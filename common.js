// Shared helpers for the settings page and popup.

// Turns "https://www.youtube.com/watch?v=1" into "youtube.com"
function normalizeDomain(input) {
  let s = (input || "").trim().toLowerCase();
  if (!s) return "";
  if (!/^[a-z]+:\/\//.test(s)) s = "http://" + s;
  let host;
  try { host = new URL(s).hostname; } catch { return ""; }
  host = host.replace(/^www\./, "").replace(/\.$/, "");
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) return "";
  return host;
}

async function getSites() {
  const { sites = [] } = await chrome.storage.sync.get("sites");
  return sites;
}

async function saveSites(sites) {
  await chrome.storage.sync.set({ sites });
}

// Shows a warning inside `el` if the extension isn't allowed in Incognito.
// Chrome only lets the user turn that on, so we link to the setting.
async function showIncognitoWarning(el) {
  let allowed = true;
  try { allowed = await chrome.extension.isAllowedIncognitoAccess(); } catch {}
  if (allowed) return;
  el.hidden = false;
  el.innerHTML =
    "<strong>Not blocking in private windows.</strong> " +
    'Turn on <em>Allow in Incognito</em> in the extension\'s details.' +
    '<button type="button" class="primary">Open setting</button>';
  el.querySelector("button").addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://extensions/?id=" + chrome.runtime.id });
  });
}
