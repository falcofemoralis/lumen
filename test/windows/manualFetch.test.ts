import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
const manualFetch = createRequire(import.meta.url)('../../windows/manual-fetch.cjs');
test('Manual challenge redirect retains every Set-Cookie and never follows the redirect', async () => {
  let followed = 0;
  const server = createServer((req,res) => {
    if(req.url === '/after') { followed++; res.end('followed'); return; }
    assert.equal(req.headers.cookie, 'verification=current');
    res.writeHead(302, { Location:'/after', 'Set-Cookie':['techaro.lol-anubis-auth-suffix=clearance; Path=/','verification=; Max-Age=0'] }); res.end();
  });
  await new Promise<void>(resolve => server.listen(0,'127.0.0.1',resolve));
  try {
    const port = (server.address() as any).port;
    const result = await manualFetch('http://127.0.0.1:'+port, {headers:{Cookie:'verification=current'}, credentials:'omit'});
    assert.equal(result.status,302);
    assert.match(result.headers.get('set-cookie')!, /anubis-auth-suffix=clearance/);
    assert.match(result.headers.get('set-cookie')!, /verification=; Max-Age=0/);
    assert.equal(followed,0);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(()=>resolve())); }
});