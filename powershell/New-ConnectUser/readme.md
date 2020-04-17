# Creating a new connect user via PowerShell

This is a sample Powershell Script to create a new user with just a few parameters.  Example for running the script:

```New-ConnectUser.ps1 -emailAddress "user@domain.com" -firstName "User" -lastName "Doe"```

This script could be used as input to create users from a .csv file or even pulling members of an Active Directory Group.

Prerequisites: Installing the AWS PowerShell Tools and configure them for your AWS Environment.
Installation link: https://docs.aws.amazon.com/powershell/latest/userguide/pstools-getting-set-up.html 
Initial Configuration Link: https://docs.aws.amazon.com/powershell/latest/userguide/pstools-getting-started.html 
Tested using AWS PowerShell tools for .NET core: https://www.powershellgallery.com/packages/AWSPowerShell.NetCore/4.0.4.0

# NOTE:  If you're using SAML for authentication:
1. Comment out the $password variable line, 
2. Comment out the line below #Uncomment for non-SAML:.. 
3. Uncomment the line below #Uncomment for SAML:

Reference for Identity Management in Amazon Connect:
https://docs.aws.amazon.com/connect/latest/adminguide/connect-identity-management.html

required variables to update in the script:

```$instanceID = "c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6"```
You can get the Instance ID value from the end of the arn on the overview page for your instance in the Amazon Connect AWS console.

```$password = "1SuperSecretPassword"```

```$routingProfileId = "c2e9dc6f-3f69-40e2-b0ec-f78d0c612345"```
To find routing profile ID you can run:  Get-ConnRoutingProfileList -InstanceId $instanceID 
That will give you a list of routing profile Arn, Id, and Name values.  Find the one you need.

```$securityProfileId = "c2e9dc6f-3f69-40e2-b0ec-f78d0c654321"```
To find the right security profile ID, it's just like the routing profile one above.
Run Get-ConnSecurityProfileList and find the ID for the one you want.