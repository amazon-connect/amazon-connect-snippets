# Sync Instances

Occasionally customers want to keep a backup instance with their same user data in another region or another account. This script helps them do that.

## Usage

First ensure boto3 is [installed on your machine](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html). Modify the following lines with the desired instances:

```python
src_instance_id = "c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6"
tgt_instance_id = "00000000-0000-0000-0000-000000000000"
```

Then run the script with `python sync_instances.py`.

With small modifications you can run this as a scheduled [AWS Lambda](https://aws.amazon.com/lambda/) function nightly to sync users.

## Additional Info

You can use this across multiple accounts as well by providing separate credentials / profiles for the clients created here:

```python
src_connect = boto3.client("connect", region_name=src_region)
tgt_connect = boto3.client("connect", region_name=tgt_region)
```

## Issues

This doesn't work well for certain authentication scenarios where Connect manages passwords.
