const list = document.getElementById("list");
const form = document.getElementById("add-form");
const input = document.getElementById("add-input");
const errorEl = document.getElementById("error");
const countEl = document.getElementById("count");

let editingIndex = -1;

function showError(msg) { errorEl.textContent = msg || ""; }

async function render() {
  const sites = await getSites();
  list.innerHTML = "";

  if (sites.length === 0) {
    list.innerHTML = '<li class="empty muted">No sites blocked yet.</li>';
  }

  sites.forEach((site, i) => {
    const li = document.createElement("li");
    if (site.enabled === false) li.classList.add("disabled");

    if (i === editingIndex) {
      const edit = document.createElement("input");
      edit.type = "text";
      edit.value = site.domain;
      const save = button("Save", "primary", () => saveEdit(i, edit.value));
      const cancel = button("Cancel", "", () => { editingIndex = -1; showError(); render(); });
      edit.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit(i, edit.value);
        if (e.key === "Escape") cancel.click();
      });
      li.append(edit, save, cancel);
      list.append(li);
      edit.focus();
      edit.select();
      return;
    }

    const name = document.createElement("span");
    name.className = "domain";
    name.textContent = site.domain;

    const toggle = button(site.enabled === false ? "Resume" : "Pause", "", async () => {
      const s = await getSites();
      s[i].enabled = s[i].enabled === false;
      await saveSites(s);
      render();
    });
    const edit = button("Edit", "", () => { editingIndex = i; showError(); render(); });
    const remove = button("Remove", "danger", async () => {
      const s = await getSites();
      s.splice(i, 1);
      await saveSites(s);
      render();
    });

    li.append(name, toggle, edit, remove);
    list.append(li);
  });

  const active = sites.filter((s) => s.enabled !== false).length;
  countEl.textContent = sites.length
    ? `${active} of ${sites.length} site${sites.length === 1 ? "" : "s"} currently blocked`
    : "";
}

function button(label, cls, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  if (cls) b.className = cls;
  b.addEventListener("click", onClick);
  return b;
}

async function saveEdit(i, value) {
  const domain = normalizeDomain(value);
  if (!domain) return showError("That doesn't look like a valid website.");
  const sites = await getSites();
  if (sites.some((s, j) => j !== i && s.domain === domain)) {
    return showError(`${domain} is already in the list.`);
  }
  sites[i].domain = domain;
  await saveSites(sites);
  editingIndex = -1;
  showError();
  render();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const domain = normalizeDomain(input.value);
  if (!domain) return showError("That doesn't look like a valid website.");
  const sites = await getSites();
  if (sites.some((s) => s.domain === domain)) {
    return showError(`${domain} is already in the list.`);
  }
  sites.push({ domain, enabled: true });
  await saveSites(sites);
  input.value = "";
  showError();
  render();
});

// Keep the page current if the list is changed from the popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.sites && editingIndex === -1) render();
});

render();
showIncognitoWarning(document.getElementById("incognito-warning"));
