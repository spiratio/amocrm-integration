import { Logger } from './logger';
import * as jwt from 'jsonwebtoken';
import { DecodedJwt } from './types';

export class JwtManager {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public isTokenTimeValid(tokenExpirationInSeconds: number, token: string): boolean {
    try {
      const decodedJwt = this.getDecodeToken(token);
      const expiration = this.getExpiration(decodedJwt);
      const remainingTimeInSeconds = this.getSecondsUntilUnixTime(expiration);
      const tenPercentOfExpiresIn = tokenExpirationInSeconds * 0.1;

      if (decodedJwt === null) {
        this.logError('Failed to decode token.');
        return false;
      }

      if (expiration === undefined) {
        this.logError('Token does not contain an expiration time.');
        return false;
      }

      const isValid = remainingTimeInSeconds >= tenPercentOfExpiresIn;

      if (isValid) {
        this.logInfo('Token time is valid.');
      } else {
        this.logInfo('Token time has expired.');
      }

      return isValid;
    } catch (error) {
      this.logError(`An error occurred: ${error}`);
      return false;
    }
  }

  private getDecodeToken(token: string): DecodedJwt | null {
    try {
      return jwt.decode(token) as DecodedJwt;
    } catch (error) {
      return null;
    }
  }

  private getExpiration(decodedJwt: any): number | undefined {
    try {
      if (decodedJwt && typeof decodedJwt.exp === 'number') {
        return decodedJwt.exp;
      }
      return undefined;
    } catch (error) {
      this.logError(`An error occurred while extracting expiration time: ${error}`);
      return undefined;
    }
  }

  private getSecondsUntilUnixTime(unixTime: number): number {
    try {
      const currentTimeMillis = Date.now();
      const unixTimeMillis = unixTime * 1000;
      const timeDifferenceMillis = unixTimeMillis - currentTimeMillis;
      const timeDifferenceSeconds = Math.round(timeDifferenceMillis / 1000);
      return timeDifferenceSeconds;
    } catch (error) {
      this.logError(`An error occurred while calculating time difference: ${error}`);
      return 0;
    }
  }

  private logInfo(message: string): void {
    this.logger.info(`[JwtManager] ${message}`);
  }

  private logError(message: string): void {
    this.logger.error(`[JwtManager] ${message}`);
  }
}
