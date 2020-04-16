import datetime
from datetime.tz import tzlocal

import boto3
import botocore

# You could use this code to load the instances from SSM parameter store.
# import json
# import os
# ssm = boto3.client("SSM")
# ROLE_INSTANCES_MAP = json.loads(
#     ssm.get_parameter(
#         Name=os.getenv('PARAMETER_NAME')
#     )['Parameter']['Value']
# )

# Mapping of roles (accounts) to connect instances

ROLE_INSTANCES_MAP = {
    "arn:aws:iam::ACCOUNT:role/metrics-role": [
        "arn:aws:connect:us-west-2:<ACCOUNT>:instance/<ID>"
    ],
    "arn:aws:iam::ACCOUNT:role/metrics-role": [
        "arn:aws:connect:us-west-2:<ACCOUNT>:instance/<ID>"
    ],
}

METRICS = [
    {"Name": "AGENTS_AFTER_CONTACT_WORK", "Unit": "COUNT"},
    {"Name": "AGENTS_AVAILABLE", "Unit": "COUNT"},
    {"Name": "AGENTS_ERROR", "Unit": "COUNT"},
    {"Name": "AGENTS_NON_PRODUCTIVE", "Unit": "COUNT"},
    {"Name": "AGENTS_ON_CALL", "Unit": "COUNT"},
    {"Name": "AGENTS_ON_CONTACT", "Unit": "COUNT"},
    {"Name": "AGENTS_ONLINE", "Unit": "COUNT"},
    {"Name": "AGENTS_STAFFED", "Unit": "COUNT"},
    {"Name": "CONTACTS_IN_QUEUE", "Unit": "COUNT"},
    {"Name": "CONTACTS_SCHEDULED", "Unit": "COUNT"},
    {"Name": "OLDEST_CONTACT_AGE", "Unit": "SECONDS"},
    {"Name": "SLOTS_ACTIVE", "Unit": "COUNT"},
    {"Name": "SLOTS_AVAILABLE", "Unit": "COUNT"},
]

# this is just a helper function for assuming x-account roles
def assumed_role_session(role_arn: str, base_session: botocore.session.Session = None):
    base_session = base_session or boto3.session.Session()._session
    fetcher = botocore.credentials.AssumeRoleCredentialFetcher(
        client_creator=base_session.create_client,
        source_credentials=base_session.get_credentials(),
        role_arn=role_arn,
        extra_args={
            # feel free to change this name
            "RoleSessionName": "MetricsCollector"
        },
    )
    creds = botocore.credentials.DeferredRefreshableCredentials(
        method="assume-role",
        refresh_using=fetcher.fetch_credentials,
        time_fetcher=lambda: datetime.datetime.now(tzlocal()),
    )
    botocore_session = botocore.session.Session()
    botocore_session._credentials = creds
    return boto3.Session(botocore_session=botocore_session)


# collect metrics on all standard queues
def collect_metrics(connect, instance):
    queues = [
        queue["Arn"]
        for queue in connect.list_queues(
            InstanceId=instance, QueueTypes=["STANDARD"]
        ).get("QueueSummaryList", [])
    ]

    if not queues:
        print(f"No valid queues found for {instance}")
        return []

    resp = connect.get_current_metric_data(
        InstanceId=instance,
        Filters={"Queues": queues, "Channels": ["VOICE"]},
        Groupings=["Queue"],
        CurrentMetrics=METRICS,
    )
    return resp["MetricResults"]


def lambda_handler(event, context):
    for role, instances in ROLE_INSTANCES_MAP.items():
        session = assumed_role_session(role)
        client = session.client("connect")
        for instance in instances:
            metrics = collect_metrics(client, instance)
            # do something with the metrics here
            print(metrics)
