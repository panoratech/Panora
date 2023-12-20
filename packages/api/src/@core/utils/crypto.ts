import * as crypto from 'crypto';
import config from './config';

const secretKey = config.ENCRYPT_CRYPTO_SECRET_KEY;
const iv = crypto.randomBytes(16);

export function encrypt(data: string): string {
  try {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(secretKey, 'utf-8'),
      iv,
    );
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedWithIv = iv.toString('hex') + ':' + encrypted; // Prepend IV to the encrypted data
    return encryptedWithIv;
  } catch (error) {
    throw new Error('Encrypting error... ' + error);
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const textParts = encryptedData.split(':');
    // Extract the IV from the first half of the value
    const ivFromText = Buffer.from(textParts.shift() as string, 'hex');
    // Extract the encrypted text without the IV
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(secretKey),
      ivFromText,
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Decrypting error... ' + error);
  }
}

export function decryptTwo(encryptedData: Buffer): string {
  try {
    const dataString = encryptedData.toString('utf-8');
    const textParts = dataString.split(':');
    // Extract the IV from the first half of the value
    const ivFromText = Buffer.from(textParts.shift() as string, 'hex');
    // Extract the encrypted text without the IV
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(secretKey),
      ivFromText,
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Decrypting error... ' + error);
  }
}
