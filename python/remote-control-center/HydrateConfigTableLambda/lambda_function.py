import boto3
import os
import time
import json

'''
SAMPLE EVENTS


####
Import Events from config.json file
####
{
    "LanguageCodes": [
        "en",
        "fr",
        "es"
    ]
}

####
Insert or overwrite messages using events
####
{
    "LanguageCodes": [
        "en",
        "fr",
        "es"
    ],
    "Configs": [
        {
            "DefaultResponse": "Hello. Thank you for calling the Amazon Connect Command Center hotline",
            "ConfigType": "MESSAGE",
            "CollectionId": "ENTRY_FLOW",
            "ConfigId": "GREETING"
        }
    ]
}
'''

ddb = boto3.resource('dynamodb')
tb_name = os.environ['ConfigTable']
translate = boto3.client('translate')
primary_key = os.environ['TablePrimaryKey']
sort_key = os.environ['TableSortKey']
table = ddb.Table(tb_name)        

def parse_parameters(params):

    if "LanguageCodes" in params:
        language_codes = params['LanguageCodes']
    else:
        language_codes = ['en']

    return language_codes
    
def translate_text(message, language_code):
    try:
        resp = translate.translate_text(
                Text=message,
                SourceLanguageCode='en',
                TargetLanguageCode=language_code
        )
        
        new_message = resp['TranslatedText']

        return new_message, language_code

    except Exception as e:
        print(e)
        return message, 'en' 
        
def build_translation_dict(message, language_codes, perform_translation=True):
    translations = {
        'en': message
    }

    for code in language_codes:
        if perform_translation:
            temp_txt, temp_code = translate_text(message, code)
            translations[temp_code] = temp_txt
        else:
            translations[code] = message

    return translations
    
def process_config(item, language_codes):
    try:
        collection_id = item["CollectionId"]
        config_id = item["ConfigId"]
        config_type = item["ConfigType"]
        default_response = item["DefaultResponse"]

        if item["ConfigType"] == "STATIC_ROUTING":
            return item

        elif item["ConfigType"] == "LANGUAGE_ROUTING":
            translations = build_translation_dict(item["DefaultResponse"], language_codes, False)
            item.update(translations)
            return item

        elif item["ConfigType"] == "MESSAGE":
            translations = build_translation_dict(item["DefaultResponse"], language_codes)
            item.update(translations)
            return item

    except Exception as e:
        print(e)
        print("Failed to load config ", item)

def lambda_handler(event, context):
    try:     
        language_codes = parse_parameters(event)

        if "Configs" in event:
            raw_configs = event["Configs"]

        else:        
            with open('configs.json') as f:
                data = json.loads(f.read())
            
            raw_configs = data['Configs']
        
        with table.batch_writer() as batch:
            for config in raw_configs:
                processed = process_config(config, language_codes)
                batch.put_item(Item=processed)
        return "success!"
        
    except Exception as e:
        print(e)
        return "failed"
