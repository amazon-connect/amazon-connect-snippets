# Amazon Connect Snippets in Go
These programs demonstrate various use cases that interact with Amazon Connect using the AWS SDK for Go.

These examples use [Go modules](https://github.com/golang/go/wiki/Modules) to manage the dependency on the AWS SDK for Go.

1. [GetQueueAvailableAgents](./GetQueueAvailableAgents): Returns all of the agents that are in the Available state in a certain call queue. Uses the [GetCurrentMetricData API](https://docs.aws.amazon.com/sdk-for-go/api/service/connect/#Connect.GetCurrentMetricData).
    ```bash
    go run ./GetQueueAvailableAgents/main.go -r <aws-region> -q <queue-arn>
    ```
    Example output: `There are 8 available agents in the queue.`


2. [StartOutboundVoiceContact](./StartOutboundVoiceContact): Begins an outbound call using the [StartOutboundVoiceContact API](https://docs.aws.amazon.com/sdk-for-go/api/service/connect/#Connect.StartOutboundVoiceContact).
    ```bash
    go run ./StartOutboundVoiceContact/main.go -r <aws-region> -c <contact-flow-id> -p <phone-number-to-call> -i <connect-instance-id> -q <queue-id>
    ```
    Example output: 
    ```
    2020/07/25 14:24:11 Got StartOutboundVoiceContactWithContext output: {
        ContactId: "e076e874-3e3e-4f27-93e0-23ed7f8ebcd1"
    }
    ```