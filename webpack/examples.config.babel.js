const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const common = {
  entry: {
    app: [path.join(__dirname, '../examples/index.jsx')],
  },

  output: {
    path: path.join(__dirname, '../examples/public'),
    filename: 'examples.js',
    publicPath: '/examples/public',
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react-freeform': path.join(__dirname, '../src'),
    },
  },

  plugins: [],
};

const hotReload = {
  entry: {
    app: ['react-hot-loader/patch'],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },

  devServer: {
    host: '0.0.0.0',
    port: 3000,
    public: 'localhost:3000',
    historyApiFallback: {
      rewrites: [
        { from: /./, to: '/examples/index.html' },
      ],
    },
  },
  devtool: 'cheap-module-eval-source-map',

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
};

const css = {
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap'],
      },
    ],
  },
};

module.exports = merge.smartStrategy({ 'module.rules': 'prepend' })(common, hotReload, css);
