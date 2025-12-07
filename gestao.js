let palavras = JSON.parse(localStorage.getItem("palavrasCustom")) || [];

function atualizarLista() {
  const ul = document.getElementById("listaPalavras");
  ul.innerHTML = "";
  palavras.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${p.toUpperCase()} <button onclick="removerPalavra(${i})">❌ Remover</button>`;
    ul.appendChild(li);
  });
  localStorage.setItem("palavrasCustom", JSON.stringify(palavras));
}

function adicionarPalavra() {
  const input = document.getElementById("novaPalavra");
  const palavra = input.value.trim().toUpperCase();

  if (palavra.length !== 5) return alert("A palavra deve ter 5 letras.");
  if (palavras.includes(palavra)) return alert("Essa palavra já existe.");

  palavras.push(palavra);
  input.value = "";
  atualizarLista();
}

function removerPalavra(index) {
  palavras.splice(index, 1);
  atualizarLista();
}

function importarJSON() {
  fetch("palavras.json")
    .then(res => res.json())
    .then(json => {
      palavras = Array.from(new Set(json.map(p => p.toUpperCase().trim())));
      atualizarLista();
      alert("Palavras importadas com sucesso!");
    });
}

document.addEventListener("DOMContentLoaded", atualizarLista);
