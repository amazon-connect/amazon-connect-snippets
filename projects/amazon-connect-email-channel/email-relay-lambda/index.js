// dependencies
const AWS = require('aws-sdk');
const util = require('util');
const simpleParser = require('mailparser').simpleParser;
// get reference to S3 client
const s3 = new AWS.S3();
const ses = new AWS.SES({apiVersion: '2010-12-01'});
const comprehend = new AWS.Comprehend();
const docClient = new AWS.DynamoDB.DocumentClient();
const connect = new AWS.Connect();

const TARGET_TYPES = {
  QUEUE: "QUEUE",
  AGENT: "AGENT",
  GENERAL: "GENERAL",
  REJECTED: "REJECTED"
};

const ALIAS_MAP = {
  QUEUE: "queuerelay",
  AGENT: "agentrelay",
  REJECT: "rejectrelay",
  GENERAL: "relay"
};

exports.lambdaHandler = async (event, context) => {
    try {
        // log the event
        console.log(JSON.stringify(event, null, 4));
        const object=event.Records[0].s3.object.key;
        const bucket=event.Records[0].s3.bucket.name;
        const file = await s3
            .getObject({ Bucket: bucket, Key: object})
            .promise();
        const response_email = await simpleParser(file.Body);
        //let destination_email=process.env.CATCHALL_EMAIL_ADDRESS; 
        //console.log(JSON.stringify(response_email, null, 4));        
       
        let sent_from_email = response_email.from.value[0].address;
        let sent_to_email = response_email.to.value[0].address;

        let interaction_record = {};

        let sent_to_email_address = sent_to_email.split('@')[0].split('+');
        let relay_alias = sent_to_email_address[0];
        let interaction_id = sent_to_email_address[1];

        interaction_record = await interactionLookup(interaction_id);

        let target_type = TARGET_TYPES.QUEUE;
        let target_destination = TARGET_TYPES.GENERAL;
        if("history" in interaction_record){
          const latest = interaction_record.history.filter(a => a.interaction_type === "ROUTED_TO_AGENT").reduce((a, b) => a.interaction_timestamp > b.interaction_timestamp ? a : b);
          

          if(relay_alias === ALIAS_MAP.QUEUE){
            interaction_record.target_type = TARGET_TYPES.QUEUE;
            interaction_record.target_destination = latest.routed_to_agent_queue;
          } else if (relay_alias === ALIAS_MAP.AGENT) {          
            interaction_record.target_type = TARGET_TYPES.AGENT;
            interaction_record.target_destination = latest.routed_to_agent;
          } else if (relay_alias === ALIAS_MAP.REJECT) {          
            interaction_record.target_type = TARGET_TYPES.REJECTED;
            interaction_record.target_destination = TARGET_TYPES.REJECTED;
          } else {
            interaction_record.target_type = TARGET_TYPES.QUEUE;
            interaction_record.target_destination = TARGET_TYPES.GENERAL;
          }


        } else {
          interaction_record.target_type = TARGET_TYPES.QUEUE;
          interaction_record.target_destination = TARGET_TYPES.GENERAL;
        }

        if(relay_alias !== ALIAS_MAP.REJECT){
          const original_email = await s3.getObject({ Bucket: interaction_record.latest_email_s3_bucket, Key: interaction_record.latest_email_s3_key}).promise();

          const original_response_email = await simpleParser(original_email.Body);

          let html_body = "<p>" + response_email.html + "</p><hr>" + process.env.EMAIL_DISCLAIMER + "<hr><br><br><br>" + original_response_email.html;
          let text_body = response_email.text + "\n\n-----------------\n" + process.env.EMAIL_DISCLAIMER + "\n\n-----------------\n\n\n\n" + original_response_email.text;


          var params = {
            Destination: { 
              ToAddresses: [interaction_record.from_address]
            },
            Message: {
              Body: {
                Html: {
                Charset: "UTF-8",
                Data: html_body
                },
                Text: {
                Charset: "UTF-8",
                Data: text_body
                }
              },
              Subject: {
                Charset: 'UTF-8',
                Data: response_email.subject
              }
              },
            Source: interaction_record.reply_to, 
            ReplyToAddresses: [
              interaction_record.reply_to
            ],
          };

          var message = await sendEmail(params);
          console.log(message);
        }

        const now = parseInt(Date.now()/1000);
        let interaction_snapshot = {
          interaction_type: relay_alias === ALIAS_MAP.REJECT ? TARGET_TYPES.REJECTED : "OUTBOUND_EMAIL",
          sent_from_email: sent_from_email,
          sent_to_email: interaction_record.from_address,
          s3_bucket: bucket,
          s3_key: object,
          interaction_timestamp: now,
          target_type: interaction_record.target_type,
          target_destination: interaction_record.target_destination
        };
        if(interaction_record.history){
          interaction_record.history.push(interaction_snapshot);
        } else {
          interaction_record.history = [interaction_snapshot];
        }
        
        interaction_record.last_update_timestamp = now;

        var final_results = await putInteraction(interaction_record);       

    } catch (err) {
        console.log(err);
        return err;
    }
    return;
};


async function interactionLookup(interaction_id){
  try {
      var params = {
        TableName : process.env.EMAIL_LOOKUP_TABLE,
        Key: {
          interaction_id: interaction_id
        }
      };
      const data = await docClient.get(params).promise();
      
      return data.Item;
  } catch (err) {
      console.log("Failure", err.message)
      let i_id = String( Math.floor(10000000 + Math.random()*90000000));
      return {
        interaction_id: i_id,
        target_type: TARGET_TYPES.GENERAL,
        target_destination: TARGET_TYPES.GENERAL,
        reply_to: process.env.GENERAL_INQUIRY_EMAIL_ADDRESS.split('@')[0] + '+' + i_id + process.env.INQUIRY_EMAIL_DOMAIN
      };
  }
}

async function putInteraction(item){
  try {
      var params = {
        TableName : process.env.EMAIL_LOOKUP_TABLE,
        Item: item
      };
        const data = await docClient.put(params).promise();
        return data;
  } catch (err) {
      console.log("Failure", err.message)
      throw err;
  }
}
async function sendEmail (params) {
    return new Promise ((resolve,reject) => {
        ses.sendEmail(params, function(err, data) {
            // If something goes wrong, print an error message.
            if(err) {
              console.log(err.message);
              reject(err);
            } else {
              resolve(data); //.messageid
            }
        });
 
    });
}
