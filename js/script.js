const PIX_KEY = "88999173315";
const TOTAL_NUMBERS = 150;
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzd87DbYnIeAOb8FhXs-MjUTRMZD0F0LFOg6JHIWATVWiC4v5ICOOvi1CkovXBbdcqa9MQ7mGnijcw/pub?gid=2065313540&single=true&output=csv";

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

async function sharePage(btn) {
  const data = {
    title: "🐱 Rifa Solidária — Ajude a Sasá!",
    text: "Nossa gatinha foi diagnosticada com doença renal crônica e precisou de uma cirurgia de emergência que ultrapassou R$ 10.000. Ela já está em casa se recuperando, mas precisamos de uma forcinha! 🙏\n🔢 150 números • 💰 R$ 10 cada\n🏆 Prêmio: Cubo Mágico 7x7 Moyu Meilong V2M Magnético\n👇 Acesse, escolha seu número e faça o Pix:\n\n🔗 thalesrochas.github.io/rifa-sasa\n🔗 thalesrochas.github.io/rifa-sasa\n🔗 thalesrochas.github.io/rifa-sasa\n\nCompartilhe com os amigos! Cada número ajuda muito. 🐾♥️",
    url: "https://thalesrochas.github.io/rifa-sasa",
  };

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

  grid.innerHTML = "";
  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    const isSold = soldNumbers.includes(i);
    const isSelected = selectedNumbers.has(i);

    const cell = document.createElement("div");
    cell.className =
      "number-cell" + (isSold ? " sold" : "") + (isSelected ? " selected" : "");
    cell.dataset.num = i;
    cell.textContent = i;

    if (!isSold) {
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
    console.log(text);
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
  loadSoldNumbers();
  initPrizeCarousel();
  setInterval(loadSoldNumbers, 60_000); // a cada 1 minuto
});
