import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSeriesTranslatorId } from '../../src/api/RezkaApi/seriesTranslator';

test('missing or malformed series initialization does not create a phantom translator', () => {
  for (const html of ['', '<html>challenge</html>', 'initCDNSeriesEvents', 'initCDNSeriesEvents(123)']) assert.equal(parseSeriesTranslatorId(html), undefined);
  assert.equal(parseSeriesTranslatorId('initCDNSeriesEvents(123,  42, 1, {"id":"x"})'), '42');
});
