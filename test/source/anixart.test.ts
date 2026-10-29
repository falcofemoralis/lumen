import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FilmType } from '../../src/type/FilmType.type';
import { ContentSource } from '../../src/source/types/ContentSource';
import Anixart, { anixartToCard, anixartToFilm, classifyAnixart, anixartAgeRating } from '../../src/source/adapters/AnixartSourceAdapter';
import { AnixartRelease, requestAnixart } from '../../src/source/adapters/AnixartApi';
import Playback, { decodeKodikUrl, getKodikVideo } from '../../src/source/playback/AnixartPlaybackAdapter';
import { SourceResolver } from '../../src/source/resolver/SourceResolver';
import { SourceRouter } from '../../src/source/resolver/SourceRouter';
import { supplementVoices } from '../../src/source/playback/createSupplementedPlaybackAdapter';
import { matchesHomeTab, getHomeMenu } from '../../src/config/HomeMenu';

const release: AnixartRelease = {
  id: 999901, title_ru: 'Тестовый релиз', title_original: 'Test Release', image: 'https://images.test/poster.jpg',
  year: '2023', country: 'Китай', category: { id: 1, name: 'Сериал' },
  episodes_released: 2, episodes_total: 12, status: { id: 2, name: 'Выходит' }, grade: 4.5, vote_count: 20,
};
test('Anixart uses country to separate donghua and anime, never the ONA label or title', () => {
  assert.equal(classifyAnixart(release), FilmType.DONGHUA);
  assert.equal(classifyAnixart({ country: 'Япония' }), FilmType.ANIME);
  const film = anixartToFilm(release);
  assert.equal(film.mainRating?.name, 'Anixart');
  assert.equal(anixartToFilm({ ...release, director: 'Test director' }).directors?.[0].name, 'Test director');
  assert.equal(film.mainRating?.rating, 9);
  assert.equal(anixartToCard(release).ratings?.imdb, undefined);
  assert.match(film.seriesInfo!, /2 \/ 12/);
  assert.ok(matchesHomeTab('anixart-donghua', anixartToCard(release)));
  assert.equal(matchesHomeTab('zona-anime', anixartToCard(release)), false);
  assert.ok(getHomeMenu([]).find((item) => item.id === 'zona-anime')?.path.includes('anixart-app.com'));
});
test('Anixart metadata wins a trusted cross-source match while IDs and sources survive', () => {
  const native = Anixart.normalizeFilmCard(anixartToCard({ ...release, kinopoisk_id: 777 }));
  const supplemental = { ...native, type: FilmType.ANIME, poster: 'rezka.jpg', ratings: { imdb: 8 },
    sources: [{ ...native.sources[0], source: ContentSource.REZKA, link: 'https://rezka.test/777', nativeId: '777' }] };
  const resolver = new SourceResolver([Anixart]);
  const merged = resolver.deduplicate([supplemental, native]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].type, FilmType.DONGHUA);
  assert.equal(merged[0].poster, release.image);
  assert.equal(merged[0].sources.length, 2);
  assert.equal(merged[0].ratings?.imdb, 8);
  assert.equal(resolver.getPreferredSource(merged[0]), ContentSource.ANIXART);
  assert.equal(resolver.isSameFilm(native, { ...native, year: 2024, sources: [{ source: ContentSource.REZKA, nativeId: '2', link: 'https://rezka.test/2', externalIds: [] }] }), false);
  const router = new SourceRouter([Anixart]);
  assert.equal(router.getAdapterForLink('https://anixart-app.com/release/1'), Anixart);
  assert.equal(router.getAdapterForLink('https://anixart.site/1.html'), null);
});
test('Anixart filter/search reuse release data and deduplicate pending API requests', async () => {
  const saved = globalThis.fetch;
  const calls: { url: string; body?: string }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), body: init?.body as string });
    return Response.json({ code: 0, content: [release], total_page_count: 3 });
  };
  try {
    const catalog = await Anixart.getFilms!('https://anixart-app.com/catalog?country=' + encodeURIComponent('Китай'), 2);
    assert.equal(catalog.totalPages, 3);
    assert.ok(calls[0].url.includes('/filter/1'));
    assert.equal(JSON.parse(calls[0].body!).country, 'Китай');
    const film = await Anixart.getFilm(catalog.films[0].link);
    assert.equal(film?.type, FilmType.DONGHUA);
    assert.equal(calls.length, 1);
    const first = requestAnixart('/search/releases/987', { query: 'Test' });
    const second = requestAnixart('/search/releases/987', { query: 'Test' });
    assert.equal(first, second);
    await first;
    assert.equal(calls.length, 2);
  } finally { globalThis.fetch = saved; }
});
test('Anixart voices, episode selection and direct streams use native IDs', async () => {
  const saved = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input); calls.push(url);
    if (url.endsWith('/episode/999902')) return Response.json({ code: 0, types: [{ id: 991, name: 'Native dub' }] });
    if (url.endsWith('/episode/999902/991')) return Response.json({ code: 0, sources: [{ id: 992, name: 'Direct', episodes_count: 2 }] });
    if (url.includes('/episode/target/')) return Response.json({ code: 0, episode: { position: 2, url: 'https://video.test/episode2.m3u8', iframe: false } });
    return Response.json({ code: 0, episodes: [{ position: 1, name: '1 серия' }, { position: 2, name: '2 серия' }] });
  };
  try {
    const film = anixartToFilm({ ...release, id: 999902 });
    const voices = await Playback.getFilmVoices(film);
    const voice = await Playback.getFilmSeasons(film, voices[0]);
    assert.equal(voice.seasons?.[0].episodes[1].episodeId, '2');
    const video = await Playback.getFilmStreamsByEpisodeId(film, voice, '1', '2');
    assert.equal(video.streams[0].url, 'https://video.test/episode2.m3u8');
    assert.ok(calls.some((url) => url.endsWith('/episode/target/999902/992/2')));
    const extras = supplementVoices(voices, [{ ...voices[0], id: '42' }, { ...voices[0], id: '43', title: 'Extra dub' }], 'Anixart');
    assert.equal(extras.length, 2);
    assert.equal(extras[0].title, 'Native dub (Anixart)');
    assert.equal(extras[1].nativeVoiceId, '43');
    assert.equal(extras[1].playbackSource, 'REZKA');
  } finally { globalThis.fetch = saved; }
});
test('Kodik returns native stream qualities and rejects invalid URLs', async () => {
  const raw = '//video.test/master.m3u8';
  const encoded = btoa(raw).replace(/[a-zA-Z]/g, (letter) => {
    const code = letter.charCodeAt(0) - 18;
    const low = letter <= 'Z' ? 65 : 97;
    return String.fromCharCode(code < low ? code + 26 : code);
  });
  assert.equal(decodeKodikUrl(encoded), 'https://video.test/master.m3u8');
  assert.throws(() => decodeKodikUrl(btoa('javascript:bad')), /Invalid|URL|character/i);
  const saved = globalThis.fetch;
  globalThis.fetch = async (_input, init) => init?.method === 'POST'
    ? Response.json({ links: { '720': { src: encoded }, '480': [{ src: raw }] } })
    : new Response('var domain = "kodikplayer.com"; var d_sign = "s"; var pd = "d"; var pd_sign = "s"; var ref = ""; var ref_sign = "s"; vInfo.type = \'seria\'; vInfo.hash = \'hash\'; vInfo.id = \'123\';');
  try {
    const video = await getKodikVideo('https://kodikplayer.com/seria/123/hash/720p');
    assert.deepEqual(video.streams.map((stream) => stream.quality), ['480p', '720p']);
    assert.ok(video.streams.every((stream) => stream.headers?.Referer?.includes('kodikplayer.com')));
  } finally { globalThis.fetch = saved; }
});

test('Anixart zero page count uses incremental pagination without repeating the first page', async () => {
  const saved = globalThis.fetch;
  const paths: string[] = [];
  globalThis.fetch = async (input) => {
    paths.push(String(input));
    return Response.json({ code: 0, total_page_count: 0, current_page: paths.length - 1,
      content: paths.length === 1 ? Array.from({ length: 25 }, (_, index) => ({ ...release, id: 998000 + index })) : [release] });
  };
  try {
    const first = await Anixart.search('Pagination test', 1);
    const second = await Anixart.search('Pagination test', 2);
    assert.equal(first.totalPages, 2);
    assert.equal(second.totalPages, 2);
    assert.ok(paths[0].endsWith('/search/releases/0'));
    assert.ok(paths[1].endsWith('/search/releases/1'));
  } finally { globalThis.fetch = saved; }
});
test('Anixart is preferred for details and old bookmarks; Rezka supplies missing external ratings', async () => {
  const native = anixartToFilm({ ...release, id: 997001, country: 'Япония', kinopoisk_id: 777 });
  const extra = { ...native, title: 'Другой перевод названия', id: '42', link: 'https://rezka.test/anime42', poster: 'rezka.jpg',
    actors: [{ name: 'Test actor', photo: '', link: 'https://rezka.test/person/1' }],
    directors: [{ name: 'Test director', photo: '', link: 'https://rezka.test/person/2' }],
    ratings: [{ name: 'IMDb', rating: 8.4, votes: 615, text: 'IMDb' }, { name: 'Кинопоиск', rating: 8, votes: 500, text: 'КП' }],
    mainRating: { name: 'Rezka', rating: 8, votes: 100, text: 'Rezka' } };
  const adapter = (source: ContentSource, film: typeof native) => ({
    source, name: source,
    getFilm: async () => film,
    search: async () => ({ films: [{ ...film, originalTitle: undefined, ratings: {}, subtitle: '2023' }], totalPages: 1 }),
    normalizeFilm: (value: typeof native) => ({
      id: value.id, title: value.title, originalTitle: value.originalTitle, year: 2023,
      type: value.type, poster: value.poster,
      sources: [{ source, link: value.link, nativeId: value.id, externalIds: [] }],
    }),
    normalizeFilmCard: (value: ReturnType<typeof anixartToCard>) => ({
      id: value.id, title: value.title, originalTitle: value.originalTitle, year: 2023,
      type: value.type, poster: value.poster,
      sources: [{ source, link: value.link, nativeId: value.id, externalIds: [] }],
    }),
    getExternalIds: () => [],
  });
  const router = new SourceRouter([adapter(ContentSource.ANIXART, native), adapter(ContentSource.REZKA, extra)]);
  const details = await router.resolvePreferredFilm(extra);
  assert.equal(details.link, native.link);
  assert.equal(details.metadataSourceFilm?.link, extra.link);
  assert.equal(details.actors?.[0].link, extra.actors[0].link);
  assert.equal(details.directors?.[0].link, extra.directors[0].link);
  assert.equal(details.ratings?.find(rating => rating.name === 'Кинопоиск')?.votes, 500);
  assert.deepEqual(await router.getAnixartExternalRatings('997001'), { imdb: 8.4, kinopoisk: 8 });
  const unrelated = { ...extra, originalTitle: 'Unrelated original title' };
  const conflictingRouter = new SourceRouter([adapter(ContentSource.ANIXART, native), adapter(ContentSource.REZKA, unrelated)]);
  assert.deepEqual(await conflictingRouter.getAnixartExternalRatings('997001'), {});
  assert.equal(details.ratings?.find((rating) => rating.name === 'IMDb')?.votes, 615);
  const old = { ...anixartToCard(release), id: 'saved-bookmark', link: extra.link, type: FilmType.ANIME, ratings: { imdb: 8.4 } };
  const updated = await router.resolvePreferredCard(old);
  assert.equal(updated.link, native.link);
  assert.equal(updated.id, 'saved-bookmark');
  assert.equal(updated.poster, native.poster);
  assert.equal(updated.ratings?.imdb, 8.4);
  const zona = { ...extra, id: 'zona-anime', link: 'https://w1.zona.im/movies/test-anime' };
  const zonaRouter = new SourceRouter([adapter(ContentSource.ANIXART, native), adapter(ContentSource.REZKA, extra), adapter(ContentSource.ZONA, zona)]);
  const updatedZona = await zonaRouter.resolvePreferredCard({ ...old, link: zona.link });
  assert.equal(updatedZona.link, native.link);
  assert.equal(updatedZona.ratingSourceType, ContentSource.ANIXART);
  assert.equal(updatedZona.id, old.id);
  const promoted = await zonaRouter.resolvePreferredFilm(zona);
  assert.equal(promoted.link, native.link);
  assert.equal(promoted.metadataSourceFilm?.link, extra.link);
});
test('Anixart maps native age ratings and exposes continuations independently of recommendations', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(anixartAgeRating), ['0+', '6+', '12+', '16+', '18+']);
  assert.equal(anixartAgeRating(999), undefined);
  const first = { ...release, id: 997201, year: '2020', age_rating: 4, status: { id: 1, name: 'Вышел' } };
  const next = { ...release, id: 997202, title_ru: 'Continuation', year: '2021' };
  const film = anixartToFilm({ ...first, related_releases: [first, next] });
  assert.equal(film.age, '16+');
  assert.match(film.seriesInfo!, /Завершён/);
  assert.equal(film.franchise?.[0].link, 'https://anixart-app.com/release/997202');
  assert.equal(film.franchise?.[1].link, '');
});

test('Anixart OVA is a configurable Home tab and sends the native category filter', async () => {
  const saved = globalThis.fetch;
  const calls: { url: string; body: string }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), body: init?.body as string });
    return Response.json({ code: 0, content: [{ ...release, category: { id: 3, name: 'OVA' } }] });
  };
  try {
    const tab = getHomeMenu([]).find(item => item.id === 'anixart-ova')!;
    assert.ok(tab);
    const result = await Anixart.getFilms!(tab.path, 1);
    assert.equal(JSON.parse(calls[0].body).category_id, 3);
    assert.match(result.films[0].info!, /OVA/);
  } finally { globalThis.fetch = saved; }
});

test('Anixart handles flat search status and released episodes overriding stale announcements', () => {
  const flat = { ...release, status: undefined, category: undefined, status_id: 2 };
  assert.match(anixartToCard(flat).info!, /Серия 2.*Выходит/);
  assert.match(anixartToCard({ ...flat, status_id: 1 }).info!, /Завершён/);
  const stale = anixartToCard({ ...release, status: { id: 3, name: 'Анонс' } });
  assert.equal(stale.isPendingRelease, false);
  assert.match(stale.info!, /Серия 2.*Выходит/);
  assert.equal(anixartToCard({ ...flat, status_id: 3, episodes_released: 0 }).isPendingRelease, true);
});

test('partial Anixart search metadata loads details once and cannot overwrite them later', async () => {
  const saved = globalThis.fetch;
  const full = { ...release, id: 994781, status: { id: 2, name: 'Выходит' }, episodes_released: 8 };
  const partial = { ...full, status: undefined, category: undefined, status_id: 3, episodes_released: 0 };
  let details = 0;
  globalThis.fetch = async (input) => {
    if (String(input).includes('/release/994781')) {
      details++;
      return Response.json({ code: 0, release: full });
    }
    return Response.json({ code: 0, content: [partial] });
  };
  try {
    await Anixart.search('partial cache reproduction', 1);
    const film = await Anixart.getFilm('https://anixart-app.com/release/994781');
    assert.match(film?.seriesInfo!, /Серия 8.*Выходит/);
    assert.equal(film?.isPendingRelease, false);
    await Anixart.search('partial cache overwrite reproduction', 1);
    assert.match((await Anixart.getFilm(film!.link))?.seriesInfo!, /Серия 8/);
    assert.equal(details, 1);
  } finally { globalThis.fetch = saved; }
});
test('standalone Anixart films have no episodic poster status, including flat category metadata', () => {
  for (const status of [1, 2, 3]) {
    const single = { ...release, category: { id: 2, name: 'Фильм' }, episodes_released: 1, episodes_total: 1, status: { id: status, name: 'Вышел' } };
    assert.equal(anixartToCard(single).info, '');
    assert.equal(anixartToFilm(single).seriesInfo, '');
    assert.equal(anixartToCard({ ...single, category: undefined, category_id: 2 }).info, '');
  }
  assert.match(anixartToCard(release).info!, /Серия 2.*Выходит/);
  assert.match(anixartToCard({ ...release, status: { id: 1, name: 'Вышел' } }).info!, /Завершён/);
});
test('Anixart director opens a native paginated filmography rather than a missing Rezka person', async () => {
  const saved = globalThis.fetch;
  const calls: { url: string; body?: string }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), body: init?.body as string });
    return Response.json({ code: 0, content: [release], total_page_count: 3 });
  };
  try {
    const link = anixartToFilm({ ...release, director: 'Масухара Мицуюки' }).directors?.[0].link;
    assert.ok(link);
    const list = await Anixart.getFilms!(link, 2);
    assert.ok(calls[0].url.endsWith('/search/releases/1'));
    assert.deepEqual(JSON.parse(calls[0].body!), { query: 'Масухара Мицуюки', searchBy: 2 });
    assert.equal(list.totalPages, 3);
    assert.equal(list.films[0].id, 'ANIXART:' + release.id);
  } finally { globalThis.fetch = saved; }
});

test('Anixart studios and authors link to their own catalog search modes', async () => {
  const saved = globalThis.fetch;
  const modes: number[] = [];
  globalThis.fetch = async (_input, init) => { modes.push(JSON.parse(String(init?.body)).searchBy); return Response.json({ code: 0, content: [] }); };
  try {
    const film = anixartToFilm({ ...release, studio: 'Native Studio', author: 'Native Author' });
    assert.equal(film.studios?.[0].name, 'Native Studio');
    assert.equal(film.authors?.[0].name, 'Native Author');
    await Anixart.getFilms!(film.studios![0].link, 1);
    await Anixart.getFilms!(film.authors![0].link, 1);
    assert.deepEqual(modes, [1, 3]);
  } finally { globalThis.fetch = saved; }
});
