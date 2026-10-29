import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const { saveHls } = createRequire(import.meta.url)('../../windows/hls-download.cjs');
test('Windows downloads HLS segments and encryption keys and rewrites them for offline playback', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lumen-windows-hls-'));
  const destination = join(directory, 'film.mp4'), requests: string[] = [];
  const fetch = async (url: string) => {
    requests.push(url);
    return new Response(url.endsWith('.m3u8')
      ? '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="key.bin"\n#EXTINF:5,\nsegment.ts\n#EXT-X-ENDLIST'
      : 'test-content');
  };
  try {
    await saveHls('https://example.com/video/index.m3u8', destination, fetch);
    const playlist = await readFile(destination, 'utf8');
    assert.ok(playlist.includes('film.mp4.parts/resource-0.bin'));
    assert.ok(playlist.includes('film.mp4.parts/resource-1.ts'));
    assert.equal(await readFile(join(destination + '.parts', 'resource-1.ts'), 'utf8'), 'test-content');
    assert.equal(requests.length, 3);
    await saveHls('https://example.com/video/index.m3u8', destination, fetch);
    assert.equal(requests.length, 4, 'a resumed download reuses complete media resources');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('Windows source IDs map to valid portable paths without leaving the download directory', () => {
  const { portablePath } = createRequire(import.meta.url)('../../windows/path.cjs');
  const root = join(tmpdir(), 'lumen-downloads');
  const result = portablePath(root, join(root, 'ANIXART:901', 'NUL.mp4'));
  assert.equal(result, join(root, 'ANIXART_901', '_NUL.mp4'));
  assert.throws(() => portablePath(root, join(root, '..', 'secret')), /outside granted directory/);
});
