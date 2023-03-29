Downloads and searches Amazon Connect contact flows for a specified String. Screenshot of the solution in action:

![Screen_Shot_2022-12-15_at_2.31.01_PM](/Search-ContactFlows/Screen_Shot_2022-12-15_at_2.31.01_PM.png)

I tested this in CloudShell. Steps to make it work:
1. Copy the script to CloudShell.
2. type in pwsh to start PowerShell
3. type in Import-Module AWSPowerShell.Netcore to import the AWS PowerShell Module.
4. run the script:
    ./Search-ContactFlows.ps1 -SearchString "value"


it's case insensitive and will download all the flows for the instance you specify and search for that detail.  It will then show you a list of what flows it was found in.

I also tested this in the shell in Cloud9.  Steps to make it work there:
1. Install PowerShell using the instructions here:  https://learn.microsoft.com/en-us/powershell/scripting/install/install-other-linux?view=powershell-7.3
2. run PowerShell by typing pwsh on the shell and hitting enter.
3. Type in Install-Module AWSPowerShell.Netcore and wait for that to complete.
4. Save the contents of this file to your Cloud9 folder
5. run the script as shown in the screenshot above.
