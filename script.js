const MAX_TENTATIVAS = 6;
const TAM_PALAVRA = 5;
let palavras = [];
let palavraSecreta = "";
let linhaAtual = 0;
const tentativas = [""];
let mensagemTimeout = null;
let modoPratica = false;

function iniciarJogo() {
  modoPratica = localStorage.getItem("modoPratica") === "true";
  const hoje = new Date().toISOString().split("T")[0];
  const palavrasSalvas = localStorage.getItem("palavrasCustom");

  if (palavrasSalvas && JSON.parse(palavrasSalvas).length > 0) {
    palavras = JSON.parse(palavrasSalvas).map(p => p.toUpperCase());
    prepararJogo();
  } else {
    fetch("palavras.json")
      .then(res => res.json())
      .then(data => {
        palavras = data.map(p => p.toUpperCase());
        prepararJogo();
      })
      .catch(() => {
        mostrarMensagem("Erro ao carregar palavras.");
        bloquearTeclado();
      });
  }
}

function prepararJogo() {
  const hoje = new Date().toISOString().split("T")[0];

  if (!Array.isArray(palavras) || palavras.length === 0) {
    mostrarMensagem("Erro: Lista de palavras vazia.");
    bloquearTeclado();
    return;
  }

  if (!modoPratica) {
    let palavraDia = localStorage.getItem("palavra_" + hoje);
    if (palavraDia && palavras.includes(palavraDia)) {
      palavraSecreta = palavraDia;
    } else {
      palavraSecreta = palavras[Math.floor(Math.random() * palavras.length)];
      if (palavraSecreta) {
        localStorage.setItem("palavra_" + hoje, palavraSecreta);
      }
    }

    if (localStorage.getItem("jogou_" + hoje)) {
      mostrarMensagem("Já jogaste hoje!");
      bloquearTeclado();
      return;
    }
  } else {
    palavraSecreta = palavras[Math.floor(Math.random() * palavras.length)];
  }

  document.addEventListener("keydown", handleKeydown);
}

const botoes = document.querySelectorAll("#keyboard button");
botoes.forEach(botao => {
  botao.addEventListener("click", () => {
    
    const tecla = botao.textContent;
    if (tecla === "Enter") validarPalavra();
    else if (tecla === "Backspace") removerLetra();
    else if (/^[A-Z]$/.test(tecla)) adicionarLetra(tecla);
  });
});

function adicionarLetra(letra) {
  if (tentativas[linhaAtual].length < TAM_PALAVRA) {
    tentativas[linhaAtual] += letra;
    desenharLetra(letra, linhaAtual, tentativas[linhaAtual].length - 1);
  }
}

function removerLetra() {
  const palavra = tentativas[linhaAtual];
  if (palavra.length > 0) {
    tentativas[linhaAtual] = palavra.slice(0, -1);
    desenharLetra("", linhaAtual, palavra.length - 1);
  }
}

function desenharLetra(letra, linha, coluna) {
  const linhaEl = document.querySelectorAll(".row")[linha];
  const celula = linhaEl.children[coluna];
  celula.textContent = letra;
}

function validarPalavra() {
  const tentativaOriginal = tentativas[linhaAtual];
  const tentativa = tentativaOriginal.toUpperCase();

  if (tentativa.length !== TAM_PALAVRA) {
    mostrarMensagem("Palavra incompleta!");
    return;
  }

  if (!palavras.includes(tentativa)) {
    mostrarMensagem("Palavra inválida!");
    return;
  }

  const resultado = Array(TAM_PALAVRA).fill("errada");
  const secretaTemp = palavraSecreta.split("");

  for (let i = 0; i < TAM_PALAVRA; i++) {
    if (tentativa[i] === palavraSecreta[i]) {
      resultado[i] = "correta";
      secretaTemp[i] = null;
    }
  }

  for (let i = 0; i < TAM_PALAVRA; i++) {
    if (resultado[i] !== "correta" && secretaTemp.includes(tentativa[i])) {
      resultado[i] = "existe";
      secretaTemp[secretaTemp.indexOf(tentativa[i])] = null;
    }
  }

  const linhaEl = document.querySelectorAll(".row")[linhaAtual];
  for (let i = 0; i < TAM_PALAVRA; i++) {
    linhaEl.children[i].classList.add(resultado[i]);
    atualizarTecla(tentativa[i], resultado[i]);
  }

  if (tentativa === palavraSecreta) {
    mostrarMensagem("Parabéns! Acertaste!");
    atualizarStats(true);
    if (!modoPratica) localStorage.setItem("jogou_" + new Date().toISOString().split("T")[0], "1");
    bloquearTeclado();
    setTimeout(() => location.reload(), 2500);
    return;
  }

  linhaAtual++;
  if (linhaAtual >= MAX_TENTATIVAS) {
    mostrarMensagem("Perdeste! A palavra era: " + palavraSecreta);
    atualizarStats(false);
    if (!modoPratica) localStorage.setItem("jogou_" + new Date().toISOString().split("T")[0], "1");
    bloquearTeclado();
    setTimeout(() => location.reload(), 2500);
  } else {
    tentativas.push("");
  }
}

function atualizarTecla(letra, estado) {
  const botoes = document.querySelectorAll("#keyboard button");
  botoes.forEach(botao => {
    if (botao.textContent === letra && !botao.classList.contains("correta")) {
      botao.classList.add(estado);
    }
  });
}

function mostrarMensagem(msg) {
  let div = document.getElementById("mensagem");
  if (!div) {
    div = document.createElement("div");
    div.id = "mensagem";
    document.body.appendChild(div);
  }
  div.textContent = msg;
  clearTimeout(mensagemTimeout);
  mensagemTimeout = setTimeout(() => { div.textContent = ""; }, 3000);
}

function atualizarStats(vitoria) {
  if (modoPratica) return;

  let jogos = +localStorage.getItem("jogos") || 0;
  let vitorias = +localStorage.getItem("vitorias") || 0;
  let serie = +localStorage.getItem("serie") || 0;

  jogos++;
  if (vitoria) {
    vitorias++;
    serie++;
  } else {
    serie = 0;
  }

  localStorage.setItem("jogos", jogos);
  localStorage.setItem("vitorias", vitorias);
  localStorage.setItem("serie", serie);
  mostrarStats();
}

function mostrarStats() {
  const statsDiv = document.getElementById("estatisticas");
  const jogos = +localStorage.getItem("jogos") || 0;
  const vitorias = +localStorage.getItem("vitorias") || 0;
  const serie = +localStorage.getItem("serie") || 0;

  statsDiv.innerHTML = `
    <p>Jogos: ${jogos}</p>
    <p>Vitórias: ${vitorias}</p>
    <p>Série atual: ${serie}</p>
  `;
}

function alternarModoPratica() {
  modoPratica = !modoPratica;
  localStorage.setItem("modoPratica", modoPratica);
  document.getElementById("btnModoPratica").textContent = "Modo Prática: " + (modoPratica ? "ON" : "OFF");
  location.reload();
}

function bloquearTeclado() {
  const botoes = document.querySelectorAll("#keyboard button");
  botoes.forEach(botao => botao.disabled = true);
  document.removeEventListener("keydown", handleKeydown);
}

function handleKeydown(e) {
  const tecla = e.key.toUpperCase();
  if (tecla === "ENTER") validarPalavra();
  else if (tecla === "BACKSPACE") removerLetra();
  else if (/^[A-Z]$/.test(tecla)) adicionarLetra(tecla);
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarStats();
  modoPratica = localStorage.getItem("modoPratica") === "true";
  document.getElementById("btnModoPratica").textContent = "Modo Prática: " + (modoPratica ? "ON" : "OFF");
  iniciarJogo();
});
