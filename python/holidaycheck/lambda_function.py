from datetime import date

def lambda_handler(event, context):

    d1 = str(date.today())

    datafile = open('holidays.txt')
    found = False
    for line in datafile:
        if d1 in line:
            found = True
            break
    datafile.close()

    if found == True:
        return {"holiday":"True"}
    else:
        return {"holiday":"False"}
