const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webpack.config.js');
const dotenv = require('dotenv');

dotenv.config();

const PORT = 9001;

config.entry.main.splice(0, 0, 'webpack/hot/dev-server');
config.plugins.push(new webpack.HotModuleReplacementPlugin());
config.plugins.push(new webpack.NamedModulesPlugin());

const compiler = webpack(config);
const server = new WebpackDevServer(compiler, {
  contentBase: __dirname,
  stats: 'minimal',
  hot: true,
  publicPath: '/dist/',
  proxy: {
    '/api': {
      target: `http://localhost:${process.env.PORT}`,
      secure: false
    }
  }
});
server.listen(PORT, 'localhost', () => {});
