import boto3
import os
import datetime
from datetime import timedelta
from botocore.exceptions import ClientError
import pytz
from enum import Enum

ddb_resource = boto3.resource('dynamodb')
business_hours_table_name = os.environ['business_hours_table_name']
business_hours_table = ddb_resource.Table(business_hours_table_name) if business_hours_table_name else None

class HoursOfOperationStatus(Enum):
    IN_HOURS = 'IN_HOURS'
    OUT_OF_HOURS = 'OUT_OF_HOURS'
    OPEN_ALL_HOURS = 'OPEN_ALL_HOURS'
    QUEUE_NOT_FOUND = 'QUEUE_NOT_FOUND'

def get_queue_id_from_arn(arn):
    # arn:aws:connect:us-west-2:ACCOUNT:instance/INSTANCEID/queue/QUEUEID
    elements = arn.split('/', 4)
    return elements[3]


def read_business_hours_table(queue_id):
    try:
        response = business_hours_table.get_item(Key={'QueueID': queue_id})
        return response['Item']
    except ClientError as error:
        print("Unexpected error: %s" % error)
        

def get_current_weekday_name(utc_offset):
    current_datetime = datetime.datetime.now() + timedelta(hours=utc_offset)
    current_weekday_name = current_datetime.strftime("%A").upper()
    print(f"current_weekday_name: {current_weekday_name}")
    return current_weekday_name

def get_current_datetime(utc_offset):
    current_datetime = datetime.datetime.now() + timedelta(hours=utc_offset)
    print(f"current_datetime: {current_datetime}")
    return current_datetime

def get_queue_utcoffset(queue_timezone_string):
    queue_timezone = pytz.timezone(queue_timezone_string)
    queue_utc_offset = int(queue_timezone.utcoffset(datetime.datetime.now(), is_dst=True).total_seconds() / 60 / 60)
    print(f"queue_utc_offset: {queue_utc_offset}")
    return queue_utc_offset

def get_matching_hours_of_operation_days(queue_hours_of_operation_config, current_weekday_name):
    matching_hours_of_operation_days = []
    for day_info in queue_hours_of_operation_config:
        if day_info['Day'] == current_weekday_name:
            matching_hours_of_operation_days.append(day_info)
    return matching_hours_of_operation_days

def get_datetime_from_time_config(time_config, current_datetime):
    return current_datetime.replace(hour=int(time_config['Hours']), minute=int(time_config['Minutes']), second=0, microsecond=0)

def get_hours_of_operation_status_and_time_left_minutes(queue_id):
    queue_info = read_business_hours_table(queue_id)
    if queue_info is None:
        print(f"Queue {queue_id} not found in DynamoDB table")
        return HoursOfOperationStatus.QUEUE_NOT_FOUND.value, 0

    print(f"Checking Hours of Operation: {queue_info['HoursOfOperationName']} for Queue: {queue_info['QueueName']} - Hours of Operation Timezone: {queue_info['HoursOfOperationTimeZone']}")

    queue_utc_offset = get_queue_utcoffset(queue_info['HoursOfOperationTimeZone'])
    current_weekday_name = get_current_weekday_name(queue_utc_offset)
    current_datetime = get_current_datetime(queue_utc_offset)

    queue_hours_of_operation_config = queue_info['HoursOfOperationConfig']

    matching_hours_of_operation_days = get_matching_hours_of_operation_days(queue_hours_of_operation_config, current_weekday_name)

    print(f"matching_hours_of_operation_days found: {len(matching_hours_of_operation_days)}")
    print(f"matching_hours_of_operation_days: {matching_hours_of_operation_days}")

    if(len(matching_hours_of_operation_days) == 0):
        print(f"{current_weekday_name} not found in HoursOfOperationConfig")
        return HoursOfOperationStatus.OUT_OF_HOURS.value, 0

    for matching_day in matching_hours_of_operation_days:

        start_time_datetime = get_datetime_from_time_config(matching_day['StartTime'], current_datetime)
        end_time_datetime = get_datetime_from_time_config(matching_day['EndTime'], current_datetime)
        print(f"start_time_datetime: {start_time_datetime} - end_time_datetime: {end_time_datetime}")

        if (start_time_datetime == end_time_datetime):
            print(f"Open all hours, as start_time_datetime == end_time_datetime")
            return HoursOfOperationStatus.OPEN_ALL_HOURS.value, 0
            
        if start_time_datetime <= current_datetime and current_datetime < end_time_datetime:
            print(f"found matching start_time_datetime and end_time_datetime window")

            time_left_minutes = int((end_time_datetime - current_datetime).total_seconds() / 60.0)
            print(f"time_left_minutes: {time_left_minutes}")
            return HoursOfOperationStatus.IN_HOURS.value, time_left_minutes
        
        print(f"current_datetime is outside of start_time_datetime and end_time_datetime window")
    
    print(f"could not find current_datetime in any start_time_datetime and end_time_datetime window")
    return HoursOfOperationStatus.OUT_OF_HOURS.value, 0


def lambda_handler(event, context):
    print("Event: ", event)

    if not business_hours_table:
        custom_error_message = "business_hours_table_name not defined, please define in environment variables"
        print(custom_error_message)
        raise Exception(custom_error_message)

    try:
        queue_arn = event["Details"]["ContactData"]["Queue"]["ARN"]
    except:
        custom_error_message = "Queue ARN not found in the event payload"
        print(custom_error_message)
        raise Exception(custom_error_message)

    queue_id = get_queue_id_from_arn(queue_arn)

    oldest_contact_time_seconds = 0
    try:
        oldest_contact_time_seconds = int(event["Details"]["Parameters"]["OldestContactTimeSeconds"])
    except:
        print("OldestContactTimeSeconds Parameter not found in the event payload")
        pass

    try:
        oldest_contact_time_minutes = int(oldest_contact_time_seconds / 60)
        
        hours_of_operation_status , time_left_minutes = get_hours_of_operation_status_and_time_left_minutes(queue_id)
        
        response = {
            "OldestContactTimeSeconds": oldest_contact_time_seconds,
            "HoursOfOperationStatus": hours_of_operation_status
            }

        if(hours_of_operation_status == HoursOfOperationStatus.IN_HOURS.value):
            time_delta_minutes = time_left_minutes - oldest_contact_time_minutes
            response["TimeLeftMinutes"] = time_left_minutes
            response["TimeDeltaMinutes"] = time_delta_minutes

        print(f"Function response: {response}")
        return response
    except Exception as error:
        print("Unexpected error: %s" % error)
        raise error
