import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CommentTextType } from '../../src/type/Comment.interface';
import { getAnixartComments, normalizeAnixartComment } from '../../src/source/adapters/AnixartComments';
import { getAnixartRelease, rememberAnixartRelease } from '../../src/source/adapters/AnixartApi';

test('Anixart comments preserve authors, dates and spoiler protection without Rezka actions', () => {
  const comment = normalizeAnixartComment({ id: 7, profile: { login: 'Author', avatar: 'https://avatar.test/7' },
    message: 'Spoiler\nsecond line', timestamp: 1700000000, likes_count: 12, is_spoiler: true });
  assert.equal(comment.username, 'Author');
  assert.equal(comment.likes, 12);
  assert.equal(comment.text[0].type, CommentTextType.SPOILER);
  assert.equal(comment.text[0].text, 'Spoiler\nsecond line');
  assert.ok(comment.date);
  assert.equal(comment.isControls, false);
  assert.equal(comment.isDisabled, true);
});

test('Anixart comments paginate, cache, refresh and never overwrite release metadata', async () => {
  const saved = globalThis.fetch;
  const calls: string[] = [];
  rememberAnixartRelease({ id: 997109, title_ru: 'Real release', image: 'poster.jpg' });
  globalThis.fetch = async input => {
    calls.push(String(input));
    return Response.json({ code: 0, total_count: 790, total_page_count: 31,
      content: [{ id: 997109, profile: { login: 'User' }, message: 'Comment', timestamp: 1700000000 },
        { id: 88, message: 'Deleted', timestamp: 1700000000, is_deleted: true }] });
  };
  try {
    const link = 'https://anixart-app.com/release/997109';
    const first = await getAnixartComments(link, 1);
    assert.equal(first.totalPages, 32);
    assert.equal(first.items.length, 1);
    assert.ok(calls[0].endsWith('/release/comment/all/997109/0?sort=1'));
    await getAnixartComments(link, 1);
    assert.equal(calls.length, 1);
    await getAnixartComments(link, 2);
    assert.ok(calls[1].endsWith('/release/comment/all/997109/1?sort=1'));
    await getAnixartComments(link, 1, true);
    assert.equal(calls.length, 3);
    assert.equal((await getAnixartRelease('997109'))?.title_ru, 'Real release');
  } finally { globalThis.fetch = saved; }
});

test('Anixart comments reject foreign links before requesting an endpoint', async () => {
  await assert.rejects(getAnixartComments('https://rezka.test/release/1', 1), /Invalid Anixart link/);
});