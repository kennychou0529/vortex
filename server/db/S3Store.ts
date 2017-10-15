import * as S3 from 'aws-sdk/clients/s3';
import * as cuid from 'cuid';
import * as express from 'express';
import * as fs from 'fs';
import ImageStore from './ImageStore';

export default class S3Store implements ImageStore {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      endpoint: process.env.STORAGE_DOMAIN
          ? `${process.env.STORAGE_REGION}.${process.env.STORAGE_DOMAIN}` : undefined,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.STORAGE_REGION,
    });
  }

  public async putImage(file: Express.Multer.File, res: express.Response) {
    const id = await this.newObjectId(process.env.STORAGE_BUCKET_IMAGES);
    this.s3.upload({
      ACL: 'public-read',
      Bucket: process.env.STORAGE_BUCKET_IMAGES,
      Key: id,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
      Metadata: {
        name: file.originalname,
        // Include owner hash
      },
    }, (err, data) => {
      if (err) {
        console.error(err);
        fs.unlink(file.path, () => {
          res.status(500).json({ error: 'upload-failed' });
        });
      } else {
        fs.unlink(file.path, () => {
          res.json({
            name: file.originalname,
            contentType: file.mimetype,
            url: data.Location,
          });
        });
      }
    });
  }

  // public async putDoc(doc: string, res: express.Response, docId?: string) {
  //   const id = docId || await this.newObjectId(process.env.STORAGE_BUCKET_DOCS);
  //   this.s3.upload({
  //     // ACL: 'public-read',
  //     Bucket: process.env.STORAGE_BUCKET_IMAGES,
  //     Key: id,
  //     Body: doc,
  //     ContentType: 'application/json',
  //     // Metadata: {
  //     //   name: file.originalname,
  //     //   // Include owner hash
  //     // },
  //   }, (err, data) => {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).json({ error: 'upload-failed' });
  //     } else {
  //       res.json({
  //         // name: file.originalname,
  //         // contentType: file.mimetype,
  //         id,
  //       });
  //     }
  //   });
  // }
  //
  // public async getDoc(id: string, res: express.Response): Promise<any> {
  //   this.s3.getObject({
  //     Bucket: process.env.STORAGE_BUCKET_DOCS,
  //     Key: id,
  //   }, (err, data) => {
  //     if (err) {
  //       if (err.code === 'NoSuchKey') {
  //         res.status(404).json({ error: 'not-found' });
  //       } else {
  //         res.status(500).json({ error: err.code });
  //       }
  //     } else {
  //       res.set('Content-Type', 'application/json');
  //       res.set('ContentLength', String(data.ContentLength));
  //       res.send(data.Body);
  //     }
  //   });
  // }

  // public async getImage(id: string, res: express.Response) {
  //   this.s3.getObject({
  //     Bucket: process.env.STORAGE_BUCKET,
  //     Key: id,
  //   }, (err, data) => {
  //     if (err) {
  //       if (err.code === 'NotFound') {
  //         res.status(404).json({ error: 'not-found' });
  //       } else {
  //         res.status(500).json({ error: err.code });
  //       }
  //     } else {
  //       console.log(data);
  //       // res.set('Content-Type', record.metadata.contentType);
  //       // res.set('X-Content-Name', record.metadata.filename);
  //     }
  //   });
  // }

  public newObjectId(bucket: string): Promise<string> {
    let attempts = 0;
    return new Promise((resolve, reject) => {
      const genId = () => {
        const id = cuid.slug();
        this.s3.headObject({
          Bucket: bucket,
          Key: id,
        }, (err, data) => {
          if (err) {
            if (err.code === 'NotFound') {
              resolve(id);
            } else {
              reject(err);
            }
          } else {
            // Object exists, try again
            console.debug('object', id, 'exists, retrying...');
            attempts += 1;
            if (attempts > 10) {
              reject(new Error('ID generation failed, too many attempts'));
            } else {
              genId();
            }
          }
        });
      };

      genId();
    });
  }
}
