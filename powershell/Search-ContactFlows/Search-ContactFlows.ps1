# created by rpittfie@amazon.com on 12/15/2022:
# Download and search all contact flows for a specific string.
#
# Examples:
#
# ./Search-ContactFlows -SearchString "Lambda"
# Prompts you for which instance to download flows from and search the content of the downloaded contact flows for the string "Lambda"
#
# ./Search-ContactFlows -SearchString "Lambda" -DownloadFlows $false
# Search any already downloaded contact flows for the string "Lambda"

Param(
    [Parameter(Mandatory=$true)]
    [string] $SearchString,
    [boolean] $DownloadFlows = $true
)

Write-Host "Importing AWSPowerShell.Netcore module.  hang on a sec..."
Import-Module AWSPowerShell.Netcore

if ($downloadFlows -eq $true) {
    
    if (!(Test-Path .\flows)) {
        mkdir flows
    }
    Write-Host `n
    Write-Host "Collecting a list of instances for the current region:"
    Write-Host `n
    $instances = Get-ConnInstanceList
    for ($i = 0; $i -lt $instances.length; $i++) {
        Write-Host $i $instances[$i].InstanceAlias
    }
    Write-Host `n
    $instanceValue = Read-Host "Enter the number of the instance you'd like to collect contact flows for"
    Write-Host `n
    $instanceId = $instances[$instanceValue].Id
    
    #Write-Host $instanceId
    
    $flowList = Get-ConnContactFlowList -InstanceId $instanceId
    
    Write-Host "Downloading flows: "
    Write-Host `n
    foreach ($flow in $flowList) {
        $flowDetails = Get-ConnContactFlow -InstanceId $instanceId -ContactFlowId $flow.Id -ErrorAction SilentlyContinue
        $fileName = $flow.Name
        $flowDetails.Content | Out-File .\flows\$fileName
        Write-Host $flow.Name
    }
}

Write-Host `n
Write-Host "Searching contact flows for: $SearchString"
Get-ChildItem .\flows\* | select-string $SearchString | Select-Object Filename -Unique