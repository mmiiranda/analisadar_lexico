//função que faz o balanceamento de uma exepressão regular

export function balanceRegex(expression) {
  const tokens = [];
  let buffer = "";

  for (const char of expression) {
    if (
      char === "(" ||
      char === ")" ||
      char === "|" ||
      char === "." ||
      char === "*"
    ) {
      if (buffer) {
        tokens.push(buffer.trim());
        buffer = "";
      }
      tokens.push(char);
    } else {
      buffer += char;
    }
  }

  if (buffer) {
    tokens.push(buffer.trim());
  }

  // Add parentheses around binary operators and handle '*'
  function addParentheses(tokens) {
    const precedence = { ".": 2, "|": 1, "*": 3 };
    const output = [];
    const operators = [];

    for (const token of tokens) {
      if (token === "(") {
        operators.push(token);
      } else if (token === ")") {
        while (operators.length && operators[operators.length - 1] !== "(") {
          output.push(operators.pop());
        }
        operators.pop(); // Remove '('
      } else if (token === "." || token === "|") {
        while (
          operators.length &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          output.push(operators.pop());
        }
        operators.push(token);
      } else if (token === "*") {
        // Handle '*' operator
        output.push(token);
      } else {
        output.push(token);
      }
    }

    while (operators.length) {
      output.push(operators.pop());
    }

    // Convert output to string with added parentheses
    return convertToParenthesized(output);
  }

  function convertToParenthesized(postfix) {
    const stack = [];

    for (const token of postfix) {
      if (token === "." || token === "|") {
        const right = stack.pop();
        const left = stack.pop();
        stack.push(`(${left}${token}${right})`);
      } else if (token === "*") {
        const expr = stack.pop();
        stack.push(`${expr}*`);
      } else {
        stack.push(token);
      }
    }

    return stack[0];
  }

  const balancedRegex = addParentheses(tokens);
  return balancedRegex.replace(/\s+/g, ""); // Remove all whitespace
}
