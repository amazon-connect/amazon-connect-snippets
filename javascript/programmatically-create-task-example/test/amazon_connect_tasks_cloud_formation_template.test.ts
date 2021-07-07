import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AmazonConnectTasksCloudFormationTemplate from '../lib/amazon_connect_tasks_cloud_formation_template-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AmazonConnectTasksCloudFormationTemplate.AmazonConnectTasksCloudFormationTemplateStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
