# Contextual Routing Example

This project demonstrates how you can use contact trace record processing, Lambda, and DynamoDB to track a callers progress through an IVR task, such as making a payment, and return them to that task should they be disonnected. In this example, we use contact attributes to initialize a tracker, store relevant data, and leave the tracker active until the task is complete. If the task does not complete and the caller is disconnected, the emitted CTR will trigger a write to Dynamo DB which stores all of the existing data. When the customer calls back in, the data is retrieved and the customer is presented the option to return to the task in progress. 
## Examples
In this project, two examples are provided:
1. Simple tracker that just returns to a given task in the IVR
2. Complex tracker that maintains entered data and allows the customer to return to the exact point in a task, retaining all entered data relevant to the task.

## Solution Components
- IAM Role: Allows Lambda read access to Kinesis Data Streams & read/write access Dynamo DB
- Lambda Functions
  - Processes the Kinesis Data Stream to set active trackers
  - Retrieve and remove trackers
- DynamoDB Table: Stores trackers
- Amazon Connect Contact Flows
  - Main flow that checks for trackers and redirects accordingly
  - Sample change PIN flow used to demonstrate the simple tracker scenario
  - Sample make payment flow used to demonstrate the complex tracker scenario
  - Customer queue flow that clears all trackers when the call is queued
