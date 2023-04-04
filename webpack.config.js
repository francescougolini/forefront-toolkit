const path = require('path');
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'forefront-toolkit-0.4.99-dev.js',
    library: 'ft',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: path.resolve(__dirname, 'dist'), 
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  mode: 'development',
  plugins: [
    new webpack.BannerPlugin({banner: 'Copyright (c) 2021-2023 Francesco Ugolini <contact@francescougolini.com> \nSPDX-License-Identifier: MPL-2.0'})
  ]
};

