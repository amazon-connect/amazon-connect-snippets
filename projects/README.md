# Amazon Connect Backend Toolkit

## What is this?
Amazon Connect is an easy to use omnichannel cloud contact center that helps companies provide superior customer service at a lower cost. Over 10 years ago, Amazon’s retail business needed a contact center that would give our customers personal, dynamic, and natural experiences. We couldn’t find one that met our needs, so we built it. We've now made this available for all businesses, and today thousands of companies ranging from 10 to tens of thousands of agents use Amazon Connect to serve millions of customers daily.

This repo is a collection of Cloudformation templates and snippets of solutions that can be quickly deployed to implement some form of functionality in support of an Amazon Connect implementation.  The repo is organized by projects and each project is self contained.

The repo is designed to facilitate adoption of Amazon Connect by showcasing its ability to utilize other AWS services like AWS Lambda, Amazon Lex, and Amazon DynamoDB.  Using these snippets, you can accelerate development of services that support Amazon Connect as part of a workshop, hackathon, or PoC development.

## How do I use it?
Each project contains an Amazon Cloudformation template or deployment guide as part of its directory.  Since each project is self contained (though some may have been used to develop others), there is no set up required outside of setting up your first Amazon Connect instance.  Each project will additionally include information or Contact Flows to demonstrate functionality.

## Which projects are currently active?
 - **CallerHistory**: The caller history project utilizes AWS Lambda and Amazon DynamoDB to record if an individual has contacted previously though a user defined identifier and records time of last contact.
 - **GetSetDataByID**: This project expands on the CallerHistory project by implementing additional functionality to get, put, and update items in Amazon DynamoDB.  This type of workflow is very useful for getting and setting information about contacts or collecting survey information.
 - **HotMessage**: This project demonstrates how hot messages or time dependent events can be dynamically added to an Amazon Connect contact flow.
 - **LastAgentRouting**:  This project shows how to potentially implement last agent routing for customers using a voice channel.
 - **RoutingFeatureRouting**:  This project shows how to capture a routing feature and use that to dynamically route a caller in a contact flow.  For example, based on the number dialed a caller can be routed to a specific queue or out to a specific external number.
 - **CrossRegionCrossAccount**:  This project shows how to call an AWS Lambda function that exists in a separate account or a separate region using AWS Lambda permissions.
 - **LambdaAlias**:  This project shows how to provide access to an AWS Lambda function Alias from Amazon Connect.
 - **SCV-CrossAccountSMS**: This project show how to use AWS Lambda and cross account permissions to allow Salesforce Service Cloud Voice provisioned Amazon Connect instances to utilize Amazon SNS to send SMS messages.
 - **ContextRouting** - This project demonstrates how you can use contact trace record processing, Lambda, and DynamoDB to track a callers progress through an IVR task, such as making a payment, and return them to that task should they be disconnected.
 - **Rate Limiter**: The rate limiter project utilizes AWS Lambda and Amazon DynamoDB dynamically to add rate limiting a caller to a Amazon Connect queue based on their phone number and/or IP address. 
 - **DynamicContactCenter**: The dynamic contact center project demonstrates how you can use AWS Lambda and Amazon DynamoDB to populate session attributes based on the dialed number and dynamically route a call to various queues, prompts, sub-contact flows, and more.  

# License
This library is licensed under the MIT-0 License. See the LICENSE file.