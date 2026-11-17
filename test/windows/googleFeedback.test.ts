import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';

test('Windows Google sign-in presents the host failure to the user instead of silently logging it', async () => {
  class Element {
    id = ''; textContent = ''; style = { cssText: '' };
    children: Element[] = []; attributes: Record<string, string> = {}; removed = false;
    parent?: Element;
    setAttribute(key: string, value: string) { this.attributes[key] = value; }
    append(...items: Element[]) { items.forEach(item => this.appendChild(item)); }
    appendChild(item: Element) { item.parent = this; this.children.push(item); }
    remove() { this.removed = true; if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
    focus() {}
  }
  const body = new Element();
  const descendants = (element: Element): Element[] => [element, ...element.children.flatMap(descendants)];
  let unsubscribed = false;
  const context = vm.createContext({
    document: { body, createElement: () => new Element(), getElementById: (id: string) => descendants(body).find(e => e.id === id) },
    window: { lumen: {
      googleCurrent: () => null,
      onGooglePhase: () => () => { unsubscribed = true; },
      googleSignIn: async () => { throw new Error('Fixture: Desktop OAuth client is missing'); },
    } },
  });
  const source = fs.readFileSync(new URL('../../src/windows/google.js', import.meta.url), 'utf8');
  vm.runInContext(source.replaceAll('export const ', 'const ') + '\nglobalThis.google = GoogleOneTapSignIn;', context);
  await assert.rejects(context.google.signIn(), /Desktop OAuth client is missing/);
  const alert = descendants(body).find(e => e.attributes.role === 'alert');
  assert.equal(alert?.textContent, 'Fixture: Desktop OAuth client is missing');
  assert.equal(unsubscribed, true);
  assert.ok(descendants(body).find(e => e.textContent === 'Закрыть'));
});
