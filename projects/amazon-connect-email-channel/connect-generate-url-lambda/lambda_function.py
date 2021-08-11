import boto3
import os
import time

s3 = boto3.client("s3")

def get_signed_url(method, params, expires_in):
  return s3.generate_presigned_url(method, params, expires_in)

def lambda_handler(event, context):
  print(event)
  attributes = event["Details"]["ContactData"]["Attributes"]

  object_key = attributes["formatted_email_key"]
  object_bucket = attributes["latest_email_s3_bucket"]
  raw_object_bucket =attributes["latest_email_s3_key"]

  get_params = {
    "Bucket": object_bucket,
    "Key": object_key
  }
  raw_get_params = {
    "Bucket": object_bucket,
    "Key": raw_object_bucket
  }
  url_timeout = int(os.environ["EMAIL_ACCESS_TIMEOUT"])
  get_url = get_signed_url("get_object", get_params, url_timeout)
  raw_get_url = get_signed_url("get_object", raw_get_params, url_timeout)

  return {
    "get_email_url": get_url,
    "get_raw_email_url":raw_get_url,
    "url_timeout": url_timeout - 60
  }
