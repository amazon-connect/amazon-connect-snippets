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
                "contentType": "PlainText",
                "content": "I'm not sure how to hande your request. Let me find an agent to assist."
            }
        }
    }
    return use_response
