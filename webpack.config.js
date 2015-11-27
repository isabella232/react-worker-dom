var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: {
        'worker.js': './worker/index.js',
        'react-worker-dom.js': './page/index.js',
    },
    output: {
        filename: '[name]',
        path: path.join(__dirname, '../dist'),
    },
    devtool: 'source-map',
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react', 'stage-0'],
                cacheDirectory: true
            },
        }]
    }
};
