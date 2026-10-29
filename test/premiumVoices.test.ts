import assert from 'node:assert/strict';
import { test } from 'node:test';
import { visibleVoices, voicePremiumIcon } from '../src/component/PlayerVideoSelector/PlayerVideoSelector.voices';
import { FilmVoiceInterface } from '../src/type/FilmVoice.interface';
const paid = { id: 'paid', isPremium: true, premiumIcon: 'https://rezka.test/prem-icon.svg' } as FilmVoiceInterface;
const free = { id: 'free', isPremium: false } as FilmVoiceInterface;
test('Paid voices are optional and become visible as soon as refreshed metadata marks them free', () => {
  const original = [paid, free];
  assert.equal(visibleVoices(original, false), original);
  assert.deepEqual(visibleVoices(original, true), [free]);
  assert.deepEqual(visibleVoices([paid], true), []);
  assert.equal(original.length, 2);
  const released = { ...paid, isPremium: false, premiumIcon: undefined };
  assert.deepEqual(visibleVoices([released, free], true), [released, free]);
});
test('Windows paid badges render from an embedded SVG instead of a protected provider URL', () => {
  assert.match(voicePremiumIcon(paid, 'web')!, /^data:image\/svg\+xml,/);
  assert.equal(voicePremiumIcon(paid, 'android'), paid.premiumIcon);
  assert.equal(voicePremiumIcon(free, 'web'), undefined);
});