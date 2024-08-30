import { Transform } from "stream";
import { balanceRegex } from "./BalanceRegex.mjs";
import { stat } from "fs";

export function regexToNfa(tokens) {
  const balancedRegexs = [];

  const mappedTokens = new Map();

  //percorro todos os tokens e faço um balanceamento de parenteses neles (se precisar)
  let i = 0;
  for (let key in tokens) {
    balancedRegexs.push(balanceRegex(tokens[key]));
    mappedTokens.set(i, key);
    i++;
  }

  //convertendo cada expressão regular em NFA
  const nfas = balancedRegexs.map((regex) => regexNfa(regex));

  // Unir todos os NFAs em um único NFA usando a função union
  const unionNfa = unionNfas(nfas, nfas.length, mappedTokens);

  // unionNfa.display();

  unionNfa.createDictionary();

  //retorno o nfa que representa a linguagem dos tokens
  return unionNfa;
}

function unionNfas(selections, quantityOperands, mappedTokens) {
  //criação do meu novo nfa
  const result = new NFA();
  //total de vertives = 2 novos vertices + todos os vertices dos outros nfas
  let vertexCount = 1;
  for (let i = 0; i < quantityOperands; i++) {
    vertexCount += selections[i].getVertexCount();
  }

  //setando a quantidade total de vertices no meu automato resultante
  result.setVertex(vertexCount);

  //variavel que vai me ajudar a definir as labels do meu novo automato
  let adderTrack = 1;

  //fazendo com que o novo estado do começo aponte para todos os automatos e todos os automatos passam a apontar pro novo estado final
  for (let i = 0; i < quantityOperands; i++) {
    result.setTransition(0, adderTrack, "^");
    const med = selections[i];
    med.transitions.forEach((transition) =>
      result.setTransition(
        transition.vertex_from + adderTrack,
        transition.vertex_to + adderTrack,
        transition.trans_symbol
      )
    );
    adderTrack += med.getVertexCount();
    result.final_states.set(adderTrack - 1, mappedTokens.get(i));
  }
  return result;
}

//criando uma classe que representa uma transição
class Transition {
  constructor(vertex_from, vertex_to, trans_symbol) {
    this.vertex_from = vertex_from;
    this.vertex_to = vertex_to;
    this.trans_symbol = trans_symbol;
  }
}
class NFA {
  constructor() {
    this.vertex = [];
    this.transitions = [];
    this.final_state = 0;
    this.final_states = new Map();
    this.dictionaryTransitions = new Map();
  }

  //pego todos os simbolos que um determinado conjunto de estados pode ler
  findSymbolsForStates(states) {
    const result = new Set();
    states.forEach((state) => {
      this.transitions.forEach((transition) => {
        if (
          state === transition.vertex_from &&
          transition.trans_symbol !== "^"
        ) {
          result.add(transition.trans_symbol);
        }
      });
    });
    return result;
  }

  //crio um dicionário para simplificar o tratamento futuro do dfa
  createDictionary() {
    this.transitions.forEach((transition) => {
      const key = `${transition.vertex_from},${transition.trans_symbol}`;
      if (this.dictionaryTransitions.has(key)) {
        this.dictionaryTransitions.get(key).add(transition.vertex_to);
      } else {
        const newSet = new Set();
        newSet.add(transition.vertex_to);
        this.dictionaryTransitions.set(key, newSet);
      }
    });
  }

  //pego
  getVertex(state, symbol) {
    return this.dictionaryTransitions.get(`${state},${symbol}`);
  }

  //eclosure que me retorna o conjunto de estados alcançados com transição epsilon
  eclosure(X) {
    const result = new Set();
    const visited = new Array(this.getVertexCount()).fill(false);

    // Usando uma abordagem de busca em profundidade para achar o fechamento epsilon
    const internalEclosure = (node) => {
      //´pergunto se o nó já foi visitado
      if (visited[node]) return;

      result.add(node);
      visited[node] = true;

      this.transitions.forEach((transition) => {
        if (
          node === transition.vertex_from &&
          transition.trans_symbol === "^"
        ) {
          const y = transition.vertex_to;
          if (!visited[y]) {
            internalEclosure(y);
          }
        }
      });
    };

    X.forEach((node) => {
      internalEclosure(node);
    });

    //retorno o resultado já ordenao pra não haver problemas
    return [...result].sort((a, b) => a - b);
  }

  //retorna a quantidade de vertices
  getVertexCount() {
    return this.vertex.length;
  }

  //seto uma quantidade vértice dado um range
  setVertex(n_vertex) {
    for (let i = 0; i < n_vertex; i++) {
      this.vertex.push(i);
    }
  }

  //seto uma nova transição
  setTransition(vertex_from, vertex_to, trans_symbol) {
    const transition = new Transition(vertex_from, vertex_to, trans_symbol);
    this.transitions.push(transition);
  }

  //seto um novo estado final
  setFinalState(final) {
    this.final_state = final;
  }

  //retorno o estado final
  getFinalState() {
    return this.final_state;
  }

  display() {
    console.log("Vertices:");
    console.log(this.vertex.join(", "));

    console.log("Transitions:");
    this.transitions.forEach((transition) => {
      console.log(
        `  ${transition.vertex_from} --${transition.trans_symbol}--> ${transition.vertex_to}`
      );
    });

    console.log("Final State:");
    console.log(this.getFinalState());
  }
}

//classe que representa um NFA

//função que recebe dois NFAS e faz a concatenação dos dois (NFA1) ^-> (NFA2)
function concat(NFA1, NFA2) {
  //criando o novo NFA
  const result = new NFA();
  //quantidade de vertices do nfa = soma dos vertices dos dois outros
  result.setVertex(NFA1.getVertexCount() + NFA2.getVertexCount());

  //percorrendo a lista de transições no NFA1 e copiando tudo pro novo nfa
  NFA1.transitions.forEach((transition, label) =>
    result.setTransition(
      transition.vertex_from,
      transition.vertex_to,
      transition.trans_symbol
    )
  );

  //setando uma transição epsilon do primeiro automato para o outro
  result.setTransition(NFA1.getFinalState(), NFA1.getVertexCount(), "^");

  //percorrendo a lista de transições no NFA2 e copiando tudo pro novo nfa, convertendo cada vertice de N2 para uma label válida
  NFA2.transitions.forEach((transition) =>
    result.setTransition(
      transition.vertex_from + NFA1.getVertexCount(),
      transition.vertex_to + NFA1.getVertexCount(),
      transition.trans_symbol
    )
  );

  //setando o estado final do automato
  result.setFinalState(NFA1.getVertexCount() + NFA2.getVertexCount() - 1);

  return result;
}

function looping(nfa) {
  //criando o novo NFA
  const result = new NFA();

  //setando os vértices do nfa, adicionando os nós do nfa antigo + 2 nós que serão os pivôs do looping
  result.setVertex(nfa.getVertexCount() + 2);

  //primeiro estado se liga com o segundo pro transição epsilon
  result.setTransition(0, 1, "^");

  //adicionando as transições do automato original, somando 1 pois foi adicionado um novo estado inicial
  nfa.transitions.forEach((transition) =>
    result.setTransition(
      transition.vertex_from + 1,
      transition.vertex_to + 1,
      transition.trans_symbol
    )
  );

  //penultimo estado vai ter transição epsilon pro ultimo
  result.setTransition(nfa.getVertexCount(), nfa.getVertexCount() + 1, "^");
  //primeiro estado tem transição epsilon pro ultimo
  result.setTransition(0, nfa.getVertexCount() + 1, "^");
  //penultimo estado tem transição epsilon pro primeiro
  result.setTransition(nfa.getVertexCount(), 1, "^");

  result.setFinalState(nfa.getVertexCount() + 1);

  return result;
}

//pegarei um set de nfas e farei a união deles
function union(selections, quantityOperands) {
  //criação do meu novo nfa
  const result = new NFA();
  //total de vertives = 2 novos vertices + todos os vertices dos outros nfas
  let vertexCount = 2;
  for (let i = 0; i < quantityOperands; i++) {
    vertexCount += selections[i].getVertexCount();
  }

  //setando a quantidade total de vertices no meu automato resultante
  result.setVertex(vertexCount);

  //variavel que vai me ajudar a definir as labels do meu novo automato
  let adderTrack = 1;

  //fazendo com que o novo estado do começo aponte para todos os automatos e todos os automatos passam a apontar pro novo estado final
  for (let i = 0; i < quantityOperands; i++) {
    result.setTransition(0, adderTrack, "^");
    const med = selections[i];
    med.transitions.forEach((transition) =>
      result.setTransition(
        transition.vertex_from + adderTrack,
        transition.vertex_to + adderTrack,
        transition.trans_symbol
      )
    );
    adderTrack += med.getVertexCount();
    result.setTransition(adderTrack - 1, vertexCount - 1, "^");
  }

  //setando o estado final
  result.setFinalState(vertexCount - 1);
  return result;
}

//isso serve para retornar umma representão de um litereal escapado
function getSpecialChar(esc_char) {
  switch (esc_char) {
    case "n":
      return "\n";
    case "t":
      return "\t";
    case "r":
      return "\r";
    case "f":
      return "\f";
    case "v":
      return "\v";
    case "s":
      return " ";
    case "\\":
      return "\\";
    default:
      return esc_char;
  }
}

function regexNfa(regex) {
  //definição de duas pilhas para usar uma abordagem de polonesa reversa
  const operators = []; //pilha de operadores
  const operands = []; //pilha de operandos

  //percorrendo todos os chars da string
  for (let i = 0; i < regex.length; i++) {
    let currentSybol = regex[i];

    //tratando operadores escapados
    // se eu achar um \ alguma coisa, eu faço um automato pra essa alguma coisa e seto
    if (currentSybol === "\\") {
      i++;
      if (i < regex.length) {
        currentSybol = regex[i];
        currentSybol = getSpecialChar(currentSybol);
        const nfa = new NFA();
        nfa.setVertex(2);
        nfa.setTransition(0, 1, currentSybol);
        nfa.setFinalState(1);
        operands.push(nfa);
      }
      //caso eu esteja vendo um simbolo válido eu faço um automato dele
    } else if (
      currentSybol !== "(" &&
      currentSybol !== ")" &&
      currentSybol !== "*" &&
      currentSybol !== "." &&
      currentSybol !== "|"
    ) {
      const nfa = new NFA();
      nfa.setVertex(2);
      nfa.setTransition(0, 1, currentSybol);
      nfa.setFinalState(1);
      operands.push(nfa);
    } else {
      if (currentSybol === "*") {
        const starNfa = operands.pop();
        operands.push(looping(starNfa));
      } else if (currentSybol === ".") {
        operators.push(currentSybol);
      } else if (currentSybol === "|") {
        operators.push(currentSybol);
      } else if (currentSybol === "(") {
        operators.push(currentSybol);
      } else {
        let operationsCount = 0;
        const operationSymbol = operators[operators.length - 1];

        if (operationSymbol === "(") {
          continue;
        }

        do {
          operators.pop();
          operationsCount++;
        } while (operators[operators.length - 1] !== "(");
        operators.pop();

        if (operationSymbol === ".") {
          for (let k = 0; k < operationsCount; k++) {
            const op2 = operands.pop();
            const op1 = operands.pop();
            operands.push(concat(op1, op2));
          }
        } else if (operationSymbol === "|") {
          const selections = new Array(operationsCount + 1).fill(new NFA());
          let tracker = operationsCount;
          for (let k = 0; k <= operationsCount; k++) {
            selections[tracker] = operands.pop();
            tracker--;
          }
          operands.push(union(selections, operationsCount + 1));
        }
      }
    }
  }
  //retorno o nfa geral que está no topo da pilha
  return operands.pop();
}
