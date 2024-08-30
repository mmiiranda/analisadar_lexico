import TOKENS from "./lexer/tokens.mjs";
import { regexToNfa } from "./lexer/regexToNfa.mjs";
import { nfaToDfa } from "./lexer/NfaToDfa.mjs";
import { lex } from "./lexer/lexer.mjs";
import fs from "fs";

const sourceCode = fs.readFileSync("./files/input.txt", "utf-8");

const nfa = regexToNfa(TOKENS);
const dfa = nfaToDfa(nfa);

//resultado da análise léxica

const result = lex(sourceCode, dfa);
let finalText = "";
result.forEach(element => {
    finalText += element;
    if(element == "SEMICOLON") finalText += "\n";
    else
    finalText += " ";
});
console.log(finalText);
