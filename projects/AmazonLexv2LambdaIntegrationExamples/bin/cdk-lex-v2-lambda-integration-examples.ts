#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { AwsSolutionsChecks } from "cdk-nag"
import { Aspects } from "aws-cdk-lib"

import { BasicPassthroughLambdaCdkStack } from "../cdkStacks/basic-passthrough-lambda-stack"
import { ReminderBotStack } from "../cdkStacks/reminder-bot-stack"

const app = new cdk.App()
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))

new BasicPassthroughLambdaCdkStack(app, "BasicLexLambdaIntegration", {})
new ReminderBotStack(app, "ReminderBot", {})
