# Azure DevOps: fix touch scrolling on Backlogs / Boards

Userscript that stops drag-and-drop from hijacking swipe gestures on touch
devices (Firefox for Android + Tampermonkey/FireMonkey), so backlog lists and
boards can be scrolled. Mouse dragging keeps working.

## Install

1. Firefox → Settings → Add-ons → install
   [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   (or [FireMonkey](https://addons.mozilla.org/firefox/addon/firemonkey/)).
2. Open
   [azure-devops-touch-scroll.user.js](https://github.com/coordinatio/azure-devops-touch-scroll/raw/main/azure-devops-touch-scroll.user.js).
   Tampermonkey will offer to install it.
3. If your TFS / Azure DevOps host is not `dev.azure.com`, `*.visualstudio.com`,
   or `tfs.content.ai`, add another `@match` line for it (Tampermonkey →
   Dashboard → the script → Editor).
4. Close the Azure DevOps tab completely and reopen it (ADO is an SPA; a simple
   refresh may keep old JS alive).

If it still does not inject, Tampermonkey → Dashboard → the script → Settings →
confirm the `@match` includes your TFS origin (scheme + host).

## What it does

On touch, Azure DevOps starts a drag after a few pixels of movement, and board
tiles set `touch-action: none`. Firefox then never scrolls the backlog or
kanban board.

This script:

1. Sets `touch-action: pan-x pan-y` on grid rows, board tiles, and their
   scroll containers.
2. Tracks real `touchstart` / `touchend` and, only during an active touch,
   stops drag-and-drop from seeing the compatibility `mousedown` that Firefox
   for Android synthesizes.
3. Stops board `touchmove` handlers that call `preventDefault()` (so the
   browser can pan). Listeners are **passive**; the script never calls
   `preventDefault()` itself.

With touch input, drag-and-drop reordering is disabled (it was effectively
unusable anyway, since you could not even scroll). Reordering with a mouse
still works.

## Tested on

Azure DevOps Server 2022.2 (`AzureDevopsServer_20240806.7`)

## License

[MIT](LICENSE)
