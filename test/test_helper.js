/* eslint-env browser */
import path from 'path';
import { JSDOM } from 'jsdom';
import hook from 'css-modules-require-hook';
import sass from 'node-sass';

const { window } = new JSDOM('<!doctype html><html><body></body></html>');

global.document = window.document;
global.window = window;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

// Prevent mocha from interpreting CSS @import files
function noop() { return null; }

require.extensions['.css'] = noop;

hook({
  extensions: ['.scss'],
  preprocessCss: (css, filepath) => sass.renderSync({
    data: css,
    includePaths: [path.resolve(filepath, '..')],
  }).css,
});
