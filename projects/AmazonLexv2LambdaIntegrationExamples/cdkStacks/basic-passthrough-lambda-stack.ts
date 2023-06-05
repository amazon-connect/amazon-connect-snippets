// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib"
import { NagSuppressions } from "cdk-nag"
import * as path from "path"
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as lambda from "aws-cdk-lib/aws-lambda"

export class BasicPassthroughLambdaCdkStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    const basicPassthroughLexv2Lambda = new nodejs.NodejsFunction(this, "BasicPassthroughLexv2Lambda", {
      memorySize: 1024,
      timeout: Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {
        DEBUG_LOGGING_ENABLED: "true",
      },
      entry: path.join(__dirname, `/../src/basicPassthroughLexv2Lambda/basicPassthroughLexv2Lambda.ts`),
    })

    NagSuppressions.addResourceSuppressions(
      basicPassthroughLexv2Lambda,
      [
        {
          id: "AwsSolutions-IAM4",
          reason: "This is the default Lambda Execution Policy which just grants writes to CloudWatch.",
        },
      ],
      true
    )

    new CfnOutput(this, "basicPassthroughLexv2LambdaArn", {
      value: basicPassthroughLexv2Lambda.functionArn,
    })
    new CfnOutput(this, "basicPassthroughLexv2LambdaLink", {
      value: `https://${Stack.of(this).region}.console.aws.amazon.com/lambda/home?region=${
        Stack.of(this).region
      }#/functions/${basicPassthroughLexv2Lambda.functionName}`,
    })
  }
}
