const siteEl = document.getElementById("site");
const blockBtn = document.getElementById("block");
const statusEl = document.getElementById("status");

document.getElementById("settings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
  window.close();
});

showIncognitoWarning(document.getElementById("incognito-warning"));

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const domain = tab && tab.url && /^https?:/.test(tab.url) ? normalizeDomain(tab.url) : "";

  if (!domain) {
    siteEl.textContent = "Not a website";
    return;
  }
  siteEl.textContent = domain;

  const sites = await getSites();
  const existing = sites.find((s) => domain === s.domain || domain.endsWith("." + s.domain));
  if (existing && existing.enabled !== false) {
    statusEl.textContent = "This site is blocked.";
    statusEl.hidden = false;
    return;
  }

  blockBtn.hidden = false;
  blockBtn.addEventListener("click", async () => {
    const s = await getSites();
    const found = s.find((x) => x.domain === domain);
    if (found) found.enabled = true;
    else s.push({ domain, enabled: true });
    await saveSites(s);
    window.close();
  });
})();
