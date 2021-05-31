
Amazon Connect Regex Patterns


#Since AWS CloudFormation templates use the JSON syntax for specifying objects and data, you will need to add an additional backslash to any backslash characters in your regular expression, or JSON will interpret these as escape characters.
For example, if you include a \d in your regular expression to match a digit character, you will need to write it as \\d in your JSON template.

