const path = require('path')
const fs = require('fs')
const webpack = require('webpack')

const appPath = fs.realpathSync(process.cwd())
const resolveApp = relativePath =>
    path.resolve(appPath, relativePath)

const nodeModules = resolveApp('node_modules')
const src = resolveApp('src')
const functions = resolveApp('src/functions')

const entries = fs.readdirSync(functions)
    .filter(filename => !filename.endsWith('.test.js'))
    .map(fileOrDirectory => ({
        name: fileOrDirectory,
        path: path.join(functions, fileOrDirectory),
    }))
    .filter(fileOrDirectory => fs.statSync(fileOrDirectory.path).isDirectory())
    .map(directory => ({
        [`${directory.name}`]: directory.path,
    }))
    .reduce((finalObject, entry) => Object.assign(finalObject, entry), {})

const rules = []

if (process.env.NODE_ENV !== 'production') {
    rules.push({
        enforce: 'pre',
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: nodeModules,
    })
}

rules.push({
    test: /\.js?$/,
    loader: 'babel-loader',
    exclude: nodeModules,
    options: {
        presets: [
            ['env', {
                targets: {
                    node: 4.3,
                },
            }],
        ],
        plugins: [
            'transform-class-properties',
            'transform-object-rest-spread',
            'transform-runtime',
        ],
    },
})

rules.push({
    test: /\.json$/,
    loader: 'json-loader',
})

module.exports = {
    entry: entries,
    output: {
        libraryTarget: 'commonjs',
        path: resolveApp('.webpack'),
        filename: '[name].js',
    },

    externals: [
        'aws-sdk', // aws-sdk included in Lambda
        'vertx',
    ],

    resolve: {
        modules: ['node_modules', src],
        extensions: ['.js', '.json'],
    },

    resolveLoader: {
        modules: [
            nodeModules,
        ],
    },

    module: {
        rules,
    },

    plugins: [
        new webpack.SourceMapDevToolPlugin({
            test: /\.js$/,
            moduleFilenameTemplate: '[absolute-resource-path]',
            fallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
            filename: '[file].map',
            sourceRoot: '/',
        }),
        // new webpack.optimize.UglifyJsPlugin(),
        new webpack.IgnorePlugin(/\.(css|less)$/),
    ],

    target: 'node',
}
