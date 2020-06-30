# Contextual Routing Example

This project demonstrates how you can use contact trace record processing, Lambda, and DynamoDB to track a callers progress through an IVR task, such as making a payment, and return them to that task should they be disonnected. In this example, we use contact attributes to initialize a tracker, store relevant data, and leave the tracker active until the task is complete. If the task does not complete and the caller is disconnected, the emitted CTR will trigger a write to Dynamo DB which stores all of the existing data. When the customer calls back in, the data is retrieved and the customer is presented the option to return to the task in progress. To keep the tracking table clean, all trackers delete using a TTL. 

## Alternative approaches

This approach uses CTR processing to track task completion. As such, there is an inherent lag in the tracker storage. Other approaches can reduce this lag, but require additional Lambda integration steps. This example is intended to inform about the concept of context tracking, and may or not be the best solution for your use case. 

## Examples
In this project, two examples are provided:
1. Simple tracker that just returns to a given task in the IVR
2. Complex tracker that maintains entered data and allows the customer to return to the exact point in a task, retaining all entered data relevant to the task.

## Project Components
- CloudFormation template that builds
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
  
## Project Requirements
- Operational Amazon Connect instance
- CTR Streaming configured using Kinesis Data Streams (Not designed for use with Kinesis Data Firehose)

## Deployment Steps
Perform the following steps to deploy this project. 
1. Deploy the cloudformation template context.yaml
  - Make sure that you select the correct region to match your Amazon Connect instance
  - Make sure that you use the ARN for the Contact Trace Record stream associated with your Amazon Connect instance
2. Add the ContextTrackerCheck Lambda function to your Amazon Connect instance.
3. Download the four contact flows in the ContactFlows directory.
4. Import them in the following order, publishing each as you import them (do not make any changes at this time):
  - (QUEUE FLOW) 001 Context Tracking - Queue
  - (CONTACT FLOW) 001 Context Tracking - Main
  - (CONTACT FLOW) 001 Context Tracking - Change PIN
  - (CONTACT FLOW) 001 Context Tracking - Make Payment
5. Open the 001 Context Tracking - Main contact flow and make the following changes:
  - Find the Invoke AWS Lambda Function block and change it to point to the ContextTrackerCheck Lambda function that you enabled with your instance in step 2.
  - Find the first Transfer to flow block. Change the transfer destination from the attribute "CHANGE TO MAKE PAYMENT FLOW" to Select a flow and choose the "001 Context Tracking - Make Payment" flow
  - Find the second Transfer to flow block. Change the transfer destination from the attribute "CHANGE TO CHANGE PIN FLOW" to Select a flow and choose the "001 Context Tracking - Change PIN" flow
  - Save & Publish
6. Set the 001 Context Tracking - Main as the contact flow for a phone number in your instance.
7. Wait ~ 2 min for everything to update.

## Validation
To validate function, perform the following steps:
### Test no context storage
1. Call the phone number that you assigned
2. Press 2 to change your PIN
3. Enter a new PIN and Confirm. You should get a PIN changed message, then return to the main menu.
4. Hang up. 
5. Wait 2 minutes to be positive that the CTR has completely processed.
6. Go to the DynamoDB dashboard and open your tracking table.
7. There should be no tracker.

### Test basic tracker
1. Call the phone number that you assigned
2. At the main menu, press 2 to change your PIN
3. Enter a new PIN, then hang up when the IVR asks you to confirm
4. Wait 2 minutes and call back.
5. When you call back in, it should ask if you want to return to the PIN change tast.
6. Press 1 to return to the PIN change task and complete the task, which will ultimately reset your tracker.

### Test complex tracker
1. Call the phone number that you assigned
2. At the main menu, select 1 to make a payment
3. Press 1 to pay by card and enter a 16 digit number
4. Enter the 4-digit expiration date
5. Hang up the call when asked for the amount
6. Wait 2 minutes and call back.
7. When you call back in, it should ask if you want to return to the payment menu and return you to the place that you left off.
8. Complete the payment to reset the tracker
  
