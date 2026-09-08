const STORAGE_KEY = "curavac-media-brief-v1";
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  window.setTimeout(() => element.classList.remove("show"), 1800);
}

function copyText(text, message) {
  navigator.clipboard.writeText(text).then(() => toast(message)).catch(() => toast("Copie indisponible"));
}

const themeToggle = $("#themeToggle");
const storedTheme = localStorage.getItem("curavac-theme");
if (storedTheme) document.documentElement.dataset.theme = storedTheme;
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("curavac-theme", next);
});

const summary = `CuraVac attend maintenant nos prix, nos délais et la confirmation du périmètre.\n\nVidéo : environ 1 min 30, référence curavac.com/video-explanation de 2:13 à 3:39, storyboard existant, 7 remarques du 6 août à intégrer. Décision interne : 600 € HTVA, 2 tours, voix générée, 1 langue, versions site et réseaux.\n\nVisuels : 3 créations statiques pour LinkedIn, Facebook et Instagram. Style ludique, éducatif, sobre, sans cliché IA, Ghibli ni Pixar. Décision interne : 250 € HTVA le lot, 2 tours et 3 formats.\n\nÀ fournir par Lana : délai des visuels, délai de la vidéo, capacité mensuelle et confirmation que les deux tours sont tenables.`;
$("#copySummary").addEventListener("click", () => copyText(summary, "Résumé copié"));

$$('.filter-bar [data-show]').forEach((button) => {
  button.addEventListener("click", () => {
    $$('.filter-bar [data-show]').forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.show;
    $$("#video .card").forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.state !== filter;
    });
  });
});

const tabs = $$('.visual-tabs [role="tab"]');
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.setAttribute("aria-selected", "false"));
    $$('.visual-panel[role="tabpanel"]').forEach((panel) => panel.hidden = true);
    tab.setAttribute("aria-selected", "true");
    $(`#${tab.getAttribute("aria-controls")}`).hidden = false;
  });
});

const checklist = $$('[data-check]');
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveChecklist() {
  const state = loadState();
  checklist.forEach((input) => state[input.dataset.check] = input.checked);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateProgress();
}
function updateProgress() {
  const done = checklist.filter((input) => input.checked).length;
  const percent = Math.round((done / checklist.length) * 100);
  $("#progressBar").style.width = `${percent}%`;
  $("#progressText").textContent = `${percent} % prêt`;
}
const initialState = loadState();
checklist.forEach((input) => {
  input.checked = Boolean(initialState[input.dataset.check]);
  input.addEventListener("change", saveChecklist);
});
updateProgress();

$("#resetChecklist").addEventListener("click", () => {
  checklist.forEach((input) => input.checked = false);
  localStorage.removeItem(STORAGE_KEY);
  updateProgress();
  toast("Checklist réinitialisée");
});

let generatedText = "";
$("#responseBuilder").addEventListener("submit", (event) => {
  event.preventDefault();
  const visualDays = $("#visualDays").value;
  const videoDays = $("#videoDays").value;
  const capacity = $("#monthlyCapacity").value;
  const scope = $("#scopeAccepted").checked;

  if (!visualDays || !videoDays || !capacity) {
    toast("Complète les trois chiffres");
    return;
  }

  generatedText = `Cadrage proposé — à valider avant envoi\n\n• Les trois visuels peuvent être livrés sous ${visualDays} jours ouvrés après confirmation.\n• La vidéo explicative de 1 min 30 peut être livrée sous ${videoDays} jours ouvrés après confirmation et récupération du feedback annoté.\n• Capacité prévue : jusqu’à ${capacity} visuel${Number(capacity) > 1 ? "s" : ""} par mois.\n• Deux tours de corrections : ${scope ? "compris et tenables" : "à renégocier avant confirmation"}.\n• Prix internes à communiquer après validation : 250 € HTVA pour les trois visuels et 600 € HTVA pour la vidéo.`;

  const output = $("#generatedResponse");
  output.textContent = generatedText;
  output.classList.add("ready");
  $("#copyResponse").hidden = false;
});

$("#copyResponse").addEventListener("click", () => copyText(generatedText, "Cadrage copié"));
