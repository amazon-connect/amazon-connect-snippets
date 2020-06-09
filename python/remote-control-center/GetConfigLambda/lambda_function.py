import boto3
import os
import time
from boto3.dynamodb.conditions import Key, Attr

'''
SAMPLE CONNECT INVOCATION EVENTS

Get a single Message with language code in attributes:
{
    "Name": "ContactFlowEvent",
    "Details": {
        "ContactData": {
            "Attributes": {
                "LanguageCode": "es"
            }
        },
        "Parameters": {
            "CollectionId": "ENTRY_FLOW",
            "ConfigId": "MENU_OPTIONS"
        }
    }
}
returns:
{
    "SUCCESS": "TRUE",
    "MENU_OPTIONS": "Presione 1 para hablar con un agente. Pulse 2 para escuchar nuestras últimas noticias."
}

Get a single Message with language code in attributes but OVERWRITTEN by parameters:
{
    "Name": "ContactFlowEvent",
    "Details": {
        "ContactData": {
            "Attributes": {
                "LanguageCode": "es"
            }
        },
        "Parameters": {
            "CollectionId": "ENTRY_FLOW",
            "ConfigId": "MENU_OPTIONS"
        }
    }
}
returns:
{
    "SUCCESS": "TRUE",
    "MENU_OPTIONS": "Appuyez sur 1 pour parler à un agent. Appuyez sur 2 pour connaître nos dernières nouvelles."
}

Get all messagees from a collection:
{
    "Name": "ContactFlowEvent",
    "Details": {
        "ContactData": {
            "Attributes": {
                "LanguageCode": "en"
            }
        },
        "Parameters": {
            "CollectionId": "ENTRY_FLOW"
        }
    }
}
returns:
{
    "SUCCESS": "TRUE",
    "EMERGENCY_MESSAGE": "We are currently closed due to company holiday.",
    "GREETING": "Hello. Thank you for calling the Amazon Connect Command Center hotline",
    "HOT_MESSAGE": "We're experiencing higher than normal hold times.",
    "HOT_MESSAGE_FLAG": "2",
    "LATEST_NEWS": "We are excited to launch the Amazon Connect Command Center solution",
    "MENU_OPTIONS": "Press 1 to speak to an agent. Press 2 to hear our latest news.",
    "NEXT_CONTACT_FLOW": "<CONTACT_FLOW_ID>",
    "ROUTE_TO_AGENT_MESSAGE": "We will now route you to an agent."
}

'''
    
ddb = boto3.resource('dynamodb')
tb_name = os.environ['ConfigTable']
translate = boto3.client('translate')
primary_key = os.environ['TablePrimaryKey']
sort_key = os.environ['TableSortKey']
table = ddb.Table(tb_name)        

def parse_parameters(params, attributes):
    if "ConfigId" in params:
        config_id = params["ConfigId"]
    else:
        config_id = None
    
    if "CollectionId" in params:
        collection_id = params["CollectionId"]
    else:
        collection_id = None
        
    if "LanguageCode" in params:
        language_code = params['LanguageCode']
    elif "LanguageCode" in attributes:
        language_code = attributes['LanguageCode']
    else:
        language_code = 'en'

    return config_id, collection_id, language_code


def add_new_language(collection_id, config_id, message_text, language_code):
    key = { 
        primary_key: collection_id,
        sort_key: config_id 
    }
        
    resp = table.update_item(
        Key=key,
        UpdateExpression="SET {} = :t".format(language_code),
        ExpressionAttributeValues = {":t": message_text}
    )

    return
    
def translate_and_update(collection_id, config_id, message_text, language_code):
    try:
        if language_code == "en":
            add_new_language(collection_id, config_id, message_text, language_code)
            return message_text, 'en'     

        resp = translate.translate_text(
                Text=message_text,
                SourceLanguageCode='en',
                TargetLanguageCode=language_code
        )
        
        translated_text = resp['TranslatedText']
        add_new_language(collection_id, config_id, translated_text, language_code)

        return translated_text, language_code

    except:
        return message_text, 'en'    



def get_configs(collection_id, config_id=None):
    configs = []
    if config_id is None:
        resp = table.query(
            KeyConditionExpression=Key('CollectionId').eq(collection_id)
        )
        
        if "Items" in resp:
            configs.extend(resp["Items"])
    else:
        key = { 
            primary_key: collection_id,
            sort_key: config_id 
        }
        resp = table.get_item(
                Key=key
        )

        if "Item" in resp:
            configs.append(resp["Item"])

    return configs

def process_configs(collection_id, raw_configs, language_code):
    response = {
        "SUCCESS": "TRUE"
    }

    for conf in raw_configs:
        config_id = conf["ConfigId"]
        
        if conf["ConfigType"] == "STATIC_ROUTING":
            response[config_id] = conf["DefaultResponse"]

        elif conf["ConfigType"] == "LANGUAGE_ROUTING":
            if language_code in conf:
                response[config_id] = conf[language_code]
            else:
                add_new_language(collection_id, config_id, conf["DefaultResponse"], language_code)
                response[config_id] = conf["DefaultResponse"]

        elif conf["ConfigType"] == "MESSAGE":
            if language_code in conf:
                response[config_id] = conf[language_code]
            else:
                response_text, language_code = translate_and_update(collection_id, config_id, conf['DefaultResponse'], language_code)
                response[config_id] = response_text

    return response

def default_response():
    return {
        "SUCCESS": "FALSE"
    }

def lambda_handler(event, context):
    try:     
        config_id, collection_id, language_code = parse_parameters(event["Details"]["Parameters"], event["Details"]["ContactData"]["Attributes"])
        
        if config_id is None and collection_id is None:
            return default_response()

        raw_configs = get_configs(collection_id, config_id)

        if len(raw_configs) == 0:
            return default_response()
        
        return process_configs(collection_id, raw_configs, language_code)

                    
    except Exception as e:
        print(e)
        return default_response()
