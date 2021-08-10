const AWS = require('aws-sdk');

exports.handler = (event, context) => {

    const connectClient = new AWS.Connect();

    let connectInstanceId = event['ResourceProperties']['InstanceId'];

    let queuesFormation = [];
    let flowsErrorsFormation = [];
    let flowsFatalErrorsFormation = [];

    // if the Cloudformation action is "Delete", delete the dashboard that was created
    if (event.RequestType == "Delete") {
        console.log(event);

        var cloudwatch = new AWS.CloudWatch();
        var params = {
            DashboardNames: [
                event['ResourceProperties']['DashboardName']
            ]
        };

        cloudwatch.deleteDashboards(params, (err, data) => {
            if (err) {
                console.log(err);
                send(event, context, "FAILED");
            } else {
                console.log(data);
                send(event, context, "SUCCESS");
            }
        });

    } else {

        let responseStatus = "FAILED";
        let responseData = {};

        let res = Promise.all([betterGetQueuesInInstance(), betterGetContactFlowsInInstance()])
            .then(([queues, flows]) => {

                queuesFormation = formatQueuesForTemplate(queues);
                flowsErrorsFormation = formatFlowsForErrorTemplate(flows);
                flowsFatalErrorsFormation = formatFlowsForFatalTemplate(flows);

                let body = {
                    "widgets": [{
                        "height": 6,
                        "width": 6,
                        "y": 0,
                        "x": 0,
                        "type": "metric",
                        "properties": {
                            "metrics": [
                                ["AWS/Connect", "ConcurrentCallsPercentage", "InstanceId", `${connectInstanceId}`, "MetricGroup", "VoiceCalls"]
                            ],
                            "view": "timeSeries",
                            "stacked": false,
                            "region": "ap-southeast-2",
                            "annotations": {
                                "horizontal": [{
                                    "label": "High Watermark",
                                    "value": 0.8
                                }]
                            },
                            "period": 60,
                            "stat": "Maximum",
                            "title": "Concurrent Calls (%)"
                        }
                    },
                    {
                        "height": 6,
                        "width": 6,
                        "y": 6,
                        "x": 18,
                        "type": "metric",
                        "properties": {
                            "view": "timeSeries",
                            "stacked": false,
                            "metrics": [
                                ["AWS/Connect", "ToInstancePacketLossRate", "Participant", "Agent", "Type of Connection", "WebRTC", "Instance ID", `${connectInstanceId}`, "Stream Type", "Voice"]
                            ],
                            "region": "ap-southeast-2",
                            "annotations": {
                                "horizontal": [{
                                    "label": "Max Avg Packet Loss",
                                    "value": 0.02
                                }]
                            },
                            "period": 60,
                            "title": "Packet Loss Rate"
                        }
                    },
                    {
                        "height": 6,
                        "width": 6,
                        "y": 0,
                        "x": 12,
                        "type": "metric",
                        "properties": {
                            "view": "timeSeries",
                            "stacked": false,
                            "metrics": [
                                ["AWS/Connect", "ThrottledCalls", "InstanceId", `${connectInstanceId}`, "MetricGroup", "VoiceCalls"]
                            ],
                            "region": "ap-southeast-2",
                            "title": "Throttled Calls",
                            "period": 60,
                            "stat": "Maximum"
                        }
                    },
                    {
                        "height": 6,
                        "width": 6,
                        "y": 0,
                        "x": 18,
                        "type": "metric",
                        "properties": {
                            "metrics": flowsErrorsFormation,
                            "view": "timeSeries",
                            "stacked": false,
                            "region": "ap-southeast-2",
                            "stat": "Sum",
                            "period": 60,
                            "title": "Contact Flow Errors"
                        }
                    },
                    {
                        "height": 6,
                        "width": 6,
                        "y": 6,
                        "x": 0,
                        "type": "metric",
                        "properties": {
                            "metrics": flowsFatalErrorsFormation,
                            "view": "timeSeries",
                            "stacked": false,
                            "region": "ap-southeast-2",
                            "stat": "Sum",
                            "period": 60,
                            "title": "Contact Flow Fatal Errors"
                        }
                    },
                    {
                        "height": 3,
                        "width": 12,
                        "y": 6,
                        "x": 6,
                        "type": "metric",
                        "properties": {
                            "metrics": queuesFormation,
                            "view": "singleValue",
                            "region": "ap-southeast-2",
                            "period": 60,
                            "stat": "Maximum",
                            "title": "Longest Queue Wait Time"
                        }
                    },
                    {
                        "height": 6,
                        "width": 6,
                        "y": 0,
                        "x": 6,
                        "type": "metric",
                        "properties": {
                            "view": "timeSeries",
                            "stacked": false,
                            "metrics": [
                                ["AWS/Connect", "ConcurrentCalls", "InstanceId", `${connectInstanceId}`, "MetricGroup", "VoiceCalls"]
                            ],
                            "region": "ap-southeast-2",
                            "title": "Concurrent Calls",
                            "period": 60,
                            "stat": "Maximum"
                        }
                    },
                    {
                        "height": 3,
                        "width": 6,
                        "y": 12,
                        "x": 0,
                        "type": "metric",
                        "properties": {
                            "metrics": [
                                ["AWS/Connect", "CallsPerInterval", "InstanceId", `${connectInstanceId}`, "MetricGroup", "VoiceCalls"]
                            ],
                            "view": "singleValue",
                            "region": "ap-southeast-2",
                            "period": 60,
                            "stat": "Sum",
                            "title": "Calls Per Interval"
                        }
                    },
                    {
                        "height": 3,
                        "width": 6,
                        "y": 12,
                        "x": 12,
                        "type": "metric",
                        "properties": {
                            "metrics": [
                                ["AWS/Connect", "MisconfiguredPhoneNumbers", "InstanceId", `${connectInstanceId}`, "MetricGroup", "VoiceCalls"]
                            ],
                            "view": "singleValue",
                            "region": "ap-southeast-2",
                            "period": 60,
                            "stat": "Sum",
                            "title": "Misconfigured Phone Numbers"
                        }
                    },
                    {
                        "type": "metric",
                        "x": 6,
                        "y": 12,
                        "width": 6,
                        "height": 3,
                        "properties": {
                            "metrics": [
                                ["AWS/Connect", "CallRecordingUploadError", "InstanceId", `${connectInstanceId}`, "MetricGroup", "CallRecordings"]
                            ],
                            "view": "singleValue",
                            "stacked": false,
                            "region": "ap-southeast-2",
                            "stat": "Sum",
                            "period": 60,
                            "title": "Call Recording Upload Error"
                        }
                    },
                    {
                        "type": "metric",
                        "x": 18,
                        "y": 12,
                        "width": 6,
                        "height": 3,
                        "properties": {
                            "metrics": [
                                ["AWS/Connect", "CallsBreachingConcurrencyQuota", "InstanceId", `${connectInstanceId}`, "MetricGroup", "VoiceCalls"]
                            ],
                            "view": "singleValue",
                            "stacked": false,
                            "region": "ap-southeast-2",
                            "stat": "Sum",
                            "period": 60,
                            "title": "Calls Breaching Quota"
                        }
                    }
                    ]
                };

                let dashboard = {
                    "DashboardName": event['ResourceProperties']['DashboardName'],
                    "DashboardBody": JSON.stringify(body)
                }

                // create the dashboard in Cloudwatch through the API
                const cloudwatch = new AWS.CloudWatch();
                return new Promise((resolve, reject) => {
                    cloudwatch.putDashboard(dashboard, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
            })
            .then((data) => {
                responseStatus = "SUCCESS";
                responseData = data;

                send(event, context, responseStatus, responseData);
            })
            .catch((err) => {
                console.log(err);

                responseData = err;
                send(event, context, responseStatus, responseData);
            });
    }


    /**
     * A recursive function to retrieve all contact flows in the instance
     * Note: only retrieving "CONTACT FLOWS" in this implementation
     */
    function betterGetContactFlowsInInstance() {

        let instanceFlows = [];

        let wrapper = (nextToken) => {

            var params = {
                InstanceId: connectInstanceId,
                /* required */
                MaxResults: 100,
                ContactFlowTypes: [
                    "CONTACT_FLOW"
                ],
                NextToken: nextToken
            };

            return new Promise((resolve, reject) => {
                connectClient.listContactFlows(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        instanceFlows = instanceFlows.concat(data.ContactFlowSummaryList);
                        if (data.NextToken) {
                            wrapper(data.NextToken);
                        }
                        else {
                            resolve(instanceFlows);
                        }
                    }
                });
            });
        };

        return wrapper();
    }

    /**
     * A recursive function to retrieve all queues in the instance
     * Note: Only retrieving "STANDARD" queues in this implementation
     */
    function betterGetQueuesInInstance() {
        let instanceQueues = [];

        let wrapper = function (nextToken) {

            var params = {
                InstanceId: connectInstanceId,
                /* required */
                MaxResults: 100,
                QueueTypes: [
                    "STANDARD"
                ],
                NextToken: nextToken
            };

            return new Promise((resolve, reject) => {
                connectClient.listQueues(params, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(null);
                    }
                    else {
                        instanceQueues = instanceQueues.concat(data.QueueSummaryList);
                        if (data.NextToken) {
                            wrapper(data.NextToken);
                        }
                        else {
                            resolve(instanceQueues);
                        }
                    }
                });
            });
        }

        return wrapper();
    }

    /**
     * Formats the contact flow data coming back from the Amazon Connect to the templated Cloudwatch expectation for the Flows Error widget
     * @param {*} flowsData 
     * @returns 
     */
    function formatFlowsForErrorTemplate(flowsData) {
        let templatedFlows = [];

        flowsData.forEach(flow => {
            let flowTemplate = ["AWS/Connect", "ContactFlowErrors", "InstanceId", connectInstanceId, "MetricGroup", "ContactFlow", "ContactFlowName", flow.Name];
            templatedFlows.push(flowTemplate);
        });

        return templatedFlows;
    }

    /**
     * Formats the contact flow data coming back from the Amazon Connect to the templated Cloudwatch expectation for the Flows Fatal Error widget
     * @param {*} flowsData 
     * @returns 
     */
    function formatFlowsForFatalTemplate(flowsData) {
        let templatedFlows = [];

        flowsData.forEach(flow => {
            let flowTemplate = ["AWS/Connect", "ContactFlowFatalErrors", "InstanceId", connectInstanceId, "MetricGroup", "ContactFlow", "ContactFlowName", flow.Name];
            templatedFlows.push(flowTemplate);
        });

        return templatedFlows;
    }

    /**
     * Formats the contact flow data coming back from the Amazon Connect to the templated Cloudwatch expectation for the all queue-based widgets
     * @param {*} queuesData 
     * @returns 
     */
    function formatQueuesForTemplate(queuesData) {
        let templatedQueues = [];

        queuesData.forEach(queue => {
            let queueTemplate = ["AWS/Connect", "LongestQueueWaitTime", "InstanceId", connectInstanceId, "MetricGroup", "Queue", "QueueName", queue.Name];
            templatedQueues.push(queueTemplate);
        });

        return templatedQueues;
    }

    /**
     * A re-implementation of send() from cfn-response module to make sure we don't rely on importing cfn-response.
     * @param {*} event 
     * @param {*} context 
     * @param {*} responseStatus 
     * @param {*} responseData 
     * @param {*} physicalResourceId 
     * @param {*} noEcho 
     */
    function send(event, context, responseStatus, responseData, physicalResourceId, noEcho) {
        var responseBody = JSON.stringify({
            Status: responseStatus,
            Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
            PhysicalResourceId: physicalResourceId || context.logStreamName,
            StackId: event.StackId,
            RequestId: event.RequestId,
            LogicalResourceId: event.LogicalResourceId,
            NoEcho: noEcho || false,
            Data: responseData
        });

        console.log("Response body:\n", responseBody);

        var https = require("https");
        var url = require("url");

        var parsedUrl = url.parse(event.ResponseURL);
        var options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.path,
            method: "PUT",
            headers: {
                "content-type": "",
                "content-length": responseBody.length
            }
        };

        var request = https.request(options, function (response) {
            console.log("Status code: " + response.statusCode);
            console.log("Status message: " + response.statusMessage);
            context.done();
        });

        request.on("error", function (error) {
            console.log("send(..) failed executing https.request(..): " + error);
            context.done();
        });

        request.write(responseBody);
        request.end();
    }
};