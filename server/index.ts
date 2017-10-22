import * as Ajv from 'ajv';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as jwt from 'jwt-simple';
import * as multer from 'multer';
import * as passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GithubStrategy } from 'passport-github';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import * as path from 'path';
import { URL } from 'url';
import DocumentStore from './db/DocumentStore';
import DynamoDbStore from './db/DynamoDbStore';
import ImageStore from './db/ImageStore';
import RethinkDBStore from './db/RethinkDBStore';
import S3Store from './db/S3Store';

const fallback = require('express-history-api-fallback');
const graphSchema = require('./graph.schema.json');
const { redirectToHTTPS } = require('express-http-to-https');

dotenv.config();

let imageStore: ImageStore;
let docStore: DocumentStore;

const validator = new Ajv();
const validate = validator.compile(graphSchema);

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

function makeCallbackUrl(pathname: string, next?: string): string {
  const url = new URL(`http://placeholder`);
  if (process.env.USE_HTTPS) {
    url.protocol = 'https';
  }
  url.hostname = process.env.HOSTNAME;
  url.pathname = pathname;
  if (process.env.PUBLIC_PORT && process.env.PUBLIC_PORT !== '80') {
    url.port = process.env.PUBLIC_PORT;
  }
  if (next) {
    url.search = `next=${encodeURIComponent(next)}`;
  }
  return url.toString();
}

interface UserToken {
  id: string;
  displayName: string;
}

function createToken(emails: Array<{ value: string }>, displayName: string): UserToken {
  if (emails.length > 0) {
    const id = emails[0].value;
    return {
      id,
      displayName,
    };
  }
  return null;
}

const app = express();
app.use(redirectToHTTPS([/localhost:(\d{4})/]));
app.use(bodyParser.json());
app.use(compression());
app.use(passport.initialize());

app.get('/api/docs', async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err: any, user: UserToken, info: any) => {
    if (!user) {
      res.json([]);
      return;
    }
    docStore.listDocuments(user.id).then(docList => {
      res.json(docList);
    }, error => {
      res.status(500).json({ error: 'internal' });
    });
  })(req, res, next);
});

app.get('/api/docs/:id', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: UserToken, info: any) => {
    docStore.getDocument(req.params.id).then((doc: any) => {
      if (doc) {
        doc.ownedByUser = doc.creator === user.id;
        res.json(doc);
      } else {
        res.status(404).json({ error: 'not-found' });
      }
    }, error => {
      console.error(error);
      res.status(500).json({ error: 'internal' });
    });
  })(req, res, next);
});

app.post('/api/docs',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      if (!req.user) {
        res.status(401).json({ error: 'unauthorized' });
        return;
      }

      if (!validate(req.body)) {
        res.status(400).json({ error: 'validation-failed', details: validate.errors });
        return;
      }

      const id = await docStore.createDocument(req.body, req.user.id, req.user.displayName);
      if (id !== null) {
        res.json({ id });
      } else {
        res.status(500).end();
      }
    });

app.put('/api/docs/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      if (!req.user) {
        res.status(401).json({ error: 'unauthorized' });
        return;
      }

      if (!validate(req.body)) {
        res.status(400).json({ error: 'validation-failed', details: validate.errors });
        return;
      }

      const doc: any = await docStore.getDocument(req.params.id);
      if (!doc) {
        console.error('pre-fetch failed');
        res.status(404).json({ error: 'not-found' });
        return;
      }

      if (doc.creator !== req.user.id) {
        res.status(403).json({ error: 'forbidden' });
        return;
      }

      const replaced = await docStore.updateDocument(req.params.id, req.body);
      if (replaced) {
        res.json({ id: req.params.id });
      } else {
        // Do something with the error
        res.status(500).end();
      }
    });

app.get('/api/images/:id', async (req, res, next) => {
  if (imageStore) {
    //
  } else {
    // const record = await bucket.getMetadata(req.params.id);
    // const rs = bucket.createReadStream({ id: req.params.id });
    // res.set('Content-Type', record.metadata.contentType);
    // res.set('X-Content-Name', record.metadata.filename);
    // rs.pipe(res);
  }
});

const upload = multer({ dest: 'uploads/' });
app.post('/api/images', upload.single('attachment'), async (req, res) => {
  imageStore.putImage(req.file, res);
});

// Set up JWT strategy
passport.use(new JwtStrategy(jwtOpts, (payload: UserToken, done) => {
  done(null, payload);
}));

// Google OAuth2 login.
// TODO: This doesn't work because google doesn't allow dynamic callback urls.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: makeCallbackUrl('/auth/google/callback'),
  }, (accessToken, refreshToken, profile, done) => {
    const token = createToken(profile.emails, profile.displayName);
    if (token) {
      done(null, jwt.encode(token, jwtOpts.secretOrKey));
    } else {
      done(Error('missing email'));
    }
  }));

  app.get('/auth/google', (req, res, next) => {
    const options = {
      session: false,
      scope: ['openid', 'email', 'profile'],
      callbackURL: makeCallbackUrl('/auth/google/callback', req.query.next),
    };
    passport.authenticate('google', options as passport.AuthenticateOptions)(req, res, next);
  });

  app.get('/auth/google/callback',
    (req, res, next) => {
      const returnTo = req.query.next || '/';
      const options = {
        session: false,
        scope: ['openid', 'email', 'profile'],
        callbackURL: makeCallbackUrl('/auth/google/callback', req.query.next),
        successRedirect: `${returnTo}?session=${req.user}`,
        failureRedirect: '/',
        failureFlash: 'Login failed.',
      };
      passport.authenticate('google', options as passport.AuthenticateOptions)(req, res, next);
    },
    (req, res) => {
      res.redirect(`/?session=${req.user}`);
    });
}

// Github OAuth login.
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '',
  }, (accessToken, refreshToken, profile, done) => {
    const token = createToken(profile.emails, profile.displayName);
    if (token) {
      done(null, jwt.encode(token, jwtOpts.secretOrKey));
    } else {
      done(Error('missing email'));
    }
  }));

  app.get('/auth/github', (req, res, next) => {
    const options = {
      session: false,
      callbackURL: makeCallbackUrl('/auth/github/callback', req.query.next),
    };
    passport.authenticate('github', options as passport.AuthenticateOptions)(req, res, next);
  });

  app.get('/auth/github/callback',
    (req, res, next) => {
      passport.authenticate('github', {
        session: false,
        failureRedirect: '/',
        failureFlash: 'Login failed.',
      }, (err: any, user: string) => {
        if (err) {
          return next(err);
        }
        const returnTo = req.query.next || '/';
        if (returnTo.indexOf('?') >= 0) {
          res.redirect(`${returnTo}&session=${user}`);
        } else {
          res.redirect(`${returnTo}?session=${user}`);
        }
      })(req, res, next);
    });
}

// Facebook login.
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: makeCallbackUrl('/auth/facebook/callback'),
    profileFields: ['id', 'displayName'],
  }, (accessToken, refreshToken, profile, done) => {
    const token = { id: `facebook:${profile.id}`, displayName: profile.displayName };
    if (token) {
      done(null, jwt.encode(token, jwtOpts.secretOrKey));
    } else {
      done(Error('missing email'));
    }
  }));

  app.get('/auth/facebook', (req, res, next) => {
    // console.log(req.query);
    const options = {
      session: false,
      callbackURL: makeCallbackUrl('/auth/facebook/callback', req.query.next),
    };
    passport.authenticate('facebook', options as passport.AuthenticateOptions)(req, res, next);
  });

  app.get('/auth/facebook/callback',
    (req, res, next) => {
      // console.log('cb', req.url);
      const options = {
        session: false,
        failureRedirect: '/',
        failureFlash: 'Login failed.',
        callbackURL: makeCallbackUrl('/auth/facebook/callback', req.query.next),
      };
      passport.authenticate('facebook', options as passport.AuthenticateOptions,
      (err: any, user: string) => {
        if (err) {
          console.log('err', err);
          return next(err);
        }
        const returnTo = req.query.next || '/';
        if (returnTo.indexOf('?') >= 0) {
          res.redirect(`${returnTo}&session=${user}`);
        } else {
          res.redirect(`${returnTo}?session=${user}`);
        }
      })(req, res, next);
    });
}

// Webpack client proxy
if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');
  const config = require('../webpack.config.js');

  config.entry.main.splice(0, 0, 'webpack/hot/dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new webpack.NamedModulesPlugin());
  config.plugins.push(new webpack.DefinePlugin({
    __DEBUG__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  }));

  const compiler = webpack(config);
  app.use(webpackMiddleware(compiler, {
    contentBase: path.resolve(__dirname, '..'),
    stats: 'minimal',
    hot: true,
    publicPath: '/dist/',
  }));
} else {
  const client = path.resolve(__dirname, '../dist/client');
  app.use('/dist/', express.static(client));
}

// Serve static client assets
const root = path.resolve(__dirname, '../static');
app.use(express.static(root));
app.use(fallback('index.html', { root }));

async function start() {
  if (process.env.STORAGE_BUCKET_IMAGES) {
    imageStore = new S3Store();
  }

  if (process.env.AWS_DOC_REGION) {
    docStore = new DynamoDbStore();
    await docStore.init();
  } else if (process.env.RETHINKDB_URL) {
    docStore = new RethinkDBStore();
    await docStore.init();
  }

  console.info('Starting server on port:', process.env.PORT);
  app.listen(process.env.PORT);
  console.info('Server started.');
}

start();
