var ExpEvaluator = {

    /**
     * Exception object.
     */
    exception: {
        /**
         * Exception types. Message of each type is self-explanatory.
         */
        types: {
            0: {
                message: "Divides by 0"
            },
            1: {
                message: "Stack underflow"
            },
            2: {
                message: "Unrecognized character"
            },
            3: {
                message: "Mismatching parenthesis. Additional right parenthesis"
            },
            4: {
                message: "Invalid number format"
            },
            5: {
                message: "Invalid location for decimal point"
            },
            6: {
                message: "Invalid function declaration"
            },
            7: {
                message: "Mismatching parenthesis. Missing right parenthesis"
            },
            8: {
                message: "Invalid expression. Violates state table"
            },
            9: {
                message: "Invalid argument declaration in function"
            },
            10: {
                message: "Function declaration not found in udFunctions"
            },
            11: {
                message: "Function does not return a number or returns NaN"
            }
        },
        /**
         * Generate exception object.
         * @param {number} type Type of exception as defined in types.
         * @param {number} index The index at which the exception occurred. Actual issue may reside at index close to given index.
         * @param {string} character The character which played a role in the exception.
         * @returns {object} A new exception object.
         */
        generateException: function(type, index, character){
            var ex = {
                message: this.types[type].message,
                index: index,
                character: character
            };

            return ex;
        },
    },

    /**
     * Numerical value for precedence of operator. An operator is said to have higher precedence than another 
     * if its precedence value is greater than the value of the other in this object.
     */
    operatorPrecedence: {
        '%': 3, '/': 2, '*': 2, '+': 1, '-': 1
    },
    
    /**
     * Regular expressions used in the library. Keys are analogous to the types or description of the regular expression.
     */
    regex: {
        operand: /^[0-9]+((\.[0-9]+){0,1})$/,
        unaryOp: /[+-/*%()]/,
        operator: /^[+-/*%]$/,
        functional: /[a-z]+[a-z0-9_]*/,
        digit: /^[0-9]$/,
        alphabet: /^[A-Za-z]$/
    },

    /**
     * Stack implementation object.
     */
    Stack: {
        stack: [],
        /**
         * Clears or empties the stack.
         */
        clear: function(){
            this.stack = [];
        },
        /**
         * Checks if the stack is empty or not.
         * @returns {boolean} True is the stack is empty or false otherwise.
         */
        isEmpty: function(){
            return this.stack.length==0;
        },
        /**
         * Returns the item present at the specified index without popping it.
         * @param {number} index The whole number index of the item to peek.
         * @returns {object} The object present at the index location of the stack.
         * @throws
         */
        peek: function(index){
            try{
                return this.stack[index];
            }
            catch(error){
                throw error;
            }
        },
        /**
         * Pops the top most element of the stack (which also includes removing it from the stack).
         * @returns {object} The topmost element of the stack.
         * @throws
         */
        pop: function(){
            if(this.stack.length==0){
                throw ExpEvaluator.exception.generateException(1, null, null);
            }
            var result = this.stack.pop();
            return result;
        },
        /**
         * Pushes an element into the stack.
         * @param {object} item The item to be pushed into the stack.
         */
        push: function(item){
            this.stack.push(item);
        },
        /**
         * Gets the top most element of the stack without removing it from the stack.
         * @returns {object} The top-most element of the stack.
         * @throws
         */
        top: function(){
            if(this.stack.length==0){
                throw ExpEvaluator.exception.generateException(1, null, null);
            }
            return this.stack[this.stack.length-1];
        }
    },

    stateCheckTable: {
        0: [1,3,5,6],
        1: [2,4],
        2: [1,3,5],
        3: [1,3,5,6],
        4: [2,4],
        5: [2,4],
        6: [1,3]
    },

    /**
     * Enumeration for token types. The keys are analogous to the names of the types.
     */
    tokenType: {
        operand: 1,
        operator: 2,
        leftParenthesis: 3,
        rightParenthesis: 4,
        subexpression: 5,
        unary: 6
    },

    /**
     * Evaluates all sub-expressions in a tokenized expression and replaces the sub-expressions object with actual values.
     * @param {Array<object>} exp The tokenized expression.
     * @return {number} The value of the expression after evaluation.
     * @throws Throws exception when either one of the functions is not found or it returns a non-number value.
     */
    evaluateAllSubexpressions: function(exp){
        // Initializing shortcut variables
        var type = this.tokenType;

        try{
            for(var i=0; i<exp.length; i++){
                // Ignoring all other types of tokens
                if(exp[i].type!=type.subexpression){
                    continue;
                }
                // Evaluating the expression
                var temp = this.evaluateSubExpression(exp[i]);
                // Replacing the sub-expression token with new value
                exp[i] = this.generateNativeToken(temp + "");
            }
        }
        catch(error){
            throw error;
        }

        return exp;
    },

    /**
     * Evaluates a mathematical expression, expressed as string.
     * @param {string} exp The expression in string form.
     * @returns {number} The result after evaluation of the string.
     * @throws Throws exceptions from tokenize method.
     */
    evaluateExpression: function(exp){
        // Checking if input is a valid data type
        if(exp==undefined || exp==null || typeof exp!='string' || exp.length==0){
            return null;
        }

        try{
            // Tokenizing expression
            var tokens = this.tokenize(exp);

            // Evaluating tokenized expression
            var result = this.evaluateTokenizedExp(tokens);

            return result;
        }
        catch(error){
            throw error;
        }
    },

    /**
     * Evaluates a native expression which is of the form firstOperand operator secondOperand.
     * @param {number} firstOperand The first operand.
     * @param {number} secondOperand The second operand.
     * @param {string} operator The operator.
     * @returns {number} The value after evaluating the expression.
     * @throws Throws exception when there is a divides by zero expression.
     */
    evaluateNativeExpression: function(firstOperand, secondOperand, operator){
        // Initializing result variable
        var result = 0.0;

        switch(operator){
            case "%":
                result = firstOperand % secondOperand;
                break;
            case "/":
                // Checking if second operator is 0 or not.
                if(secondOperand==0){
                    throw ExpEvaluator.exception.generateException(0, null, null);
                }
                result = firstOperand / secondOperand;
                break;
            case "*":
                result = firstOperand * secondOperand;
                break;
            case "+":
                result = firstOperand + secondOperand;
                break;
            case "-":
                result = firstOperand - secondOperand;
                break;
        }

        return result;
    },

    /**
     * Evaluates a postfix expression.
     * @param {Array<object>} postfix Array of tokens expressed in postfix form.
     * @returns {number} The value of the expression after evaluation.
     */
    evaluatePostfix: function(postfix){
        // Initializing shortcuts
        var type = this.tokenType;
        
        // Initializing result variable
        var result = 0.0;

        // Clearing stack
        var stack = this.Stack;
        stack.clear();

        // Scanning the expression from left to right
        for(var i=0; i<postfix.length; i++){
            if(postfix[i].type==type.operand){
                stack.push(postfix[i].value);
            }
            else if(postfix[i].type==type.operator){
                try{
                    var b = stack.pop();
                    var a = stack.pop();
                    stack.push(this.evaluateNativeExpression(a,b,postfix[i].value));
                }
                catch(error){
                    throw error;
                }
            }
        }

        return stack.pop();
    },

    /**
     * Evaluates a sub-expression contained within funcitons.
     * @param {object} subexp Sub-expression object.
     * @returns {number} Numerical result after evaluating the function.
     * @throws Throws exception when either the function is not found or when the function returns a non-number value.
     */
    evaluateSubExpression: function(subexp){
        // Initializing result variable
        var result = 0.0;
        
        // Checking if function declaration exists in udFunctions
        if(this.udFunctions[subexp.functionName]==undefined || 
            this.udFunctions[subexp.functionName]==null || 
            typeof this.udFunctions[subexp.functionName]!='function'){
                throw this.exception.generateException(10,null,subexp.functionName);
            }

        // Evaluating all the arguments of the sub-exp
        // and replacing the original arguments with the evaluated value.
        for(var i=0; i<subexp.arguments.length; i++){
            subexp.arguments[i] = this.evaluateTokenizedExp(subexp.arguments[i]);
        }

        // Calling the function and passing the arguments
        result = this.udFunctions[subexp.functionName](subexp.arguments);

        // Checking if result is a number or not
        // Return only if result is a number
        if(typeof result!='number' || isNaN(result)){
            throw this.exception.generateException(11, null, subexp.functionName);
        }

        return result;
    },

    /**
     * Evaluates a tokenized expression.
     * @param {Array<object>} tokens The tokenized expression.
     * @returns {number} The result of the evaluation.
     */
    evaluateTokenizedExp: function(tokens){
        // Evaluating all functional tokens
        tokens = this.evaluateAllSubexpressions(tokens);

        // Converting expression to postfix
        tokens = this.infixToPostfix(tokens);

        // Evaluating postfix expression
        var result = this.evaluatePostfix(tokens);

        return result;
    },

    /**
     * Creates a functional expression object.
     * @param {string} functionName The name fo the function.
     * @param {Array<string>} innerExp The inner expression/parameters of the function.
     * @returns {object} The functional expression token.
     */
    generateFunctionalExpression: function(functionName, innerExp){
        // Shortcut variables
        var type = this.tokenType;
        var regex = this.regex;
        
        // Result token initialization
        var token = {
            isSubExpression: true,
            value: null,
            type: type.subexpression,
            precedence: null,
            arguments: [],
            functionName: functionName
        };

        if(innerExp[0]=="," || innerExp[innerExp.length-1]==","){
            throw this.exception.generateException(9, null, ",");
        }

        // Splitting the arguments
        for(var i=0; i<innerExp.length; i++){
            // Ignoring commas
            if(innerExp[i]==","){
                continue;
            }
            var temp = [];
            for(; innerExp[i]!="," && i<innerExp.length; i++){
                temp.push(innerExp[i]);
            }

            // Tokenizing the argument and pusing it to argument array
            token.arguments.push(this.tokenize(temp.join("")));
        }
        
        return token;
    },

    /**
     * Method to generate new tokens.
     * @param {string} stringToken The string form of the token to be generated.
     * @returns {object} A token object representing the string.
     * @throws Throws exception when character is not recognized.
     */
    generateNativeToken: function(stringToken){
        // Shortcut variables
        var type = this.tokenType;
        var regex = this.regex;

        // Result token initialization
        var token = {
            isSubExpression: false,
            value: null,
            type: null,
            precedence: null
        };

        if(stringToken=="("){
            token.value = "(";
            token.type = type.leftParenthesis;
        }
        else if(stringToken==")"){
            token.value = ")";
            token.type = type.rightParenthesis;
        }
        else if(stringToken.match(regex.operator)){
            token.value = stringToken;
            token.type = type.operator;
            token.precedence = this.operatorPrecedence[stringToken];
        }
        else if(stringToken.match(regex.operand)){
            token.value = Number(stringToken);
            token.type = type.operand;
        }
        else{
            throw ExpEvaluator.exception.generateException(2, null, stringToken);
        }

        return token;
    },

    /**
     * Converts an infix expression to postfix form.
     * @param {Array<object>} exp Array of tokens expressed in infix form.
     * @returns {Array<object>} Array of tokens expressed as postfix.
     */
    infixToPostfix: function(exp){
        // Initializing shortcut variables
        var type = this.tokenType;
        var stack = this.Stack;
        
        // Clearing the stack
        stack.clear();

        // Initializing result array
        var postfix = [];

        try{
            // Iterating over the expression
            for(var i=0; i<exp.length; i++){
                switch(exp[i].type){
                    case type.operand:
                        postfix.push(exp[i]);
                        break;
                    case type.leftParenthesis:
                        stack.push(exp[i]);
                        break;
                    case type.rightParenthesis:
                        // Popping all operators in the operator stack until the 
                        // corresponding left parenthesis is encountered on the stack.
                        for(var temp=stack.pop(); temp.type!=type.leftParenthesis; temp=stack.pop()){
                            postfix.push(temp);
                        }
                        break;
                    case type.operator:
                        // Removing all operators in the operator stack whose precedence
                        // are higher or equal to the precedence of current operator
                        while(!stack.isEmpty() && stack.top().precedence >= exp[i].precedence){
                            postfix.push(stack.pop());
                        }
                        stack.push(exp[i]);
                }
            }

            // Appending remaining operators in the operator stack to postfix expression.
            // Removing the remaining operators in the operator stack.
            while(!stack.isEmpty()){
                postfix.push(stack.pop());
            }
        }
        catch(error){
            throw error;
        }
        
        return postfix;
    },

    /**
     * Splits/breakdown string expression into tokens.
     * @param {string} exp Expression in string form.
     * @returns {object} Array of tokens in the same order from left to right as the order of string expression.
     * @throws Throws multiple exceptions. Check exception property corresponding to the values thrown in this method.
     */
    tokenize: function(exp){
        
        // Shortcut variables
        var regex = this.regex;
        var tokenType = this.tokenType;

        // Splitting expression into individual characters
        var temp = exp.split("");

        // Array to hold final tokens
        var result = [];

        // Parenthesis counter for validation
        var pairCounter = 0;

        // Iterating over all the characters
        for(var i=0; i<temp.length; i++){
            // Ignoring spaces
            if(temp[i]==" "){
                continue;
            }
            
            var token = null;

            // Check for left/right parenthesis or operator type
            if(temp[i]=="(" || temp[i]==")" || temp[i].match(regex.operator)){
                if(temp[i]=="("){
                    pairCounter++;
                }
                else if(temp[i]==")"){
                    if(pairCounter==0){
                        throw ExpEvaluator.exception.generateException(3, i, temp[i]);
                    }
                    pairCounter--;
                }
                token = this.generateNativeToken(temp[i]);
            }
            // Check for number type
            else if(temp[i].match(regex.digit)){
                var tempNum = temp[i];

                // Gathering all non-fractional part of numbers
                for(i++; i<temp.length; i++){
                    if(!temp[i].match(regex.digit)){
                        break;
                    }
                    tempNum += temp[i];
                }

                // If end of string has not reached
                if(i<temp.length){
                    if(temp[i]=="."){
                        // Detecting decimal point anomaly
                        // If last character is decimal point
                        if(i==temp.length-1){
                            throw ExpEvaluator.exception.generateException(5, i, ".");
                        }
    
                        // Append decimal point
                        tempNum += ".";
    
                        // Check if next character is a digit or not
                        // If not digit then exception needs to be thrown
                        if(!temp[++i].match(regex.digit)){
                            throw this.exception.generateException(5, i, ".");
                        }
    
                        // Appending the rest of the fractional digits
                        for(; i<temp.length; i++){
                            if(!temp[i].match(regex.digit)){
                                break;
                            }
                            tempNum += temp[i];
                        }
                    }
                    i--;
                }

                token = this.generateNativeToken(tempNum);
            }
            // Check if character is alphabet
            else if(temp[i].match(regex.alphabet)){
                var functionName = temp[i];

                for(i++ ;i<temp.length; i++){    
                    // If left parenthesis not found until second last character
                    // function cannot have a complete format
                    if(temp[i]!="(" && i >= temp.length-2){
                        throw this.exception.generateException(6, i, null);
                    }

                    // If left parenthesis found
                    if(temp[i]=="("){
                        i++;
                        break;
                    }
                    functionName += temp[i];
                }

                var innerPairCounter = 0;
                var subExp = [];
                
                // Searching for corresponding right parenthesis
                for(; i<temp.length; i++){
                    // If right parenthesis was not found until last character
                    // then functional expression is invalid
                    if(temp[i]!=")" && i>=temp.length-1){
                        throw this.exception.generateException(7,i,")");
                    }
                    else if(temp[i]==")"){
                        if(innerPairCounter==0){
                            break;
                        }
                        // If last character reached but parenthesis not nullified
                        if(i==temp.length-1 && innerPairCounter!=0){
                            throw this.exception.generateException(7,i,")");
                        }
                        innerPairCounter--;
                    }
                    else if(temp[i]=="("){
                        innerPairCounter++;
                    }
                    subExp.push(temp[i]);
                }

                token = this.generateFunctionalExpression(functionName, subExp);
            }
            else{
                throw this.exception.generateException(2, i, temp[i]);
            }

            // Pusing token to resultant
            result = this.stateCheck(result, token);
        }

        // If additional left parenthesis was found
        if(pairCounter != 0){
            throw this.exception.generateException(7, null, null);
        }

        return result;
    },

    /**
     * Method to check if the next token argument is a valid token.
     * @param {object} intermediateArray The array of tokens which preceed the next token and are valid.
     * @param {object} nextToken The token which is to be checked for validation.
     * @returns {object} The new array containing the next token if valid.
     * @throws Throws exception when the next token is not a valid token following the last token.
     */
    stateCheck: function(intermediateArray, nextToken){

        // Checking if the nextToken is the first character
        var lastType = intermediateArray.length==0 ? 0 : intermediateArray[intermediateArray.length-1].type;
        
        // Checking if last token of array has next state as nextToken
        if(this.stateCheckTable[lastType].indexOf(nextToken.type)==-1){
            throw this.exception.generateException(8, null, null);
        }

        intermediateArray.push(nextToken);

        return intermediateArray;
    },

    /**
     * Object to contain user-defined functions. Arguments required by the method are passed within an array in the order from left to right.
     */
    udFunctions: {}
};