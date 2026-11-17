import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

function filmQuery() {
  const text = readFileSync('src/screen/FilmScreen/FilmScreen.container.tsx', 'utf8');
  const source = ts.createSourceFile('Film.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let query: ts.Node | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'useQuery') {
      const options = node.arguments[0];
      if (options && ts.isObjectLiteralExpression(options)
        && options.properties.some(p => ts.isPropertyAssignment(p)
          && p.name.getText(source) === 'queryKey' && p.initializer.getText(source) === 'filmQueryKey')) {
        const property = options.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(source) === 'queryFn');
        if (property && ts.isPropertyAssignment(property)) query = property.initializer;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert.ok(query);
  const native = { id: 'zona', link: 'zona-link', voices: [], ratings: [{ name: 'Zona', rating: 8 }] };
  const supplemental = { id: 'rezka', voices: [{ id: '7', title: 'Voice' }] };
  let cached: any = { ...native, metadataSourceFilm: supplemental,
    ratings: [{ name: 'IMDb', rating: 7 }] };
  const context: any = {
    link: native.link, filmQueryKey: ['film', native.link], isLocalLibrary: false, isSignedIn: false,
    currentService: {}, isSourceEnabled: () => true, sourceForLink: () => 'ZONA',
    updateFilmVoiceData: async () => undefined,
    queryClient: { setQueryData: (_key: unknown, update: any) => { cached = typeof update === 'function' ? update(cached) : update; },
      getQueryData: () => cached },
    sourceRouter: { loadFilm: async () => native, resolvePreferredFilm: async (_film: unknown, recover: boolean) => {
      assert.equal(recover, true);
      throw new Error('Network request failed');
    } },
  };
  runInNewContext(ts.transpileModule('globalThis.run = ' + query.getText(source), {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText, context);
  return { context, data: () => cached, supplemental, native };
}

test('a failed supplemental refresh preserves visible Rezka metadata and ratings while remaining retryable', async () => {
  const query = filmQuery();
  await assert.rejects(query.context.run(), /Network request failed/);
  assert.equal(query.data().metadataSourceFilm, query.supplemental);
  assert.equal(query.data().ratings[0].name, 'IMDb');
  assert.equal(query.data().link, query.native.link);
  query.context.sourceRouter.resolvePreferredFilm = async () => ({ ...query.native, metadataSourceFilm: { id: 'rezka-new' } });
  const recovered = await query.context.run();
  assert.equal(recovered.metadataSourceFilm.id, 'rezka-new');
});