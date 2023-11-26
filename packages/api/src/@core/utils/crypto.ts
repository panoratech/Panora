import * as crypto from 'crypto';

// Secret key must be 32 bytes for aes-256-cbc
const secretKey = '12345678901234567890123456789012'; // Replace with your actual secret key
// IV should be 16 bytes
const iv = crypto.randomBytes(16);

export function encrypt(data: string): string {
  try {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(secretKey),
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
