# Amazon Connect Snippets

This repository is a collection of code snippets for working with different parts of Amazon Connect. The snippets are organized by language. There's an additional directory called `tools` and a collection of projects that come with associated CloudFormation templates and Contact Flows in the `projects/` directory. 

We currently have snippets in:

* Python under [python/](python/)
* Java under [java/](java/)
* DotNet (C#) under [dotnet/](dotnet/)
* Javascript under [javascript/](javascript/)
* Go under [go/](go/)
* PowerShell [powershell/](powershell/)
* Tools [tools/](tools/)

Feel free to add more languages. Please follow the requirements in each subdirectory README.

## Snippets

| Name | Description | Links |
| ---- | ----------- | ----- |
| Outbound Dial | Uses the [StartOutboundVoiceContact](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartOutboundVoiceContact.html) API to call a number. | [Java](java/OutboundExample) [DotNet](dotnet/OutboundExample) [Go](go/StartOutboundVoiceContact) |
| Holiday Check | Can be used to check for holidays in a contact flow | [Python](python/holidaycheck) |
| Sync Instance User Data | Can be used to sync basic user information from one instance to another instance | [Python](python/syncinstances) |
| Lex Default Intent Function | pass the utterance used in Lex on default intent to a contact attribute in connect | [Python](python/LexDefaultIntentUtterance) |
| Get Available Agents | Uses the [GetCurrentMetricData](https://docs.aws.amazon.com/connect/latest/APIReference/API_GetCurrentMetricData.html) API to get all available agents in a queue | [Go](go/GetQueueAvailableAgents) |
| Add Connect User | Add a new user to Amazon Connect | [PowerShell](powershell/New-ConnectUser) |
| Multi Account / Multi Instance Metric Collection | Collect metrics from multiple accounts | [Python](python/multiaccountmetrics/multi_account_metrics.py) |
| Restrict Deskphone in CCP | Enforce deskphone settings with javascript in the CCP | [Javascript](javascript/restrict-deskphone-in-ccp) |
| Remote Control Center | Centrally manage prompts and routing configurations in DynamoDB | [Python](python/remote-control-center) |
| Contact Flow Helper | A single AWS Lambda function which provides a set of basic math and text tools to help manipulate data in contact flows | [Python](python/contactflowhelper)|
| Create Tasks Programmatically | CloudFormation template to enable you to programmatically create an Amazon Connect Task | [Javascript](javascript/programmatically-create-task-example)

## Projects

| Name | Description | Links |
| ---- | ----------- | ----- |
| Context Routing | Uses CTR processing, Lambda, and DynamoDB to track IVR task completion and return callers to incomplete tasks | [CloudFormation](projects/ContextRouting) |
| SCV-CrossAccountSMS | Uses Lambda and cross account permissions to allow Salesforce Service Cloud Voice provisioned Amazon Connect instances to utilize SNS to send SMS messages. | [CloudFormation](projects/SCV-CrossAccountSMS) |
| CallerHistory | The caller history project utilizes AWS Lambda and Amazon DynamoDB to record if an individual has contacted previously though a user defined identifier and records time of last contact. | [CloudFormation](projects/CallerHistory) |
| CrossRegionCrossAccount | This project shows how to call an AWS Lambda function that exists in a separate account or a separate region using AWS Lambda permissions. | [CloudFormation](projects/CrossRegionCrossAccount) |
| GetSetDataByID | This project expands on the CallerHistory project by implementing additional functionality to get, put, and update items in Amazon DynamoDB. | [CloudFormation](projects/GetSetDataByID) |
| LastAgentRouting | This project shows how to potentially implement last agent routing for customers using a voice channel.| [CloudFormation](projects/LastAgentRouting) |
| RoutingFeatureRouting | This project shows how to capture a routing feature and use that to dynamically route a caller in a contact flow.| [CloudFormation](projects/RoutingFeatureRouting) |
| LambdaAlias | This project shows how to provide access to an AWS Lambda function Alias from Amazon Connect.| [CloudFormation](projects/LambdaAlias) |
| ContextRouting | This project demonstrates how you can use contact trace record processing, Lambda, and DynamoDB to track a callers progress through an IVR task, such as making a payment, and return them to that task should they be disonnected.| [CloudFormation](projects/ContextRouting) |
| Rate Limiter | The rate limiter project utilizes AWS Lambda and Amazon DynamoDB dynamically to add rate limiting a caller to a Amazon Connect queue based on their phone number and/or IP address.| [CloudFormation](projects/RateLimiter) |
| CCP Log Parser| A visualisation tool to visualise CCP logs to help troubleshoot client side errors | [link](tools/CCPLogParser) |
| Connectivity Test Tool | This tool checks which web browser the agent is running, the network configuration from the client side and whether the microphone has required permissions. | [link](tools/CCPConnectivityTestTools) |
| Dynamic Contact Center | This project demonstrates how you can use persistent session attributes to develop modular, repeatable and dynamic contact flows | [CloudFormation](projects/DynamicContactCenter)
| Email Channel using SES and Tasks | This project demonstrates how you can use Tasks and Amazon SES as a way to support email communications through Amazon Connect | [CloudFormation](projects/amazon-connect-email-channel)
## Contributions

Make sure the `.gitignore` per language is applied.
Make sure your snippet has no external dependencies.
Make sure your snippet is self contained.

### Values for variables

* `InstanceId` : `c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6`
* `ContactFlowId`: `ae4e2be3-5541-4c57-9738-217052e61eb3`
* `DestinationPhoneNumber` : `+12065550101`
* `SourcePhoneNumber` : `+12065550100`
