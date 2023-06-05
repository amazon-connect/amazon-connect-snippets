# Basic Lambda function with no dialog handling

## Introduction

The [basicPassthroughLexv2Lambda](./basicPassthroughLexv2Lambda.ts) does not do any dialog handing, but simply logs out information. It can be attached to any code hook in Lex v2 bots created after August 17, 2022.

The deployed name will start with _BasicLexLambdaIntegration-BasicPassthroughLexv2Lambda_


### Basic Lambda function description
The Lambda function logs out the full input event and response, but also logs out a list of some of the key information.

Here is an example of what that might look like for a call to the [Reminder bot](../../bots/ReminderBotFiles) from Amazon Connect. 
```
Lambda invoked with type DialogCodeHook and label CallIntent_InitialCodeHook for ReminderBot version DRAFT and locale en_US

Calling system sent Speech and expects text/plain; charset=utf-8 to be returned

Request Attributes are:
- x-amz-lex:accept-content-types passed with value PlainText,SSML
- x-amz-lex:channels:platform passed with value Connect

User said "can you call me"
Possible alternate transcriptions are:
- "can you call me" with confidence 0.91
- "can you tell me" with confidence 0.8
- "can ya call me" with confidence 0.71

Current Intent is CallIntent with a state of InProgress
Possible interpretations are:
- CallIntent with NLU confidence 0.62
- EmailIntent with NLU confidence 0.1
- FallbackIntent with NLU confidence undefined

Proposed next action is ElicitSlot
  ```


## Prerequisites and Set-up
See overall [README](../../README.md)

## Deploying

```
npm run cdk:deploy:basiclambda
```

## Connecting the Lambda function
Follow the instructions here to attach the Lambda function to your bot once deployed: https://docs.aws.amazon.com/lexv2/latest/dg/lambda.html

There are 3 different types of code hooks you can use
- Fulfillment code hook (inside fulfillment step)
- Standard dialog code hook (between any conversation steps up to fulfillment)
- Elicitation dialog code hook (inside slot capture or confirmation step)

This Lambda function can be attached to any type of code hook, but will take no action apart from logging out details of the input and output.


## Clean-up
To remove all resources created as part of this stack run the below:

```
npm run cdk:destroy:basiclambda
```

NOTE: You will need to update any bot this was connected to, since they will now be pointing to a Lambda function that has been deleted.
