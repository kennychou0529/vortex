import * as express from 'express';
import 'multer';

export default interface Storage {
  // newGraphId(): Promise<string>;
  // putGraph(graph: any, res: express.Response): void;
  // getGraph(id: string, res: express.Response): void;
  newImageId(): Promise<string>;
  putImage(file: Express.Multer.File, res: express.Response): void;
}
