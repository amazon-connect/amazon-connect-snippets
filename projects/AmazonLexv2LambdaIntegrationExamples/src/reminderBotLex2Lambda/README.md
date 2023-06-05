# Reminder Lex bot and code hook Lambda function

## Introduction
This bot shows a simple example of a Reminder bot showing example Lambda function integrations and conditional flows. 
It lets the user set up either a reminder call or a reminder email. 
It consists of three intents:
- CallIntent
- EmailIntent
- FallbackIntent

The en-us language in both _TestBotAlias_ and _Prod_ **aliases** are hooked to a Lambda function that when deployed will have a named starting with _ReminderBot-LexFulfillmentLambda_

It is non-functional, and simply designed to show how the integration works and let you explore the input and output.

### CallIntent description
The CallIntent intent consists of the following:
- **Initial response** enabled, with a message and dialog cook hook enabled (_CallIntent_InitialCodeHook_)
- A single **slot** (of type AMAZON.Time), with both elicitation (_CallIntent_TimeSlot_PromptCodeHook_) and validation (_CallIntent_TimeSlot_ValidationCodeHook_) dialog code hooks enabled
- A **fulfillment step** with fulfillment code hook enabled

### EmailIntent description
The EmailIntent intent consists of the following:
- **Initial response** enabled, with message and dialog cook hook enabled (_CallIntent_InitialCodeHook_)
- A single **slot** (of type AMAZON.Number), with **conditional flows** for validation
- A **fulfillment step** with fulfillment code hook enabled

### FallbackIntent description
The FallbackIntent consists of the following:
- **Initial response** enabled, with no message and **conditional flow**
- A **fulfillment step** with fulfillment code hook enabled

### ReminderBot-LexFulfillmentLambda function description
The Lambda function shows how to detect and direct different parts of the conversation. 
It does some validation and message adjustment. Most of the functionality simply delegates back to Lex.

## Prerequisites and Set-up
See overall [README](../../README.md)

## Deploying

```
npm run cdk:deploy:reminderbot
```

## Clean-up

```
npm run cdk:destroy:reminderBotLambda
```
