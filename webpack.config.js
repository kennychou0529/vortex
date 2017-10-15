const webpack = require('webpack');
const path = require('path');

const debug = process.env.NODE_ENV !== 'production';

module.exports = {
  context: __dirname,
  entry: {
    main: [ './src/index.tsx' ],
  },
  output: {
    path: path.resolve(__dirname, 'dist/client'),
    publicPath: '/dist/',
    filename: '[name].bundle.js',
    chunkFilename: '[name]-[chunkhash].js',
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'client/src'),
    ],
    extensions: ['.ts', '.js', '.tsx'],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({ minimize: !debug, debug }),
  ],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      { // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        enforce: 'pre',
        test: /\.js$/,
        include: [ path.resolve(__dirname, 'src') ],
        loader: 'source-map-loader',
      },
      {
        test: /\.(glsl|vs|fs)$/, // WebGL shaders
        loader: 'webpack-glsl-loader'
      },
      {
        test: /\.scss$/, // SASS
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader'
      }
    ],
  },
};
