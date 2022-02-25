# Check Time Left

This snippet helps make a routing decision whether to add a new contact to the queue or take another action (like terminating the call) based on the queue length and the business hours for that day. 

The solution includes 2 AWS Lambda functions, and an Amazon DynamoDB table:

* `UpdateQueueHours` Lambda function:   
  - Triggered by AWS EventBridge scheduled rule
  - `UpdateRate` parameter defines Hours of Operation refresh rate, between DynamoDB and Amazon Connect Instance
  - Retrieves all Queues from an Amazon Connect instance 
  - For each queue, retrieves the queue Hours of Operation
  - Stores Queue and Hours of Operation configuration in a DynamoDB table  

* `GetTimeLeft` Lambda function: 
  - Triggered by Amazon Connect Contact Flow
  - Receives contact's `Queue ARN` and `Oldest contact in queue`
  - Retrieves Queue and Hours of Operation configuration from the DynamoDB table
  - Checks the Hours of Operation and determines `HoursOfOperationStatus` as:
    - `QUEUE_NOT_FOUND` - in case the Queue was not found in the DynamoDB table
    - `OUT_OF_HOURS` - in case: 
      - `current day` was not found in the Hours of Operation, or 
      - `current time` was outside of `Start` and `End` time window for the `current day`
    - `OPEN_ALL_HOURS` - in case `Start` and `End` time were equal for the `current day`
    - `IN_HOURS` - in case `current time` was between `Start` and `End` time window for the `current day`
  - Only if `HoursOfOperationStatus` was `IN_HOURS`, the function adds the following to the response:
    - `TimeLeftMinutes` = time difference between `current time` and `End` time
    - `TimeDeltaMinutes` = time difference between `TimeLeftMinutes` and `Oldest contact in queue`
  
Based on `GetTimeLeft` function response, you can design your Amazon Connect Contact Flow to either add the contact to the queue, if there was enough time left before the queue closes, or take another action.

To invoke `GetTimeLeft` function from your Amazon Connect Contact Flow:
  - Place `Set working queue` block and set your Queue (i.e. BasicQueue)
  - Place `Get queue metrics` block
  - Place `Invoke AWS Lambda function` and select `GetTimeLeft` Lambda function
  - In Lambda function input parameters add:
    - Select `Use attribute`
    - Destination key: `OldestContactTimeSeconds`
    - Type: `Queue metrics`
    - Attribute: `Oldest contact in queue`
  - Place `Check contact attributes` and select Type: `External`, Attribute: `HoursOfOperationStatus`, then add conditions: `QUEUE_NOT_FOUND`, `OUT_OF_HOURS`, `OPEN_ALL_HOURS`, `IN_HOURS`, and complete the contact treatment based on the result.
  - For `IN_HOURS` result, you can add another `Check contact attributes` block to check `External`->`TimeLeftMinutes` and `External`->`TimeDeltaMinutes` response parameters, then complete the contact treatment based on the result.

An AWS Serverless Application Model (SAM) defines the application's AWS resources in `template.yaml` file.  

The application includes AWS resources such as AWS Lambda functions, Amazon DynamoDB and Amazon CloudWatchEvents. You can update the template to add additional AWS resources, through the same deployment process that updates your application code.

If you prefer to use an integrated development environment (IDE) to build and test your application, you can use the AWS Toolkit.  
The AWS Toolkit is an open source plug-in for popular IDEs that uses the SAM CLI to build and deploy serverless applications on AWS. The AWS Toolkit also adds a simplified step-through debugging experience for Lambda function code. See the following links to get started.

* [PyCharm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [IntelliJ](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
* [Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/welcome.html)

## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing serverless applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* [Python 3 installed](https://www.python.org/downloads/)
* Docker (for local testing only) - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided
```

If you no longer need the AWS resources that you created by running this script, you can remove them by deleting the AWS CloudFormation stack that you deployed.

```bash
aws cloudformation delete-stack --stack-name <stack_name> --region <region>
```

