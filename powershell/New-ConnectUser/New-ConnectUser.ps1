#Create a user account in Amazon Connect
#NOTE:  This is for demonstration purposes only and includes exactly zero error handling.
#Prerequisite includes installing the AWS PowerShell Tools and configuring them for your AWS Environment.
#Installation link: https://docs.aws.amazon.com/powershell/latest/userguide/pstools-getting-set-up.html 
#Initial Configuration Link: https://docs.aws.amazon.com/powershell/latest/userguide/pstools-getting-started.html 
#Tested using AWS PowerShell tools for .NET core: https://www.powershellgallery.com/packages/AWSPowerShell.NetCore/4.0.4.0

#NOTE:  If you're using SAML for authentication:
#1. Comment out the $password variable line, 
#2. Comment out the line below #Uncomment for non-SAML:.. 
#3. Uncomment the line below #Uncomment for SAML: 
# Reference for Identity Management in Amazon Connect:
# https://docs.aws.amazon.com/connect/latest/adminguide/connect-identity-management.html

Param(
    [Parameter(Mandatory=$true,
    ValueFromPipeline=$true)]
    [String[]]
    $emailAddress,

    [Parameter(Mandatory=$true)]
    $userName,

    [Parameter(Mandatory=$true,
    ValueFromPipeline=$true)]
    [String[]]
    $firstName, 

    [Parameter(Mandatory=$true,
    ValueFromPipeline=$true)]
    [String[]]
    $lastName
)
###BEGIN hardcoded values for Instance ID, password (not required if using SAML), routing profile ID and security profile ID: 
#Get the Instance ID value from the end of the arn on the overview page for your instance in the Amazon Connect AWS console.
$instanceID = "c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6"

$password = "1SuperSecretPassword"

#To find routing profile ID:  Get-ConnRoutingProfileList -InstanceId $instanceID 
#That will give you a list of routing profile Arn, Id, and Name values.  Find the one you need.
$routingProfileId = "c2e9dc6f-3f69-40e2-b0ec-f78d0c612345"

#To find the right security profile ID, it's just like the routing profile one above.
#run Get-ConnSecurityProfileList and find the ID for the one you want.  Then set it in the line below:
$securityProfileId = "c2e9dc6f-3f69-40e2-b0ec-f78d0c654321"

###END hardcoded values for Instance ID, password (not required if using SAML), routing profile ID and security profile ID###

#You have to create this phone configuration object.  Below are the defaults.  If you want to change any of the phone config related settings, look here for details:
#https://docs.aws.amazon.com/sdkfornet/v3/apidocs/index.html?page=Connect/TConnectUserPhoneConfig.html&tocid=Amazon_Connect_Model_UserPhoneConfig
$userPhoneConfig = New-Object -TypeName Amazon.Connect.Model.UserPhoneConfig
$userPhoneConfig.AfterContactWorkTimeLimit = 0
$userPhoneConfig.AutoAccept = $false
$userPhoneConfig.PhoneType = "SOFT_PHONE"

#You have to create an object of the type below to get these fields filled in appropriately:
$userIDInfo = New-Object -TypeName Amazon.Connect.Model.UserIdentityInfo
#example hardcoding values.  Uncomment these three lines if you want to test hardcoding these values:
#$userIDInfo.Email = "user@domain.com"
#$userIDInfo.FirstName = "User"
#$userIDInfo.LastName = "Domain"

#settting values from params above:
$userIDInfo.Email = $emailAddress
$userIDInfo.FirstName = $firstName
$userIDInfo.LastName = $lastName

#Uncomment for non-SAML: Create the user with all the details collected above - non-SAML example:
New-CONNUser -InstanceId $instanceID -IdentityInfo $userIDInfo -password $password -PhoneConfig $userPhoneConfig -RoutingProfileId $routingProfileId -SecurityProfileId $securityProfileId -Username $userName
#Uncomment for SAML: Create the user with all the details collected above if using SAML - no password set:
#New-CONNUser -InstanceId $instanceID -IdentityInfo $userIDInfo -PhoneConfig $userPhoneConfig -RoutingProfileId $routingProfileId -SecurityProfileId $securityProfileId -Username $userName