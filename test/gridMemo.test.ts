import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sameGridCardProps } from '../src/component/FilmGrid/FilmGrid.memo';
import type { FilmGridItemProps } from '../src/component/FilmGrid/FilmGrid.type';

test('unchanged grid cells survive another poster enrichment while visible changes still render', () => {
  const film = { id: 'one', title: 'One', poster: 'one.jpg' };
  const props = { item: { film, key: 'one', row: 0, column: 0 }, handleOnPress() {}, isRatingVisible: true } as unknown as FilmGridItemProps;
  assert.equal(sameGridCardProps(props, { ...props, item: { ...props.item } }), true);
  assert.equal(sameGridCardProps(props, { ...props, isRatingVisible: false }), false);
  assert.equal(sameGridCardProps(props, { ...props, item: { ...props.item, film: { ...props.item.film, poster: 'two.jpg' } } }), false);
  assert.equal(sameGridCardProps(props, { ...props, handleOnPress() {} }), false);
});