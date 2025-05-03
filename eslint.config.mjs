import { defineConfig, globalIgnores } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import _import from "eslint-plugin-import";
import functional from "eslint-plugin-functional";
import eslintComments from "eslint-plugin-eslint-comments";
import vtex from "eslint-plugin-vtex";
import reactHooks from "eslint-plugin-react-hooks";
import etc from "eslint-plugin-etc";
import reactPerf from "eslint-plugin-react-perf";
import reactCompiler from "eslint-plugin-react-compiler";
import reactNative from "eslint-plugin-react-native";
import stylisticJsx from "@stylistic/eslint-plugin-jsx";
import { fixupPluginRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/__mocks__/", "**/__tests__/**/*"]), {
    extends: compat.extends(
        "plugin:react/recommended",
        "plugin:react-native/all",
        "airbnb",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ),

    plugins: {
        "simple-import-sort": simpleImportSort,
        import: _import,
        functional,
        "eslint-comments": eslintComments,
        vtex,
        "react-hooks": fixupPluginRules(reactHooks),
        etc,
        "react-perf": reactPerf,
        "react-compiler": reactCompiler,
        "react-native": reactNative,
        "@stylistic/jsx": stylisticJsx,
    },

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    settings: {
        "import/resolver": {
            node: {
                extensions: [".ts", ".tsx"],
            },
        },
    },

    rules: {
        "react/react-in-jsx-scope": "off",
        "react-native/no-inline-styles": 0,
        "react-native/no-raw-text": 0,
        "react/prop-types": "off",
        "@stylistic/jsx/jsx-max-props-per-line": "warn",
        "@stylistic/jsx/jsx-closing-bracket-location": "warn",
        "@stylistic/jsx/jsx-child-element-spacing": "warn",
        "@stylistic/jsx/jsx-closing-tag-location": "warn",
        "@stylistic/jsx/jsx-equals-spacing": "warn",

        "@stylistic/jsx/jsx-newline": ["warn", {
            prevent: true,
        }],

        "no-multi-spaces": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "consistent-return": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-redundant-type-constituents": "warn",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
        "@typescript-eslint/no-misused-promises": "warn",
        "@typescript-eslint/ban-ts-comment": "warn",
        "react/no-unstable-nested-components": "warn",
        "react-compiler/react-compiler": "warn",
        "react-perf/jsx-no-new-object-as-prop": "off",
        "react-perf/jsx-no-new-array-as-prop": "off",
        "react-perf/jsx-no-new-function-as-prop": "warn",
        "react-perf/jsx-no-jsx-as-prop": "warn",
        "etc/no-commented-out-code": "off",
        "@typescript-eslint/no-unnecessary-condition": "warn",
        "react-hooks/rules-of-hooks": "warn",
        "react-hooks/exhaustive-deps": "warn",
        "vtex/consistent-props-type": "warn",
        "vtex/prefer-early-return": "warn",
        "no-restricted-exports": "off",
        "react/style-prop-object": "off",
        "linebreak-style": "off",

        "eslint-comments/require-description": ["off", {
            ignore: [],
        }],

        "functional/no-let": ["warn", {
            allowInForLoopInit: true,
        }],

        "prefer-const": "warn",
        "prefer-template": "warn",
        "simple-import-sort/imports": "warn",
        "simple-import-sort/exports": "warn",

        "no-else-return": ["warn", {
            allowElseIf: false,
        }],

        indent: "off",

        "jsx-a11y/label-has-associated-control": [2, {
            assert: "either",
        }],

        "default-param-last": "off",
        "@typescript-eslint/indent": [2, 2],
        "no-param-reassign": 0,
        "no-use-before-define": "off",
        "import/prefer-default-export": "off",
        "import/no-unresolved": "off",
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "jsx-a11y/anchor-is-valid": "off",
        "react/prefer-stateless-function": "off",
        "react/no-unused-prop-types": "off",
        "react/require-default-props": "off",
        "react/default-props-match-prop-types": "off",
        "react/static-property-placement": ["off"],
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-empty-function": "off",
        "import/extensions": ["off"],

        quotes: [2, "single", {
            avoidEscape: true,
        }],

        "react/jsx-filename-extension": [1, {
            extensions: [".ts", ".tsx"],
        }],

        "react/jsx-curly-spacing": ["error", {
            when: "always",

            children: {
                when: "always",
            },
        }],

        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "error",

        "import/no-extraneous-dependencies": ["error", {
            devDependencies: ["**/*.test.ts", "**/*.test.tsx"],
        }],

        "newline-before-return": "error",
        "react/jsx-key": "error",
        "class-methods-use-this": "off",
        "function-paren-newline": ["error", "consistent"],
        "prefer-regex-literals": "off",
        "global-require": "off",

        "react/function-component-definition": ["error", {
            namedComponents: ["arrow-function", "function-declaration", "function-expression"],
            unnamedComponents: ["arrow-function", "function-expression"],
        }],

        "react/jsx-props-no-spreading": "off",
    },
}, {
    files: ["**/*.test.ts", "**/*.test.tsx"],

    rules: {
        "no-restricted-syntax": ["off", "ForOfStatement"],
        "no-await-in-loop": "off",
        "react/jsx-props-no-spreading": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "react/jsx-no-constructed-context-values": "off",
    },
}]);