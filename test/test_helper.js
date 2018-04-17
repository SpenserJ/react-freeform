/* eslint-env browser */
import path from 'path';
import { JSDOM } from 'jsdom';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const { window } = new JSDOM('<!doctype html><html><body></body></html>');

global.document = window.document;
global.window = window;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});
