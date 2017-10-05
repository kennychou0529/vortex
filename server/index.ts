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
const fallback = require('express-history-api-fallback');
const yeast = require('yeast');

dotenv.config();

let conn: r.Connection;
let bucket: any;

const app = express();
app.use(bodyParser.json());
app.use(compression());

app.get('/api/docs', async (req, res, next) => {
  res.json({ status: 'OK' });
});

app.get('/api/docs/:id', async (req, res, next) => {
  const doc = await r.table('docs').get(req.params.id).run(conn);
  res.json(doc);
});

app.post('/api/docs', async (req, res, next) => {
  // TODO: validate with ajv
  req.body.id = yeast.encode(await nextDocId());
  const result = await r.table('docs')
      .insert({
        name: req.body.name,
        data: req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run(conn);
  if (result.inserted === 1) {
    res.json({ id: req.body.id });
  } else {
    // Do something with the error
  }
});

app.put('/api/docs/:id', async (req, res, next) => {
  // TODO: validate with ajv
  const result = await r.table('docs')
      .replace({
        id: req.params.id,
        name: req.body.name,
        data: req.body,
        updatedAt: new Date(),
      })
      .run(conn);
  if (result.replaced === 1) {
    res.json({ id: req.params.id });
  } else {
    // Do something with the error
  }
});

app.get('/api/images', async (req, res, next) => {
  const stream = bucket.listMetadata({});
  stream.toArray().then((result: any) => res.json(result));
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

// Serve static client assets
const root = path.resolve(__dirname, '../static');
app.use(express.static(root));
app.use(fallback('index.html', { root }));

async function nextDocId() {
  // Increment the issue id counter.
  const resp: any = await r.table('global').get('0').update({
    nextDoc: r.row('nextDoc').add(1),
  }, {
    returnChanges: true,
  }).run(conn);

  if (resp.replaced !== 1) {
    console.error(resp);
    throw new Error('Error acquiring issue id.');
  }

  return resp.changes[0].new_val.nextDoc;
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
    'global',
  ]);
  conn.use(process.env.DB_NAME);
  bucket = ReGrid({ db: process.env.DB_NAME });
  await bucket.initBucket();

  await r.table('global')
      .insert({ id: '0', nextDoc: 10000 })
      .run(conn);

  app.listen(process.env.PORT);
}

start();
