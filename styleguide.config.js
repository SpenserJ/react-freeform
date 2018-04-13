const path = require('path');
const reactDoc = require('library-utils/react-doc');

module.exports = {
  components: 'src/**/*.jsx',
  webpackConfig: require('./webpack/examples.config.babel.js'),
  getComponentPathLine: (filePath) => {
    const componentDirName = path.dirname(filePath);
    const componentSourcesFileName = path.basename(filePath, '.jsx');
    const importPath = componentSourcesFileName === 'index'
      ? `${componentDirName}/`
      : `${componentDirName}/${componentSourcesFileName}`;
    const componentName = componentSourcesFileName === 'index'
      ? componentDirName.split(path.sep).pop()
      : componentSourcesFileName;
    return `import ${componentName} from 'react-freeform/${importPath}';`;
  },
  propsParser: filePath => reactDoc(filePath),
  skipComponentsWithoutExample: true,
};
