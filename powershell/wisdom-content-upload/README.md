# PowerShell wisdom content upload 

## Creating, updating, and deleting Amazon Connect Wisdom content via PowerShell

This is a sample Powershell Script to create, update, or delete Amazon Connect Wisdom articles.  Example for running the script:

`UploadContentTo-Wisdom.ps1`

The script does the following by default:

1. Collects a list of files in the directory the script is run.  These should be the content being uploaded to Wisdom. In all my testing it was .htm content.
1. Finds the Amazon Wisdom Custom Knowledge Base and gets a list of all articles attached to it.  The assumption is there is only one custom Knowledge Base in the region you're running this against.
1. Compares the list of files with the list of articles from the Custom Knowledge Base.
1. For files in the list that don't exist in Wisdom, it creates new content.
1. For files in the list that do exist in Wisdom, it updates the current content.

You can also use the -RemoveAll switch to delete all the content in the Wisdom Custom Knowledge Base like this:

`UploadContentTo-Wisdom.ps1 -RemoveAll`

Prerequisites: Install the AWS PowerShell Tools and configure them for your AWS Environment.

Installation link: https://docs.aws.amazon.com/powershell/latest/userguide/pstools-getting-set-up.html

Initial Configuration Link: https://docs.aws.amazon.com/powershell/latest/userguide/pstools-getting-started.html

Tested using AWS PowerShell tools for .NET core on macOS, Windows, and AWS CloudShell: https://www.powershellgallery.com/packages/AWSPowerShell.NetCore