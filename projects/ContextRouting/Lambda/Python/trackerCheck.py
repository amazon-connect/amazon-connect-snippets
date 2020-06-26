# Import libraries required for this function
import boto3
from boto3.dynamodb.conditions import Key
import os

# Define the lambda handler
def lambda_handler(event, context):
    
    # Create the response container
    response = {}

    # Try to get the incoming phone number and assign it to a variable
    try:
        received_phone = event["Details"]["ContactData"]["CustomerEndpoint"]["Address"]
    
    # If we didn't receive a phone number with the incoming event, then return an exception
    except:
        response.update({'status_code': 'nophone'})
        response.update({'lambdaResult': 'error'})
        
        # Return the response container
        return response
    
    # Define DB connection and table using the environment variables
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['tracker_table'])
    
    # Perform the search based on the received phone
    dynamo_response = table.get_item(
        Key={
            'caller_id' : received_phone
            
        }
    )

    # If we got a record, add it to the container
    if 'Item' in dynamo_response:
        response.update(dynamo_response['Item'])

        # Also update the container with a result code and a customer found flag
        response.update({'customer_found': '1'})
        response.update({'lambdaResult': 'success'})
        
        # Then, delete the current tracker
        remove_tracker = table.delete_item(
            Key={
                'caller_id' : received_phone
            }
        )
        
    # If we didnt get a record, update the container with success for the result and a 0 for customer found
    else:
        response.update({'customer_found': '0'})
        response.update({'lambdaResult': 'success'})
        
    # Return the response container
    return response