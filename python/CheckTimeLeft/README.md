# Check Time Left

This snippet is used help decide whether to add a new contact to the queue or take another action (like terminating the call) based on the queue length and the business hours for that day. In addition, it also provides tha ability to override the business hours for a specific day.

It's implemented using  2 lambdas, and a DynamoDB table; 
* UpdateQueueHours: reads the queue information and business hours and updates it in a DynamoDB table. This same lambda can override the business hours of a certain queue by updating the dynamoDB entry for that queue.
* getTimeLeft: checks the business hours of the current queue from the DynamoDB table, and the oldest contact time. It calculates the difference between them and returns it back to the contact flow. The contact flow decides to either add the contact to the queue if there's time left or take another action.
* events - Invocation events that you can use to invoke the function. 
* template.yaml - A template that defines the application's AWS resources.

The application uses several AWS resources, including Lambda functions, DynamoDB and Events. These resources are defined in the `template.yaml` file in this project. You can update the template to add AWS resources through the same deployment process that updates your application code.

If you prefer to use an integrated development environment (IDE) to build and test your application, you can use the AWS Toolkit.  
The AWS Toolkit is an open source plug-in for popular IDEs that uses the SAM CLI to build and deploy serverless applications on AWS. The AWS Toolkit also adds a simplified step-through debugging experience for Lambda function code. See the following links to get started.

* [PyCharm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [IntelliJ](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
* [Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/welcome.html)

## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* [Python 3 installed](https://www.python.org/downloads/)
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build --use-container
sam deploy --guided
```

