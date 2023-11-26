import crypto from 'crypto';

const secretKey = 'your-secret-key';

export function encrypt(data: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', secretKey);
  let encryptedAccessToken = cipher.update(data, 'utf8', 'hex');
  encryptedAccessToken += cipher.final('hex');
  return encryptedAccessToken;
}

export function decrypt(encrypted_data: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', secretKey);

  let decryptedAccessToken = decipher.update(encrypted_data, 'hex', 'utf8');
  decryptedAccessToken += decipher.final('utf8');
  return decryptedAccessToken;
}
