class DFA {
  constructor(dfaStates, transictions, initialState, finals, mappedTokens) {
    this.transictions = transictions;
    this.dfaStates = dfaStates;
    this.initialState = initialState;
    this.finalStates = finals;
    this.mappedTokens = mappedTokens;
  }

  // Método que mostra o autômato
  display() {
    // Exibe as transições do autômato
    this.transictions.forEach((to, from) => {
      const [state, symbol] = from.split(":");
      console.log(`{${state}}: (${symbol}) --> {${to}}`);
    });

    console.log("Final States:");
    // Exibe os estados finais e os tokens associados
    this.finalStates.forEach((state) => {
      console.log(`{${state}}: ${this.mappedTokens.get(state).join(", ")}`);
    });
  }

  //função que verifica se uma palavra está ou não na linguagem, retornando uma lista de tokens associado a essa palavra
  recognize(word) {
    //seto o primeiro estado como o inicial do meu automato
    let currentState = this.initialState;
    //
    let lastAcceptingStates = [];

    for (const symbol of word) {
      const transitionKey = `${currentState}:${symbol}`;
      if (this.transictions.has(transitionKey)) {
        currentState = this.transictions.get(transitionKey);
        // Verifica se o estado atual é um estado final
        if (this.finalStates.has(currentState)) {
          lastAcceptingStates = this.finalStates.get(currentState);
        }
      } else {
        // Se não há transição para o símbolo, a palavra não é reconhecida
        return "ERROR: Invalid input";
      }
    }

    // Verifica se o último estado é um estado final
    if (lastAcceptingStates.length > 0) {
      return lastAcceptingStates.join(", ") || "UNKNOWN TOKEN";
    } else {
      return "ERROR: Not an accepting state";
    }
  }
}

function nfaToDfaParser(nfa) {
  // Pego o eclosure do estado inicial
  const initialState = nfa.eclosure([0]);
  // Defino um set para os estados do meu DFA que vou usar apenas no algoritmo
  const dfaStates = new Set([initialState]);
  // Isso irá guardar os estados que vão para o DFA definitivo
  const dfaStatesKey = new Set([initialState.join()]);
  // Setando a fila de estados que irei percorrer para construir o autômato
  const entriesQueue = [initialState];
  // Um set para representar os estados finais do meu autômato final
  const finalsKey = new Map();
  // Aqui eu guardo em um mapa as transições do meu autômato
  const transictions = new Map();
  // Mapeamento dos tokens
  const mappedTokens = new Map();

  while (entriesQueue.length) {
    // Pego o estado que está no começo da minha fila
    const currentState = entriesQueue.shift();

    // Pego todos os símbolos que podem ser lidos por esse estado
    for (const symbol of nfa.findSymbolsForStates(currentState)) {
      // Esse é o set que representa o vértice quando leio um símbolo
      const destinyState = new Set();

      // Para cada micro estado dentro do estado unido, vejo quais estados ele vai caso eu leia um determinado símbolo
      currentState.forEach((state) => {
        const newState = nfa.getVertex(state, symbol);

        // Verificando se o resultado é válido
        if (newState) {
          // Caso seja válido, eu faço a união do meu conjunto final com o meu intermediário
          newState.forEach((a) => destinyState.add(a));
        }
      });

      // Defino o estado geral que estou indo fazendo o epsilon closure dele
      const superState = nfa.eclosure([...destinyState]);
      const superStateKey = superState.join();

      // Checo se o estado ainda não existe no set de estados
      if (!dfaStatesKey.has(superStateKey)) {
        dfaStates.add(superState);
        dfaStatesKey.add(superStateKey);
        entriesQueue.push(superState);
      }

      // Checo se o super estado possui um estado final
      superState.forEach((state) => {
        if (nfa.final_states.has(state)) {
          if (!finalsKey.has(superStateKey)) {
            finalsKey.set(superStateKey, []);
          }
          finalsKey.get(superStateKey).push(nfa.final_states.get(state));
          mappedTokens.set(superStateKey, finalsKey.get(superStateKey));
        }
      });

      transictions.set(`${currentState.join()}:${symbol}`, superStateKey);
    }
  }

  // Retorno o DFA já construído
  return new DFA(
    dfaStatesKey,
    transictions,
    initialState.join(),
    finalsKey,
    mappedTokens
  );
}

export function nfaToDfa(nfa) {
  const dfa = nfaToDfaParser(nfa);
  console.log(dfa.recognize(`"10 * 10"`));
  // dfa.display();

  return dfa;
}
