import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dragAxis, installDesktopPointer } from '../../src/windows/pointer';

test('Desktop dragging separates a click, vertical scrolling and horizontal tab swipes', () => {
  assert.equal(dragAxis(4, 6), null);
  assert.equal(dragAxis(-90, 15), 'horizontal');
  assert.equal(dragAxis(10, -60), 'vertical');
  assert.equal(dragAxis(20, 20), 'vertical');
});
test('Details carousels drag horizontally without selecting text or switching pager tabs', () => {
  const handlers: Record<string, Function> = {};
  const body = { classList: { contains: () => true } };
  const page = { parentElement: body, style: { overflowY: 'auto' }, scrollHeight: 1500, clientHeight: 500, scrollTop: 100 };
  const carousel = { parentElement: page, style: { overflowX: 'auto' }, scrollWidth: 1000, clientWidth: 300, scrollLeft: 0 };
  let swipes = 0;
  const pager = { dispatchEvent: () => swipes++ };
  const target = { parentElement: carousel, style: {}, closest: (selector: string) => {
    if (selector.includes('data-lumen-drag-scroll')) return carousel;
    if (selector === '[data-lumen-selectable]') return target;
    if (selector === '[data-lumen-pager]') return pager;
    return null;
  } };
  const doc = { body, addEventListener: (type: string, handler: Function) => { handlers[type] = handler; } };
  const previousWindow = (globalThis as any).window;
  const previousStyle = (globalThis as any).getComputedStyle;
  (globalThis as any).window = { addEventListener() {}, getSelection: () => ({ removeAllRanges() {} }) };
  (globalThis as any).getComputedStyle = (node: any) => node.style ?? {};
  try {
    installDesktopPointer(doc);
    const event = (x: number, y = 100) => ({ target, pointerId: 1, button: 0, clientX: x, clientY: y, type: 'pointerup', prevented: false, stopped: false,
      preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; } });
    handlers.pointerdown(event(200));
    handlers.pointermove(event(80));
    assert.equal(carousel.scrollLeft, 120);
    assert.equal(page.scrollTop, 100);
    handlers.pointerup(event(80));
    const click = event(80);
    handlers.click(click);
    assert.equal(click.stopped, true);
    assert.equal(swipes, 0);
    handlers.pointerdown(event(200));
    handlers.pointermove(event(196));
    const simpleClick = event(196);
    handlers.click(simpleClick);
    assert.equal(simpleClick.stopped, false);
    assert.equal(carousel.scrollLeft, 120);
  } finally {
    (globalThis as any).window = previousWindow;
    (globalThis as any).getComputedStyle = previousStyle;
  }
});