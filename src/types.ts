import winston from 'winston';

export type Integration = {
  referer: string;
  tokenInformation: TokenInformation;
};

export type TokenInformation = {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

export type ContactField = 'phone' | 'email' | 'name';

export interface LoggerOptions {
  level?: string;
  format?: winston.Logform.Format;
  transports?: winston.transport[];
}

export interface DecodedJwt {
  exp?: number;
}

export const collectionName = 'Integrations';
