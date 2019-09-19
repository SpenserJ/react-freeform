import { configure } from '@storybook/react';

const documentationStories = require.context('../docs', true, /\.stories\.(jsx?|mdx)$/);
const componentStories = require.context('../src', true, /stories\.(jsx?|mdx)$/);
const loadStories = () => ([
  documentationStories.keys().map(filename => documentationStories(filename)),
  componentStories.keys().map(filename => componentStories(filename)),
].flat());

// automatically import all files ending in *.stories.js
configure(loadStories, module);
