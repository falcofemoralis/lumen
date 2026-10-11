import assert from 'node:assert/strict';
import { test } from 'node:test';
import { posterSeriesInfo } from '../src/util/Film/posterStatus';
import { FilmType } from '../src/type/FilmType.type';
test('posters hide cached standalone release labels and retain episodic statuses', () => {
  for (const type of [FilmType.ANIME, FilmType.DONGHUA, FilmType.CARTOON, FilmType.FILM]) {
    assert.equal(posterSeriesInfo({ type, info: 'Вышел' }), undefined);
    assert.equal(posterSeriesInfo({ type, info: '  вышел  ' }), undefined);
  }
  for (const type of [FilmType.SERIES, FilmType.ANIME, FilmType.DONGHUA, FilmType.CARTOON]) {
    const info = 'Сезон 2 • серия 8 • Завершён';
    assert.equal(posterSeriesInfo({ type, info }), info);
    assert.equal(posterSeriesInfo({ type, info: 'Завершён' }), 'Завершён');
  }
});