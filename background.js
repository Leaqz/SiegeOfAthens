// Keeps Chrome's blocking rules in sync with the list saved in storage.

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function syncRules() {
  const { sites = [] } = await chrome.storage.sync.get("sites");
  const active = sites.filter((s) => s.enabled !== false);
  const blockedPage = chrome.runtime.getURL("blocked.html");

  const addRules = active.map((site, i) => ({
    id: i + 1,
    priority: 1,
    action: {
      type: "redirect",
      // Pass the original URL to the blocked page so it can show what was blocked
      redirect: { regexSubstitution: blockedPage + "#\\0" }
    },
    condition: {
      // Matches the domain and all its subdomains, any path
      regexFilter: "^https?://([^/]*\\.)?" + escapeRegex(site.domain) + "(:[0-9]+)?(/.*)?$",
      resourceTypes: ["main_frame"]
    }
  }));

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules
  });

  // Also redirect tabs that are already open on a newly blocked site
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.url || !/^https?:/.test(tab.url)) continue;
    let host;
    try { host = new URL(tab.url).hostname; } catch { continue; }
    if (active.some((s) => host === s.domain || host.endsWith("." + s.domain))) {
      chrome.tabs.update(tab.id, { url: blockedPage + "#" + tab.url });
    }
  }
}

chrome.runtime.onInstalled.addListener(syncRules);
chrome.runtime.onStartup.addListener(syncRules);
// With "incognito": "split", a separate copy of this worker runs for Incognito
// windows. onStartup doesn't fire for it, so sync whenever the worker loads.
syncRules();
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.sites) syncRules();
});
