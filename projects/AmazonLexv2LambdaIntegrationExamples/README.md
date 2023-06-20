# Amazon Lex V2 Lambda Integration Examples

## Introduction

This folder contains examples of AWS Lambda functions for use with Amazon Lex v2 code hooks.


## Prerequisites

- AWS Account
- [AWS IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) with Administrator permissions
- [Node](https://nodejs.org/) (v18)
- [NPM](https://docs.npmjs.com/cli/v9/configuring-npm/install) (v9)
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
- [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/cli.html)

## Set-up
```commandline
cd projects/AmazonLexv2LambdaIntegrationExamples
```
```commandline
npm install
npm run build
```

If you have started with a new environment, please bootstrap CDK
```commandline
npm run cdk:bootstrap
```



## Deploying

To deploy **all** examples 
```commandline
npm run cdk:deploy:all
```

To deploy individual examples, use the specific instructions below:

#### Basic pass-through lambda
If you are just looking to get a basic template, or to do some experimenting and learning, this lambda will give you a place to start.

See [README](src/basicPassthroughLexv2Lambda/README.md) for detailed information.

```commandline
npm run cdk:deploy:basiclambda
```

#### Reminder Lex bot and Lambda function
This bot shows a simple non-functional example of a Reminder bot showing example Lambda function integrations and conditional flows.
It deploys both the Lex bot and the Lambda function and connects the Lambda function to the bot as part of deploy.

See [README](src/reminderBotLex2Lambda/README.md) for detailed information.

```commandline
npm run cdk:deploy:reminderbot
```


### Clean-up
To remove **all** resources created as part of all stacks run the below:
```commandline
npm run cdk:destroy:all
```
See individual READMEs for specific instructions to just remove individual Stacks.
