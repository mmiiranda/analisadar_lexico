//definição das expressões regulares
function TokenAndRegularExpressionsDefinition() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const letters = alphabet + alphabet.toUpperCase();
  const alphanumeric = letters + digits + "_";

  //EXPRESSÃO: [a-zA-Z_].[a-zA-Z0-9_]*
  const varRegex = `(${letters.split("").concat("_").join("|")}).(${alphanumeric
    .split("")
    .join("|")})*`;
  //EXPRESSÃO: [0-9][0-9]*
  const numRegex = `(${digits.split("").join("|")}).(${digits
    .split("")
    .join("|")})*`;
  //EXPRESSÃO: (".([a-zA-Z0-9!#~"]*).")
  const constRegex = `".(${alphanumeric
    .split("")
    .concat("!", "#", "\\s", "\\*", "?", "+", "-", "=", "@", ..."~")
    .filter((c) => c !== '"')
    .join("|")})*."`;

  let blank = "(\\s|\\r||\\n|\\t||\\v)";

  const eqRegex = `=`;
  const addRegex = `+`;
  const subRegex = `-`;
  const mulRegex = `\\*`;
  const blankRegex = "\\n";
  const gtRegex = `>`;
  const ltRegex = `<`;
  const semicolonRegex = `;`;
  const intRegex = `i.n.t`;
  const stringRegex = "s.t.r.i.n.g";

  //definição dos tokens e suas
  return {
    VAR: varRegex,
    NUM: numRegex,
    CONST: constRegex,
    EQ: eqRegex,
    ADD: addRegex,
    SUB: subRegex,
    MUL: mulRegex,
    GT: gtRegex,
    LT: ltRegex,
    SEMICOLON: semicolonRegex,
    INT: intRegex,
    STRING: stringRegex,
    BLANK: blank,
  };
}

export default TokenAndRegularExpressionsDefinition();
