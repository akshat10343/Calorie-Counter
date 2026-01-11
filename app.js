let FOODS = []; // loaded from foods.json

const qEl = document.getElementById("q");
const msgEl = document.getElementById("msg");
const statusEl = document.getElementById("status");
const resultsBody = document.getElementById("resultsBody");

function setMsg(text, kind = "") {
  msgEl.textContent = text || "";
  msgEl.className = "msg" + (kind ? ` ${kind}` : "");
}

function clearResults() {
  resultsBody.innerHTML = "";
}

function renderResults(items) {
  clearResults();

  const limited = items.slice(0, 25);

  for (const item of limited) {
    const tr = document.createElement("tr");

    const tdFood = document.createElement("td");
    tdFood.textContent = item.description ?? "";

    const tdPortion = document.createElement("td");
    tdPortion.textContent = item.portion ?? "";

    const tdCalories = document.createElement("td");
    tdCalories.textContent =
      item.calories === null || item.calories === undefined || item.calories === ""
        ? ""
        : String(item.calories);

    tr.appendChild(tdFood);
    tr.appendChild(tdPortion);
    tr.appendChild(tdCalories);
    resultsBody.appendChild(tr);
  }
}

function normalize(s) {
  return (s ?? "").toString().trim().toLowerCase();
}

function searchFoods(query) {
  const cleaned = normalize(query);
  if (!cleaned) return { error: "empty" };

  // Split search into words
  const terms = cleaned.split(/\s+/).filter(Boolean);

  const matches = FOODS.filter((x) => {
    const hay = normalize(x.description);
    return terms.every((t) => hay.includes(t));
  });

  return { matches };
}

async function loadFoods() {
  try {
    const res = await fetch("foods.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    FOODS = await res.json();

    statusEl.textContent = `Loaded ${FOODS.length.toLocaleString()} foods.`;
    setMsg("");
  } catch (err) {
    statusEl.textContent = "Failed to load foods.json";
    setMsg(
      "Could not load foods.json. Make sure you are running a local server (Live Server).",
      "error"
    );
    console.error(err);
  }
}

function onSearch() {
  setMsg("");

  const query = qEl.value;
  const result = searchFoods(query);

  if (result.error === "empty") {
    clearResults();
    setMsg("Please enter search terms before clicking Search.", "warn");
    return;
  }

  const matches = result.matches || [];
  if (matches.length === 0) {
    clearResults();
    setMsg("No matches found. Try different words.", "warn");
    return;
  }

  renderResults(matches);
  setMsg(`Found ${matches.length} matches. Showing up to 25.`, "ok");
}

function onClear() {
  qEl.value = "";
  clearResults();
  setMsg("");
  qEl.focus();
}

document.getElementById("searchBtn").addEventListener("click", onSearch);
document.getElementById("clearBtn").addEventListener("click", onClear);

qEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onSearch();
});

loadFoods();