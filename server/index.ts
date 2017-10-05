import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import * as r from 'rethinkdb';
import { URL } from 'url';
import { ensureDbsExist, ensureTablesExist } from './db/helpers';

const ReGrid = require('rethinkdb-regrid');

dotenv.config();

let conn: r.Connection;
let bucket: any;

const app = express();
app.use(bodyParser.json());
app.use(compression());

app.get('/api/docs', (req, res, next) => {
  res.json({ status: 'OK' });
});

app.post('/api/docs', (req, res, next) => {
  res.json({ status: 'Yep.' });
});

app.put('/api/docs', (req, res, next) => {
  res.json({ status: 'Gotcha!' });
});

app.get('/api/images', async (req, res, next) => {
  const stream = bucket.listMetadata({});
  stream.toArray().then((result: any) => res.json(result));
  // stream.on('data', (data: any) => {
  //   console.log('data');
  // });
});

app.get('/api/images/:id', async (req, res, next) => {
  const record = await bucket.getMetadata(req.params.id);
  const rs = bucket.createReadStream({ id: req.params.id });
  res.set('Content-Type', record.metadata.contentType);
  res.set('X-Content-Name', record.metadata.filename);
  rs.pipe(res);
});

const upload = multer({ dest: 'uploads/' });
app.post('/api/images', upload.single('attachment'), async (req, res) => {
  console.info('Uploading:', req.file.originalname, req.file.mimetype, req.file);
  const id = await r.uuid().run(conn);
  const ws = bucket.createWriteStream({
    filename: id,
    metadata: {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      mark: true, // For garbage collection.
    },
  });
  fs.createReadStream(req.file.path).pipe(ws);
  ws.on('error', (e: any) => {
    console.error(e);
    fs.unlink(req.file.path, () => {
      res.status(500).json({ err: 'upload' });
    });
  });
  ws.on('finish', async () => {
    const fn = await bucket.getFile({ filename: id });
    // Delete the temp file.
    fs.unlink(req.file.path, () => {
      res.json({
        name: req.file.originalname,
        contentType: req.file.mimetype,
        id: fn.id,
      });
    });
  });
});

// Serve static client assets
app.use(express.static(path.resolve(__dirname, '../static')));

// Webpack client proxy
if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');
  const config = require('../webpack.config.js');

  config.entry.main.splice(0, 0, 'webpack/hot/dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new webpack.NamedModulesPlugin());

  const compiler = webpack(config);
  app.use(webpackMiddleware(compiler, {
    contentBase: path.resolve(__dirname, '..'),
    stats: 'minimal',
    hot: true,
    publicPath: '/dist/',
  }));
}

async function start() {
  const dbUrl = new URL(process.env.RETHINKDB_URL);
  // logger.info(`Connecting to RethinkDB at host: ${dbUrl.hostname}, port: ${dbUrl.port}`);
  conn = await r.connect({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port, 10),
  });
  await ensureDbsExist(conn, [process.env.DB_NAME]);
  await ensureTablesExist(conn, process.env.DB_NAME, [
    'docs',
    'images',
  ]);
  // await ensureIndicesExist(this.conn, process.env.DB_NAME, {
  //   projects: ['name'],
  //   memberships: ['project', 'user'],
  // });
  conn.use(process.env.DB_NAME);
  bucket = ReGrid({ db: process.env.DB_NAME });
  await bucket.initBucket();
  // this.middleware();
  // await this.routes();

  app.listen(process.env.PORT);
}

start();
