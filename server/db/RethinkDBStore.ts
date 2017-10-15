import * as express from 'express';
import * as r from 'rethinkdb';
import DocumentStore, { Document, DocumentListEntry, GraphData } from './DocumentStore';
import { ensureDbsExist, ensureTablesExist } from './helpers';
import ImageStore from './ImageStore';

const yeast = require('yeast');

// function sleep(ms: number): Promise<any> {
//   return new Promise((resolve, reject) => {
//     setTimeout(resolve, ms);
//   });
// }

export default class RethinkDBStore implements DocumentStore, ImageStore {
  private conn: r.Connection;

  public async init(): Promise<any> {
    const dbUrl = new URL(process.env.RETHINKDB_URL);
    console.info(`Connecting to RethinkDB at host: ${dbUrl.hostname}, port: ${dbUrl.port}`);
    this.conn = await r.connect({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10),
    });

    console.info('Database onnection successful.');
    await ensureDbsExist(this.conn, [process.env.DB_NAME]);
    await ensureTablesExist(this.conn, process.env.DB_NAME, [
      'docs',
      'global',
    ]);
    this.conn.use(process.env.DB_NAME);

    // For storing images
    // bucket = ReGrid({ db: process.env.DB_NAME });
    // await bucket.initBucket();
    // return Promise.resolve();

    await r.table('global')
        .insert({ id: '0', nextDoc: 100000 })
        .run(this.conn);
  }

  public async listDocuments(user: string): Promise<DocumentListEntry[]> {
    const docs = await (await r.table('docs').filter({ creator: user }).run(this.conn)).toArray();
    if (docs) {
      return docs.map(d => ({
        id: d.id,
        name: d.name,
        created: d.created,
        updated: d.updated,
      }));
    } else {
      return [];
    }
  }

  public getDocument(id: string): Promise<Document> {
    return r.table('docs').get(id).run(this.conn) as Promise<any>;
  }

  public async createDocument(data: GraphData, user: string, userName: string): Promise<string> {
    const id = yeast.encode(await this.nextDocId());
    const result = await r.table('docs')
        .insert({
          id,
          name: data.name,
          data,
          creator: user,
          creatorName: userName,
          created: new Date(),
          updated: new Date(),
        })
        .run(this.conn);
    if (result.inserted === 1) {
      return id;
    } else {
      // Do something with the error
      console.log(result);
      return null;
    }
  }

  public async updateDocument(docId: string, data: GraphData): Promise<boolean> {
    const result = await r.table('docs').get(docId).update({
        name: data.name,
        data,
        updatedAt: new Date(),
      })
      .run(this.conn);
    return result.replaced === 1;
  }

  public putImage(file: Express.Multer.File, res: express.Response): void {
  //   const id = await r.uuid().run(conn);
  //   const ws = bucket.createWriteStream({
  //     filename: id,
  //     metadata: {
  //       filename: req.file.originalname,
  //       contentType: req.file.mimetype,
  //       mark: true, // For garbage collection.
  //     },
  //   });
  //   fs.createReadStream(req.file.path).pipe(ws);
  //   ws.on('error', (e: any) => {
  //     console.error(e);
  //     fs.unlink(req.file.path, () => {
  //       res.status(500).json({ err: 'upload' });
  //     });
  //   });
  //   ws.on('finish', async () => {
  //     const fn = await bucket.getFile({ filename: id });
  //     // Delete the temp file.
  //     fs.unlink(req.file.path, () => {
  //       res.json({
  //         name: req.file.originalname,
  //         contentType: req.file.mimetype,
  //         id: fn.id,
  //       });
  //     });
  //   });
  }

  private async nextDocId() {
    // Increment the issue id counter.
    const resp: any = await r.table('global').get('0').update({
      nextDoc: r.row('nextDoc').add(1),
    }, {
      returnChanges: true,
    }).run(this.conn);

    if (resp.replaced !== 1) {
      console.error(resp);
      throw new Error('Error acquiring issue id.');
    }

    return resp.changes[0].new_val.nextDoc;
  }
}
