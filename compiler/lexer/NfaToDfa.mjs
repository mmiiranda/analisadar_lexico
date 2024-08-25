class DFA {
  constructor(dfaStates, transictions, initialState, finals) {
    this.transictions = transictions;
    this.dfaStates = dfaStates;
    this.initialState = initialState;
    this.final_states = finals;
  }

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
  const dfaStates = new Set([initialState]);
  const dfaStatesKey = new Set([initialState.join()]);

  const entriesQueue = [initialState];
  const finalsKey = new Set();
  const transictions = new Map();

  if (initialState.includes(nfa.final_state)) {
    finalsKey.add(initialState.join());
  }

  nfa.findSymbolsForStates(initialState).forEach((c) => {
    console.log(c);
  });

  while (entriesQueue.length) {
    const currentState = entriesQueue.shift();
    for (const symbol of nfa.findSymbolsForStates(currentState)) {
      const destinyState = new Set();

      currentState.forEach((state) => {
        const newState = nfa.getVertex(state, symbol);

        //verificando se o resultado é valido
        if (newState) {
          newState.forEach((a) => destinyState.add(a));
        }
      });

      const superState = nfa.eclosure([...destinyState]);
      const superStateKey = superState.join();

      if (!dfaStatesKey.has(superStateKey)) {
        dfaStates.add(superState);
        dfaStatesKey.add(superStateKey);
        entriesQueue.push(superState);
      }
      if (superState.includes(nfa.final_state)) {
        finalsKey.add(superStateKey);
      }
      transictions.set(`${currentState.join()}:${symbol}`, superStateKey);
    }
  }

  return new DFA(dfaStatesKey, transictions, initialState.join(), finalsKey);
}

export function nfaToDfa(nfa) {
  const dfa = nfaToDfaParser(nfa);
  dfa.display();

  // console.log(dfa.transictions.size);

  return dfa;
}
