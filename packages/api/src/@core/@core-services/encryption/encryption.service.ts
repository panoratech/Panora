import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private secretKey: string;
  private iv = crypto.randomBytes(16);

  constructor(private env: EnvironmentService, private logger: LoggerService) {
    this.secretKey = process.env.ENCRYPT_CRYPTO_SECRET_KEY;
  }

  encrypt(data: string): string {
    try {
      if (!data) throw new Error('Cant encrypt empty string');
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(this.secretKey, 'utf-8'),
        this.iv,
      );
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const encryptedWithIv = this.iv.toString('hex') + ':' + encrypted;
      return encryptedWithIv;
    } catch (error) {
      throw error;
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const textParts = encryptedData.split(':');
      const ivFromText = Buffer.from(textParts.shift() as string, 'hex');
      const encryptedText = textParts.join(':');
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(this.secretKey),
        ivFromText,
      );
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw error;
    }
  }

  generateCodes(): { codeVerifier: string; codeChallenge: string } {
    const base64URLEncode = (str: Buffer): string => {
      return str
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };

    const verifier = base64URLEncode(Buffer.from(crypto.randomBytes(32)));
    const challenge = base64URLEncode(
      crypto.createHash('sha256').update(Buffer.from(verifier)).digest(),
    );

    return { codeVerifier: verifier, codeChallenge: challenge };
  }
}
