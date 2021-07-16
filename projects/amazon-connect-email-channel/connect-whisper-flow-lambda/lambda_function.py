import boto3
import os
import time

s3 = boto3.client("s3")
table = boto3.resource("dynamodb").Table(os.environ["EMAIL_LOOKUP_TABLE"])


def interaction_lookup(interaction_id):
  try:
    resp = table.get_item(
      Key={"interaction_id": interaction_id}
    )

    if "Item" in resp:
      data = resp["Item"]
      return data
    else:
      return {}

  except Exception as e:
    print(e)
    return {}

def interaction_put(item):
  try:
    resp = table.put_item(
      Item=item
    )

    return

  except Exception as e:
    print(e)
    return

def get_signed_url(method, params, expires_in):
  return s3.generate_presigned_url(method, params, expires_in)

def lambda_handler(event, context):
  print(event)
  interaction_id = event["Details"]["ContactData"]["Attributes"]["interaction_id"]

  interaction_record = interaction_lookup(interaction_id)

  now = int(time.time())
  interaction_snapshot = {
    "interaction_timestamp": now,
    "interaction_type": "ROUTED_TO_AGENT",
    "routed_to_agent": event["Details"]["Parameters"]["Agent"],
    "routed_to_agent_queue": event["Details"]["Parameters"]["Queue"],
    "contact_id": event["Details"]["ContactData"]["ContactId"],
    "target_type": interaction_record["target_type"],
    "target_destination": interaction_record["target_destination"]
  }

  if "history" in interaction_record and interaction_record["history"] is not None:
    interaction_record["history"].append(interaction_snapshot)
  else:
    interaction_record["history"] = [interaction_snapshot]
  

  interaction_record["last_update_timestamp"] = now

  interaction_put(interaction_record)

  return {}