# Amazon Connect Snippets in Go
These programs demonstrate various use cases that interact with Amazon Connect using the AWS SDK for Go.

These examples use Go 1.14 and [Go modules](https://github.com/golang/go/wiki/Modules) to manage the dependency on the AWS SDK for Go.

1. [GetQueueAvailableAgents](./GetQueueAvailableAgents): Returns all of the agents that are in the Available state in a certain call queue. Uses the [GetCurrentMetricDataOutput API](https://docs.aws.amazon.com/sdk-for-go/api/service/connect/#Connect.GetCurrentMetricData).
    ```bash
    go run ./GetQueueAvailableAgents/main.go -r <aws-region> -q <queue-arn>
    ```
    Example output: `There are 8 available agents in the queue.`