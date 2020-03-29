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
20. Publish the contact flow.
15. Create a new Outbound whisper contact flow.
16. Import the RecordOutboundAgent file in this repo.
19. Under the Invoke AWS Lambda function, select the GetUserDataLambda AWS Lambda function created by the template.
20. Publish.
21. Under queues, assign the RecordOutboundAgent contact flow as the Outbound whisper flow for a queue.  This will record any agent interactions for outbound calls.
22. Save the queue.
23. Test the configuration where a caller calls in, disconnects, and calls again.  Test an outbound dial from an agent to a person, disconnect or leave a message, and call again.

NOTE: There is no timeout logic built in to this snipper.  Meaning if a caller is entered into the table, it will record their last agent interaction.