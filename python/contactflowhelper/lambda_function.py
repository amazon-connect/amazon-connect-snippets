'''
Basic helper function that covers common text/math operations for use with 
contact flows. This function is assuming incoming events from a contact flow. 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
'''
import json
import random

def lambda_handler(event, context):
    response = {}
    response.update({'result':'success'})
    operation_requested = event['Details']['Parameters']['operation']
    operation_parameters = event['Details']['Parameters']
    
    if operation_requested == 'freeform_math':
        response.update({'answer':str(freeform_math(operation_parameters))})
        
    elif operation_requested == 'random_number':
        response.update({'answer':str(random_number(operation_parameters))})
        
    elif operation_requested == 'increment_1':
        response.update({'answer':str(increment_1(operation_parameters))})
        
    elif operation_requested == 'increment_n':
        response.update({'answer':str(increment_n(operation_parameters))})
        
    elif operation_requested == 'random_choice':
        response.update({'answer':str(random_choice(operation_parameters))})
        
    elif operation_requested == 'replace_text':
        response.update({'answer':str(replace_text(operation_parameters))})
        
    elif operation_requested == 'split_text':
        response.update(split_text(operation_parameters))
        
    elif operation_requested == 'strip_text':
        response.update({'answer': str(strip_text(operation_parameters))})
        
    elif operation_requested == 'upper_text':
        response.update({'answer': str(upper_text(operation_parameters))})
        
    elif operation_requested == 'lower_text':
        response.update({'answer': str(lower_text(operation_parameters))})
        
    else:
        response.update({'result':'fail'})
        response.update({'reason':'no valid function passed'})
    
    return response
    
def freeform_math(operation_parameters):
    result = eval(operation_parameters['expression'])
    return result
    
def random_number(operation_parameters):
    result = round(random.uniform(int(operation_parameters['start']),int(operation_parameters['end'])))
    return result
    
def increment_1(operation_parameters):
    result = int(operation_parameters['base'])+1
    return result
    
def increment_n(operation_parameters):
    result = int(operation_parameters['base'])+int(operation_parameters['increment'])
    return result
    
def random_choice(operation_parameters):
    choice_list = operation_parameters['list'].split(',')
    result = random.choice(choice_list)
    return result
    
def replace_text(operation_parameters):
    do_replace = operation_parameters['text_string']
    result = do_replace.replace(operation_parameters['replace_this'], operation_parameters['with_this'])
    return result
    
def split_text(operation_parameters):
    split_values = {}
    split_counter = 0
    text_to_split = operation_parameters['text_string']
    split_at = operation_parameters['split_at']
    try:
        split_max = int(operation_parameters['split_max'])
    except:
        split_max = -1
    split_result = text_to_split.split(split_at,split_max)
    for string in split_result:
        split_counter = split_counter + 1
        split_values.update({
            'segment'+str(split_counter):string
        })
    split_values.update({'total_segments':str(split_counter)})
    result = split_values
    return result
    
def strip_text(operation_parameters):
    text_to_strip = operation_parameters['text_string']
    what_to_strip = operation_parameters['strip_this']
    strip_mode = operation_parameters['mode']
    if strip_mode == 'trim':
        result = text_to_strip.strip(what_to_strip)
    if strip_mode == 'right':
        result = text_to_strip.rstrip(what_to_strip)
    if strip_mode == 'left':
        result = text_to_strip.lstrip(what_to_strip)
    return result
        
def upper_text(operation_parameters):
    result = operation_parameters['text_string'].upper()
    return result
    
def lower_text(operation_parameters):
    result = operation_parameters['text_string'].lower()
    return result
