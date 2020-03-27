# Routing Table

The caller history project utilizes AWS Lambda and Amazon DynamoDB dynamically route a caller to either a queue or an external number.  

# To deploy
1. Launch the Amazon Cloudformation template routingtable.yml.
2. Navigate to the Amazon Connect console and select your Amazon Connect instance.
3. Navigate to Contact flows.  Under AWS Lambda, add the AWS Lambda function created by the Amazon Cloudformation Template.
4. Log into your Amazon Connect instance.
5. Navigate to Contact Flows under Routing.
6. Create a new contact flow.
7. Import the RoutingTable file in this repo.
8. Under the Invoke AWS Lambda function, select the ContactRoutingLambda AWS Lambda function created by the template.
   1. This example utilizes the dialed phone number as the routing feature, but any attribute can be used.  This use case is for when multiple DIDs or TFNs are routed to the same contact flow, but depending on certain attributes or caller decisions, need to be routed to a specific queue or external line.
9.  Publish and test.

By default, the caller will be routed to the Basic Queue.

# To add routing
1. Navigate to the Amazon DymamoDB service.
2. Select the RoutingTable table.
3. Create a queue routing item with the following JSON text:
```
{
  "RoutingFeature": "+15555555555",     # replace with a claimed phone number
  "QueueARN": "<QUEUE_ARN>",            # you can find the ARN by selecting the queue in the Queue menu and clicking on "Show additional queue information"
  "RoutingType": "QUEUE"
}
```
4. Create a external number routing item with the following JSON text:
```
{
  "RoutingFeature": "+16666666666",     # replace with a claimed phone number
  "ExternalEndpoint": "+17777777777",   # replace with the target phone number
  "RoutingType": "EXTERNAL"
}
```
