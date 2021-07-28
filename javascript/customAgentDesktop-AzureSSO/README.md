# How to launch a custom Amazon Connect Agent Desktop from Microsoft 365 Application Launcher
Launching Amazon Connect is a common requirement for enterprise customers who manage their [custom Amazon Connect Agent Desktop](https://github.com/amazon-connect/amazon-connect-streams) using the same process as their other internal applications.  This also benefits the end user, as the Agent Desktop is located in the same location as their other enterprise applications.

## Demo
![Demo](./images/demo.gif)

## How it works
1. Sign in to [Microsoft 365](https://office.com/)
1. Select the custom Amazon Connect Agent Desktop Application
1. [Microsoft Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/) (Azure AD) sends the SAML token to [Amazon Cognito](https://aws.amazon.com/cognito/) and then redirects the user to the [Amazon CloudFront](https://aws.amazon.com/cloudfront/) URL.  The application is loaded in the browser.
1. The [Amazon Connect Contact Control Panel](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-contact-centers.html) (CCP) loads and authenticates with Microsoft 365
1. The application calls [Amazon API Gateway](https://aws.amazon.com/api-gateway/) which authenticates using an Amazon Cognito [JSON Web Token](https://jwt.io/) and displays the results 

## Prerequisites
* An AWS account with Administrator access
* A [Microsoft 365](https://www.microsoft.com/en-us/microsoft-365/business/compare-all-microsoft-365-business-products?activetab=tab:primaryr2) subscription with Administrator access
* An [Amazon Connect](https://aws.amazon.com/connect/) instance configured with [SAML 2.0-based authentication](https://docs.aws.amazon.com/connect/latest/adminguide/configure-saml.html)
* Azure AD as the SSO provider configured to access the CCP via the Microsoft 365 Application Launcher.  Please review this [blog](https://aws.amazon.com/blogs/contact-center/configure-single-sign-on-using-microsoft-azure-active-directory-for-amazon-connect/) for additional details.
* An environment to build a [React Web application](https://reactjs.org/) and run [AWS CLI](https://aws.amazon.com/cli/) commands.  [AWS Cloud9](https://aws.amazon.com/cloud9/) is one option.

## How to deploy
1. Create a new Microsoft 365 Application
    1.  Go to Azure Active Directory Admin Center
    1.  Select "Enterprise applications"
    1.  Select "New application"
    1.  Select "Create your own application" 
        1. Provide a name
        1. Select "Integrate any other application you don't find in the gallery (Non-gallery)"
        1. Select create
    1.  Select the created Enterprise application
    1.  Select "Single sign-on" and then select "SAML"
    2.  On the SAML screen, copy the "App Federation Metadata Url".  This is located in the "SAML Signing Certificate" section and will be used in the next step
1. Deploy ./deployment/template.cft [AWS Cloudformation](https://aws.amazon.com/cloudformation/) script
    1.  Provide "User access URL" as a parameter
    1.  Deploy the CloudFormation template using the AWS CLI or AWS Management Console
        1.  `aws cloudformation deploy --template-file template.cft --stack-name CustomConnectAgentDesktop --parameter-overrides AzureADAppFederationMetadataUrl="App Federation Metadata Url"`
    1. Deploying the template creates the following resources:
        1. [Amazon S3 bucket](https://aws.amazon.com/s3/) and [Amazon CloudFront](https://aws.amazon.com/cloudfront/) to host the Agent Desktop web application
        1. [Amazon Cognito user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html) to authenticate the agent using Azure AD
        1. [Amazon API Gateway](https://aws.amazon.com/api-gateway/) that returns a Mock response.  This demonstrates how to use the JSON Web Token
1. Update the Agent Desktop's configuration file (./webApp/src/config.js)
    ```js
    const config = {
        cognito:{
            region: 'AWS Cloudformation Output: Region',
            userPoolId: 'AWS Cloudformation Output: CognitoUserPoolId',
            clientId: 'AWS Cloudformation Output: CognitoClientId',
            domain: 'AWS Cloudformation Output: CognitoDomain',
            redirectUrl: 'AWS Cloudformation Output: CloudFrontRedirectUrl',
        },
        connectLoginURL: 'Amazon Connect: LoginURL',
        azureAD: {
            ccpUserAccessURL: 'Microsoft User access URL (Properties menu) for the CCP from the prerequisites section.  See "Create a second Azure AD AWS SAML application for Amazon Connect agents" section in the blog',
            customAgentDesktopUserAccessURL: 'Microsoft User access URL (Properties menu) from step 1'
        },
        apiGateway: {
            mockEndpoint: 'AWS Cloudformation Output: MockApiEndpoint',
            mockPath: 'AWS Cloudformation Output: MockApiPath'
        }
    };
    ```
1. Update the Agent Desktop's Deployment file (./deployment/deploy.sh)
    ```bash
    S3HostBucket=AWS Cloudformation Output: WebsiteHostBucket
    CloudFrontDistributionId=AWS Cloudformation Output: CloudFrontDistributionId
    ```
1. Update the Microsoft 365 Application from step 1
    1. Select the application and then select "Single Sign-on" menu
    1. Edit the values in the "Basic SAML Configuration" section:
        1. Identifier (Entity ID) = AWS Cloudformation Output: AzureADIdentifier
        1. Reply URL = AWS Cloudformation Output: AzureADReplyURL
        1. Sign on URL = AWS Cloudformation Output: AzureADSignOnUrl
    1. Add users to the applications.  It's best practice to create a group and attach it to both applications: 1) ccpUser and 2) customAgentDesktop
1. Set the "Visible to users" value to No for the Microsoft 365 Application in the prerequisites section
1. Update the Amazon Connect Approved origins for your instance.  The value is AWS Cloudformation Output: CloudFrontRedirectUrl
1. Set your browser to allow popups from AWS Cloudformation Output: CloudFrontRedirectUrl 
1. Confirm that your command-line environment is running Node v12+ 
    1.  Check version command: `node -v`
    1.  How to install the stable version:
        1. `nvm install stable`
        1. `nvm use 16.3.0`
        1. `nvm alias default v16.3.0`
1. Run the deploy script (./deployment/deploy.sh).  This does the following tasks:
    1. Installs the Node modules
    1. Builds the web application
    1. Copies the built application to the Amazon S3 bucket
    1. Invalidates the Amazon CloudFront files.  Wait for this step to complete before moving to the next step.  View the status using the Amazon CloudFront console.
1. Launch the custom Amazon Connect Agent Desktop
    1. Navigate to https://www.office.com/ using a browser
    1. Sign in to Microsoft 365
    1. Select the custom Agent Desktop application