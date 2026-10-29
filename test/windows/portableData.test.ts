import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const relocate = createRequire(import.meta.url)('../../windows/portable-data.cjs');

test('Portable Windows data restores nested cached posters and downloaded media after moving the EXE folder', async () => {
  const root = await mkdtemp(join(tmpdir(), 'lumen-portable-'));
  const oldRoot = join(tmpdir(), 'lumen-previous', 'data'), external = join(tmpdir(), 'external-media', 'movie.mp4');
  const poster = join(oldRoot, 'media-cache', 'poster.jpg'), movie = join(oldRoot, 'downloads', 'movie.mp4');
  try {
    await writeFile(join(root, 'portable-location.json'), JSON.stringify({ root: oldRoot }));
    await writeFile(join(root, 'config.json'), JSON.stringify({ bookmarks: JSON.stringify([{ poster }]) }));
    await writeFile(join(root, 'download-jobs.json'), JSON.stringify({ movie: { destination: movie }, external: { destination: external } }));
    relocate(root);
    const config = JSON.parse(await readFile(join(root, 'config.json'), 'utf8'));
    assert.equal(JSON.parse(config.bookmarks)[0].poster, join(root, 'media-cache', 'poster.jpg'));
    const downloads = JSON.parse(await readFile(join(root, 'download-jobs.json'), 'utf8'));
    assert.equal(downloads.movie.destination, join(root, 'downloads', 'movie.mp4'));
    assert.equal(downloads.external.destination, external);
  } finally { await rm(root, { recursive: true, force: true }); }
});
