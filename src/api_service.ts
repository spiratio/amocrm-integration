import axios, { AxiosInstance } from 'axios';
import { Logger } from './logger';
import { ContactField, TokenInformation } from './types';

export class ApiService {
  private instance: AxiosInstance;
  private logger: Logger;

  constructor() {
    this.instance = axios.create({
      timeout: 5000,
    });
    this.logger = new Logger();
  }

  public async getAccessToken(client_id: string, client_secret: string, code: string, referer: string, redirect_uri: string) {
    const postData = {
      client_id,
      client_secret,
      grant_type: 'authorization_code',
      code,
      redirect_uri,
    };

    const headers = {
      'Content-Type': 'application/json',
      Host: referer,
    };

    try {
      const response = await this.instance.post(`https://www.${referer}/oauth2/access_token`, postData, { headers });
      return response.data;
    } catch (error) {
      this.logError(`Error sending POST request: ${error}`);
    }
  }

  public async getNewAccessToken(client_id: string, client_secret: string, refresh_token: string, referer: string, redirect_uri: string) {
    const postData = {
      client_id,
      client_secret,
      grant_type: 'refresh_token',
      refresh_token,
      redirect_uri,
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await this.instance.post(`https://www.${referer}/oauth2/access_token`, postData, { headers });
      return response.data;
    } catch (error) {
      this.logError(`Error sending POST request: ${error}`);
    }
  }

  public async updateContact(
    referer: string,
    contactId: string,
    name: string,
    phone: string,
    email: string,
    token_information: TokenInformation,
  ) {
    const patchData = {
      name,
      custom_fields_values: [
        {
          field_code: 'PHONE',
          values: [
            {
              value: phone,
            },
          ],
        },
        {
          field_code: 'EMAIL',
          values: [
            {
              value: email,
            },
          ],
        },
      ],
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `${token_information.token_type} ${token_information.access_token}`,
    };

    try {
      await this.instance.patch(`https://${referer}/api/v4/contacts/${contactId}`, patchData, { headers });
      this.logInfo('Contact updated');
    } catch (error) {
      this.logError(`Error sending PATCH request: ${error}`);
    }
  }

  public async addNewContact(
    referer: string,
    name: string,
    phone: string,
    email: string,
    token_information: TokenInformation,
  ): Promise<undefined | string> {
    const patchData = [
      {
        name,
        custom_fields_values: [
          {
            field_code: 'PHONE',
            values: [
              {
                value: phone,
              },
            ],
          },
          {
            field_code: 'EMAIL',
            values: [
              {
                value: email,
              },
            ],
          },
        ],
      },
    ];

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `${token_information.token_type} ${token_information.access_token}`,
    };

    try {
      const response = await this.instance.post(`https://${referer}/api/v4/contacts`, patchData, { headers });
      this.logInfo('New contact created');
      return response.data._embedded.contacts[0].id;
    } catch (error) {
      this.logError(`Error sending POST request: ${error}`);
    }
  }

  public async addNewLeads(referer: string, contactId: number, token_information: TokenInformation) {
    const postData = [
      {
        name: '',
        _embedded: {
          contacts: [
            {
              id: contactId,
            },
          ],
        },
      },
    ];

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `${token_information.token_type} ${token_information.access_token}`,
    };

    try {
      await this.instance.post(`https://${referer}/api/v4/leads`, postData, { headers });
      this.logInfo('New lead created');
    } catch (error) {
      this.logError(`Error sending POST request: ${error}`);
    }
  }

  public async searchContact(query: string, field: ContactField, subdomain: string, accessToken: string): Promise<undefined | string> {
    try {
      const response = await this.instance.get(`https://${subdomain}/api/v4/contacts`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          query,
          field,
        },
      });

      const data = response.data;

      if (data._embedded && data._embedded.contacts && data._embedded.contacts.length > 0) {
        return data._embedded.contacts[0].id;
      }
    } catch (error) {
      this.logError(`Error sending GET request: ${error}`);
    }
  }

  private logInfo(message: string): void {
    this.logger.info(`[ApiService] ${message}`);
  }

  private logError(message: string): void {
    this.logger.error(`[ApiService] ${message}`);
  }
}
