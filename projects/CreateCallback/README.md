# Placing a Call in a Callback Queue Using Lambda

This project creates a lambda with associated role as well as an Amazon Connect contact flow allowing you to push a callback directly into a queue in your Amazon Connect instance.


 
## Introduction: 
In an omni-channel contact center it is sometimes desirable to be able to offer customers on the web, or chat channels an opportunity to request a callback from an agent.
This document shows how the outbound API can be used to put a call into a configurable callback queue using lambda. This enables chat-bots and web-forms to create a callback directly in the callback queue. The call can be sent to different queues depending on which webpage or where in the context of the chat.
While not in the scope of this document, it would be recommended to keep track of the callbacks using DynamoDB to not create multiple callbacks for the same phone number. The chatbot or web page might also be configured to not offer callbacks when the contact-center is closed. Please refer to this blog post for more on this.

 
## High Level Architecture
1.	A customer, while interacting with a chat bot, requests to be called back by an agent.
2.	The chat bot calls the CreateCallback Lambda function. Depending on the context of the chat different queues or contact flows can be used.
3.	The Lambda function creates an outbound call to the Amazon Connect instance specifying a specific queue and contact flow to be executed.
4.	Amazon connect executes the specified flow and creates a callback in the specified queue using the provided customer provided callback number.
5.	The chat bot gets a successful response from the Lambda function.
6.	The chat bot informs the customer that they will be called back.
7.	When an agent is available to handle the callback created the call pops on the Contact Control Panel and the customer is called back.

Additional data can be attached and shown on the CCP the same way that the callback number is handled. This is not covered in this document.
![Screenshot of flow diagram](images/flowDiagram.PNG)
 


## Steps to get started

### Import and configure the Amazon Connect contact flow

1.	Find the contact flow called “CreateCallback” in the repository
2.	Log in to your Amazon Connect Console.
3.	On the left side of the Amazon Connect console, select Routing -> Contact Flows
4.	Click the Create contact flow button at the top-right
5.	Click the drop-down at the top-right and select Import Flow
6.	Click the Select button and select the downloaded CreateCallback file from step 1.
7.	Save and Publish your contact flow.
8.	Make a note of the ID for the flow. You will use it for the Lambda later.
![Screenshot of contact flow id](images/contactFlow.PNG)
9.	Make a note of the ID for the callback queue that you have configured. (create one if you do not already have a callback queue)
![Screenshot of queue id](images/queue.PNG)
10.	Make sure you have claimed a phone number for your Connect instance and that this number is pointing to an inbound flow that is <B>NOT</B> the imported CreateCallback flow.


### Create the Lambda and role using CloudFormation

We will use a CloudFormation template to programmatically deploy the backend logic:
•	A Lambda for creating an outbound call.
•	IAM role and inline policy

1.	Log in to your AWS Management Console.
2.	Confirm that the AWS Region selected has the Amazon Connect service available.
3.	Select the CloudFormation service.
4.	Create a new stack by using the CreateCallback.yaml template found in the repository.
5.	Select an appropriate Stack name and provide names for the Lambda and Role that will be created.
6.	Enter the appropriate data for the parameters requested. These are related to the Amazon Connect instance you have set up.
7.	Click the Create stack button after selecting the checkbox.
![Screenshot of permission dialog](images/permissions.PNG)

 
## Call the Lambda
To execute the Lambda and create a callback, create an event for the Lambda function and call it to push a callback to the queue. If you are logged in and Available as an agent in the Amazon Connect instance, you will get a callback almost immediately (unless other queues have calls of higher priority waiting to be handled).
An example event would look like this:
<br>{<br>
  "Attributes": {<br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"CallbackNumber": "+1XXXXXXXXXX"
  }<br>
}

You can also supply additional paramters if you want to override the environment varables (e.g. to target a different queue or use a different contact flow).<br>
{<br>
  "ContactFlowId": "The ID for the contact flow used to create the callback",<br>
  "DestinationPhoneNumber": "+1 phone number claimed by your instance",<br>
  "InstanceId": "Your Amazon Connect Instance ID",<br>
  "QueueId": "The ID for the callback queue",<br>
  "Attributes": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"CallbackNumber": "The customer’s phone number to call back in E.164 standard (+1xxxxxxxxxx)" <br>
  },<br>
  "SourcePhoneNumber": "A phone number claimed by your instance in E.164 standard (+1xxxxxxxxxx)"<br>
}<br>




## Parameters and Environment Variables

| Parameter/Variable | Description |
| --- | --- |
| ContactFlowId | The contact flow to point to initially. Points directly to the create callback flow.|
| DestinationPhoneNumber | The call centers number in this case (+1 XXX XXX XXXX) This is the phone number of the outbound call created. In this use case we are dialing our own Amazon Connect instance. |
| InstanceId | The instance Id of the Amazon Connect instance. |
| QueueId | This is the id of the callback queue xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| Attributes | {"CallbackNumber": "+1xxxxxxxxxx"} Callbacknumber is the number of the customer to call back. Additional attributes can be added here and accessed in the contact flow for screen pop. |
| SourcePhoneNumber | "+1xxxxxxxxxx" This is the number to dial out from. It has to be set to a number claimed by the call center. Set it to the same number as the DestinationPhoneNumber. If you have not claimed a number for your instance of Amazon Connect you will have to do that first and put that number here. It does not matter which flow the number is assigned to in Amazon Connect (As long as it is <B>NOT</B> the imported CreateCallback flow). The Lambda code specifies which flow will be targeted by the callbacks. |


### Next Steps
This functionality can be used to offer callbacks from a customer’s website. Depending on the page the customer is viewing a different callback queue could be used (Billing, PaymentExtension, NewService etc). Similarly different queues could be used depending on where in the chat-bot experience the customer requested a callback.

It is possible to attach more data to the callback using Attributes the same way that the callback phone number is sent in now. This can be used to attach data to the call such as the customer’s name, reason for calling etc. This data can then be displayed to the agent using a custom CCP as described here.

