# Cross Region, Cross Account

This project shows how to call an AWS Lambda function that exists in a separate account or a separate region using AWS Lambda permissions.  You might want to do this if you want to interact with a backend system that is hosted in another account

# To deploy
1. Launch the Amazon Cloudformation template crossregioncrossaccount.yml in the account account and region where your backend infrastructure exists.  This can be in a separate account as the target Amazon Connect instance (but doesn't have to be) or a separate region.
2. The template will ask for two parameters:
   1. ConnectInstanceArn - This is the ARN of the target Amazon Connect instance.
   2. SourceAccountId - This is the Account ID where the Amazon Connect instance resides.  The account ID is part of the ARN of the instance.
3. Launch the stack.  This will create a Lambda function in your source account that can be invoked by the Amazon Connect instance.
4. Navigate to a contact flow in your Amazon Connect instance.
5. Under the Inovoke AWS Lambda function, enter the full ARN of the AWS Lambda function.  It will not populate automatically like other AWS Lambda functions.
6. Publish and test.