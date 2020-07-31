# Sync Instance User Details

Occasionally customers want to keep a backup instance with their same user data in another region or another account. This script helps them do that.

## Usage

First ensure python3 and boto3 are [installed on your machine](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html).

Usage details below:

```text
$ ./sync_instances.py -h
usage: sync_instances.py [-h] [--src-role SRC_ROLE] [--tgt-role TGT_ROLE]
                         [--dry-run]
                         src tgt

sync user data from src instance to tgt instance

positional arguments:
  src                  ARN of the source instance
  tgt                  ARN of the target instance

optional arguments:
  -h, --help           show this help message and exit
  --src-role SRC_ROLE  role to assume in source account
  --tgt-role TGT_ROLE  role to assume in target account
  --dry-run            don't actually sync the users

Example command: ./sync_instances.py arn:aws:connect:us-
west-2:111122223333:instance/c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6
arn:aws:connect:us-
east-1:111122223333:instance/00000000-0000-0000-0000-000000000000
```

With small modifications you can run this as a scheduled [AWS Lambda](https://aws.amazon.com/lambda/) function nightly to sync users.

## Issues

This script isn't perfect and there are issues you can run into depending on how your instances are configured.

### Authentication Issues

This doesn't work well for certain authentication scenarios where Connect manages passwords. If you get an error like:

```text
botocore.errorfactory.InvalidRequestException: An error occurred (InvalidRequestException) when calling the CreateUser operation: Required parameter missing: Password
```

Then you need to override this line in the script: `# Password="D3l3tM3L8ter",` with the desired default password for those users. Just be sure to have your users changes their password after. This is not needed with other authentication setups.

### Sync Issues

Syncing of routing and security profiles between regions only works if you use the same names across both regions.
