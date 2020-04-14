from datetime import date


def lambda_handler(event, context):
    today = str(date.today())
    with open("holidays.txt") as datafile:
        if today in datafile.read():
            return {"holiday": True}
    return {"holiday": False}
