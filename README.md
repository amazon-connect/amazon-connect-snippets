# Amazon Connect Snippets

This repository is a collection of code snippets for working with different parts of Amazon Connect. The snippets are organized by language. There's an additional collection of projects that come with associated CloudFormation templates and Contact Flows in the `projects/` directory.

We currently have sippets in:

* Python under [python/](python/README.md)
* Java under [java/](java/README.md)
* DotNet (C#) under [dotnet/](dotnet/README.md)
* Javascript under [javascript/](javascript/README.md)

Feel free to add more languages. Please follow the requirements in each subdirectory README.

## Snippets

| Name | Description | Links |
| ---- | ----------- | ----- |
| Outbound Dial | Uses the [StartOutboundVoiceContact](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartOutboundVoiceContact.html) API to call a number. | [Java](java/OutboundExample) [DotNet](dotnet/OutboundExample) |
| Holiday Check | Can be used to check for holidays in a contact flow | [Python](python/holidaycheck) |
| Sync Instances | Can be used to sync basic user information from one instance to another instance | [Python](python/syncinstances) |

## Projects

| Name | Description | Links |
| ---- | ----------- | ----- |
| Context Routing | Uses CTR processing, Lambda, and DynamoDB to track IVR task completion and return callers to incomplete tasks | [CloudFormation](projects/ContextRouting) |

## Contributions

Make sure the `.gitignore` per language is applied.
Make sure your snippet has no external dependencies.
Make sure your snippet is self contained.

### Values for variables

* `InstanceId` : `c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6`
* `ContactFlowId`: `ae4e2be3-5541-4c57-9738-217052e61eb3`
* `DestinationPhoneNumber` : `+12065550101`
* `SourcePhoneNumber` : `+12065550100`
