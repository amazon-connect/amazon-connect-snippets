# Lex Default Intent Fulfillment Function
Simple lambda function fulfillment funciton for Lex default intents. This allows you to pass the last utterance that triggered the contact flow as a Lex session attribute. You can then write it as a session attribute, use it in another Lambda function to query a document DB, etc. Additionally, this function returns a simple message that is played/presented to the customer depedning on the media type that lets them know what is going on.

By default, this code uses plaintext to render the message. If you'd like to use SSML, that is also an option. Simply change the contentType setting to SSML.

    "contentType": "SSML",
