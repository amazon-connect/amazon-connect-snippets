#!/usr/bin/env python3
import sys
import argparse
import datetime
from dateutil.tz import tzlocal

import boto3
import botocore

def parse_arn(arn):
    # http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
    elements = arn.split(':', 5)
    result = {
        'arn': elements[0],
        'partition': elements[1],
        'service': elements[2],
        'region': elements[3],
        'account': elements[4],
        'resource': elements[5],
        'resource_type': None
    }
    if '/' in result['resource']:
        result['resource_type'], result['resource'] = result['resource'].split('/',1)
    elif ':' in result['resource']:
        result['resource_type'], result['resource'] = result['resource'].split(':',1)
    return result

def assumed_role_session(role_arn, base_session):
    base_session = base_session or boto3.session.Session()._session
    fetcher = botocore.credentials.AssumeRoleCredentialFetcher(
        client_creator=base_session.create_client,
        source_credentials=base_session.get_credentials(),
        role_arn=role_arn,
        extra_args={
            # feel free to change this name
            'RoleSessionName': 'ConnectUserSync'
        }
    )
    creds = botocore.credentials.DeferredRefreshableCredentials(
        method='assume-role',
        refresh_using=fetcher.fetch_credentials,
        time_fetcher=lambda: datetime.datetime.now(tzlocal())
    )
    botocore_session = botocore.session.Session()
    botocore_session._credentials = creds
    return boto3.Session(botocore_session=botocore_session)


def get_users_by_username(client, instance_id):
    users = {}
    paginator = client.get_paginator("list_users")
    page_iterator = paginator.paginate(InstanceId=instance_id)
    for page in page_iterator:
        for user in page["UserSummaryList"]:
            users[user["Username"]] = user
    return users


def get_deep_user(client, instance_id, user_id):
    return client.describe_user(InstanceId=instance_id, UserId=user_id).get("User")


def index_profile(client, instance_id, call_name, list_name):
    method = getattr(client, call_name)
    profiles = method(InstanceId=instance_id)[list_name]
    profiles_by_x = {}
    for profile in profiles:
        profiles_by_x[profile["Id"]] = profile
        profiles_by_x[profile["Name"]] = profile
    return profiles_by_x


def get_security_profiles_index(client, instance_id):
    return index_profile(
        client, instance_id, "list_security_profiles", "SecurityProfileSummaryList"
    )


def get_routing_profiles_index(client, instance_id):
    return index_profile(
        client, instance_id, "list_routing_profiles", "RoutingProfileSummaryList"
    )


def perform_sync(src, tgt, src_role=None, tgt_role=None, dry_run=False):
    src_arn = parse_arn(src)
    tgt_arn = parse_arn(tgt)

    if src_role:
        src_session = assumed_role_session(src_role).client("connect")
        src_connect = src_session.client("connect", region_name=src_arn['region'])
    else:
        src_connect = boto3.client("connect", region_name=src_arn['region'])
    
    if tgt_role:
        tgt_session = assumed_role_session(tgt_role).client("connect")
        tgt_connect = tgt_session.client("connect", region_name=tgt_arn['region'])
    else:
        tgt_connect = boto3.client("connect", region_name=tgt_arn['region'])        

    src_instance_id = src_arn['resource']
    tgt_instance_id = tgt_arn['resource']

    # Get Shallow Users
    src_users = get_users_by_username(src_connect, src_instance_id)
    tgt_users = get_users_by_username(tgt_connect, tgt_instance_id)

    # Calculate difference between two sets:
    diff_users = src_users.keys() - tgt_users.keys()

    if len(diff_users) == 0:
        print("Nothing to update, exiting...")
        sys.exit(0)

    print(f"There are {len(diff_users)} different users to update.")
    deep_users = [
        get_deep_user(src_connect, src_instance_id, src_users[user]["Id"])
        for user in diff_users
    ]

    # Get Mappings of Security and Routing Profiles
    # Please note this only works if you have the same names
    # for your security profiles between regions
    # and those names are not in UUIDv4 format.
    src_routing = get_routing_profiles_index(src_connect, src_instance_id)
    tgt_routing = get_routing_profiles_index(tgt_connect, tgt_instance_id)

    src_security = get_security_profiles_index(src_connect, src_instance_id)
    tgt_security = get_security_profiles_index(tgt_connect, tgt_instance_id)

    for user in deep_users:
        security_profiles = []
        for profile in user["SecurityProfileIds"]:
            security_profiles.append(tgt_security[src_security[profile]["Name"]]["Id"])
        routing_profiles = tgt_routing[src_routing[user["RoutingProfileId"]]["Name"]]["Id"]
        if not dry_run:
            resp = tgt_connect.create_user(
                InstanceId=tgt_instance_id,
                Username=user["Username"],
                IdentityInfo=user["IdentityInfo"],
                PhoneConfig=user["PhoneConfig"],
                SecurityProfileIds=security_profiles,
                RoutingProfileId=routing_profiles,
                Tags=user["Tags"],
                # Hopefully password not required, it depends on how your authentication was set up
                # Password="D3l3tM3L8ter",
            )
        print(f"Added to {tgt_instance_id}: {user}")

if __name__ == "__main__":
    example_arn1 = "arn:aws:connect:us-west-2:111122223333:instance/c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6"
    example_arn2 = "arn:aws:connect:us-east-1:111122223333:instance/00000000-0000-0000-0000-000000000000"
    parser = argparse.ArgumentParser(
        description="sync user data from src instance to tgt instance",
        epilog=f"Example command: ./sync_instances.py {example_arn1} {example_arn2}"
    )
    parser.add_argument("src", help="ARN of the source instance")
    parser.add_argument("tgt", help="ARN of the target instance")
    parser.add_argument("--src-role", help="role to assume in source account")
    parser.add_argument("--tgt-role", help="role to assume in target account")
    parser.add_argument("--dry-run", action="store_true", help="don't actually sync the users")
    args = parser.parse_args()
    perform_sync(args.src, args.tgt, args.src_role, args.tgt_role, args.dry_run)