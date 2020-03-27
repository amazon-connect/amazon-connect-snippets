# Hot Message

This project demonstrates how hot messages or time dependent events can be dynamically added to an Amazon DynamoDB table and referenced with an AWS Lambda fucntion in an Amazon Connect contact flow.

# To deploy
1. Launch the Amazon Cloudformation template hotmessage.yml.
2. Navigate to the Amazon Connect console and select your Amazon Connect instance.
3. Navigate to Contact flows.  Under AWS Lambda, add the AWS Lambda function created by the Amazon Cloudformation Template.
4. Log into your Amazon Connect instance.
5. Navigate to Contact Flows under Routing.
6. Create a new contact flow.
7. Import the CallerHistory file in this repo.
8. Under the Invoke AWS Lambda function, select the AWS Lambda function created by the template.
9. Publish and test.

By default, no hot messages will populate.

# To add messages
1. Navigate to the Amazon DymamoDB service.
2. Select the Hot Message table.
3. Create an item with the following JSON text:
```
{
  "EndTimeStamp": 1000000000000000000000,
  "Message": "Hello, we're currently in a staff meeting.  Please call later.",
  "StartTimeStamp": 100
}
```
The AWS Lambda function utilizes epoch time as a way to identify current hot messages and the "Message" key to read out what the current message is.