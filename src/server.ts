import express, { Express, Request, Response } from 'express';
import { Logger } from './logger';
import { ApiService } from './api_service';
import { MongoDBClient } from './mongoDBClient';
import { Integration, TokenInformation, collectionName } from './types';
import { JwtManager } from './jwtManager';

export class Server {
  private app: Express;
  private port: number;
  private apiService: ApiService;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUrl: string;
  private readonly dBClient: MongoDBClient;
  private logger: Logger;

  constructor(clientId: string, clientSecret: string, DB_URL: string, redirectUrl: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUrl = redirectUrl;
    this.dBClient = new MongoDBClient(DB_URL);
    this.apiService = new ApiService();
    this.app = express();
    this.port = 3000;
    this.configureRoutes();
    this.logger = new Logger();
  }

  private configureRoutes() {
    this.app.get('/', this.handleRequest.bind(this));
  }

  private async handleRequest(req: Request, res: Response) {
    const code: string | undefined = req.query.code as string;
    const phone: string | undefined = req.query.phone as string;
    const email: string | undefined = req.query.email as string;
    const name: string | undefined = req.query.name as string;

    if (code) {
      await this.handleCodeRequest(req, res, code);
    } else if (phone || email || name) {
      await this.handlePhoneRequest(req, res, phone, email, name);
    }
  }

  private async handlePhoneRequest(req: Request, res: Response, phone: string, email: string, name: string) {
    if (!phone || !email || !name) {
      res.status(400).json({ error: 'Invalid parameters: phone, email, and name must be provided.' });
      return;
    }

    this.logInfo('Received search parameters');

    try {
      await this.dBClient.connect();
      const integration = await this.dBClient.findOneDocument('Integrations');
      await this.dBClient.close();

      await this.checkToken(integration);

      const idByPhone = await this.apiService.searchContact(phone, 'phone', integration.referer, integration.tokenInformation.access_token);
      const idByEmail = await this.apiService.searchContact(email, 'email', integration.referer, integration.tokenInformation.access_token);
      if (idByEmail || idByPhone) {
        const idToUpdate = idByEmail || idByPhone;
        await this.apiService.updateContact(integration.referer, idToUpdate, name, phone, email, integration.tokenInformation);
        await this.apiService.addNewLeads(integration.referer, idToUpdate as unknown as number, integration.tokenInformation);
      } else {
        this.logInfo('Contact not found');
        const id = await this.apiService.addNewContact(integration.referer, name, phone, email, integration.tokenInformation);
        this.logInfo('New contact created');
        if (id) {
          await this.apiService.addNewLeads(integration.referer, id as unknown as number, integration.tokenInformation);
        }
      }

      res.json({ message: 'GET request successfully processed' });
    } catch (error) {
      this.logError(`[handlePhoneRequest] Error processing parameters: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while processing parameters.' });
    }
  }

  private async checkToken(integration: Integration) {
    const jwtManager = new JwtManager();

    const isTokenTimeValid = jwtManager.isTokenTimeValid(integration.tokenInformation.expires_in, integration.tokenInformation.access_token);
    if (!isTokenTimeValid) {
      try {
        await this.apiService.getNewAccessToken(
          this.clientId,
          this.clientSecret,
          integration.tokenInformation.refresh_token,
          integration.referer,
          this.redirectUrl,
        );

        const integrationData: Integration = { referer: integration.referer, tokenInformation: integration.tokenInformation };
        await this.dBClient.connect();
        await this.dBClient.replaceIntegrationInCollection(integrationData, collectionName);
        await this.dBClient.close();
      } catch (error) {
        this.logError(`[checkToken] Error processing code: ${error.message}`);
      }
    }
  }

  private async handleCodeRequest(req: Request, res: Response, code: string) {
    const referer = this.validateStringParam(req.query.referer, 'referer');

    if (!referer) {
      res.status(400).json({ error: 'Parameter "referer" is missing or invalid.' });
      return;
    }

    this.logInfo('Code received');

    try {
      const tokenInformation: TokenInformation = await this.apiService.getAccessToken(
        this.clientId,
        this.clientSecret,
        code,
        referer,
        this.redirectUrl,
      );

      const integrationData: Integration = { referer: referer, tokenInformation: tokenInformation };

      await this.dBClient.connect();
      await this.dBClient.insertIntegrationInCollection(integrationData, collectionName);
      await this.dBClient.close();

      res.json({ message: 'GET request successfully processed' });
    } catch (error) {
      this.logError(`[handleCodeRequest] Error processing code: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while processing code.' });
    }
  }

  private validateStringParam(param: any, paramName: string): string | null {
    if (typeof param !== 'string') {
      this.logError(`[validateStringParam] Parameter ${paramName} is not a string.`);
      return null;
    }
    return param;
  }

  public start() {
    this.app.listen(this.port, () => {
      this.logInfo(`Server is running on port ${this.port}`);
    });
  }

  private logInfo(message: string): void {
    this.logger.info(`[Server] ${message}`);
  }

  private logError(message: string): void {
    this.logger.error(`[Server] ${message}`);
  }
}
