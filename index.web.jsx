import React from 'react';
import { registerRootComponent } from 'expo';
import './src/windows/runtime';
import './src/windows/diagnostics';
const { App } = require('./src/App');
registerRootComponent(App);
