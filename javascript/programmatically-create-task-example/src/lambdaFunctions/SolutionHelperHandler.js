/**********************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved                                            *
 *                                                                                                                    *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated      *
 *  documentation files (the "Software"), to deal in the Software without restriction, including without limitation   *
 *  the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and  *
 *  to permit persons to whom the Software is furnished to do so.                                                     *
 *                                                                                                                    *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO  *
 *  THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF         *
 *  CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS *
 *  IN THE SOFTWARE.                                                                                                  *
 **********************************************************************************************************************/
'use strict';

const https = require('https');
const url = require('url');
const AWS = require('aws-sdk');
const connect = new AWS.Connect();

exports.handler = (event, context, callback) => {
    console.log("Received event: " + JSON.stringify(event));

    var responseStatus = 'FAILED';
    var responseData = {};
 
    var taskContactFlowName = "Task Flow";
    var sendResponseLambdaArn = event.ResourceProperties.SendEmailFunctionArn;
    //var taskContactFlowContent = `{\"Version\":\"2019-10-30\",\"StartAction\":\"5fbd0eda-94c0-4584-9368-63fcc26ac334\",\"Metadata\":{\"entryPointPosition\":{\"x\":15,\"y\":15},\"snapToGrid\":false,\"ActionMetadata\":{\"5fbd0eda-94c0-4584-9368-63fcc26ac334\":{\"position\":{\"x\":157,\"y\":20}},\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\":{\"position\":{\"x\":1273,\"y\":78}},\"db1066ca-967b-4a57-ba8e-093d6bc2f1af\":{\"position\":{\"x\":724,\"y\":257},\"dynamicMetadata\":{},\"useDynamic\":false},\"713d36b4-15c9-46db-aa91-df49a2666adf\":{\"position\":{\"x\":1006,\"y\":31},\"useDynamic\":false},\"c201de51-f66a-483e-944b-d75d16eb7208\":{\"position\":{\"x\":404,\"y\":49},\"conditionMetadata\":[{\"id\":\"d7a98712-e70a-496f-a940-b2be3fc86250\",\"operator\":{\"name\":\"Equals\",\"value\":\"Equals\",\"shortDisplay\":\"=\"},\"value\":\"emailRequest\"},{\"id\":\"17fd473a-c37b-44b7-89b4-c2faf5462f06\",\"operator\":{\"name\":\"Equals\",\"value\":\"Equals\",\"shortDisplay\":\"=\"},\"value\":\"emailResponse\"}]}}},\"Actions\":[{\"Identifier\":\"5fbd0eda-94c0-4584-9368-63fcc26ac334\",\"Parameters\":{\"FlowLoggingBehavior\":\"Enabled\"},\"Transitions\":{\"NextAction\":\"c201de51-f66a-483e-944b-d75d16eb7208\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"UpdateFlowLoggingBehavior\"},{\"Identifier\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"Type\":\"DisconnectParticipant\",\"Parameters\":{},\"Transitions\":{}},{\"Identifier\":\"db1066ca-967b-4a57-ba8e-093d6bc2f1af\",\"Parameters\":{\"LambdaFunctionARN\":\"${sendResponseLambdaArn}\",\"InvocationTimeLimitSeconds\":\"3\"},\"Transitions\":{\"NextAction\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"Errors\":[{\"NextAction\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"ErrorType\":\"NoMatchingError\"}],\"Conditions\":[]},\"Type\":\"InvokeLambdaFunction\"},{\"Identifier\":\"713d36b4-15c9-46db-aa91-df49a2666adf\",\"Transitions\":{\"NextAction\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"Errors\":[{\"NextAction\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"ErrorType\":\"NoMatchingError\"},{\"NextAction\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"ErrorType\":\"QueueAtCapacity\"}],\"Conditions\":[]},\"Type\":\"TransferContactToQueue\"},{\"Identifier\":\"c201de51-f66a-483e-944b-d75d16eb7208\",\"Parameters\":{\"ComparisonValue\":\"$.Attributes.taskTopic\"},\"Transitions\":{\"NextAction\":\"713d36b4-15c9-46db-aa91-df49a2666adf\",\"Errors\":[{\"NextAction\":\"713d36b4-15c9-46db-aa91-df49a2666adf\",\"ErrorType\":\"NoMatchingCondition\"}],\"Conditions\":[{\"NextAction\":\"713d36b4-15c9-46db-aa91-df49a2666adf\",\"Condition\":{\"Operator\":\"Equals\",\"Operands\":[\"emailRequest\"]}},{\"NextAction\":\"db1066ca-967b-4a57-ba8e-093d6bc2f1af\",\"Condition\":{\"Operator\":\"Equals\",\"Operands\":[\"emailResponse\"]}}]},\"Type\":\"Compare\"}]}`;
    var taskContactFlowContent = "{\"Version\":\"2019-10-30\",\"StartAction\":\"5fbd0eda-94c0-4584-9368-63fcc26ac334\",\"Metadata\":{\"entryPointPosition\":{\"x\":15,\"y\":15},\"snapToGrid\":false,\"ActionMetadata\":{\"5fbd0eda-94c0-4584-9368-63fcc26ac334\":{\"position\":{\"x\":157,\"y\":20}},\"713d36b4-15c9-46db-aa91-df49a2666adf\":{\"position\":{\"x\":546,\"y\":17},\"useDynamic\":false},\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\":{\"position\":{\"x\":940,\"y\":57}}}},\"Actions\":[{\"Identifier\":\"5fbd0eda-94c0-4584-9368-63fcc26ac334\",\"Parameters\":{\"FlowLoggingBehavior\":\"Enabled\"},\"Transitions\":{\"NextAction\":\"713d36b4-15c9-46db-aa91-df49a2666adf\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"UpdateFlowLoggingBehavior\"},{\"Identifier\":\"713d36b4-15c9-46db-aa91-df49a2666adf\",\"Transitions\":{\"NextAction\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"Errors\":[{\"NextAction\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"ErrorType\":\"NoMatchingError\"},{\"NextAction\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"ErrorType\":\"QueueAtCapacity\"}],\"Conditions\":[]},\"Type\":\"TransferContactToQueue\"},{\"Identifier\":\"e964eeb0-c050-4799-a7b8-2b1b0d4aca94\",\"Type\":\"DisconnectParticipant\",\"Parameters\":{},\"Transitions\":{}}]}";
    var taskQueueTransferFlowName = "Task Queue Transfer Flow";
    var taskQueueTransferFlowContent = `{\"Version\":\"2019-10-30\",\"StartAction\":\"c5a8d18e-afcb-4945-ad5a-35beca2149f4\",\"Metadata\":{\"entryPointPosition\":{\"x\":20,\"y\":20},\"snapToGrid\":false,\"ActionMetadata\":{\"c5a8d18e-afcb-4945-ad5a-35beca2149f4\":{\"position\":{\"x\":267,\"y\":92},\"dynamicMetadata\":{},\"useDynamic\":false},\"367bab97-21d2-4215-8a14-9d760b7933f2\":{\"position\":{\"x\":627,\"y\":97}}}},\"Actions\":[{\"Identifier\":\"c5a8d18e-afcb-4945-ad5a-35beca2149f4\",\"Parameters\":{\"LambdaFunctionARN\":\"${sendResponseLambdaArn}\",\"InvocationTimeLimitSeconds\":\"3\"},\"Transitions\":{\"NextAction\":\"367bab97-21d2-4215-8a14-9d760b7933f2\",\"Errors\":[{\"NextAction\":\"367bab97-21d2-4215-8a14-9d760b7933f2\",\"ErrorType\":\"NoMatchingError\"}],\"Conditions\":[]},\"Type\":\"InvokeLambdaFunction\"},{\"Identifier\":\"367bab97-21d2-4215-8a14-9d760b7933f2\",\"Type\":\"DisconnectParticipant\",\"Parameters\":{},\"Transitions\":{}}]}`;
    console.log(taskContactFlowContent);

    if (event.RequestType === 'Create') {
        createContactFlow(taskContactFlowName, taskContactFlowContent, "CONTACT_FLOW").then((createContactFlowResult) => {
            console.log("Created inbound flow: " + JSON.stringify(createContactFlowResult));
            responseData = {
                contactFlowId: createContactFlowResult.ContactFlowId
            };
            createContactFlow(taskQueueTransferFlowName, taskQueueTransferFlowContent, "QUEUE_TRANSFER").then((createContactFlowResult2) => {
                console.log("Created queue transfer flow: " + JSON.stringify(createContactFlowResult2));
                responseStatus = 'SUCCESS';
                sendResponse(event, callback, context.logGroupName, responseStatus, responseData);
            });
        }).catch((err) => {
            console.log("caught error " + err);
            responseData = {
                'Error': err
            };
            sendResponse(event, callback, context.logGroupName, responseStatus, responseData);
        });
    } else {
      responseStatus = 'SUCCESS';
      sendResponse(event, callback, context.logGroupName, responseStatus, responseData);
    }
};

function createContactFlow(name, content, type) {
    return new Promise(function (resolve, reject) {
        const params = {
            "InstanceId": process.env.INSTANCE_ARN.split("/")[1],
            "Name": name,
            "Type": type,
            "Content": content
        };

        connect.createContactFlow(params, function (err, res) {
            if (err) {
                console.log("Error creating contact flow : ", err);
                reject();
            } else {
                console.log("Successfully created the contact flow.");
                resolve(res);
            }
        });
    });
}

/**
 * Sends a response to the pre-signed S3 URL
 */
function sendResponse(event, callback, logGroupName, responseStatus, responseData) {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: `See the details in CloudWatch Log Group: ${logGroupName}`,
        PhysicalResourceId: logGroupName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData,
    });

    console.log('RESPONSE BODY:\n', responseBody);
    const parsedUrl = url.parse(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'Content-Type': '',
            'Content-Length': responseBody.length,
        }
    };

    const req = https.request(options, (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        callback(null, 'Successfully sent stack response!');
    });

    req.on('error', (err) => {
        console.log('sendResponse Error:\n', err);
        callback(err);
    });

    req.write(responseBody);
    req.end();
}

