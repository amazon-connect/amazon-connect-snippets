import boto3
import botocore
import os
from copy import deepcopy

config = botocore.config.Config(
   retries = {
      'max_attempts': 10,
      'mode': 'standard'
   }
)

connect_client = boto3.client('connect', config=config)
ddb_resource = boto3.resource('dynamodb')

connect_instance_id = os.environ['connect_instance_id']

business_hours_table_name = os.environ['business_hours_table_name']
business_hours_table = ddb_resource.Table(business_hours_table_name) if business_hours_table_name else None

hours_of_operation_details_list_cache = {}

def get_queue_id_from_arn(arn):
    # arn:aws:connect:us-west-2:ACCOUNT:instance/INSTANCEID/queue/QUEUEID
    elements = arn.split('/', 4)
    return elements[3]

def get_queue_id_list_from_connect():

    print(f"get_queue_id_list_from_connect")

    try:
        paginator = connect_client.get_paginator('list_queues')
        page_iterator = paginator.paginate(
            InstanceId=connect_instance_id,
            QueueTypes=['STANDARD'],
        )

        queue_id_list = []
        for page in page_iterator:
            queue_summary_list = page['QueueSummaryList']
            for queue_summary in queue_summary_list:
                queue_id_list.append(queue_summary['Id'])

        print(f"{len(queue_id_list)} queues retrieved from Amazon Connect")
        return queue_id_list

    except botocore.exceptions.ClientError as error:
        print("Unexpected error in get_queue_id_list_from_connect: %s" % error)
        raise error

def get_queue_details_from_connect(queue_id, isRetry = False):

    print(f"get_queue_details_from_connect: {queue_id}")
    try:
        response = connect_client.describe_queue(
            InstanceId=connect_instance_id,
            QueueId=queue_id
        )

        queue = {}
        queue['QueueId'] = response['Queue']['QueueId']
        queue['Name'] = response['Queue']['Name']
        queue['HoursOfOperationId'] = response['Queue']['HoursOfOperationId']

        return queue

    except botocore.exceptions.ClientError as error:
        print("Unexpected error in get_queue_details_from_connect: %s" % error)
        raise error
    
def get_hours_of_operation_details_from_connect(hours_of_operation_id, isRetry = False):

    print(f"get_hours_of_operation_details_from_connect: {hours_of_operation_id}")
    try:
        response = connect_client.describe_hours_of_operation(
            InstanceId=connect_instance_id,
            HoursOfOperationId=hours_of_operation_id
        )
    
        hours_of_operation = {}
        hours_of_operation['HoursOfOperationId'] = response['HoursOfOperation']['HoursOfOperationId']
        hours_of_operation['Name'] = response['HoursOfOperation']['Name']
        hours_of_operation['TimeZone'] = response['HoursOfOperation']['TimeZone']
        hours_of_operation['Config'] = response['HoursOfOperation']['Config']

        return hours_of_operation

    except botocore.exceptions.ClientError as error:
        print("Unexpected error in get_hours_of_operation_details_from_connect: %s" % error)
        raise error

def store_hours_of_operation_to_ddb(queue_id, queue_name, queue_hours_of_operation_name, queue_hours_of_operation_config, queue_hours_of_operation_timezone):

    try:
        response = business_hours_table.put_item(
            Item={
                'QueueID': queue_id,
                'QueueName': queue_name,
                'HoursOfOperationName': queue_hours_of_operation_name,
                'HoursOfOperationConfig': queue_hours_of_operation_config,
                'HoursOfOperationTimeZone': queue_hours_of_operation_timezone
            }
        )

        return response
    
    except botocore.exceptions.ClientError as error:
        print("Unexpected error: %s" % error)
        raise error

def get_detailed_queue_list():
    queue_id_list = get_queue_id_list_from_connect()

    detailed_queue_list = []
    for queue_id in queue_id_list:
        detailed_queue = deepcopy(get_queue_details_from_connect(queue_id))
        detailed_queue_list.append(detailed_queue)
    
    return detailed_queue_list

def add_hours_of_operation_details_to_cache(detailed_hours_of_operation):
    hours_of_operation_id = detailed_hours_of_operation['HoursOfOperationId']
    hours_of_operation_details_list_cache[hours_of_operation_id] = detailed_hours_of_operation

def get_hours_of_operation_details_from_cache(hours_of_operation_id):
    if hours_of_operation_id not in hours_of_operation_details_list_cache:
        detailed_hours_of_operation = deepcopy(get_hours_of_operation_details_from_connect(hours_of_operation_id))
        add_hours_of_operation_details_to_cache(detailed_hours_of_operation)
    return hours_of_operation_details_list_cache[hours_of_operation_id]

def add_hours_of_operation(detailed_queue_list):
    queue_with_hours_of_operation_list = []
    for detailed_queue in detailed_queue_list:
        detailed_hours_of_operation = get_hours_of_operation_details_from_cache(detailed_queue['HoursOfOperationId'])
        
        queue_with_hours_of_operation = deepcopy(detailed_queue)
        queue_with_hours_of_operation['HoursOfOperationName'] = detailed_hours_of_operation['Name']
        queue_with_hours_of_operation['HoursOfOperationConfig'] = detailed_hours_of_operation['Config']
        queue_with_hours_of_operation['HoursOfOperationTimeZone'] = detailed_hours_of_operation['TimeZone']
        queue_with_hours_of_operation_list.append(queue_with_hours_of_operation)

    return queue_with_hours_of_operation_list

def update_queue_business_hours_table():
    
    detailed_queue_list = get_detailed_queue_list()
    queue_with_hours_of_operation_list = add_hours_of_operation(detailed_queue_list)
    

    for queue_with_hours_of_operation in queue_with_hours_of_operation_list:
        print("Storing queue_with_hours_of_operation: ", queue_with_hours_of_operation)
        store_hours_of_operation_to_ddb(
            queue_with_hours_of_operation['QueueId'], 
            queue_with_hours_of_operation['Name'], 
            queue_with_hours_of_operation['HoursOfOperationName'],
            queue_with_hours_of_operation['HoursOfOperationConfig'], 
            queue_with_hours_of_operation['HoursOfOperationTimeZone'])

    return len(queue_with_hours_of_operation_list)

def lambda_handler(event, context):
    print("Event: ", event)
    hours_of_operation_details_list_cache.clear()

    if not business_hours_table:
        custom_error_message = "business_hours_table_name not defined, please define in environment variables"
        print(custom_error_message)
        raise Exception(custom_error_message)

    if not connect_instance_id:
        custom_error_message = "connect_instance_id not defined, please define in environment variables"
        print(custom_error_message)
        raise Exception(custom_error_message)

    try:
        num_updated_queues = update_queue_business_hours_table()
        response = {'NumberOfUpdatedQueues' : num_updated_queues}
        print(response)
        return {'NumberOfUpdatedQueues' : num_updated_queues}
    except Exception as error:
        print("Unexpected error: %s" % error)
        raise error
