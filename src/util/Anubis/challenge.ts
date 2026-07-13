import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

export interface AnubisChallenge {
  id: string;
  randomData: string;
  algorithm: string;
  difficulty: number;
  basePrefix: string;
}

export interface PowSolution {
  nonce: number;
  hash: string;
}

interface RawChallenge {
  challenge?: { id?: string; randomData?: string; difficulty?: number };
  rules?: { algorithm?: string; difficulty?: number };
}

const CHALLENGE_MARKER = 'anubis_challenge';
const ASSET_MARKER = '/.within.website/x/cmd/anubis/';

// Cheap guard so we only parse bodies that look like the Anubis interstitial.
export function isAnubisChallenge(body: string): boolean {
  return body.includes(CHALLENGE_MARKER) || body.includes(ASSET_MARKER);
}

// Anubis embeds its data with templ.JSONScript, which HTML-escapes '<','>','&'
// inside the JSON, so a non-greedy match up to the closing tag is safe.
function extractJsonScript(body: string, id: string): string | null {
  const re = new RegExp(`<script[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)</script>`, 'i');
  const match = body.match(re);

  return match ? match[1].trim() : null;
}

export function parseChallenge(body: string): AnubisChallenge | null {
  const raw = extractJsonScript(body, 'anubis_challenge');

  if (!raw) {
    return null;
  }

  let data: RawChallenge;

  try {
    data = JSON.parse(raw) as RawChallenge;
  } catch {
    return null;
  }

  const id = data.challenge?.id ?? '';
  const randomData = data.challenge?.randomData ?? '';
  const algorithm = data.rules?.algorithm ?? 'fast';
  // Difficulty lives in `rules`; `challenge.difficulty` is the value at issue time.
  const difficulty = Number(data.rules?.difficulty ?? data.challenge?.difficulty ?? 0);

  if (!id || !randomData || !Number.isFinite(difficulty)) {
    return null;
  }

  let basePrefix = '';
  const rawPrefix = extractJsonScript(body, 'anubis_base_prefix');

  if (rawPrefix) {
    try {
      const parsed = JSON.parse(rawPrefix) as unknown;

      basePrefix = typeof parsed === 'string' ? parsed : '';
    } catch {
      basePrefix = '';
    }
  }

  return { id, randomData, algorithm, difficulty, basePrefix };
}

// randomData is hex and the nonce is decimal digits, so both are pure ASCII;
// building bytes directly avoids depending on TextEncoder in the JS runtime.
function asciiBytes(input: string): Uint8Array {
  const out = new Uint8Array(input.length);

  for (let i = 0; i < input.length; i++) {
    out[i] = input.charCodeAt(i) & 0xff;
  }

  return out;
}

// Find the smallest nonce whose sha256(randomData + nonce) hex digest starts
// with `difficulty` leading '0' characters — the Anubis proof-of-work.
export function solvePow(randomData: string, difficulty: number): PowSolution {
  const prefix = '0'.repeat(Math.max(0, difficulty));

  for (let nonce = 0; ; nonce++) {
    const hash = bytesToHex(sha256(asciiBytes(randomData + nonce)));

    if (hash.startsWith(prefix)) {
      return { nonce, hash };
    }
  }
}
