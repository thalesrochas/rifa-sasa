const PIX_KEY = "88999173315";
const TOTAL_NUMBERS = 150;
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzd87DbYnIeAOb8FhXs-MjUTRMZD0F0LFOg6JHIWATVWiC4v5ICOOvi1CkovXBbdcqa9MQ7mGnijcw/pub?gid=2065313540&single=true&output=csv";

async function sharePage(btn) {
  const data = {
    title: "Rifa Solidária — Ajude a Sasá! 🐱",
    text: "Nossa gatinha precisou de cirurgia de emergência e estamos fazendo uma rifa para cobrir os custos. Concorra a um Cubo Mágico 3x3 por apenas R$ 10. Toda ajuda é bem-vinda! 🙏",
    url: "https://thalesrochas.github.io/rifa-sasa",
  };

  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
      // share falhou por outro motivo — cai no fallback abaixo
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

  grid.innerHTML = "";
  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    const cell = document.createElement("div");
    cell.className = "number-cell" + (soldNumbers.includes(i) ? " sold" : "");
    cell.textContent = i;
    grid.appendChild(cell);
  }
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

document.addEventListener("DOMContentLoaded", () => {
  loadSoldNumbers();
  setInterval(loadSoldNumbers, 60_000); // a cada 1 minuto
});
