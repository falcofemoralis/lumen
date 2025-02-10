"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_plugins_1 = require("@expo/config-plugins");
var generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
var withIosAppDelegateImport = function (config) {
    // @ts-ignore
    var newConfig = (0, config_plugins_1.withAppDelegate)(config, function (config) {
        var newSrc = ['#import <RNKeyEvent.h>'];
        var newConfig = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-import',
            src: config.modResults.contents,
            newSrc: newSrc.join('\n'),
            anchor: "#import \"AppDelegate.h\"",
            offset: 1,
            comment: '//',
        });
        return __assign(__assign({}, config), { modResults: newConfig });
    });
    return newConfig;
};
var withIosAppDelegateBody = function (config) {
    // @ts-ignore
    var newConfig = (0, config_plugins_1.withAppDelegate)(config, function (config) {
        var newSrc = [
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
            '    NSCharacterSet *validChars = [NSCharacterSet characterSetWithCharactersInString:@"ABCDEFGHIJKLMNOPQRSTUVWXYZ"];',
            '     ',
            '    for (NSString* names in namesArray) {',
            '      NSRange  range = [names rangeOfCharacterFromSet:validChars];',
            '       ',
            '      if (NSNotFound != range.location) {',
            '        [keys addObject: [UIKeyCommand keyCommandWithInput:names modifierFlags:UIKeyModifierShift action:@selector(keyInput:)]];',
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
        var newConfig = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-body',
            src: config.modResults.contents,
            newSrc: newSrc.join('\n'),
            anchor: "@implementation AppDelegate", // /#import "AppDelegate\.h"/g,
            offset: 1,
            comment: '//',
        });
        return __assign(__assign({}, config), { modResults: newConfig });
    });
    return newConfig;
};
var withAndroidMainActivityImport = function (config) {
    // @ts-ignore
    var newConfig = (0, config_plugins_1.withMainActivity)(config, function (config) {
        var newSrc = [
            'import android.view.KeyEvent',
            'import com.github.kevinejohn.keyevent.KeyEventModule',
        ];
        var newConfig = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-import',
            src: config.modResults.contents,
            newSrc: newSrc.join('\n'),
            anchor: "import",
            offset: 1,
            comment: '//',
        });
        return __assign(__assign({}, config), { modResults: newConfig });
    });
    return newConfig;
};
var withAndroidMainActivityBody = function (config) {
    // @ts-ignore
    var newConfig = (0, config_plugins_1.withMainActivity)(config, function (config) {
        var newSrc = [
            'override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {',
            '  KeyEventModule.getInstance().onKeyDownEvent(keyCode, event)',
            '',
            '  return super.onKeyDown(keyCode, event);',
            '}',
            '',
            'override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {',
            '  KeyEventModule.getInstance().onKeyUpEvent(keyCode, event)',
            '',
            '  return super.onKeyUp(keyCode, event);',
            '}',
            '',
            'override fun onKeyMultiple(keyCode: Int, repeatCount: Int, event: KeyEvent): Boolean {',
            '    KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event)',
            '    return super.onKeyMultiple(keyCode, repeatCount, event)',
            '}',
        ];
        var newConfig = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-body',
            src: config.modResults.contents,
            newSrc: newSrc.join('\n'),
            anchor: "class MainActivity",
            offset: 1,
            comment: '//',
        });
        return __assign(__assign({}, config), { modResults: newConfig });
    });
    return newConfig;
};
var initPlugin = function (config) {
    config = withIosAppDelegateImport(config);
    config = withIosAppDelegateBody(config);
    config = withAndroidMainActivityImport(config);
    config = withAndroidMainActivityBody(config);
    return config;
};
exports.default = initPlugin;
