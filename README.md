# Site Blocker

A simple Chrome extension that blocks websites you choose.

## Install

1. Unzip this folder somewhere permanent (Chrome loads it from that location).
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `site-blocker` folder.
5. Pin the extension from the puzzle-piece menu for quick access.
6. **To also block in private (Incognito) windows:** on `chrome://extensions`, click
   **Details** under Site Blocker and turn on **Allow in Incognito**. Chrome doesn't let
   extensions turn this on themselves. Until you do, the settings page and popup show a
   warning with a button that takes you to that setting.

## Use

- **Settings page:** right-click the extension icon → *Options*, or click the icon → *Manage blocked sites*.
  - Add a site by typing a domain (`reddit.com`) or pasting any link.
  - **Edit** changes a domain, **Pause/Resume** temporarily unblocks it, **Remove** deletes it.
- **Popup:** click the icon on any site and choose *Block this site*.

Blocking a domain also blocks its subdomains (blocking `reddit.com` blocks `old.reddit.com`).
Tabs already open on a site are redirected as soon as you block it. Your list syncs across
Chrome browsers signed into the same account.

## Files

- `manifest.json` — extension config (Manifest V3)
- `background.js` — turns your list into Chrome blocking rules
- `options.html/js` — settings page
- `popup.html/js` — toolbar popup
- `blocked.html/js` — page shown instead of a blocked site
