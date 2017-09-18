const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webpack.config.js');

const PORT = 9001;

config.plugins.push(new webpack.HotModuleReplacementPlugin());
config.plugins.push(new webpack.NamedModulesPlugin());

const compiler = webpack(config);
const server = new WebpackDevServer(compiler, {
  contentBase: __dirname,
  stats: 'minimal',
  hot: true,
  publicPath: '/dist/',
});
server.listen(PORT, 'localhost', () => {});
