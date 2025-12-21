// DEMO masa datası: x/y yüzde (%). Krokinin üstünde doğru yere koyarsın.
// Not: ID'ler benzersiz olmalı.
const TABLES = [
  { id: "1", x: 11, y: 52 },
  { id: "2", x: 26, y: 60 },
  { id: "3", x: 45.5, y: 65 },
  { id: "4", x: 59, y: 64 },
  { id: "5", x: 88.5, y: 64 },
  { id: "6", x: 45.5, y: 86 },
  { id: "7", x: 59.8, y: 86 },
  { id: "8", x: 88.5, y: 83 },
];

const STORAGE_KEY = "novaletta_table_status_v1";
// status: "empty" | "booked"
let statusMap = loadStatus();
let selectedTableId = null;

const tablesLayer = document.getElementById("tablesLayer");
const chosenTableEl = document.getElementById("chosenTable");
const chosenStatusEl = document.getElementById("chosenStatus");
const form = document.getElementById("resForm");
const resetBtn = document.getElementById("resetBtn");

renderTables();
updateChosenUI();

resetBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  statusMap = loadStatus();
  selectedTableId = null;
  renderTables();
  updateChosenUI();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!selectedTableId) {
    alert("Önce boş bir masa seç.");
    return;
  }

  if (statusMap[selectedTableId] === "booked") {
    alert("Bu masa zaten dolu görünüyor.");
    return;
  }

  // Form verileri (istersen sonra gösterir / kaydederiz)
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());

  // DEMO: seçilen masayı dolu yap
  statusMap[selectedTableId] = "booked";
  saveStatus(statusMap);

  // Seçimi temizle
  const bookedId = selectedTableId;
  selectedTableId = null;

  renderTables();
  updateChosenUI();

  alert(`Rezervasyon alındı!\nMasa: ${bookedId}\nİsim: ${payload.name}\nTarih: ${payload.date} ${payload.time}`);
  form.reset();
});

function renderTables() {
  tablesLayer.innerHTML = "";

  for (const t of TABLES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "table-dot";
    btn.textContent = t.id.replace("T", ""); // üstünde 1,2,3 yazsın

    btn.style.left = `${t.x}%`;
    btn.style.top = `${t.y}%`;

    const st = statusMap[t.id] ?? "empty";
    if (st === "booked") btn.classList.add("booked");
    else btn.classList.add("empty");

    if (selectedTableId === t.id) {
      btn.classList.remove("empty");
      btn.classList.add("selected");
    }

    btn.title = `${t.id} - ${labelStatus(t.id)}`;

    btn.addEventListener("click", () => {
      if ((statusMap[t.id] ?? "empty") === "booked") return;

      // aynı masaya tekrar basarsa seçim kaldır
      selectedTableId = (selectedTableId === t.id) ? null : t.id;
      renderTables();
      updateChosenUI();
    });

    tablesLayer.appendChild(btn);
  }
}

function updateChosenUI() {
  if (!selectedTableId) {
    chosenTableEl.textContent = "—";
    chosenStatusEl.textContent = "—";
    return;
  }
  chosenTableEl.textContent = selectedTableId;
  chosenStatusEl.textContent = labelStatus(selectedTableId);
}

function labelStatus(id) {
  const st = statusMap[id] ?? "empty";
  if (id === selectedTableId) return "Seçili";
  return st === "booked" ? "Dolu" : "Boş";
}

function loadStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveStatus(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}