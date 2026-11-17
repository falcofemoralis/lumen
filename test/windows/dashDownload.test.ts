import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const { saveDash } = createRequire(import.meta.url)('../../windows/dash-download.cjs');

test('Windows DASH downloads both audio and video, expands negative timeline repeats and resumes locally', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lumen-windows-dash-'));
  const destination = join(directory, 'film.mp4'), requests: string[] = [];
  const manifest = '<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" type="static" mediaPresentationDuration="PT6S"><BaseURL>https://example.com/media/</BaseURL><Period>'
    + ['audio', 'video'].map(type => '<AdaptationSet contentType="' + type + '"><SegmentTemplate timescale="1" startNumber="5" initialization="$RepresentationID$/init.webm" media="$RepresentationID$/$Number%03d$.webm"><SegmentTimeline><S t="0" d="2" r="-1"/></SegmentTimeline></SegmentTemplate><Representation id="' + type + '" bandwidth="100"/></AdaptationSet>').join('')
    + '</Period></MPD>';
  const fetch = async (url: string) => { requests.push(url); return new Response(url.endsWith('.mpd') ? manifest : 'media'); };
  try {
    await saveDash('https://example.com/film.mpd', destination, fetch);
    const local = await readFile(destination, 'utf8');
    assert.ok(local.includes('<SegmentList'));
    assert.equal((local.match(/<SegmentURL /g) || []).length, 6);
    assert.equal((local.match(/<Initialization /g) || []).length, 2);
    assert.ok(!local.includes('https://') && !local.includes('SegmentTemplate'));
    assert.ok(requests.includes('https://example.com/media/audio/005.webm'));
    assert.ok(requests.includes('https://example.com/media/video/007.webm'));
    assert.equal(requests.length, 9);
    await saveDash('https://example.com/film.mpd', destination, fetch);
    assert.equal(requests.length, 10, 'resume reuses complete audio and video segments');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
