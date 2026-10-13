import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDesktopRequest } from '../../src/windows/request.js';
test('Windows Rezka form posts carry the boundary used by the serialized body', async () => {
  const form = new FormData(); form.append('id', '123'); form.append('action', 'get_movie');
  const request = createDesktopRequest('https://example.com/ajax', { method: 'POST', body: form, headers: { 'Content-Type': 'multipart/form-data', 'X-Test': 'keep' }, redirect: 'manual', credentials: 'omit' });
  const boundary = request.headers.get('content-type')!.split('boundary=')[1];
  assert.ok(boundary);
  assert.ok((await request.text()).includes('--' + boundary));
  assert.equal(request.headers.get('x-test'), 'keep');
  assert.equal(request.redirect, 'manual'); assert.equal(request.credentials, 'omit');
});
test('Desktop transport restores Cookie and User-Agent removed by Chromium Request', async () => {
  const { desktopRequestHeaders } = await import('../../src/windows/request.js');
  const sanitized = { headers: new Headers({accept:'application/json'}) };
  const headers = desktopRequestHeaders(sanitized, { headers:{Cookie:'verification=current','User-Agent':'Lumen-UA'} });
  assert.equal(headers.cookie,'verification=current'); assert.equal(headers['user-agent'],'Lumen-UA');
  assert.equal(headers.accept,'application/json');
});

test('Desktop cookie jar can read all Set-Cookie values hidden by Chromium Response', async () => {
  const { preserveResponseCookies } = await import('../../src/windows/request.js');
  const response = new Response('body',{headers:{'content-type':'text/html'}});
  assert.equal(response.headers.get('set-cookie'),null);
  preserveResponseCookies(response,[['set-cookie','auth=token; Path=/'],['Set-Cookie','verification=; Max-Age=0']]);
  assert.equal(response.headers.get('Set-Cookie'),'auth=token; Path=/, verification=; Max-Age=0');
  assert.equal(response.headers.get('content-type'),'text/html'); assert.equal(await response.text(),'body');
});