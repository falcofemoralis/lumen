import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { isRecoverableSourceFailure } from '../src/util/NetworkRecovery';

function ratingsRequest(errorPage: boolean) {
  const text = readFileSync('src/api/RezkaApi/index.ts', 'utf8');
  const source = ts.createSourceFile('Rezka.ts', text, ts.ScriptTarget.Latest, true);
  let method: ts.MethodDeclaration | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isMethodDeclaration(node) && node.name.getText(source) === 'getFilmRatings') method = node;
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert.ok(method);
  const context: any = { Error, parseHtml: () => ({ querySelector: (selector: string) =>
    selector === '.error-code' && errorPage ? {} : null }) };
  runInNewContext(ts.transpileModule('globalThis.api = {' + method.getText(source) + '}', {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText, context);
  context.api.postRequest = async () => 'html';
  return context.api.getFilmRatings('123');
}

test('Rezka error pages remain retryable instead of caching absent ratings for a week', async () => {
  await assert.rejects(ratingsRequest(true), error => {
    assert.equal(isRecoverableSourceFailure(error), true);
    return true;
  });
});

test('a valid unrated title does not trigger repeated recovery requests', async () => {
  assert.equal(Object.keys(await ratingsRequest(false)).length, 0);
});
test('malformed Rezka detail responses remain recoverable instead of becoming a cached mismatch', async () => {
  const text = readFileSync('src/source/adapters/RezkaSourceAdapter.ts', 'utf8');
  const source = ts.createSourceFile('Adapter.ts', text, ts.ScriptTarget.Latest, true);
  let method: ts.MethodDeclaration | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isMethodDeclaration(node) && node.name.getText(source) === 'getFilm') method = node;
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert.ok(method);
  const context: any = { Error, RezkaApi: { getFilm: async () => ({ id: '', title: '' }) } };
  runInNewContext(ts.transpileModule('globalThis.api = {' + method.getText(source) + '}', {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText, context);
  await assert.rejects(context.api.getFilm('film'), error => {
    assert.equal(isRecoverableSourceFailure(error), true);
    return true;
  });
});
