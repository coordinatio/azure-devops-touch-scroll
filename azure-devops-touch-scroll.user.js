// ==UserScript==
// @name         Azure DevOps: fix touch scrolling on Backlogs / Boards
// @namespace    https://github.com/coordinatio/azure-devops-touch-scroll
// @version      1.1
// @description  Stops drag-and-drop from hijacking swipe gestures on touch devices so backlog lists and boards can be scrolled. Mouse dragging keeps working.
// @homepageURL  https://github.com/coordinatio/azure-devops-touch-scroll
// @supportURL   https://github.com/coordinatio/azure-devops-touch-scroll/issues
// @downloadURL  https://raw.githubusercontent.com/coordinatio/azure-devops-touch-scroll/main/azure-devops-touch-scroll.user.js
// @updateURL    https://raw.githubusercontent.com/coordinatio/azure-devops-touch-scroll/main/azure-devops-touch-scroll.user.js
// @license      MIT
// @match        https://dev.azure.com/*
// @match        https://*.visualstudio.com/*
// @match        https://tfs.content.ai/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const GRID = '.grid-row, .grid-canvas, .board-tile, .card, [role="row"], [role="listitem"], [draggable="true"]';

  // 1) Give the browser permission to pan. Board tiles ship with touch-action:none,
  //    which alone kills scrolling even before any JS runs.
  const style = document.createElement('style');
  style.textContent = GRID + ', .agile-content-container, .kanban-board { touch-action: pan-x pan-y !important; }';
  (document.head || document.documentElement).appendChild(style);

  // 2) Firefox for Android synthesizes mousedown/mousemove from a finger press.
  //    jQuery UI Draggable (no Touch Punch on backlogs; boards also call
  //    TouchEventsHelper.simulateMouseEvent) then starts a drag after 5–20px
  //    and the list never scrolls.
  //    Track real touches; only then treat mousedown as a finger gesture.
  //    All listeners are passive: we never preventDefault(), so Firefox can scroll.
  let activeTouches = 0;
  window.addEventListener('touchstart', () => { activeTouches++; }, { capture: true, passive: true });
  window.addEventListener('touchend', () => { activeTouches = Math.max(0, activeTouches - 1); }, { capture: true, passive: true });
  window.addEventListener('touchcancel', () => { activeTouches = Math.max(0, activeTouches - 1); }, { capture: true, passive: true });

  const onGrid = (t) => t instanceof Element && t.closest(GRID);

  const isTouchLike = (e) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') return true;
    if (e.pointerType === 'mouse') return false;
    return activeTouches > 0; // compatibility mouse events during a touch (Firefox)
  };

  const blockDrag = (e) => {
    if (!isTouchLike(e) || !onGrid(e.target)) return;
    e.stopImmediatePropagation();
  };

  for (const type of ['pointerdown', 'mousedown', 'touchstart']) {
    window.addEventListener(type, blockDrag, { capture: true, passive: true });
  }

  // 3) Boards: tile touchmove → simulateMouseEvent + preventDefault().
  //    Backlogs: VSS Grid binds touchmove to a handler that returns false
  //    (jQuery then preventDefault). Stop those in capture; the 'scroll'
  //    listener still redraws the virtualized grid.
  window.addEventListener('touchmove', (e) => {
    if (onGrid(e.target)) e.stopImmediatePropagation();
  }, { capture: true, passive: true });
})();
