import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

const require = createRequire(import.meta.url);
function renderPager(tabPosition: string, menuTrailingComponent: unknown) {
  const exports: any = {};
  const code = ts.transpileModule(readFileSync('src/component/FilmPager/FilmPager.component.atv.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(code, { exports, require: (name: string) => {
    if (name === 'react/jsx-runtime') return require(name);
    if (name === 'react') return { memo: (value: unknown) => value, useCallback: (value: unknown) => value,
      useMemo: (value: () => unknown) => value(), useRef: (value: unknown) => ({ current: value }),
      useState: (value: any) => [typeof value === 'function' ? value() : value, () => {}],
      useEffect() {}, useId: () => 'id' };
    if (name === 'react-native') return { View: 'View' };
    if (name === 'react-native-pager-view') {
      return { usePagerView: () => ({ AnimatedPagerView: 'Pager', ref: { current: null } }) };
    }
    if (name === 'Theme/context') return { useAppTheme: () => ({ scale: (value: number) => value, theme: {} }) };
    if (name === 'Hooks/useThemedStyles') return { useThemedStyles: () => ({}) };

    return {};
  } });

  return exports.FilmPagerComponent({ tabPosition, menuTrailingComponent, onPreLoad() {}, onNextLoad() {},
    pagerItems: [{ menuItem: { id: 'completed', title: 'Completed' }, films: [], pagination: {} }] });
}
for (const placement of ['top', 'bottom']) {
  test(`last bookmark folder retains its title and manager at ${placement}`, () => {
    const tree = renderPager(placement, 'manager');
    assert.ok(tree.props.children[placement === 'top' ? 0 : 2]);
  });
}
function inputActions() {
  const text = readFileSync('src/component/ThemedInput/ThemedInput.component.atv.tsx', 'utf8');
  const file = ts.createSourceFile('Input.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ['onEnterPress', 'onBlur'].includes(node.name.getText(file))) {
      declarations.push(`const ${node.getText(file)};`);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  let blurs = 0, focuses = 0;
  const input = { blur: () => { blurs++; }, focus: () => { focuses++; } };
  const context: any = { Platform: { OS: 'web' }, editable: true, textInputRef: { current: input },
    TextInput: { State: { currentlyFocusedInput: () => input } }, useCallback: (value: unknown) => value,
    setTimeout: (fn: () => void) => fn() };
  runInNewContext(ts.transpileModule(`${declarations.join('\n')}\nglobalThis.actions = {onEnterPress, onBlur};`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);

  return { ...context.actions, counts: () => ({ blurs, focuses }) };
}
test('Windows text editing is not interrupted by delayed TV focus callbacks', () => {
  const actions = inputActions();
  actions.onEnterPress();
  actions.onBlur();
  assert.deepEqual(actions.counts(), { blurs: 0, focuses: 0 });
});
function updateFolders(previous: string[], next: string[], activeIndex: number, mobile = false) {
  const path = mobile ? 'FilmPager.component.tsx' : 'FilmPager.component.atv.tsx';
  const text = readFileSync('src/component/FilmPager/' + path, 'utf8');
  const file = ts.createSourceFile('Pager.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let effect: string | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText(file) === 'useEffect'
      && node.arguments[0]?.getText(file).includes('previousTabIds.current')) effect = node.getText(file);
    ts.forEachChild(node, visit);
  };
  visit(file);
  assert.ok(effect);
  const pages: number[] = [], selected: number[] = [];
  const context = { activeIndex, previousTabIds: { current: previous }, tabsKey: next.join('|'),
    pagerItems: next.map(id => ({ menuItem: { id } })), useEffect: (fn: () => void) => fn(),
    pagerViewRef: { current: { setPageWithoutAnimation: (index: number) => pages.push(index) } },
    updateActiveTab: (index: number) => selected.push(index), setActiveIndex() {} };
  const compiled = ts.transpileModule(effect, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, context);

  return { pages, selected };
}
test('folder deletion and reorder preserve the surviving selection instead of a stale index', () => {
  assert.deepEqual(updateFolders(['favorite', 'completed'], ['completed'], 1), { pages: [0], selected: [0] });
  assert.deepEqual(updateFolders(['favorite', 'completed'], ['completed'], 0), { pages: [0], selected: [0] });
  assert.deepEqual(updateFolders(['favorite', 'completed'], ['completed', 'favorite'], 1),
    { pages: [0], selected: [0] });
  assert.deepEqual(updateFolders(['completed'], ['completed'], 0), { pages: [], selected: [] });
});
test('compact interface also recovers a folder selection after deleting its neighbor', () => {
  assert.deepEqual(updateFolders(['favorite', 'completed'], ['completed'], 1, true), { pages: [0], selected: [0] });
});