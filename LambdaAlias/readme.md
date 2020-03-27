# AWS Lambda Alias

This project shows how to call an AWS Lambda function alias.  AWS Lambda Aliases allow you to safely and efficiently deploy new versions of backend infrastructure without making modifications to Amazon Connect Contact flows, allowing your developers to develop code without impacting your production contact center.  

# To deploy the stack
1.	Download the resource pack
2.	Unzip the file to your local machine, this will create a Resources folder which contains
   1. CloudFormation template lambdaalias.yml
   2. Amazon Connect contact flow for one time testing LambdaAlias-test
   3. Amazon Connect contact flow for testing in a loop LambdaAlias-loop
3.	Login to the AWS Console
4.	Open the AWS CloudFormation Console
5.	Make sure that you have the console open to the same region as your Amazon Connect
6.	instance. See Choosing a Region in the Getting Started Guide In the CloudFormation console, choose Create stack
7.	On the Create stack screen, leave the Prerequisite set to Template is ready
8.	In the Specify template section, select Upload a template file, then select the Choose file button
9.	Navigate to the Resources folder that you created in step 2, open the CloudFormation folder inside, and select lambdaalias.yaml
10.	Once the template loads, choose Next
11.	Provide a name for the stack
12.	 In the Parameters section, complete the values as follows: 
   1.  ConnectInstanceArn: enter in the ARN of your existing Amazon Connect instance.  For help finding the ARN, refer to the AWS Premium Support page for finding your Amazon Connect instance ID.
   2.  SAMAlias: leave as PROD.  You can change this value to change the name of the AWS Lambda Alias.
13.	Choose Next
14.	Apply any Tags as desired.  Leave the rest of the options to their defaults and choose Next.
15.	Review the configuration.  At the bottom of the page, select the checkbox to acknowledge that IAM resources may be created.
16.	Choose Create stack.  This will launch the CloudFormation template and create the resources needed.  Creation should only take a couple minutes and deploys the following resources:
   - ConnectLambdaFunction: a function that returns the invoked version of the function.
   - ConnectLambdaFunctionAliasPROD: an AWS Lambda function alias
   - ConnectLambdaFunctionVersion: the first version of the AWS Lambda function
   - ConnectLambdaFunctionRole: a role with basic execution permissions
   - AliasErrorMetricGreaterThanZeroAlarm: an Amazon Cloudwatch Alarm for the AWS Lambda Alias
   - ServerlessDeploymentApplication: an AWS SAM application
   - ConnectLambdaFunctionDeploymentGroup: an AWS CodeDeploy Deployment Group
   - CodeDeployServiceRole: a role for AWS CodeDeploy17.	
18.	Once the stack is create, the status will change to CREATE_COMPLETE
19.	Select the Outputs tab
20.	Note the fully qualified ARN of the AWS Lambda Function Alias

# To invoke the AWS Lambda function in a contact flow
1.	Log in to your contact center using your access URL.
2.	In the navigation pane, choose Routing, Contact flows.
3.	Choose Create contact flow. This opens the contact flow designer and creates an inbound contact flow (Type = Contact flow).
4.	Select the down arrow next to the greyed out Save button and choose Import flow (beta)
5.	Choose Select
6.	Navigate to the resources folder and select the LambdaAlias-test file, then choose Open
7.	Choose Import
8.	Once the flow imports, edit the Invoke AWS Lambda function node
9.	Replace the value for the function with the output value from your CloudFormation stack noted earlier. This would be the value for the key ConnectLambdaFunctionAlias
10.	Publish the Contact Flow

*NOTE*: We did not have to explicitly give permission for the Amazon Connect instance to call the fully qualified ARN of the AWS Lambda Function Alias.  The AWS CloudFormation template included an explicit permission for the instance to call the Alias.  Because permission was granted in such a way, the function will not appear in the drop down menu as described in the documentation.  To grant an Amazon Connect instance access to invoke an AWS Lambda Alias, you can use the following command:
```
aws lambda add-permission --function-name <LAMBDA_ARN>:<ALIAS> --statement-id <UNIQUE_CODE> --action lambda:InvokeFunction --principal connect.amazonaws.com --source-account <ACCOUNT_ID> --source-arn <CONNECT_INSTANCE_ARN>
```