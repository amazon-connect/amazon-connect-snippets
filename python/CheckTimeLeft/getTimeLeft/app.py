import boto3
import os
import datetime
from datetime import timedelta
from botocore.exceptions import ClientError

ddb = boto3.resource('dynamodb')
client = boto3.client('connect')

try:
    tb_name = os.environ['BusinessHoursTable']
except KeyError:
    print("Table not defined, please define in environment variables")

try:
    timeZoneDelta = int(os.environ['TimeZone'])
except KeyError:
    print("TimeZone not defined using default GMT")
    timeZoneDelta = 0

table = ddb.Table(tb_name)


def getQueueID(arn):
    # arn:aws:connect:us-west-2:ACCOUNT:instance/INSTANCEID/queue/QUEUEID
    elements = arn.split('/', 4)
    return elements[3]


def readTable(QueueID):
    try:
        response = table.get_item(Key={'QueueID': QueueID})
    except ClientError as e:
        print(e.response['Error']['Message'])
        return False
    else:
        return response['Item']


def today():
    now = datetime.datetime.now() + timedelta(hours=timeZoneDelta)
    return now.strftime("%A").upper()


def checkTimeLeft(QueueID):
    now = datetime.datetime.now() + timedelta(hours=timeZoneDelta)
    # print(now)
    queueInfo = readTable(QueueID)
    if queueInfo == False:
        return 0
    queueHours = queueInfo['Hours']['Config']
    # print(queueHours)
    for key in queueHours:
        for (k, v) in key.items():
            if key['Day'] == today():
                thisday = key['Day']
                if k == 'StartTime':
                    startTime = now.replace(hour=int(key[k]['Hours']), minute=int(key[k]['Minutes']))
                if k == 'EndTime':
                    endTime = now.replace(hour=int(key[k]['Hours']), minute=int(key[k]['Minutes']))

    print(thisday, startTime, endTime)
    if (now < startTime or now > endTime):
        return 0

    minutes_diff = (endTime - now).total_seconds() / 60.0
    return minutes_diff


def lambda_handler(event, context):
    print(event)
    queueARN = event["Details"]["ContactData"]["Queue"]["ARN"]
    queueID = getQueueID(queueARN)
    oldestContactTime = int(event["Details"]["Parameters"]["OldestContact"] or 0)
    timeLeft = checkTimeLeft(queueID)

    return {
        "OldestContactTime": oldestContactTime,
        "TimeLeft": timeLeft,
        "TimeDelta": timeLeft - oldestContactTime
    }
