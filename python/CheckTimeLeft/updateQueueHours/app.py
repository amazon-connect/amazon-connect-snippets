import boto3
from botocore.exceptions import ClientError
import os
from copy import deepcopy

connect = boto3.client('connect')
ddb = boto3.resource('dynamodb')

try:
    tb_name = os.environ['BusinessHoursTable']
except KeyError:
    print("Table not defined, please define in environment variables")
    tb_name = "QueueHours"

try:
    InstanceID = os.environ['instanceID']
except KeyError:
    print("Connect Instance ID not defined,please define in environment variables")

table = ddb.Table(tb_name)


def getinstanceID(arn):
    # arn:aws:connect:us-west-2:ACCOUNT:instance/INSTANCEID/queue/QUEUEID
    elements = arn.split(':', 5)
    instance = elements[5].split('/', 4)
    return instance[1]


def getQueueID(arn):
    # arn:aws:connect:us-west-2:ACCOUNT:instance/INSTANCEID/queue/QUEUEID
    elements = arn.split('/', 4)
    return elements[3]


def getQueues(InstanceID):
    response = connect.list_queues(
        InstanceId=InstanceID,
        QueueTypes=[
            'STANDARD'
        ]
    )
    return response['QueueSummaryList']


def getQueueDetails(InstanceID, QueueID):
    try:
        response = connect.describe_queue(
            InstanceId=InstanceID,
            QueueId=QueueID
        )
    except ClientError as e:
        print(e.response['Error']['Message'])
        return False
    else:
        return response['Queue']


def getOperationHoursDetails(InstanceID, OperationId):
    response = connect.describe_hours_of_operation(
        InstanceId=InstanceID,
        HoursOfOperationId=OperationId
    )
    return response['HoursOfOperation']


def getOperationHours(InstanceID):
    response = connect.list_hours_of_operations(
        InstanceId=InstanceID
    )
    return response['HoursOfOperationSummaryList']


def writeToTable(QueueID, Hours):
    response = table.put_item(
        Item={
            'QueueID': QueueID,
            'Hours': Hours
        }
    )
    return response


def updateTable(updateQueueID, validatedUpdate):
    queuesList = getQueues(InstanceID)
    # print(queuesList)
    detailedQueueList = {}
    for detailedQueue in queuesList:
        detailedQueueList[detailedQueue['Id']] = deepcopy(getQueueDetails(InstanceID, detailedQueue['Id']))

    operationHoursList = deepcopy(getOperationHours(InstanceID))
    hoursList = {}
    for operationHours in operationHoursList:
        hoursList[operationHours['Id']] = deepcopy(getOperationHoursDetails(InstanceID, operationHours['Id']))

    for queueID in detailedQueueList:
        detailedQueueList[queueID]['HoursOfOperationId'] = deepcopy(
            hoursList[detailedQueueList[queueID]['HoursOfOperationId']])
        if queueID == updateQueueID:
            foundqueue = True
        # print(queueID, detailedQueueList[queueID]['HoursOfOperationId'])

    if foundqueue:
        # print(updateQueueID, detailedQueueList[updateQueueID]['HoursOfOperationId'])
        for d in detailedQueueList[updateQueueID]['HoursOfOperationId']['Config']:
            # print(d)
            if d['Day'] == validatedUpdate['Day']:
                d['StartTime'] = validatedUpdate['StartTime']
                d['EndTime'] = validatedUpdate['EndTime']
                break
    else:
        detailedQueueList[queueID]['HoursOfOperationId']['Config'].append(validatedUpdate)

    for queueID in detailedQueueList:
        writeToTable(queueID, detailedQueueList[queueID]['HoursOfOperationId'])
        # print(queueID, detailedQueueList[queueID]['HoursOfOperationId'])

    return True


def validateTime(updateDay, startTime, endTime):
    days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    starts = startTime.split(':', 2)
    startHrs = int(starts[0] or 0)
    startMin = int(starts[1] or 0)
    ends = endTime.split(':', 2)
    endHrs = int(ends[0] or 0)
    endMin = int(ends[1] or 0)

    if ((startHrs * 60 + startMin) > (endHrs * 60 + endMin)) or (updateDay not in days):
        print('Error Updating Queue')
        return False
    else:
        return {
            "Day": updateDay,
            "StartTime": {
                "Hours": startHrs,
                "Minutes": startMin
            },
            "EndTime": {
                "Hours": endHrs,
                "Minutes": endMin
            }
        }


def lambda_handler(event, context):
    print(event)
    # print(event["Details"]["Parameters"])
    queueARN = event["Details"]["ContactData"]["Queue"]["ARN"]
    updateQueueID = getQueueID(queueARN)
    try:
        updateDay = (event["Details"]["Parameters"]["Day"]).upper()
        updateStart = event["Details"]["Parameters"]["Start"]
        UpdateEnd = event["Details"]["Parameters"]["End"]
    except KeyError:
        updateDay = ""
        updateStart = ""
        UpdateEnd = ""

    validatedUpdate = validateTime(updateDay, updateStart, UpdateEnd)
    # print(validatedUpdate)

    if validatedUpdate and updateTable(updateQueueID, validatedUpdate):
        print('All updated')
        return {
            "Status": "Updated"
        }
    else:
        print('Error')
        return {
            "Status": "Error"
        }
