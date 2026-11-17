import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getFranchiseChronology } from '../src/util/Film/franchise';
const part = (year: string, name = year) => ({ year, name, rating: '', link: name });

test('All Parts displays old and freshly fetched reversed franchises oldest first', () => {
  const cached = Object.freeze([part('2019'), part('2018'), part('2015'), part('2012')]);
  const ordered = getFranchiseChronology(cached);
  assert.deepEqual(ordered.map(item => item.year), ['2012','2015','2018','2019']);
  assert.deepEqual(cached.map(item => item.year), ['2019','2018','2015','2012']);
});

test('Same-year parts retain source order and unknown years follow dated parts', () => {
  const items = [part('', 'unknown'), part('2020', 'first'), part('2020', 'second'), part('2018–2019', 'earlier')];
  assert.deepEqual(getFranchiseChronology(items).map(item => item.name), ['earlier','first','second','unknown']);
  assert.deepEqual(getFranchiseChronology(), []);
});
