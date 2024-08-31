import TOKENS from "./lexer/tokens.mjs";
import { regexToNfa } from "./lexer/regexToNfa.mjs";
import { nfaToDfa } from "./lexer/NfaToDfa.mjs";
import fs from "fs";

const sourceCode = fs.readFileSync("./files/input.txt", "utf-8");

const nfa = regexToNfa(TOKENS);
const tokens = nfaToDfa(nfa, sourceCode);

if (tokens === "ERROR") {
  console.log("ERROR");
} else {
  tokens.forEach((token) => {
    if (token !== "UNKNOWN TOKEN") {
      if (token !== "SEMICOLON") {
        process.stdout.write(token + " ");
      } else {
        process.stdout.write(token + "\n");
      }
    }
  });
}
