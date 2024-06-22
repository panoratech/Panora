import { EnvironmentService } from '@@core/environment/environment.service';
import { LoggerService } from '@@core/logger/logger.service';
import { EncryptionError, throwTypedError } from '@@core/utils/errors';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private secretKey: string;
  private iv = crypto.randomBytes(16);

  constructor(private env: EnvironmentService, private logger: LoggerService) {
    this.secretKey = this.env.getCryptoKey();
  }

  encrypt(data: string): string {
    try {
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
}
