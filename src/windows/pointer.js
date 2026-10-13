export const dragAxis = (dx, dy) => Math.max(Math.abs(dx), Math.abs(dy)) < 10
  ? null : Math.abs(dx) > Math.abs(dy) * 1.3 ? 'horizontal' : 'vertical';

export function installDesktopPointer(document) {
  let drag, suppressClick = false;
  const scroller = target => {
    for (let node = target; node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 2) return node;
    }
  };
  document.addEventListener('dragstart', event => {
    if (!event.target.closest('input,textarea,[contenteditable=true]')) event.preventDefault();
  }, true);
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('#lumen-player,input,textarea,[role=slider],select,[contenteditable=true],#lumen-titlebar,#lumen-mini-controls')) return;
    // Details text can be selected normally; drag a blank area or poster to scroll.
    if (document.body.classList.contains('lumen-details') && event.target.closest('[data-lumen-selectable]')) return;
    const pager = event.target.closest('[data-lumen-pager]');
    const scroll = scroller(event.target);
    if (!pager && !scroll) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, lastY: event.clientY, pager, scroll, axis: null };
    suppressClick = false;
  }, true);
  document.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    drag.axis ||= dragAxis(dx, dy);
    if (!drag.axis) return;
    if (drag.axis === 'vertical' && drag.scroll) {
      drag.scroll.scrollTop -= event.clientY - drag.lastY;
      suppressClick = true;
    } else if (drag.axis === 'horizontal' && drag.pager) {
      suppressClick = true;
    }
    drag.lastY = event.clientY;
    if (suppressClick) { event.preventDefault(); window.getSelection()?.removeAllRanges(); }
  }, { capture: true, passive: false });
  const end = event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (event.type !== 'pointercancel' && drag.axis === 'horizontal' && drag.pager && Math.abs(event.clientX - drag.x) >= 70) {
      drag.pager.dispatchEvent(new CustomEvent('lumen-swipe', { detail: event.clientX < drag.x ? 1 : -1 }));
    }
    drag = null;
    // A drag must never open the poster under the pointer on release.
    if (suppressClick) setTimeout(() => { suppressClick = false; }, 0);
  };
  document.addEventListener('pointerup', end, true);
  document.addEventListener('pointercancel', end, true);
  window.addEventListener('blur', () => { drag = null; suppressClick = false; });
  document.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); suppressClick = false; }
  }, true);
}