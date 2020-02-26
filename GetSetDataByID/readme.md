# Getting, Setting, and Updating Information

This project expands on the CallerHistory project by implementing additional functionality to get, put, and update items in Amazon DynamoDB.  This type of workflow is very useful for getting and setting information about contacts or collecting survey information.

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
7. Create a new contact flow.
8. Import the CallerHistory file in this repo.
9. Under the Invoke AWS Lambda function, select the AWS Lambda function created by the template.
10. Publish and test.