# Math-Expression-Eval-JS

### Introduction
ExpEvaluator library provides features for evaluation of a mathematical expression expressed as a string. This library does not use/call JS’ in-built `eval` method. The library functions by using already existing algorithms for expression evaluation alongside a tokenizing function.
The order of operations for the evaluation of an expression are:
1. The expression (as a string data type) is first split into tokens using the tokenize method. Note that tokens here do not refer to individual characters, rather, they are individual mathematical tokens. Refer to definition and description of a token. 
2. After the expression is successfully tokenized, all sub-expressions or functions are evaluated and replaced by a native token of type number. This step ensures that all tokens in the expression are now in native form having a certain value.
3. The native expression, which originally was expressed as an infix expression, will then be converted to postfix expression.
4. The postfix expression is finally evaluated in a single scan of the expression to give the final output.

### Token
A token is a building block of the expression. There are 5 types of tokens:
* Left Parenthesis – Represents a left parenthesis.
* Number – This token represents an operand. Its value is a number data type.
* Operator – Represents a binary operator, which are, addition, subtraction, multiplication and division.
* Right Parenthesis – Represents a right parenthesis.
* Functional or Sub-Expression – This token represents a function call within the expression. The arguments are expressed as tokenized expressions during tokenizing of the whole expression.
Except for the sub-expression token, all other tokens are regarded as native tokens because they do not need to be evaluated before the final infix to postfix conversion. Any other tokens which may be created in the future will be regarded as derived tokens and they must be evaluated to a native token before final evaluation.

**Properties of Token**
* arguments - Array of arguments (which are expressions themselves) to be passed to the function call in case the token is a sub-expression.
* functionName - In case the token is a functional token, then this property specifies the function to be invoked. The function must be declared in the udFunctions property of the object.
* isSubExpression - Denotes if the token is a sub-expression or not.
* precedence - This is relevant for operator type tokens. The value must be defined in the operatorPrecedence property of ExpEvaluator. For other tokens, it is null.
* type - Specifies the type of token. Values must be defined in the tokenType property of the ExpEvaluator object.
* value - Specifies the value of the token. If the token is a left/right parenthesis or an operator, then the value is the string representation. If the token is of type number, then the value is the numerical value of the token. The value is null for derived token types.

### Sub-Expression
A sub-expression is a function, of the form `f(a1,a2,....an)`, similar to function calls. The sub-expressions can behave similar to an operand, in that, their state tables are similar. After the tokens are generated, the method first performs evaluation of the sub-expressions and replaces all of them with actual numerical values (hence the sub-exp cannot return any non-number data type). These functions have to be declared in the `udFunctions` property of the object and the arguments will be passed as `[a1,a2,...,an]` (an array in the same order from left to right). For example, if a function _func_ is defined in the udFuncitons property and then it will call the function passing the parameters found in the string as expressions or operands recursively. The body of _func_ will have two arguments, passed to it as `[a1,a2]`.
For example:
If you include a function `fun1` to the `udFunctions` property of the ExpEvaluator object then you can access it as such:

`ExpEvaluator.udFunctions["fun1"] = function(args){ return args[0] + args[2]; };`

then any expression, for example the expression `1+2+fun1(2,7)` will evaluate to `12` as `fun1(2,7)` will return the sum of the first and second argument.


***
### try-it-out.html
This is a web page with an input text box where you can give an input string and try out the tokenize, postix conversion and evaluating functions. The contents of the page are self explanatory.


***
## References
[Infix to Postfix Conversion and Postfix evaluation](http://interactivepython.org/runestone/static/pythonds/BasicDS/InfixPrefixandPostfixExpressions.html)
