# Contact Flow Helper
A single AWS Lambda function which provides a set of basic math and text tools to help manipulate data in contact flows. Included operations are:
* freeform_math = performs basic evaluation of a mathematical expression. For example: 2+2
* increment_1 = increments a provided number by 1
* increment_n = increments a provided number by a provided amount
* random_choice = returns a random selection from a provided list of options
* replace_text = replaces defined string within a text string with a provided string
* split_text = splits a defined string into two strings at a defined point
* strip_text = strips text from the start/end of a defined string
* lower_text = returns the lowercase version of a string
* upper_text = returns the uppercase version of a string

## Usage
When invoked, the function looks at the `function` parameter to determine wheich funciton to exectute. Based on the `function` parameter provided, there are additional required fields.

### freeform_math
The freeform_math operation simply evaluates a provided expression and returns the result as a string. For example, providing 2+2 with return a response of "4".
#### Required Parameters
The freeform_math operation requires the following parameters:
1. function = the operation to exectute, which should be set to `freeform_math`
2. expression = the mathematical expression to be evaluated

## Example
````
"Parameters": {
    "function": "freeform_math",
    "expression": "2+(2*4)/4"
}
````
Which will result in the following response from Lambda:
````
{
  "answer": "4.0",
  "result": "success"
}
````

### random_number
The random_number operation returns a rounded random number from a provided range. 
#### Required Parameters
The random_number operation requires the following parameters:
1. function = the operation to exectute, which should be set to `random_number`
2. start = the lower limit of the number range
3. end = the upper limit of the number range

## Example
````
"Parameters": {
    "function": "random_number",
    "start": "1000",
    "end": "9999"
}
````
Which will result in from Lambda similar to:
````
{
  "answer": "6517",
  "result": "success"
}
````

### increment_1
The increment_1 operation simply increments a provided number by 1 and returns the resulting string. For example, providing 24 will return a response of "25".
#### Required Parameters
The increment_1 operation requires the following parameters:
1. function = the operation to exectute, which should be set to `increment_1`
2. base = the number to increment

## Example
````
"Parameters": {
    "function": "increment_1",
    "base": "24"
}
````
Which will result in the following response from Lambda:
````
{
  "answer": "25",
  "result": "success"
}
````

### increment_n
The increment_n operation simply increments a provided base number by the provided increment value and returns the resulting string. For example, providing  abase of 24 and an increment of 6 will return a response of "30".
#### Required Parameters
The increment_n operation requires the following parameters:
1. function = the operation to exectute, which should be set to `increment_n`
2. base = the number to increment
3. increment = the amount to increment the base by

## Example
````
"Parameters": {
    "function": "increment_n",
    "base": "24",
    "increment": "6"
}
````
Which will result in the following response from Lambda:
````
{
  "answer": "30",
  "result": "success"
}
````

### random_choice
The random_choice operation returns a random selection from a provided list of options. For example, from the provided list of "hi,hello,yo,howdy,wassup" the function will select and return one option.
#### Required Parameters
The random_choice operation requires the following parameters:
1. function = the operation to exectute, which should be set to `random_choice`
2. list = the list of values you want to choose from. This should be a comma seperated list with no spaces.

## Example
````
"Parameters": {
    "function": "random_choice",
    "list": "hi,hello,yo,howdy,wassup"
}
````
Which will result in from Lambda similar to:
````
{
  "answer": "yo",
  "result": "success"
}
````

### replace_text
The replace_text repalces specifid text in an existing string with the supplied replacement.
#### Required Parameters
The replace_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `replace_text`
2. text_string = the text you are working with
3. replace_this = the string in that text that you want to replace
4. with_this = the string the you want to replace it with

## Example
````
"Parameters": {
    "function": "replace_text",
    "text_string": "I don't like contractions.",
    "replace_this": "don't",
    "with_this": "do not"
}
````
Which will result in the following response from Lambda:
````
{
  "answer": "I do not like contractions.",
  "result": "success"
}
````

### split_text
The split_text splits a provided string into two strings using a specified string as the split point. 
#### Required Parameters
The split_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `split_text`
2. text_string = the text you are working with
3. split_at = the string of text that you want to use as your split point

## Example
````
"Parameters": {
    "function": "split_text",
    "text_string": "User, Test",
    "split_at": ", "
}
````
Which will result in the following response from Lambda:
````
{
  "segment_1": "User",
  "segment_2": "Test",
  "result": "success"
}
````

### strip_text
The strip_text strips text from the start, end, or from both sides of a string. It has three mode options: trim = strips text from the start and end of a string, left = strips only from the start of a string, right = strips only from the end of a string 
#### Required Parameters
The strip_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `strip_text`
2. mode = the mode you want to use. Options are: trim,left,right
3. text_string = the text you are working with
4. text_to_strip = the characters that you want to strip

## Example
````
"Parameters": {
    "function": "strip_text",
    "mode": "trim",
    "text_string": "   xxxXXXMasterProgrammer2010XXXxxx   ",
    "strip_this": " xX"
}
````
Which will result in the following response from Lambda:
````
{
  "answer": "MasterProgrammer2010",
  "result": "success"
}
````

### lower_text
The lower_text returns the lowercase version of a string 
#### Required Parameters
The lower_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `lower_text`
2. text_string = the text you are working with

## Example
````
"Parameters": {
    "function": "lower_text",
    "text_string": "This tEXt HAS a MIX of CaSeS"
}
````
Which will result in the following response from Lambda:
````
{
  "answer": "this text has a mix of cases",
  "result": "success"
}
````

### upper_text
The upper_text returns the lowercase version of a string 
#### Required Parameters
The upper_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `upper_text`
2. text_string = the text you are working with

## Example
````
"Parameters": {
    "function": "upper_text",
    "text_string": "This tEXt HAS a MIX of CaSeS"
}
````
Which will result in the following response from Lambda:
````
{
  "answer": "THIS TEXT HAS A MIX OF CASES",
  "result": "success"
}
````
