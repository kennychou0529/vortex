import * as localforage from 'localforage';

const yeast: () => string = require('yeast');

export default class ImageStore {
  public put(file: File, callback: (err: any, id: string) => void): string {
    const id = yeast();
    localforage.setItem(id, file, err => {
      callback(err, id);
    });
    return id;
  }

  public get(id: string, callback: (err: any, file: File) => void) {
    localforage.getItem(id, (err: any, value: any) => {
      callback(err, value);
    });
  }
}
