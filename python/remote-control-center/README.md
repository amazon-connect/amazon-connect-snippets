# Remote Control Center Solution

## What is this?
The Remote Control Center will allow you to centrally manage how your contact center manages the user experiences as individuals move through your contact flows.

This solution will allow you to centrally manage prompts, translation, static routing features, and language specific routing features using an Amazon DynamoDB table.  Each configuration is referenced by a CollectionId and a ConfigId that can be called via AWS Lambda from a contact flow.  Storing these configuration values allow you to simplify contact flows by dynamically populating contact control blocks with language or experience specific values instead of enumerating all possible customer experiences.

Collections allow you to group prompts and other routing features together to simplify how you import configurations into a contact flow.  For example, by creating a collection of configurations for your main menu contact flow (i.e. MAIN_MENU), you can invoke a single Lambda function to return the appropriate prompt to play for a greeting, menu options, and any potential hot messages in a specific language, as well as any flags that can alter how users are routed through the contact flow.  Using routing features, you can implement logic that changes the user experience based on external parameters.  For example, by setting a flag in the configuration table, you can inform a contact that the contact center is closed due to a company event.

### Prompt management
This solution will allow you to centrally manage and configure TTS or SSML based prompts that can be referenced within a contact flow by calling the GetConfigLambda function with a CollectionId and optional ConfigId.  The solution's HydrateConfigTableLambda and GetConfigLambda include the ability to translate prompts into any language supported by Amazon Translate.  By centrally managing prompts in the config table, you can immediately publish changes to prompts without logging into Amazon Connect or modifying any contact flows.

The solution is designed to translate prompts on the fly if prompts are requested in a language that is not already in the table.  The translation is then persisted for future use.  If a translation already exists, it will not be overwritten.  This allows you to modify the translation to correct for any translation gaps.

### Static Routing features
Static routing features allow you to set flags or otherwise define parameters that should be used within a contact flow.  Using static features, you can define logic for different levels of event, define external numbers to forward calls, or provide parameters for queues, prompts, music, etc.

One use case for static routing features revolves around how users get routed based on external parameters.  For example, by default you may set a flag to 0 for day to day operations. You may want to define a flag for 1 to play a message to a user before routing to the main menu to share more information, i.e. holds times may be longer than normal due to high call volume. Similarly, you can define a flag level of 2 to play a message indicating the office is closed before disconnecting the user.

### Language Specific Routing features
Language specific routing features are used to define features that are language dependent but not meant to be translated.  For example, you can use a language specific routing feature to define queue IDs that support specific languages.  By using a dynamic parameter, you can greatly simplify your contact flows to route users to the appropriate prompts, queues, and agents without duplicating contact flows.

## Initial Deployment
This solution leverages the AWS Serverless Application Model to deploy the backend infrastructure required to implement the solution.

### Deploy the solution
1. Clone this directory
2. Ensure the AWS CLI and AWS SAM are installed locally (or leverage a Cloud9 development environment)
   1. https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html
3. Run the following commands
   1. ` sam build `
   2. ` sam package --s3-bucket <YOUR_S3_BUCKET> --output-template-file packaged.yaml `
   3. ` sam deploy --template-file packaged.yaml --stack-name remote-control-center   --capabilities CAPABILITY_IAM  `
4. Wait while the template deploys the following resources
   1. ConfigTable - The Amazon DynamoDB table used to store configurations
   2. HydrateConfigTableLambda - An AWS Lambda function used to populate values into the config table
   3. RetrieveConfigLambda - An AWS Lambda function to be invoked from within a contact flow
   4. HydrateConfigTableLambdaRole - An AWS IAM Role for HydrateConfigTableLambda
   5. RetrieveConfigLambdaRole - An AWS IAM Role for RetrieveConfigLambda

### Configure example configurations
1. Navigate to the HydrateConfigTableLambda function
2. Included in the function package is a configs.json file with example configurations
3. The function code includes comments on how to create additional configurations using events
4. Create and execute a test event with the following JSON body:
```javascript
{
  "LanguageCodes": [
    "en",
    "fr",
    "es"
  ]
}
```
5. This will populate the table with the default configurations and translate messages to French and Spanish
6. Navigate to the ConfigTable in DynamoDB to validate the configurations were properly loaded

### Configure Amazon Connect to leverage the Control Center
1. Navigate to the Amazon Connect console
2. Select your instance (or create a new one)
3. Within the Amazon Connect service page under Contact Flows, give your instance permission to the RetrieveConfigLambda function
4. Log into the instance
5. Under routing, select contact flows and select create new contact flow
6. Import the example remote-Sample.json contact flow
7. For the two Invoke AWS Lambda function blocks, update the target lambda function to the RetrieveConfigLambda function
8. Save, publish, and route a phone number to the contact flow
9. Test the contact flow for each of the available languages.  After testing option 4 (Italian) notice how the prompts were automatically translated into Italian and then stored in the DynamoDB table
10. Set the HOT_MESSAGE_FLAG configuration to 1 and test.  Then set it to 2
11. Test modifying some of the language specific prompts within the DynamoDB console. Note, to change the English prompt, you must modify the "en" attribute and not the DefaultResponse

## Behaviors and upkeep

### Maintaining Messages
Messages can be changed at any time.  To overwrite and translate messages, the HydrateConfigTableLambda function includes a sample event to overwrite messages.  Note, using the function will replace the entire item, including any additional translations.  However it is the fastest way to bulk upload prompts and configure the base languages used for translation.

Prompts can also be modified directly in the table.  The changes made directly in the table will take effect immediately. Note, to change the English prompt, you must modify the "en" attribute and not the DefaultResponse

If a language is requested that is not in the table, the GetConfigLambda will use the DefaultResponse attribute to attempt to translate into the target language.  If the translation fails, the DefaultResponse is returned in lieu of a translation.

You can also use SSML in the field as long as the contact flow block is set up to interpret the response as SSML.

### Maintaining Language Routing features
Like Messages, Language Routing features can be updated using the bulk tool or directly in the console.  

Unlike Messages, the retrieval lambda function will not attempt to translate the DefaultResponse upon request in a new language, rather it will just return the DefaultResponse and save an entry in the requested language.  You can then go into the table and update the value to the desired value.  

This config type is useful for designating dynamic values that are dependent on a specific language.  For example, setting up language specific queues or forwarding to language specific external numbers.  For using recorded prompts or queues, the dynamic routing blocks expect either the resource ARN or resource ID.  You can also use SSML in the field as long as the contact flow block is set up to interpret the response as SSML.

### Maintaining Static Routing features
Like Messages, Static Routing features can be updated using the bulk tool or directly in the console.  

Unlike Messages, Static Routing features are not language specific nor do they create language specific attributes as options.  Rather, static features return the DefaultResponse whenever they are called.

These features can be used with numeric or text based values to be referenced within the contact flow.

Use cases can be hot message or emergency closure behaviors, external forwarding numbers, etc.

### Contact Flow requirements
The GetConfigLambda function expects 3 variables when invoked from a contact flow:
1. CollectionId - Required: Passed as Parameter.  This is a required field that determines which Collection of configs to use when returning configurations.
2. ConfigId - Optional: Passed as Parameter.  This is an optional field that returns will only return the configuration with the specific CollectionId and ConfigId combination.
3. LanguageCode - Optional: Pass as a contact Attribute or Parameter.  Values passed as a parameter OVERRIDE attribute settings.  Setting the code as an attribute persists the configuration for the duration of the contact.  The LanguageCode is the Amazon Translate specific code used to perform translation.  If no LanguageCode exists, English is used as the default.
   1. To see available languages: https://docs.aws.amazon.com/translate/latest/dg/what-is.html

The expected response format is as follows:
```python
{
    "SUCCESS": "TRUE|FALSE",    #returns if there is an unhandled error or no configs are returned
    "CONFIG_ID_1": "Message 1", 
    "CONFIG_ID_2": "Message 2",
    ...
}
```
If using the ConfigId parameter, only one message will be returned.  If not, all configs within the collection are returned.

To reference the values as an external attribute, use $.External.ConfigId or reference the ConfigId within a Dynamic selection block.

Note: External values are not persisted to the Contact Trace Record and are overwritten upon new Lambda Invocation.  

## Best practices
- Keep collections as small as possible: If a large collection is translated on the fly, there is a risk that the invocation will time out.  It also reduces the amount of data being passed around the contact flow and simplifies management.
- Make use of reusable content - Using collections and mappings, you can build contact flows that offer dynamic content without having to enumerate contact flows for every possible option.
- Plan for failure and nothing fails - Make use of static features to build alternative contact flow paths for unexpected events.  Similarly, since we are using dynamic attributes, ensure error paths provide for graceful degradation.  