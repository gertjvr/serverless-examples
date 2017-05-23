const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const paths = require('./paths')

const entries = fs.readdirSync(paths.appFunctions)
  .filter(filename => !filename.endsWith('.test.js'))
  .map(fileOrDirectory => ({
    name: fileOrDirectory,
    path: path.join(paths.appFunctions, fileOrDirectory),
  }))
  .filter(fileOrDirectory => fs.statSync(fileOrDirectory.path).isDirectory())
  .map(directory => ({
    [`${directory.name}`]: directory.path,
  }))
  .reduce((finalObject, entry) => Object.assign(finalObject, entry), {})

module.exports = {
  bail: true,
  devtool: 'source-map',
  entry: entries,
  output: {
    path: paths.appBuild,
    libraryTarget: 'commonjs',
    filename: '[name].js',
  },
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(paths.nodePaths),
    extensions: ['.js', '.ts', '.json'],
  },
  externals: [
    'aws-sdk', // aws-sdk included in Lambda
  ],
  module: {
    strictExportPresence: true,
    rules: [
      {
        parser: { requireEnsure: false },
      },
      {
        enforce: 'pre',
        test: /\.(ts)$/,
        loader: 'tslint-loader',
        include: paths.appSrc,
        options: {
          typeCheck: true,
        },
      },
      {
        enforce: 'pre',
        test: /\.(js)$/,
        loader: 'eslint-loader',
        include: paths.appSrc,
      },
      {
        test: /\.(ts)$/,
        use: [
          'babel-loader',
          'ts-loader',
        ],
        include: paths.appSrc,
      },
      {
        test: /\.(js)?$/,
        loader: 'babel-loader',
        include: paths.appSrc,
      },
      {
        test: /\.(json)$/,
        loader: 'json-loader',
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      },
      sourceMap: true,
    }),
  ],

  target: 'node',
}
