# Last agent rouging

This project expands on the GetSetDataById project by implementing additional functionality to implement last agent routing.  Meaning, if a caller is disconnected for any reason, or if they call sometime later in time, they will be presented the option to speak to the same agent again.

# To deploy
1. Launch the Amazon Cloudformation template getsetdatabyid.yml.
2. The template will create four resources:
   1. PutUserDataLambda - An AWS Lambda function that takes all parameters passed in from a contact flow and creates or overwrites an item in a table.  It must be passed a CustomerId field.
   2. UpdateUserDataLambda - An AWS Lambda function that takes all parameters passed in from a contact flow and add or overwrites the attributes to an item in a table.  It must be passed a CustomerId field.
   3. GetUserDataLambda - An AWS Lambda function that takes a CustomerId field and returns the item to a Contact Flow.
   4. UserDataTable - An Amazon DynamoDB table to store user dataq.
3. Navigate to the Amazon Connect console and select your Amazon Connect instance.
4. Navigate to Contact flows.  Under AWS Lambda, add the AWS Lambda functions created by the Amazon Cloudformation Template.
5. Log into your Amazon Connect instance.
6. Navigate to Contact Flows under Routing.
7. Create a new Agent whisper contact flow.
8. Import the RecordLastAgent contact flow.9. 
13. Under the Invoke AWS Lambda function, select the UpdateUserDataLambda AWS Lambda function created by the template.
14. Publish the contact flow.
15. Create a new standard contact flow.
16. Import the GetUserData file in this repo.
17. Set your working queue.
18. Set the Agent whisper flow to the RecordLastAgent flow.
19. Under the Invoke AWS Lambda function, select the GetUserDataLambda AWS Lambda function created by the template.
20. Publish and test.