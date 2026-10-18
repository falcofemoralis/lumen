import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { componentStyles } from '../src/component/SettingBase/SettingBase.style.atv';

const require = createRequire(import.meta.url);
const compile = (path: string, resolve: (name: string) => unknown) => {
  const exports: any = {};
  const code = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  runInNewContext(code, { exports, require: (name: string) => name === 'react/jsx-runtime' ? require(name) : resolve(name) });
  return exports;
};

test('ATV setting focus has visible background and contrasting text', () => {
  const colors = { transparent: 'transparent', backgroundFocused: '#fff', textFocused: '#111' };
  const styles = componentStyles({ scale: (value: number) => value, colors, text: { sm: { fontSize: 16 } } } as any);
  assert.notEqual(styles.settingFocused.backgroundColor, colors.transparent);
  assert.equal(styles.settingTitleFocused.color, colors.textFocused);
  assert.equal(styles.settingSubtitleFocused.color, colors.textFocused);
});

test('TV pager position is independent of a mobile bottom preference', () => {
  let tv = true;
  const mod = compile('src/component/FilmPager/FilmPager.container.tsx', name => {
    if (name === 'Context/ConfigContext') return { useIsTV: () => tv, useConfigContext: () => ({ tvTabPosition: 'top' }) };
    return { __esModule: true, default: name };
  });
  assert.equal(mod.FilmPagerContainer({ tabPosition: 'bottom' }).props.tabPosition, 'top');
  tv = false;
  assert.equal(mod.FilmPagerContainer({ tabPosition: 'bottom' }).props.tabPosition, 'bottom');
});

test('Order editor can be embedded without replacing the settings page', () => {
  const mod = compile('src/component/NavigationOrderSetting/NavigationOrderSetting.component.tsx', name => {
    if (name === 'react') return { useMemo: (fn: Function) => fn(), useCallback: (fn: Function) => fn };
    if (name === 'Hooks/useThemedStyles') return { useThemedStyles: () => ({ buttonIcon: { width: 24, height: 24 } }) };
    if (name === 'Component/ThemedScrollView') return { ThemedScrollView: 'Scroll' };
    if (name === 'Component/Page') return { Page: 'Page' };
    if (name === 'Component/ThemedSafeArea') return { ThemedSafeArea: 'SafeArea' };
    if (name === 'Component/Header') return { Header: 'Header' };
    return {};
  });
  const props = { items: [], value: [], hiddenItems: [], onBack() {}, onChange() {}, onHiddenItemsChange() {} };
  assert.equal(mod.default({ ...props, embedded: true }).type, 'Scroll');
  assert.equal(mod.default(props).type, 'Page');
});

test('Sidebar focus opens the drawer and blur closes it; focused tab is highlighted', () => {
  let focusOptions: any, tab: any;
  const transitions: boolean[] = [];
  const styles = { tab: 'base', tabFocused: 'focused', tabSelected: 'selected', tabIcon: { width: 20 } };
  const mod = compile('src/component/NavigationBar/NavigationBar.component.atv.tsx', name => {
    if (name === 'react') return { memo: (fn: Function) => { tab = fn; return fn; }, useCallback: (fn: Function) => fn, useMemo: (fn: Function) => fn() };
    if (name.includes('norigin-spatial-navigation-react-native')) return { FocusContext: { Provider: 'Focus' }, useFocusable: (options: unknown) => { focusOptions = options; return { ref: null, focusKey: 'SIDEBAR' }; } };
    if (name === 'Context/NavigationContext') return { useNavigationContext: () => ({ isMenuOpen: false, toggleMenu: (open: boolean) => transitions.push(open) }) };
    if (name === 'Context/ServiceContext') return { useServiceContext: () => ({ badgeData: {}, isSignedIn: true }) };
    if (name === 'Context/ConfigContext') return { useConfigContext: () => ({ showAccountAvatar: true }) };
    if (name === 'Hooks/useThemedStyles') return { useThemedStyles: () => styles };
    if (name === 'react-native-safe-area-context') return { useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0 }) };
    if (name === 'Theme/context') return { useAppTheme: () => ({ scale: (v: number) => v, theme: { colors: { primary: '#ff8800', icon: '#aaa', text: '#eee' } } }) };
    if (name === 'react-native-reanimated') return { __esModule: true, default: { View: 'AnimatedView' } };
    if (name === 'react-native') return { View: 'View', Image: 'Image' };
    if (name === 'Component/ThemedPressable') return { ThemedPressable: 'Pressable' };
    if (name.endsWith('NavigationBar.style.atv')) return {};
    return {};
  });
  mod.NavigationBarComponent({ state: { index: 0, routes: [{ name: 'home', key: 'home' }] }, descriptors: { home: { options: {} } } });
  focusOptions.onFocus(); focusOptions.onBlur();
  assert.deepEqual(transitions, [true, false]);
  const iconColor = (active: boolean, focused: boolean, sidebarFocused: boolean) => {
    const item = tab({ styles, name: 'home', label: 'Home', IconComponent: 'Icon', badgeCount: 0, isActiveTab: active, isMenuOpened: true, hasSidebarFocus: sidebarFocused });
    assert.equal(item.props.focusOnPress, false);
    const rendered = item.props.children({ isFocused: focused });
    assert.equal(rendered.props.style, styles.tab);
    return rendered.props.children.props.children[0].props.children[0].props.color;
  };
  assert.equal(iconColor(true, false, false), '#ff8800');
  assert.equal(iconColor(true, false, true), '#aaa');
  assert.equal(iconColor(false, true, true), '#ff8800');

});
test('Disabled ATV pressables cannot be activated by the remote', () => {
  let options: any;
  let presses = 0;
  const mod = compile('src/component/ThemedPressable/ThemedPressable.component.atv.tsx', name => {
    if (name.includes('norigin-spatial-navigation')) return { useFocusable: (value: any) => { options = value; return { focusKey: 'disabled', focused: true, focusSelf() {} }; } };
    if (name.includes('ScrollContext')) return { useScrollContext: () => ({}) };
    if (name === 'Hooks/useDefaultFocus') return { useDefaultFocus() {} };
    if (name === 'Hooks/useLongEnterPress') return { useLongEnterPress() {} };
    if (name === 'Theme/context') return { useAppTheme: () => ({ theme: { colors: {} } }) };
    if (name === 'react-native') return { View: 'View', Platform: { OS: 'android' } };
    if (name === 'react-native-gesture-handler') return { Pressable: 'Pressable' };
    return {};
  });
  mod.ThemedPressableComponent({ disabled: true, onPress: () => presses++, children: null });
  options.onEnterPress?.();
  assert.equal(presses, 0);
  assert.equal(options.focusable, false);
  mod.ThemedPressableComponent({ disabled: false, onPress: () => presses++, children: null });
  options.onEnterPress?.();
  assert.equal(presses, 1);
  assert.equal(options.focusable, true);
});

test('ATV category rows expose a visible remote focus state', () => {
  const styles = { rowDrag: 'normal', rowDragFocused: 'focused', rowTitle: 'title', rowTextFocused: 'contrast' };
  const mod = compile('src/component/LocalCategoriesOverlay/LocalCategoriesOverlay.component.atv.tsx', name => {
    if (name === 'react') return { useState: () => [false, () => {}] };
    if (name === 'react-native') return { View: 'View' };
    if (name === 'Theme/context') return { useAppTheme: () => ({ scale: (n: number) => n, theme: { colors: { icon: '#aaa', iconFocused: '#000' } } }) };
    if (name === 'Hooks/useThemedStyles') return { useThemedStyles: () => styles };
    if (name === 'i18n/translate') return { t: (value: string) => value };
    if (name.startsWith('Component/')) { const key = name.split('/')[1]; return { [key]: key }; }
    return {};
  });
  const tree = mod.LocalCategoriesOverlayComponent({ categories: [{ id: 'one', title: 'Films', count: 1 }], mode: 'list' });
  const fragment = tree.props.children.props.children[1];
  const rowElement = fragment.props.children[0].props.children[1][0];
  const row = rowElement.type(rowElement.props);
  const pressable = row.props.children.props.children[0];
  assert.equal(typeof pressable.props.style, 'function');
  assert.ok(pressable.props.style({ isFocused: true }).includes('focused'));
  assert.equal(typeof pressable.props.children, 'function');
});
test('ATV buttons forward disabled state and list position to spatial navigation', () => {
  const mod = compile('src/component/ThemedButton/ThemedButton.component.atv.tsx', name => {
    if (name === 'Theme/context') return { useAppTheme: () => ({ scale: (n: number) => n, theme: { colors: {} } }) };
    if (name === 'Hooks/useThemedStyles') return { useThemedStyles: () => ({}) };
    if (name === 'Component/ThemedPressable') return { ThemedPressable: 'Pressable' };
    return {};
  });
  const extraProps = { index: 27 };
  const button = mod.default({ title: 'Episode 28', disabled: true, extraProps });
  assert.equal(button.props.disabled, true);
  assert.equal(button.props.extraProps, extraProps);
});
test('Recent grid actions distinguish remote focus from the other icons', () => {
  const mod = compile('src/screen/RecentScreen/RecentScreen.component.atv.tsx', name => {
    if (name === 'react') return { useMemo: (fn: Function) => fn(), useCallback: (fn: Function) => fn };
    if (name === 'react-native') return { View: 'View' };
    if (name === 'Theme/context') return { useAppTheme: () => ({ scale: (n: number) => n, theme: { colors: { button: '#222', backgroundFocused: '#fff', icon: '#aaa', iconFocused: '#000' } } }) };
    if (name === 'Hooks/useThemedStyles') return { useThemedStyles: () => ({}) };
    if (name === 'Context/ConfigContext') return { useConfigContext: () => ({ isLocalLibrary: true }) };
    if (name === 'Context/ServiceContext') return { useServiceContext: () => ({ isSignedIn: false }) };
    if (name === 'Util/Film') return { recentToFilmCard: (item: any) => item };
    if (name === 'i18n/translate') return { t: (value: string) => value };
    if (name.startsWith('Component/')) { const key = name.split('/')[1]; return { [key]: key }; }
    return {};
  });
  const film = { id: 'one' };
  const tree = mod.RecentScreenComponent({ displayMode: 'grid', items: [film] });
  const actions = tree.props.children[1].props.filmActions(film);
  for (const action of actions.props.children) {
    assert.equal(typeof action.props.style, 'function');
    assert.notDeepEqual(action.props.style({ isFocused: true }), action.props.style({ isFocused: false }));
    assert.equal(typeof action.props.children, 'function');
  }
});
test('Sidebar pointer presses can navigate without claiming remote focus', () => {
  let claims = 0, presses = 0;
  const mod = compile('src/component/ThemedPressable/ThemedPressable.component.atv.tsx', name => {
    if (name.includes('norigin-spatial-navigation')) return { useFocusable: () => ({ focusKey: 'sidebar', focused: false, focusSelf: () => claims++ }) };
    if (name.includes('ScrollContext')) return { useScrollContext: () => ({}) };
    if (name === 'Hooks/useDefaultFocus') return { useDefaultFocus() {} };
    if (name === 'Hooks/useLongEnterPress') return { useLongEnterPress() {} };
    if (name === 'Theme/context') return { useAppTheme: () => ({ theme: { colors: {} } }) };
    if (name === 'react-native') return { View: 'View', Platform: { OS: 'web' } };
    if (name === 'react-native-gesture-handler') return { Pressable: 'Pressable' };
    return {};
  });
  const suppressed = mod.ThemedPressableComponent({ focusOnPress: false, onPress: () => presses++ });
  suppressed.props.children[1].props.onPress();
  assert.equal(presses, 1);
  assert.equal(claims, 0);
  const normal = mod.ThemedPressableComponent({ onPress: () => presses++ });
  normal.props.children[1].props.onPress();
  assert.equal(presses, 2);
  assert.equal(claims, 1);
});