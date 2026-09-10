const PIX_KEY = "88999173315";
const TOTAL_NUMBERS = 150;
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzd87DbYnIeAOb8FhXs-MjUTRMZD0F0LFOg6JHIWATVWiC4v5ICOOvi1CkovXBbdcqa9MQ7mGnijcw/pub?gid=2065313540&single=true&output=csv";

// ═══════════════════════════════════════════════════════════════════
// RESULTADO DO SORTEIO
//
// A página tem três estados, controlados por aqui:
//
//   1. ANTES DO SORTEIO      → realizado: false
//   2. APURAÇÃO EM ANDAMENTO → realizado: true, numero: null
//      As vendas já encerraram, mas nenhum prêmio caiu em número
//      vendido ainda. A página explica isso e diz que a apuração
//      segue para o concurso seguinte, conforme a regra publicada.
//   3. VENCEDOR DEFINIDO     → realizado: true, numero: 87
//      Mostra o número vencedor, destaca ele na grade e monta o
//      passo a passo completo da apuração.
//
// Nos estados 2 e 3 as vendas ficam encerradas: botões de Pix e de
// enviar comprovante desativados, "Como participar" oculto.
// ═══════════════════════════════════════════════════════════════════
const RESULTADO = {
  // As vendas encerraram e o sorteio já foi feito?
  realizado: true,

  // Número vencedor. Deixe null enquanto a apuração não fechar.
  numero: 68,

  // Data em que a rifa foi sorteada.
  data: "30/08/2026",

  // Link do resultado oficial.
  link: "https://loterias.caixa.gov.br/Paginas/Federal.aspx",

  // Cada rodada é um concurso da Federal que foi usado na apuração,
  // na ordem. Enquanto nenhum prêmio cair em número vendido, é só
  // acrescentar a próxima rodada aqui — o histórico fica registrado.
  // Cole os prêmios como aparecem no site da Caixa; o código usa só
  // os 3 últimos dígitos de cada um.
  rodadas: [
    {
      concurso: "6096",
      data: "30/08/2026",
      premios: ["008932", "049314", "017181", "010373", "047859"],
    },
    {
      concurso: "6097",
      data: "02/09/2026",
      premios: ["030921", "024230", "071189", "002173", "057347"],
    },
    {
      concurso: "6098",
      data: "06/09/2026",
      premios: ["048337", "065904", "007642", "065308", "038572"],
    },
    {
      concurso: "6099",
      data: "09/09/2026",
      premios: ["064423", "083481", "037422", "027068", "057566"],
    },
  ],

  // Enquanto numero for null: qual o próximo concurso da apuração.
  // Se você ainda não souber, deixe os dois campos como "" — a página
  // fala só em "próximo concurso da Loteria Federal".
  proxima: { concurso: "", data: "" },

  // Observação livre, se algo fugir do padrão. Se preenchida, aparece
  // no lugar da mensagem automática.
  nota: "",
};

// Vendas encerradas (estados 2 e 3)
function sorteioEncerrado() {
  return RESULTADO.realizado === true;
}

// Já existe um número vencedor (estado 3)
function temVencedor() {
  return sorteioEncerrado() && Number.isInteger(RESULTADO.numero);
}

const selectedNumbers = new Set();

function buildWhatsAppMessage() {
  if (selectedNumbers.size === 0) {
    return "Olá! Gostaria muito de ajudar a Sasá!\nMeu número da sorte é ___ e meu nome completo é _____.\nAbaixo vou enviar o comprovante de transferência.";
  }

  const sorted = [...selectedNumbers].sort((a, b) => a - b);
  const count = selectedNumbers.size;
  const total = count * 10;

  if (count === 1) {
    return `Olá! Gostaria muito de ajudar a Sasá!\nMeu número da sorte é ${sorted[0]} e meu nome completo é _____.\nAbaixo vou enviar o comprovante de transferência.`;
  }

  return `Olá! Gostaria muito de ajudar a Sasá!\nMeus números da sorte são ${sorted.join(", ")} (${count} números — R$\u00a0${total}) e meu nome completo é _____.\nAbaixo vou enviar o comprovante de transferência.`;
}

function updateWhatsAppButton() {
  const btn = document.getElementById("whatsapp-btn");
  if (!btn) return;
  if (sorteioEncerrado()) return; // botão fica desativado após o sorteio
  btn.href =
    "https://wa.me/5588999173315?text=" +
    encodeURIComponent(buildWhatsAppMessage());
  btn.classList.toggle("has-selection", selectedNumbers.size > 0);
}

function updateSelectionUI() {
  const counter = document.getElementById("selection-counter");
  if (!counter) return;

  const count = selectedNumbers.size;

  if (count === 0) {
    counter.style.display = "none";
  } else {
    counter.style.display = "flex";
    const sorted = [...selectedNumbers].sort((a, b) => a - b);
    const total = count * 10;
    const plural = count > 1;

    document.getElementById("selection-label").textContent = plural
      ? `${count} números selecionados`
      : "1 número selecionado";
    document.getElementById("selection-numbers-list").textContent =
      sorted.join(", ");
    document.getElementById("selection-total").textContent =
      `Total: R$ ${total}`;
  }

  updateWhatsAppButton();
}

function toggleNumber(num) {
  if (sorteioEncerrado()) return;
  const cell = document.querySelector(`.number-cell[data-num="${num}"]`);
  if (!cell || cell.classList.contains("sold")) return;

  if (selectedNumbers.has(num)) {
    selectedNumbers.delete(num);
    cell.classList.remove("selected");
  } else {
    selectedNumbers.add(num);
    cell.classList.add("selected");
  }
  updateSelectionUI();
}

function clearSelection() {
  selectedNumbers.clear();
  document
    .querySelectorAll(".number-cell.selected")
    .forEach(c => c.classList.remove("selected"));
  updateSelectionUI();
}

// Última rodada registrada (o concurso mais recente da apuração)
function ultimaRodada() {
  const rodadas = Array.isArray(RESULTADO.rodadas) ? RESULTADO.rodadas : [];
  return rodadas.length > 0 ? rodadas[rodadas.length - 1] : null;
}

function buildShareData() {
  const url = "https://thalesrochas.github.io/rifa-sasa";

  if (temVencedor()) {
    const r = ultimaRodada();
    const concurso =
      r && r.concurso
        ? `\n🍀 Loteria Federal — concurso ${r.concurso} (${r.data || RESULTADO.data})`
        : `\n🍀 Loteria Federal — sorteio de ${RESULTADO.data}`;

    return {
      title: "🐱 Rifa da Sasá — saiu o resultado!",
      text: `🎉 Saiu o resultado da rifa da Sasá!\n\n🏆 Número sorteado: ${RESULTADO.numero}${concurso}\n\nA Sasá está recuperada e em casa. Obrigado a todo mundo que participou e ajudou! 🐾♥️\n\n👇 Confira o resultado:`,
      url,
    };
  }

  if (sorteioEncerrado()) {
    const r = ultimaRodada();
    const qual = r && r.concurso ? ` (concurso ${r.concurso})` : "";
    const prox =
      RESULTADO.proxima && RESULTADO.proxima.concurso
        ? ` A apuração segue no concurso ${RESULTADO.proxima.concurso}${RESULTADO.proxima.data ? `, ${RESULTADO.proxima.data}` : ""}.`
        : " A apuração segue no próximo concurso da Loteria Federal.";

    return {
      title: "🐱 Rifa da Sasá — apuração em andamento",
      text: `⏳ A rifa da Sasá foi sorteada, mas ainda não temos vencedor!\n\nNenhum dos 5 prêmios da Loteria Federal${qual} caiu na faixa 001–150.${prox}\n\nÉ exatamente o que a regra publicada prevê. Acompanhe o passo a passo:`,
      url,
    };
  }

  return {
    title: "🐱 Rifa Solidária — Ajude a Sasá!",
    text: "Nossa gatinha foi diagnosticada com doença renal crônica e precisou de uma cirurgia de emergência que ultrapassou R$ 10.000. Ela já está em casa se recuperando, mas precisamos de uma forcinha! 🙏\n🔢 150 números • 💰 R$ 10 cada\n🏆 Prêmio: Cubo Mágico 7x7 Moyu Meilong V2M Magnético\n🗓️ Sorteio: 30/08/2026 pela Loteria Federal\n👇 Acesse, escolha seu número e faça o Pix:\n\n🔗 thalesrochas.github.io/rifa-sasa\n🔗 thalesrochas.github.io/rifa-sasa\n🔗 thalesrochas.github.io/rifa-sasa\n\nCompartilhe com os amigos! Cada número ajuda muito. 🐾♥️",
    url,
  };
}

// Monta o passo a passo da apuração a partir dos prêmios do concurso,
// seguindo o mesmo critério publicado antes do sorteio: os 3 últimos
// dígitos do 1º prêmio; se caírem fora da faixa ou em número não
// vendido, passa para o prêmio seguinte.
function renderApuracao() {
  const wrap = document.getElementById("apuracao");
  const lista = document.getElementById("apuracao-steps");
  if (!wrap || !lista) return;

  // Só entram rodadas com prêmios preenchidos. Uma rodada já cadastrada
  // mas ainda não sorteada fica de fora até você colar os números.
  const rodadas = (Array.isArray(RESULTADO.rodadas) ? RESULTADO.rodadas : [])
    .map(r => ({
      concurso: r.concurso,
      data: r.data,
      premios: (Array.isArray(r.premios) ? r.premios : [])
        .map(p => String(p).replace(/\D/g, ""))
        .filter(p => p !== ""),
    }))
    .filter(r => r.premios.length > 0);

  const nota = (RESULTADO.nota || "").trim();
  if (rodadas.length === 0 && nota === "") return;

  const titulo = document.getElementById("apuracao-title");
  if (titulo && !temVencedor()) {
    titulo.textContent = "O que saiu na Loteria Federal";
  }

  const faixa = `001–${String(TOTAL_NUMBERS).padStart(3, "0")}`;

  // A rodada que decide a apuração: a que tem o vencedor ou, enquanto
  // não houver um, a última cadastrada.
  let finalIdx = rodadas.length - 1;
  let achouVencedor = false;
  if (temVencedor()) {
    for (let i = 0; i < rodadas.length; i++) {
      if (
        rodadas[i].premios.some(
          p => parseInt(p.slice(-3), 10) === RESULTADO.numero,
        )
      ) {
        finalIdx = i;
        achouVencedor = true;
        break;
      }
    }
  }

  // O cartaz (formato fixo de Stories) só tem espaço para uma rodada em
  // detalhe. Rodadas anteriores à decisiva entram resumidas numa linha
  // só — no site (que pode rolar) o histórico completo continua saindo.
  const compacto = document.body.classList.contains("is-poster");
  const primeiraExibida = compacto ? Math.max(finalIdx, 0) : 0;

  lista.innerHTML = "";

  if (compacto && rodadas.length > 0 && finalIdx > 0) {
    const anteriores = rodadas
      .slice(0, finalIdx)
      .map(r => r.concurso)
      .filter(Boolean);
    const resumo = document.createElement("div");
    resumo.className = "apuracao-history";
    resumo.textContent =
      (anteriores.length === 1
        ? `Concurso ${anteriores[0]}`
        : `Concursos ${anteriores.join(", ")}`) +
      " — nenhum prêmio caiu em número vendido. Seguimos adiante:";
    lista.appendChild(resumo);
  }

  for (
    let idx = primeiraExibida;
    idx <= finalIdx && idx < rodadas.length;
    idx++
  ) {
    const rodada = rodadas[idx];
    const grupo = document.createElement("div");
    grupo.className = "apuracao-rodada";

    if (rodada.concurso) {
      const cab = document.createElement("div");
      cab.className = "apuracao-rodada-title";
      cab.textContent = rodada.data
        ? `Concurso ${rodada.concurso} · ${rodada.data}`
        : `Concurso ${rodada.concurso}`;
      grupo.appendChild(cab);
    }

    let venceuNestaRodada = false;
    for (let i = 0; i < rodada.premios.length; i++) {
      const bruto = rodada.premios[i];
      const digitos = bruto.slice(-3).padStart(3, "0");
      const num = parseInt(digitos, 10);
      const venceu = temVencedor() && num === RESULTADO.numero;

      let veredito;
      if (venceu) {
        veredito = `Número ${num}, vendido — é o vencedor! 🏆`;
        venceuNestaRodada = true;
      } else if (num >= 1 && num <= TOTAL_NUMBERS) {
        veredito = `Número ${num} não foi vendido — vamos para o próximo prêmio`;
      } else {
        veredito = `Fora da faixa ${faixa} — vamos para o próximo prêmio`;
      }

      const step = document.createElement("div");
      step.className = "apuracao-step" + (venceu ? " is-winner" : "");
      step.innerHTML =
        `<span class="apuracao-ordem">${i + 1}º</span>` +
        `<div class="apuracao-body">` +
        `<div class="apuracao-line">` +
        `<span class="apuracao-premio">${bruto}</span>` +
        `<span class="apuracao-arrow">→</span>` +
        `<span class="apuracao-digits">${digitos}</span>` +
        `</div>` +
        `<div class="apuracao-verdict">${veredito}</div>` +
        `</div>`;
      grupo.appendChild(step);

      if (venceu) break;
    }

    // Rodada fechou sem vencedor: pela regra, vai para o concurso seguinte
    if (!venceuNestaRodada && rodada.premios.length > 0) {
      const fim = document.createElement("div");
      fim.className = "apuracao-rodada-end";
      fim.textContent =
        "Nenhum prêmio caiu em um número vendido — seguimos para o concurso seguinte.";
      grupo.appendChild(fim);
    }

    lista.appendChild(grupo);
  }

  const notaEl = document.getElementById("apuracao-nota");
  if (nota !== "") {
    notaEl.textContent = nota;
    notaEl.hidden = false;
  } else if (temVencedor() && rodadas.length > 0 && !achouVencedor) {
    // Há um número declarado que não bate com nenhum prêmio listado —
    // provavelmente falta cadastrar a rodada que definiu o vencedor.
    notaEl.textContent =
      "O número vencedor não aparece nos concursos acima. Confira se falta cadastrar a rodada da apuração.";
    notaEl.hidden = false;
  }

  wrap.hidden = false;
}

function applyResultMode() {
  if (!sorteioEncerrado()) return;

  const venceu = temVencedor();
  document.body.classList.add("raffle-closed");

  const box = document.getElementById("result-box");
  if (box) {
    const eyebrow = document.getElementById("result-eyebrow");
    const headline = document.getElementById("result-headline");
    const numeroWrap = document.getElementById("result-number-wrap");
    const pendente = document.getElementById("result-pending");
    const linha = document.getElementById("result-concurso-line");

    if (venceu) {
      document.getElementById("result-number").textContent = RESULTADO.numero;

      const r = ultimaRodada();
      linha.innerHTML =
        r && r.concurso
          ? `Loteria Federal · Concurso <strong>${r.concurso}</strong> · ${r.data || RESULTADO.data}`
          : `Loteria Federal · Sorteio de <strong>${RESULTADO.data}</strong>`;
    } else {
      // Apuração em andamento: nenhum prêmio caiu em número vendido
      box.classList.add("is-pending");
      eyebrow.textContent = "⏳ Apuração em andamento";
      headline.textContent = "Ainda não temos um vencedor";
      numeroWrap.hidden = true;
      pendente.hidden = false;

      const p = RESULTADO.proxima || {};
      const proximo = p.concurso
        ? `o <strong>concurso ${p.concurso}</strong>${p.data ? ` (${p.data})` : ""}`
        : "o <strong>próximo concurso</strong>";

      document.getElementById("result-pending-text").innerHTML =
        `Nenhum dos 5 prêmios da Loteria Federal caiu na faixa <strong>001–${TOTAL_NUMBERS}</strong>. ` +
        `Conforme a regra publicada antes do sorteio, a apuração segue para ${proximo} — ` +
        `e assim por diante, até sair um número válido e vendido.`;

      linha.innerHTML = `Rifa sorteada em <strong>${RESULTADO.data}</strong>`;
    }

    const link = document.getElementById("result-link");
    if (RESULTADO.link) link.href = RESULTADO.link;

    renderApuracao();
    box.hidden = false;
  }

  // "Como será o sorteio?" já aconteceu
  const drawTitle = document.getElementById("draw-title");
  if (drawTitle) drawTitle.textContent = "🎲 Como foi o sorteio";

  // O aviso final depende de já haver ganhador ou não
  const closedNote = document.getElementById("closed-note");
  if (closedNote && !venceu) {
    closedNote.textContent =
      "🔒 As vendas foram encerradas em 30/08. O número vencedor será anunciado aqui assim que a apuração fechar — quem participou não precisa fazer nada.";
  }

  // Some com o que não faz mais sentido
  ["announce-box", "how-to-section"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });

  // Legenda: ninguém mais compra, então "Disponível" vira "Não vendido".
  // O "Vencedor" só entra quando existe um número vencedor.
  const legendaDisp = document.getElementById("legend-available");
  if (legendaDisp) legendaDisp.textContent = "Não vendido";

  const legendaVenc = document.getElementById("legend-winner");
  if (legendaVenc && venceu) legendaVenc.hidden = false;

  // Desativa os botões de compra
  document.querySelectorAll(".pix-copy-btn, #whatsapp-btn").forEach(el => {
    el.classList.add("is-disabled");
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("tabindex", "-1");
    if (el.tagName === "BUTTON") el.disabled = true;
    else el.removeAttribute("href");
  });

  const nota = document.getElementById("closed-note");
  if (nota) nota.hidden = false;

  clearSelection();
}

async function sharePage(btn) {
  const data = buildShareData();

  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }

  const message = `🐱 Ajude a Sasá!\n\n${data.text}\n\n👉 ${data.url}`;
  navigator.clipboard.writeText(message).then(() => {
    const original = btn.innerHTML;
    btn.textContent = "✅ Mensagem copiada!";
    setTimeout(() => (btn.innerHTML = original), 2000);
  });
}

function copyPixKey(btn) {
  navigator.clipboard.writeText(PIX_KEY).then(() => {
    btn.textContent = "✅ Chave copiada!";
    setTimeout(() => {
      btn.textContent = "📋 Copiar chave Pix";
    }, 2000);
  });
}

function parseSoldNumbers(csvText) {
  return csvText
    .split("\n")
    .map(line => parseInt(line.trim(), 10))
    .filter(n => !isNaN(n));
}

function renderNumbersGrid(soldNumbers) {
  const grid = document.getElementById("numbers-grid");
  if (!grid) return;

  // Remove from selection any number that became sold
  soldNumbers.forEach(n => selectedNumbers.delete(n));

  const encerrado = sorteioEncerrado();
  const marcarVencedor = temVencedor();

  grid.innerHTML = "";
  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    const isSold = soldNumbers.includes(i);
    const isSelected = selectedNumbers.has(i);
    const isWinner = marcarVencedor && i === RESULTADO.numero;

    const cell = document.createElement("div");
    cell.className =
      "number-cell" +
      (isSold ? " sold" : "") +
      (isSelected ? " selected" : "") +
      (isWinner ? " winner" : "");
    cell.dataset.num = i;
    cell.textContent = i;

    if (isWinner) {
      cell.setAttribute("aria-label", `Número ${i} — número vencedor`);
      cell.title = "🏆 Número vencedor";
    }

    if (!isSold && !encerrado) {
      cell.setAttribute("role", "button");
      cell.setAttribute("tabindex", "0");
      cell.setAttribute("aria-label", `Número ${i}`);
      cell.addEventListener("click", () => toggleNumber(i));
      cell.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleNumber(i);
        }
      });
    }

    grid.appendChild(cell);
  }

  updateSelectionUI();
}

async function loadSoldNumbers() {
  // Requer servidor HTTP — não funciona via file://
  // Para testar localmente: use a extensão "Live Server" no VS Code
  if (location.protocol === "file:") {
    renderNumbersGrid([]);
    return;
  }

  try {
    const url = `${SHEET_CSV_URL}&t=${Date.now()}`;
    const res = await fetch(url, { redirect: "follow", cache: "no-store" });
    const text = await res.text();
    renderNumbersGrid(parseSoldNumbers(text));
  } catch {
    renderNumbersGrid([]);
  }
}

function initPrizeCarousel() {
  const track = document.querySelector(".prize-gallery-track");
  if (!track) return;
  const count = track.querySelectorAll(".prize-photo").length;
  if (count < 2) return;
  track.innerHTML += track.innerHTML;
  track.style.animationDuration = `${count * 2.5}s`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateWhatsAppButton();
  applyResultMode();
  loadSoldNumbers();
  initPrizeCarousel();

  // Depois do sorteio a planilha não muda mais — para de consultar
  if (!sorteioEncerrado()) {
    setInterval(loadSoldNumbers, 60_000); // a cada 1 minuto
  }
});
