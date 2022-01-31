import os
import json
import boto3
import logging
import cfnresponse

from botocore.exceptions import ClientError


CONTACT_FLOW = 'contact-flow.json'
CONTACT_FLOW_NAME = '0000 BankID Authentication'

AUTH_ARN = os.environ['AUTH_ARN']
INSTANCE_ID = os.environ['INSTANCE_ID']
CONNECT_REGION = os.environ['CONNECT_REGION']

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Supports Amazon Connect Instances from any region
client = boto3.client('connect', region_name=CONNECT_REGION)


def lambda_handler(event, context):
    logger.info('Creating contact flow.')
    logger.info({ 'event': event })
    
    template = load_content(CONTACT_FLOW)
    content = update_content(template)
    
    try:
        resp_data = create_contact_flow(content)

        logger.debug({ 'responseData': resp_data })
        cfnresponse.send(event, context, cfnresponse.SUCCESS, resp_data)

        
    except ClientError as e:
        error = e.response['Error']
        logger.error({ 'Error': error })
        cfnresponse.send(event, context, cfnresponse.FAILED, error)


def create_contact_flow(content):
    resp = client.create_contact_flow(
        InstanceId=INSTANCE_ID,
        Name=CONTACT_FLOW_NAME,
        Type='CONTACT_FLOW',
        Description='Verifies the callers identity with BankID integration.',
        Content=content
    )

    logger.info('Contact Flow created.')
    return {
        'Arn': resp['ContactFlowArn']
    }

def load_content(fn):
    # Loads contact flow content from json file
    logger.info('Loading content from {}'.format(fn))
    with open(fn) as f:
        content = json.load(f)
    
    logger.debug({ 'content': content })
    return content


def update_content(content, queue_arn):
    # The contact flow was pre-generated which provided the identifiers.
    # The identifiers used below are fixed in the contact flow configuration
    # and are used to automate the process of replacing the Arns that are unique
    # to the Amazon account that the solution will be deployed to.

    logger.info('Updating content with account specific Arns.')

    for i in content['Actions']:
        # This identifier relates to the block that invokes a new lambda function
        if i['Identifier'] == '2367a288-95db-4535-ad4f-7d70be3636a9':
            logger.info('Identified block and replacing Lambda ARN.')
            i['Parameters']['LambdaFunctionARN'] = AUTH_ARN
            return json.dumps(content)
