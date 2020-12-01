#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AmazonConnectTasksCloudFormationTemplateStack } from '../lib/amazon_connect_tasks_cloud_formation_template-stack';

const app = new cdk.App();
new AmazonConnectTasksCloudFormationTemplateStack(app, 'AmazonConnectTasksCloudFormationTemplateStackTest');
