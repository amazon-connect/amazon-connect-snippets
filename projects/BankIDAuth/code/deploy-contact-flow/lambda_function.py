import os
import json
import logging
import boto3
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

    queue_arn = fetch_sample_basic_queue_arn()
    template = load_content(CONTACT_FLOW)
    content = update_content(template, queue_arn)

    try:
        # Gracefully handle re-deployments
        contact_flow = fetch_contact_flow()
        if contact_flow:
            # Contact Flow was already created
            resp_data = update_contact_flow(content, contact_flow)
        else:
            # Contact Flow does not exist
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

def update_contact_flow(content, contact_flow):
    client.update_contact_flow_content(
        InstanceId=INSTANCE_ID,
        ContactFlowId=contact_flow['Id'],
        Content=content
    )

    logger.info('Contact Flow updated.')
    return {
        'Arn': contact_flow['Arn']
    }

def load_content(fn):
    # Loads contact flow content from json file
    logger.info('Loading content from %s', fn)
    with open(fn, encoding='utf-8') as f:
        content = json.load(f)

    logger.debug({ 'content': content })
    return content


def fetch_sample_basic_queue_arn():
    # All Amazon Connect instances have a Sample Basic Queue
    # This function collects the Arn for the Sample Basic Queue
    # Which will be used in the contact flow to connect the caller
    # to an agent.
    logger.info('Fetching Sample Basic Queue Arn')
    response = client.list_queues(
        InstanceId=INSTANCE_ID,
        QueueTypes=['STANDARD']
    )

    logger.debug({ 'response': response })
    for i in response['QueueSummaryList']:
        if i['Name'] == 'Sample BasicQueue':
            logger.info({ 'Arn': i['Arn'] })
            return i['Arn']


def fetch_contact_flow():
    # Gracefully handle duplication errors during re-deployment
    # This function collects the info for the Contact Flow
    # So that the contact flow can be updated instead of created
    logger.info('Fetching Contact Flow ID')
    response = client.list_contact_flows(
        InstanceId=INSTANCE_ID,
        ContactFlowTypes=['CONTACT_FLOW']
    )

    logger.debug({ 'response': response })
    for i in response['ContactFlowSummaryList']:
        if i['Name'] == CONTACT_FLOW_NAME:
            logger.info({ 'ContactFlow': i })
            return i


def update_content(content, queue_arn):
    # The contact flow was pre-generated which provided the identifiers.
    # The identifiers used below are fixed in the contact flow configuration
    # and are used to automate the process of replacing the Arns that are unique
    # to the Amazon account that the solution will be deployed to.

    logger.info('Updating content with account specific Arns.')
    # This identifier relates to metadata of a block that sets the working queue
    queue = content['Metadata']['ActionMetadata']['bb212c4b-3f98-4080-b533-fe9d2ca36b70']
    queue['queue']['id'] = queue_arn

    for i in content['Actions']:
        # This identifier relates to the block that invokes a new lambda function
        if i['Identifier'] == '2367a288-95db-4535-ad4f-7d70be3636a9':
            logger.info('Identified block and replacing Lambda ARN.')
            i['Parameters']['LambdaFunctionARN'] = AUTH_ARN

        # This identifier relates to a block that sets the working queue
        elif i['Identifier'] == 'bb212c4b-3f98-4080-b533-fe9d2ca36b70':
            logger.info('Identified block and replacing queue ARN.')
            i['Parameters']['QueueId'] = queue_arn

    return json.dumps(content)
