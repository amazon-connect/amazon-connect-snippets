# Caller History

The caller history project utilizes AWS Lambda and Amazon DynamoDB to record if an individual has contacted previously though a user defined identifier and records time of last contact.

# To deploy
1. Launch the Amazon Cloudformation template callerhistory.yml.
2. Navigate to the Amazon Connect console and select your Amazon Connect instance.
3. Navigate to Contact flows.  Under AWS Lambda, add the AWS Lambda function created by the Amazon Cloudformation Template.
4. Log into your Amazon Connect instance.
5. Navigate to Contact Flows under Routing.
6. Create a new contact flow.
7. Import the CallerHistory file in this repo.
8. Under the Inovoke AWS Lambda function, select the AWS Lambda function created by the template.
9. Publish and test.