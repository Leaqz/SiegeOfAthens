const original = decodeURIComponent(location.hash.slice(1));
try {
  const host = new URL(original).hostname.replace(/^www\./, "");
  if (host) document.getElementById("domain").textContent = host;
} catch {}

document.getElementById("back").addEventListener("click", () => {
  if (history.length > 1) history.back();
  else chrome.tabs.getCurrent((tab) => tab && chrome.tabs.remove(tab.id));
});

document.getElementById("settings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
