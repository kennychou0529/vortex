import * as S3 from 'aws-sdk/clients/s3';
import * as cuid from 'cuid';
import * as express from 'express';
import * as fs from 'fs';
import Storage from './Storage';

export default class S3Storage implements Storage {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      endpoint: process.env.STORAGE_DOMAIN
          ? `${process.env.STORAGE_REGION}.${process.env.STORAGE_DOMAIN}` : undefined,
      accessKeyId: process.env.STORAGE_ACCESS_KEY,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      region: process.env.STORAGE_REGION,
    });
  }

  public newImageId(): Promise<string> {
    let attempts = 0;
    return new Promise((resolve, reject) => {
      const genId = () => {
        const id = cuid.slug();
        this.s3.headObject({
          Bucket: process.env.STORAGE_BUCKET,
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
              reject(new Error('Image ID generation failed, too many attempts'));
            } else {
              genId();
            }
          }
        });
      };

      genId();
    });
  }

  public async putImage(file: Express.Multer.File, res: express.Response) {
    const id = await this.newImageId();
    this.s3.upload({
      ACL: 'public-read',
      Bucket: process.env.STORAGE_BUCKET,
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
        res.status(500).json({ error: 'upload-failed' });
      } else {
        res.json({
          name: file.originalname,
          contentType: file.mimetype,
          url: data.Location,
        });
      }
    });
  }

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
  //       // rs.pipe(res);
  //       //
  //       // resolve({
  //       //   contentLength: data.ContentLength,
  //       //   contentType: data.ContentType,
  //       // });
  //     }
  //   });
  // }
}
