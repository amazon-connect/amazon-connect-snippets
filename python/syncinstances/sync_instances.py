import sys

import boto3

src_region = "us-east-1"
tgt_region = "us-west-2"
src_connect = boto3.client("connect", region_name=src_region)
tgt_connect = boto3.client("connect", region_name=tgt_region)

src_instance_id = "c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6"
tgt_instance_id = "00000000-0000-0000-0000-000000000000"


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
    resp = tgt_connect.create_user(
        InstanceId=tgt_instance_id,
        Username=user["Username"],
        IdentityInfo=user["IdentityInfo"],
        PhoneConfig=user["PhoneConfig"],
        SecurityProfileIds=security_profiles,
        RoutingProfileId=tgt_routing[src_routing[user["RoutingProfileId"]]["Name"]][
            "Id"
        ],
        # Hopefully password not required
        # Password="D3l3tM3L8ter",
        Tags=user["Tags"],
    )
    print(f"Added {user} to target: {tgt_instance_id}")
