import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

import { isAnubisChallenge, parseChallenge, solvePow } from 'Util/Anubis/challenge';

const challengeData = {
  challenge: {
    id: 'b1946ac9-2b1a-4f3c-8d21-000000000001',
    randomData: '3f8a1c9e7b2d4f60',
    difficulty: 3,
  },
  rules: { algorithm: 'fast', difficulty: 3, report_as: 3 },
};

const sampleBody = `<!DOCTYPE html><html><head><title>Making sure you're not a bot!</title></head>
<body>
<script id="anubis_version" type="application/json">"1.25.0"</script>
<script id="anubis_challenge" type="application/json">${JSON.stringify(challengeData)}</script>
<script id="anubis_base_prefix" type="application/json">""</script>
<script async type="module" src="/.within.website/x/cmd/anubis/static/js/main.mjs"></script>
</body></html>`;

const normalBody =
  '<!DOCTYPE html><html><body><div class="b-content__inline_item">film</div></body></html>';

function sha256hex(input: string): string {
  return createHash('sha256').update(Buffer.from(input, 'ascii')).digest('hex');
}

test('isAnubisChallenge detects the interstitial and ignores normal pages', () => {
  assert.equal(isAnubisChallenge(sampleBody), true);
  assert.equal(isAnubisChallenge(normalBody), false);
});

test('parseChallenge extracts challenge fields, rules, and base prefix', () => {
  const c = parseChallenge(sampleBody);

  assert.ok(c, 'expected a parsed challenge');
  assert.equal(c.id, 'b1946ac9-2b1a-4f3c-8d21-000000000001');
  assert.equal(c.randomData, '3f8a1c9e7b2d4f60');
  assert.equal(c.algorithm, 'fast');
  assert.equal(c.difficulty, 3);
  assert.equal(c.basePrefix, '');
});

test('parseChallenge returns null for non-challenge HTML', () => {
  assert.equal(parseChallenge(normalBody), null);
});

test('solvePow finds a nonce whose hash has the required leading zero hex chars', () => {
  const randomData = '3f8a1c9e7b2d4f60';

  for (const difficulty of [1, 2, 3]) {
    const { nonce, hash } = solvePow(randomData, difficulty);

    assert.equal(hash, sha256hex(randomData + nonce), 'hash must match an independent SHA-256');
    assert.ok(
      hash.startsWith('0'.repeat(difficulty)),
      `hash ${hash} lacks ${difficulty} leading zeros`
    );
  }
});

test('solvePow returns the smallest satisfying nonce', () => {
  const randomData = 'deadbeef';
  const difficulty = 2;

  const { nonce } = solvePow(randomData, difficulty);

  for (let n = 0; n < nonce; n++) {
    assert.ok(
      !sha256hex(randomData + n).startsWith('00'),
      `nonce ${n} already satisfies but was skipped`
    );
  }
});
