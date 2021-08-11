// dependencies
const AWS = require('aws-sdk');
const util = require('util');
const simpleParser = require('mailparser').simpleParser;
// get reference to S3 client
const s3 = new AWS.S3();
const ses = new AWS.SES({ apiVersion: '2010-12-01' });
const comprehend = new AWS.Comprehend();
const docClient = new AWS.DynamoDB.DocumentClient();
const connect = new AWS.Connect();

const TARGET_TYPES = {
  QUEUE: "QUEUE",
  AGENT: "AGENT",
  GENERAL: "GENERAL"
};


const VALID_SENTIMENT_LANGUAGES = ["ar", "hi", "ko", "zh-TW", "ja", "zh", "de", "pt", "en", "it", "fr", "es"];
const SES_SPAM_FLAGS = ["x-ses-virus-verdict", "x-ses-spam-verdict"];

exports.lambdaHandler = async (event, context) => {
  try {
    // log the event
    console.log(JSON.stringify(event, null, 4));
    const object = event.Records[0].s3.object.key;
    const bucket = event.Records[0].s3.bucket.name;
    const file = await s3
      .getObject({ Bucket: bucket, Key: object })
      .promise();
    const parsed = await simpleParser(file.Body);

    if (parsed.headerLines) {
      parsed.headerLines.forEach((header_line) => {
        if (SES_SPAM_FLAGS.includes(header_line.key) && header_line.line.includes("FAIL")) {
          // Include bounce logic
          return;
        }
      });
    }
    
    const eml_object_key = object.replace("inbound", "inboundemails") + ".eml";
    var eml_object_params = {
      Bucket: bucket,
      Key: eml_object_key,
      Body: file.Body
    }

    const eml_upload_results = await s3.putObject(eml_object_params).promise();

    let formatted_email_doc = JSON.parse(JSON.stringify(parsed));
    if (formatted_email_doc.headerLines) {
      delete formatted_email_doc.headerLines;
    }
    const text_to_evaluate = parsed.text;
    let detected_language = "UNKNOWN";
    let detected_sentiment = "UNKNOWN";
    //find the suggested language from comprehend
    try {
      if (process.env.ENABLE_LANGUAGE_DETECTION == "TRUE") {
        var params = {
          Text: text_to_evaluate
        };
        var language_result = await detectDominantLanguage(params);
        detected_language = language_result.Languages[0].LanguageCode;
        formatted_email_doc.detected_language = detected_language;

        if (process.env.ENABLE_SENTIMENT_DETECTION == "TRUE" && VALID_SENTIMENT_LANGUAGES.includes(detected_language)) {
          params = {
            Text: text_to_evaluate,
            LanguageCode: detected_language
          };

          let sentiment_result = await detectSentiment(params);
          detected_sentiment = sentiment_result.Sentiment;
          formatted_email_doc.sentiment = sentiment_result;
        }

        if (process.env.ENABLE_ENTITY_RECOGNITION == "TRUE" && VALID_SENTIMENT_LANGUAGES.includes(detected_language)) {
          params = {
            Text: text_to_evaluate,
            LanguageCode: detected_language
          };

          let entity_results = await detectKeyPhrases(params);
          formatted_email_doc.key_phrases = entity_results.KeyPhrases;
        }
      }
    } catch {
      console.log("AI service failure.");
    }

    let target_type = TARGET_TYPES.QUEUE;
    let target_destination = TARGET_TYPES.GENERAL;

    let sent_from_email = parsed.from.value[0].address;
    let sent_to_email = parsed.to.value[0].address;

    let interaction_record = {};

    if (sent_to_email == process.env.GENERAL_INQUIRY_EMAIL_ADDRESS) {
      interaction_record.interaction_id = String(Math.floor(10000000 + Math.random() * 90000000));
      interaction_record.target_type = target_type;
      interaction_record.target_destination = target_destination;

      interaction_record.reply_to = process.env.GENERAL_INQUIRY_EMAIL_ADDRESS.split('@')[0] + '+' + interaction_record.interaction_id + process.env.INQUIRY_EMAIL_DOMAIN;

    } else {
      let interaction_id = sent_to_email.split('@')[0].split('+')[1];
      interaction_record = await interactionLookup(interaction_id);
    }

    let formatted_email_key = object.replace("inbound", "formatted");
    formatted_email_doc.interaction_id = interaction_record.interaction_id;

    var s3_formated_email_params = {
      Bucket: bucket,
      Key: formatted_email_key,
      Body: JSON.stringify(formatted_email_doc, null, 4),
      ContentType: 'application/json'
    }

    const s3_upload_results = await s3.putObject(s3_formated_email_params).promise();

    interaction_record.subject = parsed.subject;
    interaction_record.sent_to_email = sent_to_email;
    interaction_record.from_address = sent_from_email;
    interaction_record.detected_language = detected_language;
    interaction_record.detected_sentiment = detected_sentiment;
    interaction_record.latest_email_s3_bucket = bucket;
    interaction_record.latest_email_s3_key = eml_object_key;
    interaction_record.formatted_email_key = formatted_email_key;

    var task_attributes = JSON.parse(JSON.stringify(interaction_record))
    if (task_attributes.history) {
      delete task_attributes.history;
    }

    if (task_attributes.last_update_timestamp) {
      delete task_attributes.last_update_timestamp;
    }


    var task_params = {
      ContactFlowId: process.env.AMAZON_CONNECT_CONTACT_FLOW_ARN,
      InstanceId: process.env.AMAZON_CONNECT_INSTANCE_ARN,
      Name: parsed.subject,
      Attributes: task_attributes,
      Description: parsed.text
    };

    let results = (await createTask(task_params));

    const now = parseInt(Date.now() / 1000);
    let interaction_snapshot = {
      interaction_type: "INBOUND_EMAIL",
      sent_from_email: sent_from_email,
      sent_to_email: sent_to_email,
      s3_bucket: bucket,
      s3_key: object,
      interaction_timestamp: now,
      target_type: interaction_record.target_type,
      target_destination: interaction_record.target_destination
    };
    if (interaction_record.history) {
      interaction_record.history.push(interaction_snapshot);
    } else {
      interaction_record.history = [interaction_snapshot];
    }

    interaction_record.related_contact_id = results.ContactId;
    interaction_record.last_update_timestamp = now;

    var final_results = await putInteraction(interaction_record);



  } catch (err) {
    console.log(err);
    return err;
  }
  return;
};


async function interactionLookup(interaction_id) {
  try {
    var params = {
      TableName: process.env.EMAIL_LOOKUP_TABLE,
      Key: {
        interaction_id: interaction_id
      }
    };
    const data = await docClient.get(params).promise();
    return data.Item;
  } catch (err) {
    console.log("Failure", err.message)
    let i_id = String(Math.floor(10000000 + Math.random() * 90000000));
    return {
      interaction_id: i_id,
      target_type: TARGET_TYPES.GENERAL,
      target_destination: TARGET_TYPES.GENERAL,
      reply_to: process.env.GENERAL_INQUIRY_EMAIL_ADDRESS.split('@')[0] + '+' + i_id + process.env.INQUIRY_EMAIL_DOMAIN
    };
  }
}

async function putInteraction(item) {
  try {
    var params = {
      TableName: process.env.EMAIL_LOOKUP_TABLE,
      Item: item
    };
    const data = await docClient.put(params).promise();
    return data;
  } catch (err) {
    console.log("Failure", err.message)
    throw err;
  }
}

async function detectKeyPhrases(params) {
  return new Promise((resolve, reject) => {
    comprehend.detectKeyPhrases(params, function (err, data) {
      // If something goes wrong, print an error message.
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        resolve(data);
      }
    });

  });
}
async function detectDominantLanguage(params) {
  return new Promise((resolve, reject) => {
    comprehend.detectDominantLanguage(params, function (err, data) {
      // If something goes wrong, print an error message.
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        resolve(data);
      }
    });

  });
}

async function detectSentiment(params) {
  return new Promise((resolve, reject) => {
    comprehend.detectSentiment(params, function (err, data) {
      // If something goes wrong, print an error message.
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        resolve(data);
      }
    });

  });
}
async function sendEmail(params) {
  return new Promise((resolve, reject) => {
    ses.sendEmail(params, function (err, data) {
      // If something goes wrong, print an error message.
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        resolve(data); //.messageid
      }
    });

  });
}

async function createTask(params) {
  return new Promise((resolve, reject) => {
    connect.startTaskContact(params, function (err, data) {
      // If something goes wrong, print an error message.
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        resolve(data); //.messageid
      }
    });
  });
}