import TOKENS from "./tokens.mjs";
import { regexToNfa } from "./regexToNfa.mjs";
import { nfaToDfa } from "./NfaToDfa.mjs";

function lex(sourceCode, dfa) {
  const tokens = [];
  let lexeme = ""; // Armazena o lexema atual
  let currentIndex = 0;
  let tokenOrder = [' INT', ' STRING', 'VAR']; // Removido o espaço extra

  while (currentIndex < sourceCode.length) {
    lexeme += sourceCode[currentIndex];
    currentIndex++;

    const result = dfa.recognize(lexeme);

    if (result === "ERROR: Invalid input") {
      if (lexeme.length > 1) {
        lexeme = lexeme.slice(0, -1); // Remove o último caractere adicionado
        currentIndex--; // Reposiciona o índice para o último caractere

        const tokenType = dfa.recognize(lexeme);

        if (tokenType !== "ERROR: Invalid input" && tokenType !== "ERROR: Not an accepting state") {
          // Verifica se o próximo caractere é um espaço, nova linha, ou ponto e vírgula
          if ([' ', '\n', ';'].includes(sourceCode[currentIndex])) {
            let isReserved = false;
            let resumeTokenType = [...new Set(tokenType.split(','))];

            // Processa tokens na ordem de precedência
            tokenOrder.forEach(ord => {
              if (isReserved) return;
              resumeTokenType.forEach(element => {
                if (element === ord) {
                  tokens.push(element);
                  isReserved = true;
                }
              });
            });

            if (!isReserved && resumeTokenType[0] !== 'BLANK') {
              tokens.push(resumeTokenType[0]);
            }
          }
        } else {
          throw new Error(`Unrecognized token: ${lexeme}`);
        }
      } else {
        throw new Error(`Unrecognized token: ${lexeme}`);
      }

      lexeme = ""; // Limpa o lexema atual para começar um novo
    } else if (result === "ERROR: Not an accepting state" && currentIndex === sourceCode.length) {
      throw new Error(`Unrecognized token at the end of the source code: ${lexeme}`);
    } else if (result !== "ERROR: Not an accepting state") {
      if (currentIndex === sourceCode.length || sourceCode[currentIndex] === ';') {
        let isReserved = false;
            let resumeTokenType = [...new Set(result.split(','))];

            // Processa tokens na ordem de precedência
            tokenOrder.forEach(ord => {
              if (isReserved) return;
              resumeTokenType.forEach(element => {
                if (element === ord) {
                  tokens.push(element);
                  isReserved = true;
                }
              });
            });

            if (!isReserved && resumeTokenType[0] !== 'BLANK') {
              tokens.push(resumeTokenType[0]);
            }
        lexeme = "";

        // Verifica se o próximo caractere é um ponto e vírgula e o adiciona diretamente aos tokens
        while (currentIndex < sourceCode.length && sourceCode[currentIndex] === ';') {
          tokens.push('SEMICOLON');
          currentIndex++;
        }
      }
    }
  }

  return tokens;
}

export { lex };

