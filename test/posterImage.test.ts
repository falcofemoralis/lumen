import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filmPosterUrl } from '../src/util/Film/posterImage';
test('related posters read lazy image attributes and normalize protocol-relative CDN URLs', () => {
  assert.equal(filmPosterUrl({ 'data-src': '//img.test/poster.jpg', src: 'placeholder.gif' }), 'https://img.test/poster.jpg');
  assert.equal(filmPosterUrl({ 'data-src': ' ', 'data-original': 'https://img.test/real.jpg', src: 'blank.gif' }), 'https://img.test/real.jpg');
  assert.equal(filmPosterUrl({ src: 'https://img.test/poster.jpg' }), 'https://img.test/poster.jpg');
  assert.equal(filmPosterUrl(), '');
});