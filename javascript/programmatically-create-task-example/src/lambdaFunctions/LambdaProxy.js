var AWS = require('aws-sdk');
const remoteRegion = process.env.REMOTE_REGION;
const lambdaName = process.env.LAMBDA_NAME;
AWS.config.region = remoteRegion;
var lambda = new AWS.Lambda();

exports.handler = function(event, context, callback) {
  var eventStr = JSON.stringify(event);
  console.log('event is: ', eventStr);
  
  var params = {
    FunctionName: lambdaName, // the lambda function we are going to invoke
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: eventStr
  };

  console.log('Invoking ${lambdaName} Lambda now...');
  lambda.invoke(params, function(err, data) {
    if (err) {
      console.log('${lambdaName} failed LOG: ', err);
      callback(null, err);
    } else {
      console.log('${lambdaName} succeeded!');
      console.log('data.Payload is: ', data.Payload);
      var response_str = data.Payload.replace("\\", "");
      callback(null, response_str);
    }
  })
};