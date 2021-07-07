import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from "@aws-cdk/aws-iam";

import path = require("path");
import { Duration } from '@aws-cdk/core';

export class AmazonConnectTasksCloudFormationTemplateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * 
     * Parameters
     * 
     */
    const connectInstanceArn = new cdk.CfnParameter(this, "connectInstanceArn", {
      type: "String",
      description: "The ARN of the Amazon Connect instance you want to use."});

    /**
     * 
     * IAM Configuration
     * 
     */
    let createContactFlowPolicy = new iam.ManagedPolicy(this, `CreateContactFlowPolicy`, {
      description: "TODO",
      statements: [
        iam.PolicyStatement.fromJson({
          Sid: "CreateContactFlow",
          Effect: "Allow",
          Action: ["connect:CreateContactFlow"],
          Resource: [`${connectInstanceArn.valueAsString}`, `${connectInstanceArn.valueAsString}/*`],
        }),
      ],
    });

    let createTaskPolicy = new iam.ManagedPolicy(this, `CreateTaskPolicy`, {
      description: "TODO",
      statements: [
        iam.PolicyStatement.fromJson({
          Sid: "CreateTask",
          Effect: "Allow",
          Action: ["connect:StartTaskContact"],
          Resource: [`${connectInstanceArn.valueAsString}`, `${connectInstanceArn.valueAsString}/*`],
        }),
        iam.PolicyStatement.fromJson({
          Sid: "GetMessageContent",
          Effect: "Allow",
          Action: ["workmailmessageflow:GetRawMessageContent"],
          Resource: ['*'],
        }),
      ],
    });

    let sendEmailPolicy = new iam.ManagedPolicy(this, `SendEmailPolicy`, {
      description: "TODO",
      statements: [
        iam.PolicyStatement.fromJson({
          Sid: "SendEmail",
          Effect: "Allow",
          Action: ["ses:SendEmail"],
          Resource: ['*'],
        }),
      ],
    });

    /**
     * 
     * Lambda Configuration
     * 
     */
    const amazonConnectLayer = new lambda.LayerVersion(this, "AmazonConnectLayer", {
      // updated 10/15 --> TODO: update to include new zip with new create contact flow api
      code: lambda.Code.fromAsset(path.resolve(__dirname, "../src/lambdaLayer/TaskJsSDK.zip")),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X, lambda.Runtime.NODEJS_10_X],
    });

    const mailParserLambda = new lambda.LayerVersion(this, "MailParserLambda", {
      // updated 10/15 --> TODO: update to include new zip with new create contact flow api
      code: lambda.Code.fromAsset(path.resolve(__dirname, "../src/lambdaLayer/mailparser_lambda_layer.zip")),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X, lambda.Runtime.NODEJS_10_X],
    });


    const sendEmailLambda = new lambda.Function(this, "SendEmailLambda", {
      handler: "SendEmailHandler.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.resolve(__dirname, `../src/lambdaFunctions/`))
    });
    sendEmailLambda.role?.addManagedPolicy(sendEmailPolicy);

    const connectServicePrincipal = new iam.ServicePrincipal('connect.amazonaws.com', {
      conditions: {
        ArnEquals: {
          'aws:SourceArn': sendEmailLambda.functionArn
        }
      }
    });
    
    sendEmailLambda.addPermission('ConnectAccess', {
      principal: connectServicePrincipal,
    });

    const solutionHelperLambda = new lambda.Function(this, "SolutionHelperLambda", {
      handler: "SolutionHelperHandler.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.resolve(__dirname, `../src/lambdaFunctions/`)),
      layers: [amazonConnectLayer],
      environment: {
        INSTANCE_ARN: connectInstanceArn.valueAsString
      }
    });
    solutionHelperLambda.role?.addManagedPolicy(createContactFlowPolicy);

    const customResource = new cdk.CustomResource(this, "CreateContactFlows", {
      serviceToken: solutionHelperLambda.functionArn,
      resourceType: "Custom::LoadLambda",
      properties: {
        CustomAction: "CreateContactFlows",
        SendEmailFunctionArn: sendEmailLambda.functionArn
      }
    });
    
    const createTaskLambda = new lambda.Function(this, "CreateTaskLambda", {
      handler: "CreateTaskHandler.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.resolve(__dirname, `../src/lambdaFunctions/`)),
      layers: [amazonConnectLayer, mailParserLambda],
      timeout: Duration.seconds(15),
      environment: {
        INSTANCE_ARN: connectInstanceArn.valueAsString,
        CONTACT_FLOW_ID: customResource.getAttString("contactFlowId")
      }
    });
    createTaskLambda.role?.addManagedPolicy(createTaskPolicy);
    const workmailServicePrincipal = new iam.ServicePrincipal(`workmail.${this.region}.amazonaws.com`, {
      conditions: {
        ArnEquals: {
          'aws:SourceArn': createTaskLambda.functionArn
        }
      }
    });
    
    createTaskLambda.addPermission('WorkMailAccess', {
      principal: workmailServicePrincipal,
    });
  }
}
