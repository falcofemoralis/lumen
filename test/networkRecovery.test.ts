import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isChallengeCookie, isNetworkFailure } from '../src/util/NetworkRecovery';
import { hasFreshAnubisClearance, isCookieExpired } from '../src/util/Cookies/lifecycle';

test('network recovery recognizes transport failures, without retrying server blocks', () => {
  for (const message of ['Network request failed', 'TypeError: Network request failed', 'Failed to fetch']) {
    assert.equal(isNetworkFailure(new Error(message)), true);
  }
  for (const message of ['Service Temporarily Unavailable', 'Подозрительная активность с вашего IP-адреса', 'HTTP 403']) {
    assert.equal(isNetworkFailure(new Error(message)), false);
  }
});
test('challenge reset preserves account and application cookies', () => {
  for (const name of ['cf_clearance', '__cf_bm', 'cf_chl_2', 'techaro.lol-anubis-auth']) {
    assert.equal(isChallengeCookie(name), true);
  }
  for (const name of ['dle_user_id', 'dle_password', 'PHPSESSID', 'language']) {
    assert.equal(isChallengeCookie(name), false);
  }
});
test('clearance refused by server must renew even before its advertised expiry', () => {
  const name = 'techaro.lol-anubis-auth';
  const jar = { [name]: { name, value: 'old', expires: new Date(Date.now() + 86400000) } };
  assert.equal(hasFreshAnubisClearance(jar, name + '=old; language=ru'), false);
  jar[name].value = 'new';
  assert.equal(hasFreshAnubisClearance(jar, name + '=old'), true);
  jar[name].expires = new Date(0);
  assert.equal(hasFreshAnubisClearance(jar, name + '=old'), false);
});
test('verification cookies do not count as clearance and persisted expiry survives serialization', () => {
  assert.equal(hasFreshAnubisClearance({
    verification: { name: 'techaro.lol-anubis-cookie-verification', value: 'challenge' },
  }, ''), false);
  assert.equal(isCookieExpired(JSON.parse(JSON.stringify({ name: 'cf_clearance', value: 'old', expires: new Date(0) }))), true);
  assert.equal(isCookieExpired({ name: 'session', value: 'account' }), false);
});
test('server failures recover only after their cooldown, without refetching valid cached data', async () => {
  const { isRecoverableSourceFailure } = await import('../src/util/NetworkRecovery');
  const { SourceBlockedError } = await import('../src/util/Request/sourceFailure');
  const blocked = new SourceBlockedError('blocked');
  blocked.retryAt = 5000;
  assert.equal(isRecoverableSourceFailure(blocked, 4999), false);
  assert.equal(isRecoverableSourceFailure(blocked, 5000), true);
  assert.equal(isRecoverableSourceFailure(new Error('Not found'), 5000), false);
  assert.equal(isRecoverableSourceFailure(new Error('Network request failed'), 5000), true);
});
