// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime } from "aws-cdk-lib/aws-lambda"
import { CfnBot, CfnBotAlias, CfnBotVersion } from "aws-cdk-lib/aws-lex"
import { Asset } from "aws-cdk-lib/aws-s3-assets"
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"

import { NagSuppressions } from "cdk-nag"
import * as path from "path"

export class ReminderBotStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    const lexFulfillmentLambda = new NodejsFunction(this, "LexFulfillmentLambda", {
      memorySize: 1024,
      timeout: Duration.seconds(30),
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {
        DEBUG_LOGGING_ENABLED: "true",
      },
      entry: path.join(__dirname, "../src/reminderBotLex2Lambda/reminderBotLambda.ts"),
    })

    NagSuppressions.addResourceSuppressions(
      lexFulfillmentLambda,
      [
        {
          id: "AwsSolutions-IAM4",
          reason: "This is the default Lambda Execution Policy which just grants writes to CloudWatch.",
        },
      ],
      true
    )

    const lexBotRole = new Role(this, "LexBotRole", {
      assumedBy: new ServicePrincipal("lexv2.amazonaws.com"),
      inlinePolicies: {
        ["LexRuntimeRolePolicy"]: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: ["*"],
              actions: ["polly:SynthesizeSpeech", "comprehend:DetectSentiment"],
            }),
          ],
        }),
      },
    })

    NagSuppressions.addResourceSuppressions(
      lexBotRole,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "This is the standard pattern for a service-linked role for Amazon Lex V2.",
        },
      ],
      true
    )

    const lexAssetS3Bucket = new Asset(this, "lexAssetS3Bucket", {
      path: path.join(__dirname, "../bots/ReminderBotFiles"),
    })

    const reminderBot = new CfnBot(this, "ReminderBot", {
      dataPrivacy: { ChildDirected: false },
      idleSessionTtlInSeconds: 300,
      name: "ReminderBot",
      roleArn: lexBotRole.roleArn,
      autoBuildBotLocales: true,
      botFileS3Location: {
        s3Bucket: lexAssetS3Bucket.s3BucketName,
        s3ObjectKey: lexAssetS3Bucket.s3ObjectKey,
      },
      testBotAliasSettings: {
        botAliasLocaleSettings: [
          {
            localeId: "en_US",
            botAliasLocaleSetting: {
              enabled: true,
              codeHookSpecification: {
                lambdaCodeHook: {
                  codeHookInterfaceVersion: "1.0",
                  lambdaArn: lexFulfillmentLambda.functionArn,
                },
              },
            },
          },
        ],
      },
    })

    const botVersion = new CfnBotVersion(this, "BotVersion", {
      botId: reminderBot.ref,
      botVersionLocaleSpecification: [
        {
          botVersionLocaleDetails: {
            sourceBotVersion: "DRAFT",
          },
          localeId: "en_US",
        },
      ],
    })

    const prodBotAlias = new CfnBotAlias(this, "prodBotAlias", {
      botAliasName: "Prod",
      botId: reminderBot.ref,
      botAliasLocaleSettings: [
        {
          botAliasLocaleSetting: {
            enabled: true,
            codeHookSpecification: {
              lambdaCodeHook: {
                codeHookInterfaceVersion: "1.0",
                lambdaArn: lexFulfillmentLambda.functionArn,
              },
            },
          },
          localeId: "en_US",
        },
      ],
      botVersion: botVersion.getAtt("BotVersion").toString(),
      sentimentAnalysisSettings: { DetectSentiment: true },
    })

    lexFulfillmentLambda.addPermission("Lex Invocation", {
      principal: new ServicePrincipal("lexv2.amazonaws.com"),
      sourceArn: `arn:aws:lex:${Stack.of(this).region}:${Stack.of(this).account}:bot-alias/${reminderBot.attrId}/*`,
    })

    new CfnOutput(this, "reminderBotLambdaLink", {
      value: `https://${Stack.of(this).region}.console.aws.amazon.com/lambda/home?region=${
        Stack.of(this).region
      }#/functions/${lexFulfillmentLambda.functionName}`,
    })

    new CfnOutput(this, "reminderBotLink", {
      value: `https://${Stack.of(this).region}.console.aws.amazon.com/lexv2/home?region=${Stack.of(this).region}#/bot/${
        reminderBot.attrId
      }`,
    })
  }
}
