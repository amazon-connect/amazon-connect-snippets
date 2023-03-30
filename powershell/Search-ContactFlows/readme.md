Downloads and searches Amazon Connect contact flows for a specified String.

<<<<<<< HEAD
![Screen_Shot_2022-12-15_at_2.31.01_PM](./Screen_Shot_2022-12-15_at_2.31.01_PM.png)

I tested this in CloudShell. Steps to make it work:
=======
CloudShell instructions:
>>>>>>> 07ff206 (updated Search-ContactFlows.ps1, screenshot, and related readme.md)

1. Copy the script to CloudShell.
2. type in pwsh to start PowerShell
3. run the script: ./Search-ContactFlows.ps1 -SearchString "value"

Screenshot below shows sample usage in CloudShell:

![Screen_Shot](/powershell/Search-ContaactFlows/Screen_Shot.png)


Cloud9 instructions:

1. Install PowerShell using the instructions here:  https://learn.microsoft.com/en-us/powershell/scripting/install/install-other-linux?view=powershell-7.3
2. run PowerShell by typing pwsh on the shell and hitting enter.
<<<<<<< HEAD
3. Type in Install-Module AWSPowerShell.Netcore and wait for that to complete.
4. Save the contents of this file to your Cloud9 folder
5. run the script as shown in the screenshot above.
=======
3. Type in Install-Module AWS.Tools.Common and wait for that to complete.
4. Type in Install-Module AWS.Tools.Connect and wait for that to complete.
5. Save the contents of this file to your Cloud9 folder
6. run the script: ./Search-ContactFlows.ps1 -SearchString "value"
>>>>>>> 07ff206 (updated Search-ContactFlows.ps1, screenshot, and related readme.md)
