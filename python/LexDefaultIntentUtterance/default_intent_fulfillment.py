import json
def lambda_handler(event, context):
    
    use_response = {
        "sessionAttributes": {
            "detected_utterance": event['inputTranscript']
        },
        "dialogAction": {
            "type": "Close",
            "fulfillmentState": "Fulfilled",
            "message": {
                # Can be PlainText or SSML
                "contentType": "PlainText",
                # Edit the content value below with the message you want to return to the customer.
                "content": "I'm not sure how to hande your request. Let me find an agent to assist."
            }
        }
    }
    return use_response
