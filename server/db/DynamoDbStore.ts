import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import DocumentStore, { Document, DocumentListEntry, GraphData } from './DocumentStore';

const yeast = require('yeast');

const DOCUMENTS_TABLE = 'documents';
const COUNTERS_TABLE = 'counters';

export default class DynamoDbStore implements DocumentStore {
  private db: DynamoDB;

  constructor() {
    this.db = new DynamoDB({
      endpoint: process.env.AWS_DOC_ENDPOINT,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DOC_REGION,
    });
  }

  public async init(): Promise<any> {
    const tables = await this.listTables();
    const tableNames = new Set(tables.TableNames);
    if (!tableNames.has(COUNTERS_TABLE)) {
      await this.createTable({
        TableName: COUNTERS_TABLE,
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' },  // Partition key
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 10,
        },
      });
    }
    if (!tableNames.has(DOCUMENTS_TABLE)) {
      await this.createTable({
        TableName: DOCUMENTS_TABLE,
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' },  // Partition key
          // { AttributeName: 'docName', KeyType: 'RANGE' },  // Sort key
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          // { AttributeName: 'docName', AttributeType: 'S' },
          { AttributeName: 'creator', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [{
          IndexName: 'creator_index',
          KeySchema: [
            { AttributeName: 'creator', KeyType: 'HASH' },  // Partition key
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10,
          },
        }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 10,
        },
      });
    }
    await this.initCounter('document', 10000);
  }

  public listDocuments(user: string): Promise<DocumentListEntry[]> {
    return new Promise((resolve, reject) => {
      this.db.query({
        TableName: DOCUMENTS_TABLE,
        IndexName: 'creator_index',
        KeyConditionExpression: '#creator = :creator',
        ExpressionAttributeNames:{
          '#creator': 'creator',
        },
        ExpressionAttributeValues: {
          ':creator': { S: user },
        },
      }, (err, result) => {
        if (err) {
          console.error('listDocuments error:', err);
          reject(err);
        } else {
          const docs: DocumentListEntry[] = result.Items.map(item => ({
            id: item.id.S,
            name: item.name.S,
            created: new Date(item.created.S),
            updated: new Date(item.updated.S),
          }));
          resolve(docs);
        }
      });
    });
  }

  public getDocument(id: string): Promise<Document> {
    return new Promise((resolve, reject) => {
      this.db.getItem({
        TableName: DOCUMENTS_TABLE,
        Key: {
          id: { S: id },
        },
      }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          if (!result.Item) {
            resolve(null);
            return;
          }
          const doc: Document = {
            id: result.Item.id.S,
            created: new Date(result.Item.created.S),
            updated: new Date(result.Item.updated.S),
            creator: result.Item.creator.S,
            creatorName: result.Item.creatorName.S,
            data: JSON.parse(result.Item.data.S),
          };
          resolve(doc);
        }
      });
    });
  }

  public async createDocument(data: GraphData, user: string, userName: string): Promise<string> {
    const id = await this.nextDocId();
    await new Promise((resolve, reject) => {
      this.db.putItem({
        TableName: DOCUMENTS_TABLE,
        Item: {
          id: { S: id },
          name: { S: data.name },
          creator: { S: user },
          creatorName: { S: userName },
          created: { S: new Date().toString() },
          updated: { S: new Date().toString() },
          data: { S: JSON.stringify(data) },
        },
      }, (err, result) => {
        if (err) {
          console.error('createDocument error:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return id;
  }

  public async updateDocument(docId: string, data: GraphData): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
      this.db.updateItem({
        TableName: DOCUMENTS_TABLE,
        Key: {
          id: { S: docId },
        },
        UpdateExpression: 'set #name = :name, #updated = :updated, #data = :data',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#updated': 'updated',
          '#data': 'data',
        },
        ExpressionAttributeValues: {
          ':name': { S: data.name },
          ':updated': { S: new Date().toString() },
          ':data': { S: JSON.stringify(data) },
        },
      }, (err, result) => {
        if (err) {
          console.error('updateDocument error:', err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  private createTable(options: DynamoDB.Types.CreateTableInput):
      Promise<DynamoDB.Types.CreateTableOutput> {
    return new Promise((resolve, reject) => {
      console.log('creating table:', options.TableName);
      this.db.createTable(options, (err, data) => {
        if (err) {
          console.error('error creating table:', options.TableName, err);
          reject(err);
        } else {
          console.info('table created:', options.TableName);
          resolve(data);
        }
      });
    });
  }

  private listTables(): Promise<DynamoDB.Types.ListTablesOutput> {
    return new Promise((resolve, reject) => {
      this.db.listTables({}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private nextDocId(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.db.updateItem({
        TableName: COUNTERS_TABLE,
        Key: {
          id: { S: 'document' },
        },
        ExpressionAttributeNames: {
          '#value': 'value',
        },
        ExpressionAttributeValues: {
          ':incr': { N: '1' },
        },
        UpdateExpression: 'set #value = #value + :incr',
        ReturnValues: 'UPDATED_NEW',
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(yeast.encode(Number(data.Attributes.value.N)));
        }
      });
    });
  }

  private initCounter(id: string, initialValue: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.getItem({
        TableName: COUNTERS_TABLE,
        Key: {
          id: { S: id },
        },
      }, (err, data) => {
        if (err) {
          reject(err);
        } else if (!('Item' in data)) {
          console.log('initCounter:', id, '=', initialValue);
          this.db.putItem({
            TableName: COUNTERS_TABLE,
            Item: {
              id: { S: id },
              value: { N: `${initialValue}` },
            },
          }, (e2, d2) => {
            if (e2) {
              reject(e2);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve(false);
        }
      });
    });
  }
}
