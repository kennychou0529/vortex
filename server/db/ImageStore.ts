import * as express from 'express';
import 'multer';

export default interface ImageStore {
  putImage(file: Express.Multer.File, res: express.Response): void;
}
