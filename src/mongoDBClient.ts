import { MongoClient, Db, Collection } from 'mongodb';
import { Integration } from './types';
import { Logger } from './logger';

export class MongoDBClient {
  private readonly uri: string;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private logger: Logger;

  constructor(uri: string) {
    this.uri = uri;
    this.logger = new Logger();
  }

  public async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.logInfo('Connected to MongoDB');
      this.db = this.client.db();
    } catch (error) {
      this.logError('Failed to connect to MongoDB: ' + error);
      process.exit(1);
    }
  }

  public async close(): Promise<void> {
    try {
      await this.client?.close();
      this.logInfo('Connection to MongoDB closed');
    } catch (err) {
      this.logError('Error disconnecting from MongoDB: ' + err);
    }
  }

  public async insertIntegrationInCollection(integration: Integration, collectionName: string): Promise<void> {
    const collection = this.db!.collection(collectionName);
    const existingIntegration = await collection.findOne({ referer: integration.referer });

    if (existingIntegration) {
      this.logInfo(`Integration with referer '${integration.referer}' already exists in MongoDB`);
    } else {
      try {
        await collection.insertOne(integration);
        this.logInfo('Integration added to MongoDB');
      } catch (error) {
        this.logError('The integration insertion into MongoDB has failed: ' + error);
        throw error;
      }
    }
  }

  public async replaceIntegrationInCollection(integration: Integration, collectionName: string): Promise<void> {
    const collection = this.db!.collection(collectionName);
    const filter = { referer: integration.referer };

    try {
      const result = await collection.replaceOne(filter, integration, { upsert: true });

      if (result.modifiedCount > 0) {
        this.logInfo(`Integration with referer '${integration.referer}' replaced in MongoDB`);
      } else {
        this.logInfo(`Integration with referer '${integration.referer}' added to MongoDB`);
      }
    } catch (error) {
      this.logError('The integration replacement/insertion into MongoDB has failed: ' + error);
      throw error;
    }
  }

  public async getCollection<T>(collectionName: string): Promise<Collection<T>> {
    try {
      return this.db!.collection<T>(collectionName);
    } catch (error) {
      this.logError('Failed to get collection');
      throw error;
    }
  }

  public async findOneDocument(collectionName: string): Promise<Integration | null> {
    try {
      const collection = this.db!.collection(collectionName);
      const document = await collection.findOne({});
      if (document) {
        this.logInfo('One document retrieved');
        return document as unknown as Integration;
      } else {
        this.logInfo('Collection is empty or document not found.');
        return null;
      }
    } catch (err) {
      this.logError('Error while fetching document: ' + err);
      throw err;
    }
  }
  private logInfo(message: string): void {
    this.logger.info(`[MongoDB] ${message}`);
  }

  private logError(message: string): void {
    this.logger.error(`[MongoDB] ${message}`);
  }
}
