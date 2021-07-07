'use strict';

var AWS = require('aws-sdk');
var ses = new AWS.SES();
  
exports.handler = (event, context, callback) => {
    console.log('event is: ', JSON.stringify(event));

    if (!event['Details']['ContactData']['Attributes']) {
        const response = {
            statusCode: 400,
            body: "Unsupported event: " + JSON.stringify(event)
        };
        console.log('Unsupported event: : ', JSON.stringify(event));
        callback(null, response);
    }

    var attr = event.Details.ContactData.Attributes;
    var toEmail = attr.From.split('<')[1].split('>')[0];
    var emailBody = event.Details.ContactData.Description;
    var emailSubject = event.Details.ContactData.Name;
    var fromEmail = attr.To;


    var params = {
        Destination: {
            /*
            CcAddresses: [
              'EMAIL_ADDRESS',
            ],
            */
            ToAddresses: [
                toEmail
            ]
        },
        Message: {
            Body: {
                /*
                Html: {
                Charset: "UTF-8",
                Data: emailBody
                },
                */
                Text: {
                    Charset: "UTF-8",
                    Data: emailBody
                }
            },
            Subject: {
                Charset: 'UTF-8',
                // By prefixing the original email subject with "Re:", most mail apps will group the messages together, which helps the customer keep context
                Data: emailSubject
            }
        },
        Source: fromEmail,
        ReplyToAddresses: [
            fromEmail
        ]
    };

    console.log('params for sendEmail is: ', JSON.stringify(params));
    // Create the promise and SES service object
    var sendPromise = ses.sendEmail(params).promise();

    // Handle promise's fulfilled/rejected states
    sendPromise.then((data) => {
        const response = {
            statusCode: 200,
            body: {MessageId: data.MessageId}
        };
        console.log('sendEmail success, MessageId is: ', data.MessageId);
        callback(null, response);
    }).catch((err) => {
        const response = {
            statusCode: 400,
            body: err.stack
        };
        console.log('sendEmail failed, err.stack is: ', err.stack);
        callback(null, response);
    });
};
