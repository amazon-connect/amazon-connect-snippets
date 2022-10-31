param (
    [switch] $RemoveAll = $false
)

$psVer = (Get-Host).Version

if (Get-Module -Name "AWSPowerShell") {
    Write-Host "AWS PowerShell Module installed.  Importing it now..."
    Import-Module -Name AWSPowerShell
}
elseif (Get-Module -Name "AWSPowerShell.Netcore") {
    Write-Host "AWS PowerShell.Netcore Module installed.  Importing it now..."
    Import-Module -Name AWSPowerShell.Netcore
}
elseif (Get-Module -Name "AWS.Tools.ConnectWisdomService" ) {
    Write-Host "AWS.Tools.ConnectWisdomService module installed.  Importing now"
    Import-Module -Name AWS.Tools.ConnectWisdomService
    Import-Module -Name AWS.Tools.Common
}
else {
    Write-Host "AWS Powershell Modules need to be installed to run this script."
    Write-Host "See https://docs.aws.amazon.com/powershell/latest/reference/ for details on how to get started with AWS PowerShell."
    exit
}


$knowledgeBases = Get-WSDMKnowledgeBasisList  | Where-Object { $_.KnowledgeBaseType -eq "CUSTOM" }

$kbArn = $knowledgeBases.KnowledgeBaseArn

#get a full list of files in the current directory:
$fileList = Get-ChildItem *.* -Exclude *.ps1

#get a list of the content currently uploaded to Wisdom:
$fullContentList = @()
do {
    if ($nextToken) {
        $contentList = Get-WSDMContentList -KnowledgeBaseId $kbArn -NextToken $nextToken   
        Write-Host -NoNewLine "."    
    }
    else {
        Write-Host -NoNewLine "Collecting article list..."
        $contentList = Get-WSDMContentList -KnowledgeBaseId $kbArn
    }
    $fullContentList += $contentList
    $nextToken = $AWSHistory.LastServiceResponse.NextToken
} while ($nextToken)

Write-Host ""

#Create a list of files that haven't been uploaded as content yet.
$newContent = Compare-Object -ReferenceObject $fileList -DifferenceObject $fullContentList -Property Name | Where-Object { $_.SideIndicator -eq "<=" }
$updateContent = Compare-Object -ReferenceObject $fileList -DifferenceObject $fullContentList -Property Name -IncludeEqual | Where-Object { $_.SideIndicator -eq "==" }

if ($RemoveAll) {
    if ($fullContentList) {
        $confirmation = Read-Host "Delete all"($fullcontentList).Count"articles in your KnowledgeBase? (y/n)"

        if ($confirmation -eq "y") {
            #kill all content for the specific KB:
            foreach ($content in $fullContentList) {
                Remove-WSDMContent -ContentId $content.ContentId -KnowledgeBaseId $kbArn -Force -Verbose
            }
        }
        exit
    } else {
        Write-Host "No articles to delete."
        exit
    }
    
} 

elseif ($newContent) {
    Write-Host ($NewContent).Count "new articles to upload. starting now..."

    foreach ($file in $newContent) {
    
        # This returns parameters used for the upload and then creating the content/associating it with the upload.
        #By default this uses HTML as the content type.  Feel free to update if you have to use a different one.
        $uploadDetails = Start-WSDMContentUpload -KnowledgeBaseId $kbArn -ContentType text/html
    
        $destinationUrl = $uploadDetails.url 
        $uploadId = $uploadDetails.UploadId
        $headers = $uploadDetails.HeadersToInclude       
    
        #get data from the file you wanna upload:
        $content = Get-Content $file.Name
    
        #upload the content:
        Invoke-RestMethod -Method PUT -Uri $destinationUrl -Headers $headers -Body $content
    
        #Associate the uploaded content to this newly created name:
        $uploadResult = New-WSDMContent -KnowledgeBaseId $kbArn -Name $file.Name -UploadId $uploadId
        Write-Host $uploadResult.Name "complete"
    }
}

else {
    Write-Host "No new articles to upload found."
}

if ($updateContent) {
    Write-Host ($updateContent).Count " articles to update. starting now..."

    foreach ($file in $updateContent) {

        $contentId = ($fullContentList | Where-Object {$_.Name -eq $file.Name}).ContentId
        
        # This returns parameters used for the upload and then creating the content/associating it with the upload.
        $uploadDetails = Start-WSDMContentUpload -KnowledgeBaseId $kbArn -ContentType text/html
    
        $destinationUrl = $uploadDetails.url 
        $uploadId = $uploadDetails.UploadId
        $headers = $uploadDetails.HeadersToInclude       
    
        #get data from the file you wanna upload:
        $content = Get-Content $file.Name
    
        #upload the content:
        Invoke-RestMethod -Method PUT -Uri $destinationUrl -Headers $headers -Body $content
    
        #Update the articles that are already uploaded:
        $updateResult = Update-WSDMContent -KnowledgeBaseId $kbArn -UploadId $uploadId -ContentId $contentId
        Write-Host $updateResult.Name "complete"
    }
}
else {
    Write-Host "No articles to update found."
}
