# Contact Flow Helper
A single AWS Lambda function which provides a set of basic math and text tools to help manipulate data in contact flows. Included operations are:
* freeform_math = performs basic evaluation of a mathematical expression. For example: 2+2
* random_number + returns a random number between a provided upper and lower limit
* increment_1 = increments a provided number by 1
* increment_n = increments a provided number by a provided amount
* random_choice = returns a random selection from a provided list of options
* replace_text = replaces defined string within a text string with a provided string
* split_text = splits a defined string at a defined point
* strip_text = strips text from the start/end of a defined string
* lower_text = returns the lowercase version of a string
* upper_text = returns the uppercase version of a string

__NOTE:__ No special IAM roles are required for this function.

## Usage
When invoked, the function looks at the `operation` parameter to determine which operation to exectute. Based on the `operation` parameter provided, there are additional required fields.

### freeform_math
The freeform_math operation simply evaluates a provided expression and returns the result as a string. For example, providing 2+2 with return a response of "4". This can be useful for things like calculating payments or balances, creating estimated wait times, or calculating other metrics.
#### Required Parameters
The freeform_math operation requires the following parameters:
1. function = the operation to exectute, which should be set to `freeform_math`
2. expression = the mathematical expression to be evaluated

## Example
````
"Parameters": {
    "operation": "freeform_math",
    "expression": "254.36-54.36"
}
````
Which will result in the following response from Lambda:
````
{
  "result": "success",
  "answer": "200.0"
}
````

### random_number
The random_number operation returns a rounded random number from a provided range. This can be useful for created randomized PINs for authentication purposes.
#### Required Parameters
The random_number operation requires the following parameters:
1. function = the operation to exectute, which should be set to `random_number`
2. start = the lower limit of the number range
3. end = the upper limit of the number range

## Example
````
"Parameters": {
    "operation": "random_number",
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
The increment_1 operation simply increments a provided number by 1 and returns the resulting string. For example, providing 24 will return a response of "25". This can be used to provide a loop counter that can be relayed to a customer or used to evaluate conditions based on current loop iteration. 
#### Required Parameters
The increment_1 operation requires the following parameters:
1. function = the operation to exectute, which should be set to `increment_1`
2. base = the number to increment

## Example
````
"Parameters": {
    "operation": "increment_1",
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
The increment_n operation simply increments a provided base number by the provided increment value and returns the resulting string. For example, providing  a base of 24 and an increment of 6 will return a response of "30". This can be used to provide a loop counter that can be relayed to a customer or used to evaluate conditions based on current loop iteration.
#### Required Parameters
The increment_n operation requires the following parameters:
1. function = the operation to exectute, which should be set to `increment_n`
2. base = the number to increment
3. increment = the amount to increment the base by

## Example
````
"Parameters": {
    "operation": "increment_n",
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
The random_choice operation returns a random selection from a provided list of options. For example, from the provided list of "hi,hello,yo,howdy,wassup" the function will select and return one option. This allows for randomization in messaging or options.
#### Required Parameters
The random_choice operation requires the following parameters:
1. function = the operation to exectute, which should be set to `random_choice`
2. list = the list of values you want to choose from. This should be a comma seperated list with no spaces.

## Example
````
"Parameters": {
    "operation": "random_choice",
    "list": "hi,hello,yo,howdy,wassup"
}
````
Which will result in from Lambda similar to:
````
{
  "result": "success",
  "answer": "hello"
}
````

### replace_text
The replace_text replaces specified text in an existing string with the supplied replacement. This can be used to alter formatting of recieved variables. For example, if one queried system provides a number formatted with hyphens, but the destination system requires underscores instead.
#### Required Parameters
The replace_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `replace_text`
2. text_string = the text you are working with
3. replace_this = the string in that text that you want to replace
4. with_this = the string the you want to replace it with

## Example
````
"Parameters": {
    "operation": "replace_text",
    "text_string": "GHKS-KKKLOE-23423-GGS",
    "replace_this": "-",
    "with_this": "_"
}
````
Which will result in the following response from Lambda:
````
{
  "result": "success",
  "answer": "GHKS_KKKLOE_23423_GGS"
}
````

### split_text
The split_text splits a provided string based on a provided split point. Also returns the number of segments identified. This can be used to isolate parts of text retrieved from a query. One example would be in cases where a query returns a customer name as "Doe, John". You could then split and use the result to address the customer by first name only. 
#### Required Parameters
The split_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `split_text`
2. text_string = the text you are working with
3. split_at = the string of text that you want to use as your split point
#### Optional Parameter
Optionally, you may also specify a maximum split value. The default behavior is to provide all splits in the string, however you can specify the maximum numbwer of splits. Please remember that this is python, so when setting the split_max value, the numbering begins at 0. With this in mind, you would define only one split by setting the split_max value to 0. 
1. split_max = maximum number of splits. Unless otherwise specified, the operation defaults split_max to -1, which is to return all splits possible.

## Example
````
"Parameters": {
    "operation": "split_text",
    "text_string": "Doe, John",
    "split_at": ", ",
    "split_max": "-1"
}
````
Which will result in the following response from Lambda:
````
{
  "result": "success",
  "segment1": "Doe",
  "segment2": "John",
  "total_segments": "2"
}
````

### strip_text
The strip_text strips text from the start, end, or from both sides of a string. It has three mode options: trim = strips text from the start and end of a string, left = strips only from the start of a string, right = strips only from the end of a string. This can be used to remove unnecessary characters around a given value. For example, if a customer's driver's license is stored in a DB with the state + license number, you could strip the state and return only the number.
#### Required Parameters
The strip_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `strip_text`
2. mode = the mode you want to use. Options are: trim,left,right
3. text_string = the text you are working with
4. strip_this = the characters that you want to strip

## Example
````
"Parameters": {
    "operation": "strip_text",
    "mode": "left",
    "text_string": "WA987654321",
    "strip_this": "WA"
}
````
Which will result in the following response from Lambda:
````
{
  "result": "success",
  "answer": "987654321"
}
````

### lower_text
The lower_text returns the lowercase version of a string. This is helpful when you need data cretrieved from a database to be evaluated in a standardized format.
#### Required Parameters
The lower_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `lower_text`
2. text_string = the text you are working with

## Example
````
"Parameters": {
    "operation": "lower_text",
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
The upper_text returns the lowercase version of a string. This is helpful when you need data cretrieved from a database to be evaluated in a standardized format.
#### Required Parameters
The upper_text operation requires the following parameters:
1. function = the operation to exectute, which should be set to `upper_text`
2. text_string = the text you are working with

## Example
````
"Parameters": {
    "operation": "upper_text",
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
