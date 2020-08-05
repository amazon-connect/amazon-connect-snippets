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
    
    if event['Details']['Parameters']['function'] == 'freeform_math':
        response.update({'answer':str(freeform_math(event))})
        
    elif event['Details']['Parameters']['function'] == 'random_number':
        response.update({'answer':str(random_number(event))})
        
    elif event['Details']['Parameters']['function'] == 'increment_1':
        response.update({'answer':str(increment_1(event))})
        
    elif event['Details']['Parameters']['function'] == 'increment_n':
        response.update({'answer':str(increment_n(event))})
        
    elif event['Details']['Parameters']['function'] == 'random_choice':
        response.update({'answer':str(random_choice(event))})
        
    elif event['Details']['Parameters']['function'] == 'replace_text':
        response.update({'answer':str(replace_text(event))})
        
    elif event['Details']['Parameters']['function'] == 'split_text':
        response.update(split_text(event))
        
    elif event['Details']['Parameters']['function'] == 'strip_text':
        response.update({'answer': str(strip_text(event))})
        
    elif event['Details']['Parameters']['function'] == 'upper_text':
        response.update({'answer': str(upper_text(event))})
        
    elif event['Details']['Parameters']['function'] == 'lower_text':
        response.update({'answer': str(lower_text(event))})
        
    else:
        response.update({'result':'fail'})
        response.update({'reason':'no valid function passed'})
    
    response.update({'result':'success'})
    return response
    
def freeform_math(event):
    result = eval(event['Details']['Parameters']['expression'])
    return result
    
def random_number(event):
    result = round(random.uniform(int(event['Details']['Parameters']['start']),int(event['Details']['Parameters']['end'])))
    return result
    
def increment_1(event):
    result = int(event['Details']['Parameters']['base'])+1
    return result
    
def increment_n(event):
    result = int(event['Details']['Parameters']['base'])+int(event['Details']['Parameters']['increment'])
    return result
    
def random_choice(event):
    choice_list = event['Details']['Parameters']['list'].split(',')
    result = random.choice(choice_list)
    return result
    
def replace_text(event):
    do_replace = event['Details']['Parameters']['text_string']
    result = do_replace.replace(event['Details']['Parameters']['replace_this'], event['Details']['Parameters']['with_this'])
    return result
    
def split_text(event):
    text_to_split = event['Details']['Parameters']['text_string']
    split_at = event['Details']['Parameters']['split_at']
    split_result = text_to_split.split(split_at,1)
    result = {
        'segment_1': str(split_result[0]),
        'segment_2': str(split_result[1])
        }
    return result
    
def strip_text(event):
    text_to_strip = event['Details']['Parameters']['text_string']
    what_to_strip = event['Details']['Parameters']['strip_this']
    strip_mode = event['Details']['Parameters']['mode']
    if strip_mode == 'trim':
        result = text_to_strip.strip(what_to_strip)
    if strip_mode == 'right':
        result = text_to_strip.rstrip(what_to_strip)
    if strip_mode == 'left':
        result = text_to_strip.lstrip(what_to_strip)
    return result
        
def upper_text(event):
    result = event['Details']['Parameters']['text_string'].upper()
    return result
    
def lower_text(event):
    result = event['Details']['Parameters']['text_string'].lower()
    return result
