# Import required libraries
import base64
import json
import boto3
import os
import time

# Define the main handler
def lambda_handler(event, context):

    # Create the response container and the tracker container
    response = {}
    tracker_item = {}
    
    # Setup stats for logging
    ctrs_skipped = 0
    ctrs_processed = 0

    # Process the stream event(s)
    for record in event['Records']:
        
        # Decode the data and parse the json
        try:
            payload = base64.b64decode(record['kinesis']['data'])
            payload_data = json.loads(payload)
            print(payload_data)
        
        # Log a decode failure and break out of loop
        except:
            response.update({'fail_code':'decode data fail'})
            response.update({'result':'fail'})
            break

        # Extract the tracker flag, if it exists
        try:
            active_task_tracker = payload_data['Attributes']['active_task_tracker']

        # Log missing tracker and continue
        except:
            print('No tracker')
            ctrs_skipped = ctrs_skipped + 1
            continue
        
        # Establish DynamoDB client and table
        try:
            # Define DB connection and table using the environment variables
            dynamodb_client = boto3.resource('dynamodb')
            dynamodb_table = dynamodb_client.Table(os.environ['tracker_table'])
            
        # Update the response on fail
        except:
            response.update({'fail_code':'dynamo init fail'})
            response.update({'result':'fail'})
                

        # Check if tracker was disabled. If so, do a quick update to Dynamo to delete the tracker.
        if active_task_tracker == '0':
            # Increment ctrs_skipped
            delete_tracker = dynamodb_table.delete_item(
                Key={'caller_id':payload_data['CustomerEndpoint']['Address']}
            )
            continue
            
        else:
            # Pull the attributes and add them to the tracker item
            try:
                ctr_attributes = payload_data['Attributes']
                for k,v in ctr_attributes.items():
                    tracker_item.update({k : v})
            
            # Log a attribute extraction fail and stop processing
            except:
                response.update({'fail_code':'Attribute extraction fail'})
                response.update({'result':'fail'})
                continue
            
            # Update the tracker item with the customer phone number
            tracker_item.update({'caller_id':payload_data['CustomerEndpoint']['Address']})
            
            # Define the TTL for the tracker using the environment variable
            currEpochTime = round(time.time())
            item_ttl = currEpochTime+int(os.environ['tracker_ttl'])
            tracker_item.update({'item_ttl':item_ttl})
            
            # Write the tracker item to DynamoDB
            try:
                tracker_write = dynamodb_table.put_item(
                    Item = tracker_item
                )
                response.update({'tracking': 'true'})
            
            # Log a fail to the response
            except:
                response.update({'tracking': 'false'})
                
            # retuen the response back for this item
            return response
  
    # Update the response with stats
    response.update({'ctrs_processed':ctrs_processed})
    response.update({'ctrs_skipped':ctrs_skipped})
    
    # Print the response for logging & return
    print(response)
    return response