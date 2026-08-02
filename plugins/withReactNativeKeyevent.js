'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const config_plugins_1 = require('@expo/config-plugins');
const generateCode_1 = require('@expo/config-plugins/build/utils/generateCode');
const withIosAppDelegateImport = function (config) {
  // @ts-ignore
  return (0, config_plugins_1.withAppDelegate)(config, function (appDelegateConfig) {
    const newSrc = ['#import <RNKeyEvent.h>'];
    const merged = (0, generateCode_1.mergeContents)({
      tag: 'react-native-keyevent-import',
      src: appDelegateConfig.modResults.contents,
      newSrc: newSrc.join('\n'),
      anchor: '#import "AppDelegate.h"',
      offset: 1,
      comment: '//',
    });

    return { ...appDelegateConfig, modResults: merged };
  });
};
const withIosAppDelegateBody = function (config) {
  // @ts-ignore
  return (0, config_plugins_1.withAppDelegate)(config, function (appDelegateConfig) {
    const newSrc = [
      'RNKeyEvent *keyEvent = nil;',
      ' ',
      '- (NSMutableArray<UIKeyCommand *> *)keyCommands {',
      '  NSMutableArray *keys = [NSMutableArray new];',
      '   ',
      '  if (keyEvent == nil) {',
      '    keyEvent = [[RNKeyEvent alloc] init];',
      '  }',
      '   ',
      '  if ([keyEvent isListening]) {',
      '    NSArray *namesArray = [[keyEvent getKeys] componentsSeparatedByString:@","];',
      '     ',
      '    NSCharacterSet *validChars = [NSCharacterSet characterSetWithCharactersInString:'
        + '@"ABCDEFGHIJKLMNOPQRSTUVWXYZ"];',
      '     ',
      '    for (NSString* names in namesArray) {',
      '      NSRange  range = [names rangeOfCharacterFromSet:validChars];',
      '       ',
      '      if (NSNotFound != range.location) {',
      '        [keys addObject: [UIKeyCommand keyCommandWithInput:names '
        + 'modifierFlags:UIKeyModifierShift action:@selector(keyInput:)]];',
      '      } else {',
      '        [keys addObject: [UIKeyCommand keyCommandWithInput:names modifierFlags:0 action:@selector(keyInput:)]];',
      '      }',
      '    }',
      '  }',
      '   ',
      '  return keys;',
      '}',
      '',
      '- (void)keyInput:(UIKeyCommand *)sender {',
      '  NSString *selected = sender.input;',
      '  [keyEvent sendKeyEvent:selected];',
      '}',
    ];
    const merged = (0, generateCode_1.mergeContents)({
      tag: 'react-native-keyevent-body',
      src: appDelegateConfig.modResults.contents,
      newSrc: newSrc.join('\n'),
      anchor: '@implementation AppDelegate', // /#import "AppDelegate\.h"/g,
      offset: 1,
      comment: '//',
    });

    return { ...appDelegateConfig, modResults: merged };
  });
};
const withAndroidMainActivityImport = function (config) {
  // @ts-ignore
  return (0, config_plugins_1.withMainActivity)(config, function (mainActivityConfig) {
    const newSrc = [
      'import android.view.KeyEvent',
      'import com.github.kevinejohn.keyevent.KeyEventModule',
    ];
    const merged = (0, generateCode_1.mergeContents)({
      tag: 'react-native-keyevent-import',
      src: mainActivityConfig.modResults.contents,
      newSrc: newSrc.join('\n'),
      anchor: 'import',
      offset: 1,
      comment: '//',
    });

    return { ...mainActivityConfig, modResults: merged };
  });
};
const withAndroidMainActivityBody = function (config) {
  // @ts-ignore
  return (0, config_plugins_1.withMainActivity)(config, function (mainActivityConfig) {
    const newSrc = [
      'override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {',
      '  try {',
      '      KeyEventModule.getInstance().onKeyDownEvent(keyCode, event)',
      '  } catch (e: Exception) {',
      '      e.printStackTrace()',
      '  }',
      '',
      '  return super.onKeyDown(keyCode, event);',
      '}',
      '',
      'override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {',
      '  try {',
      '      KeyEventModule.getInstance().onKeyUpEvent(keyCode, event)',
      '  } catch (e: Exception) {',
      '      e.printStackTrace()',
      '  }',
      '',
      '  return super.onKeyUp(keyCode, event);',
      '}',
      '',
      'override fun onKeyMultiple(keyCode: Int, repeatCount: Int, event: KeyEvent): Boolean {',
      '    KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event)',
      '    return super.onKeyMultiple(keyCode, repeatCount, event)',
      '}',
      'override fun dispatchKeyEvent(event: KeyEvent): Boolean {',
      '    val keyCode = event.keyCode',
      '    if (keyCode == KeyEvent.KEYCODE_DPAD_CENTER || keyCode == KeyEvent.KEYCODE_ENTER) {',
      '        try {',
      '            when (event.action) {',
      '            KeyEvent.ACTION_DOWN -> KeyEventModule.getInstance().onKeyDownEvent(keyCode, event)',
      '            KeyEvent.ACTION_UP -> KeyEventModule.getInstance().onKeyUpEvent(keyCode, event)',
      '            }',
      '        } catch (e: Exception) {',
      '            e.printStackTrace()',
      '        }',
      '        return true',
      '    }',
      '    return super.dispatchKeyEvent(event)',
      '}',
    ];
    const merged = (0, generateCode_1.mergeContents)({
      tag: 'react-native-keyevent-body',
      src: mainActivityConfig.modResults.contents,
      newSrc: newSrc.join('\n'),
      anchor: 'class MainActivity',
      offset: 1,
      comment: '//',
    });

    return { ...mainActivityConfig, modResults: merged };
  });
};
const initPlugin = function (config) {
  let newConfig = withIosAppDelegateImport(config);

  newConfig = withIosAppDelegateBody(newConfig);
  newConfig = withAndroidMainActivityImport(newConfig);
  newConfig = withAndroidMainActivityBody(newConfig);

  return newConfig;
};
exports.default = initPlugin;
