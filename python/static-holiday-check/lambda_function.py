import json
import boto3
from datetime import date


holidayList = {
    "25/12/2020": "Christmas Day",
    "01/01/2020": "New Year Day",
    "27/01/2020": "Australia Day",
    "10/04/2020": "Good Friday",
    "01/06/2020": "Awesome Day"
}

def lambda_handler(event, context):
    #Get Current date
    today = date.today()

    #Convert it into the format of the variable list
    d1 = today.strftime("%d/%m/%Y")

    #Enable the below line with the date you want to test with, or add today's date to the list above
    #d1 = "10/04/2020"
    #Make sure you disable the above testing line before putting this code into production

    #Find in the list
    try:
        x = holidayList.get(d1)
        if (x == None):
            toReturn = {
                "IsHoliday": "no",
                "holidayName": "none"
            }
        else:
            toReturn = {
                "IsHoliday": "yes",
                "holidayName": x
            }
    except:
        print("Didnt work")
        toReturn = {
            "IsHoliday": "no",
            "holidayName": "none"
        }

    return toReturn
