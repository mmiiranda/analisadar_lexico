class DFA {
  constructor(dfaStates, transictions, initialState, finals) {
    this.transictions = transictions;
    this.dfaStates = dfaStates;
    this.initialState = initialState;
    this.final_states = finals;
  }

  //método que mostra o autômato
  display() {
    for (const [from, to] of this.transictions.entries()) {
      const [state, symbol] = from.split(":");
      console.log(`{${state}}: (${symbol}) --> {${to}}`);
    }

    console.log("Final States:");

    this.final_states.forEach((state) => {
      console.log(`{${state}}`);
    });
  }
}

function nfaToDfaParser(nfa) {
  //pego o eclosure do estado inicial
  const initialState = nfa.eclosure([0]);
  //defino um set par os estados do meu dfa que vou usar apenas no algoritmo
  const dfaStates = new Set([initialState]);
  //isso irá guardar os estados que vão pro dfa definitivo
  const dfaStatesKey = new Set([initialState.join()]);
  //setando a fila de estados que irei percorrer para construir o automato
  const entriesQueue = [initialState];
  //um set para representar os estados finais do meu automato final
  const finalsKey = new Set();
  //aqui eu guardo em um mapa as transições do meu automato
  const transictions = new Map();

  //checo se o estado inicial é um estado final
  if (initialState.includes(nfa.final_state)) {
    finalsKey.add(initialState.join());
  }

  while (entriesQueue.length) {
    //pego o estado que está no começo da minha fila
    const currentState = entriesQueue.shift();

    //pego todos os simbolos que podem ser lidos por esse estado
    for (const symbol of nfa.findSymbolsForStates(currentState)) {
      //esse é set que representa o vertice quando leio um simbolo
      const destinyState = new Set();

      //para cada micro estado dentro do estado unido, vejo quais estados ele vai caso eu leia um determiando simbolo
      currentState.forEach((state) => {
        const newState = nfa.getVertex(state, symbol);

        //verificando se o resultado é valido
        if (newState) {
          // caso seja válido, eu faço a união do meu conjunto final com o meu intermediário
          newState.forEach((a) => destinyState.add(a));
        }
      });

      //defino o estado geral que estou indo fazendo o epsilon closure dele
      const superState = nfa.eclosure([...destinyState]);
      const superStateKey = superState.join();

      //checo se o estado ainda não existe no set de estados
      if (!dfaStatesKey.has(superStateKey)) {
        dfaStates.add(superState);
        dfaStatesKey.add(superStateKey);
        entriesQueue.push(superState);
      }
      //checo se o super estado é um estado final
      if (superState.includes(nfa.final_state)) {
        finalsKey.add(superStateKey);
      }
      transictions.set(`${currentState.join()}:${symbol}`, superStateKey);
    }
  }
  //retono o dfa ja construido
  return new DFA(dfaStatesKey, transictions, initialState.join(), finalsKey);
}

export function nfaToDfa(nfa) {
  const dfa = nfaToDfaParser(nfa);
  dfa.display();

  // console.log(dfa.transictions.size);

  return dfa;
}
