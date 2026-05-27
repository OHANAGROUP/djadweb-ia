const { createDecipheriv } = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;
const SEPARATOR = ':';

const CURRENT_ENCRYPTION_VERSION = 1;

function loadKey(version = CURRENT_ENCRYPTION_VERSION) {
  const envKey = version === 1
    ? process.env.CREDENTIALS_ENCRYPTION_KEY
    : process.env[`CREDENTIALS_ENCRYPTION_KEY_V${version}`];

  if (!envKey) {
    throw new Error(
      `[crypto] CREDENTIALS_ENCRYPTION_KEY${version > 1 ? `_V${version}` : ''} no está configurada.`
    );
  }

  const keyBuf = envKey.length === 64 && /^[0-9a-fA-F]+$/.test(envKey)
    ? Buffer.from(envKey, 'hex')
    : Buffer.from(envKey.slice(0, KEY_BYTES).padEnd(KEY_BYTES, '0'));

  if (keyBuf.length !== KEY_BYTES) {
    throw new Error(`[crypto] La clave debe ser de ${KEY_BYTES} bytes.`);
  }
  return keyBuf;
}

function decrypt(ciphertext, encryptionVersion = CURRENT_ENCRYPTION_VERSION) {
  if (!ciphertext || typeof ciphertext !== 'string') {
    throw new Error('[crypto] El ciphertext no puede estar vacío.');
  }

  const parts = ciphertext.split(SEPARATOR);
  if (parts.length !== 3) {
    throw new Error('[crypto] Formato de ciphertext inválido. Se esperaba "iv:ciphertext:authTag".');
  }

  const [ivB64, encryptedB64, authTagB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  if (iv.length !== IV_BYTES) {
    throw new Error(`[crypto] IV inválido: se esperaban ${IV_BYTES} bytes.`);
  }
  if (authTag.length !== TAG_BYTES) {
    throw new Error(`[crypto] AuthTag inválido: se esperaban ${TAG_BYTES} bytes.`);
  }

  const key = loadKey(encryptionVersion);

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_BYTES,
  });
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (err) {
    throw new Error('[crypto] Error de autenticación GCM: el ciphertext fue manipulado o la clave es incorrecta.');
  }
}

module.exports = {
  decrypt,
  CURRENT_ENCRYPTION_VERSION
};
