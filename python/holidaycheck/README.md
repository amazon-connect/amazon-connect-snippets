# Amazon Connect Holiday Check Lambda Sample

This is a sample of holiday check using a local text file in the Lambda function without any use of external databases. This is great for branching to a Holiday or out of office contact flow based on the response. You can use this and queue [hours of operation](https://docs.aws.amazon.com/connect/latest/adminguide/set-hours-operation.html) to create a responsive and automated contact center.

You could alternatively load a parameter from [AWS Parameter Store](https://aws.amazon.com/systems-manager/features/#Parameter_Store) with something like the code below:

```python
import boto3
import os
ssm = boto3.client("SSM")
HOLIDAYS = ssm.get_parameter(Name=os.getenv('HOLIDAY_PARAMETER_NAME'))['Parameter']['Value']
```

You would set a lambda function environment variable `HOLIDAY_PARAMETER_NAME` to the name of the parameter. The parameter would have newline delimited dates in `2020-12-25` formats.

If you want to check ignoring the year you could just compare month and day.

```python
today = str(date.today())[5:]
```

Feel free to mix and match solutions to best enable your contact center!
