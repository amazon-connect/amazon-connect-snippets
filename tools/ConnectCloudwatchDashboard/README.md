## Purpose
This project's intent is to automate the creation and deployment of a Cloudwatch dashboard to monitor critical metrics for an Amazon Connect instance.

It is made of two parts:
- a Cloudformation stack
- a Lambda

The Cloudformation stack will take care of creating the dashboard by triggering the Lambda as a custom resource. The deletion of the dashboard is also handled when the stack is deleted.
The Lamdba is gathering the Amazon Connect instance necessary objects (queues, contact flows, etc...) and responds to Cloudformation events to create the relevant dashboard.

The dashboard created allows to monitor:
- Concurrent Calls (%)
- Concurrent Calls (number)
- Throttled Calls (number)
- Contact Flow Errors
- Contact Flows Fatal Errors
- Longest Queue Wait Time
- Packet Loss Rate
- Calls Per Interval
- Call Recording Upload Error
- Misconfigured Phone Numbers
- Calls Breaching Quota


## How-to use
Zip index.js, and upload the archive to S3.
Create the Cloudformation stack using the template that takes a few input parameters:
- the name of the dashboard that will be created (without spaces or special characters)
- the Amazon Connect instance id
- the S3 bucket where the Lambda package is located
- the name of the Lambda package object in S3

## Feedback
If you would like to give some feedback, please get in touch with <a href="mailto:plancqua@amazon">me</a>!