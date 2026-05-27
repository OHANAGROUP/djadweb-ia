/**
 * Utilidad de cifrado AES-256 para credenciales SII
 *
 * NOTA: Actualmente el scraper SII usa solo endpoints publicos.
 * Esta utilidad queda disponible para futura integracion con
 * Clave Unica (OAuth 2.0 del gobierno chileno) o para
 * almacenar tokens de sesion de forma segura.
 *
 * Modo de uso futuro:
 * 1. Implementar flujo OAuth Clave Unica
 * 2. Almacenar refresh token con esta utilidad
 * 3. Usar token para consultas autenticadas SII
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

const ALGORITHM = 'aes-256-cbc';

function getEncryptionKey() {
  const key = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY must be at least 32 chars');
  }
  return crypto.scryptSync(key, 'sii-credentials-salt', 32);
}

function encryptPassword(password) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encrypted, iv: iv.toString('hex') };
}

function decryptPassword(encrypted, ivHex) {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encryptPassword, decryptPassword };
