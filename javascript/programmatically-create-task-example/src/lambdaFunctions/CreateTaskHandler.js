var AWS = require('aws-sdk');
var simpleParser = require('mailparser').simpleParser;

var connect = new AWS.Connect();
var workmail = new AWS.WorkMailMessageFlow();
const eventSources = {
    WORK_MAIL: 'workmail'
};

// This function shows how you can create a task based on an email sent to a Workmail domain.
// You can easily extend this function to work for other inputs as well, such as APIs, SES, contact flows, etc.
 exports.handler = async (event, context, callback) => {
    console.log("Event: " + JSON.stringify(event));
    var attributes = {};
    var description;
    var url;
    var name;

    var event_source = eventSources.OTHER;

    if (event.messageId) {
        event_source = eventSources.WORK_MAIL;

        const parsed_email = await parseEmail(event.messageId);

        name = "Incoming Email Task";
        description = parsed_email.text;
        attributes = {
            "TaskTopic": "Email Request",
            "From": parsed_email.from.text,
            "To": parsed_email.to.text,
            "Date": parsed_email.date.toString(),
            "Subject": parsed_email.subject.toString(),
            "Content": parsed_email.text
        };
        // If there are any attachments in the email you can get them from parsed_email.attachments
        // You could then upload them to S3 and link to them in the url portion of the task
    } else {
        throw new Error("Unknown event");
    }

    attributes["Source"] = event_source;
    await (startTask(name, attributes, description, url, callback)
        .then((result) => {
            callback(null, buildSuccessfulResponse(event_source, result));
        })
        .catch((err) => {
            console.log('startTask.catch() is called');
            callback(null, buildResponseFailed(event_source, err));
        }));
};

async function parseEmail(messageId) {
    try {
        var params = {
           messageId: messageId
        };
        var workmailResponse = await (workmail.getRawMessageContent(params).promise());
        console.log("Got message content");

        try {
            const parsed_email = await simpleParser(workmailResponse.messageContent);
            console.log("Done parsing email");
            return(parsed_email);
        } catch(e) {
            console.log("Error parsing the raw email.");
            throw new Error(`Could not parse the raw email: ${e.message}`);
        }
    } catch (e) {
        console.log("Error getting email from Workmail.");
        throw new Error(`Could not retrieve file from S3: ${e.message}`);
    }
}

function startTask(name, attributes, description, url, callback) {
    var instanceId = process.env.INSTANCE_ARN.split("/")[1];
    var contactFlowId = process.env.CONTACT_FLOW_ID;

    return new Promise(function (resolve, reject) {
        var startTask = {
            "InstanceId": instanceId,
            "ContactFlowId": contactFlowId,
            "Attributes": attributes,
            "Name": name,
            "Description": description
        };
        if (url) {
            startTask["References"] = {
                "Reference": {
                    "Type": "URL",
                    "Value": url
                }
            };
        }
        console.log("Start task input: " + JSON.stringify(startTask));
        connect.startTaskContact(startTask, function(err, data) {
            if (err) {
                console.log("Error starting the task.");
                console.log(err, err.stack);
                reject(err);
            } else {
                console.log("Start task succeeded with the response: " + JSON.stringify(data));
                resolve(data);
            }
        });
    });
}

function buildSuccessfulResponse(event_source, result) {
    // You can vary the responses based on your event source
    return  {
        statusCode: 200,
        body: JSON.stringify({
            data: result
        })
    };
}

function buildResponseFailed(event_source, err) {
    return {
        statusCode: 500,
        body: JSON.stringify({
            data: {
                "Error": err
            }
        })
    };
}