import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dragAxis } from '../../src/windows/pointer';

test('Desktop dragging separates a click, vertical scrolling and horizontal tab swipes', () => {
  assert.equal(dragAxis(4, 6), null);
  assert.equal(dragAxis(-90, 15), 'horizontal');
  assert.equal(dragAxis(10, -60), 'vertical');
  assert.equal(dragAxis(20, 20), 'vertical');
});