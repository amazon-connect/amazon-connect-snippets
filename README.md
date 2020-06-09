# Amazon Connect Snippets

This repository is a collection of code snippets for working with different parts of Amazon Connect. The snippets are organized by language. There's an additional collection of projects that come with associated CloudFormation templates and Contact Flows in the `projects/` directory.

We currently have snippets in:

* Python under [python/](python/)
* Java under [java/](java/)
* DotNet (C#) under [dotnet/](dotnet/)
* Javascript under [javascript/](javascript/)
* Go under [go/](go/)
* PowerShell [powershell/](powershell/)

Feel free to add more languages. Please follow the requirements in each subdirectory README.

## Snippets

| Name | Description | Links |
| ---- | ----------- | ----- |
| Outbound Dial | Uses the [StartOutboundVoiceContact](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartOutboundVoiceContact.html) API to call a number. | [Java](java/OutboundExample) [DotNet](dotnet/OutboundExample) |
| Holiday Check | Can be used to check for holidays in a contact flow | [Python](python/holidaycheck) |
| Sync Instance User Data | Can be used to sync basic user information from one instance to another instance | [Python](python/syncinstances) |
| Lex Default Intent Function | pass the utterance used in Lex on default intent to a contact attribute in connect | [Python](python/LexDefaultIntentUtterance) |
| Get Available Agents | Uses the [GetCurrentMetricData](https://docs.aws.amazon.com/connect/latest/APIReference/API_GetCurrentMetricData.html) API to get all available agents in a queue | [Go](go/GetQueueAvailableAgents) |
| Add Connect User | Add a new user to Amazon Connect | [PowerShell](powershell/New-ConnectUser) |
| Multi Account / Multi Instance Metric Collection | Collect metrics from multiple accounts | [Python](python/multiaccountmetrics/multi_account_metrics.py) |
| Restrict Deskphone in CCP | Enforce deskphone settings with javascript in the CCP | [Javascript](javascript/restrict-deskphone-in-ccp) |

## Contributions

Make sure the `.gitignore` per language is applied.
Make sure your snippet has no external dependencies.
Make sure your snippet is self contained.

### Values for variables

* `InstanceId` : `c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6`
* `ContactFlowId`: `ae4e2be3-5541-4c57-9738-217052e61eb3`
* `DestinationPhoneNumber` : `+12065550101`
* `SourcePhoneNumber` : `+12065550100`
