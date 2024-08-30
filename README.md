# Analisador Léxico em Node.js

Este projeto é uma implementação de um analisador léxico utilizando Node.js. O analisador léxico é um componente fundamental de um compilador, responsável por analisar o código fonte e convertê-lo em tokens, que são as menores unidades sintáticas significativas de um programa.

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes pré-requisitos instalados em seu sistema:

- **Node.js** (versão 12 ou superior)

## Passos para Execução

1. **Navegar para a pasta "compiler":**
   Abra o terminal e use o comando `cd` para navegar até a pasta "compiler". É importante estar nesta pasta, pois os caminhos na aplicação não são absolutos.

2. **Preparar o arquivo de entrada:**
   Dentro da pasta `files`, você encontrará um arquivo chamado `input.txt`. Coloque o código fonte que você deseja analisar dentro desse arquivo.

3. **Executar o analisador léxico:**
   Certifique-se de que você está na pasta "compiler" e execute o arquivo `index.mjs` usando o comando:
   ```bash
   node index.mjs
   ```
4. **Visualizar os tokens:**
   Após executar o comando, o terminal exibirá a lista de tokens correspondentes a cada lexema do código fonte presente em `input.txt`.

5. **Consultar o significado dos tokens:**
   Dentro da pasta `lexer`, há um arquivo chamado `Tokens.txt`. Este arquivo contém uma descrição do que cada token representa, ajudando você a entender o resultado gerado pelo analisador léxico.
