/**
 * crypto.ts — Cifrado AES-256-GCM para credenciales de portales gubernamentales.
 *
 * USO EXCLUSIVO EN SERVER-SIDE (Next.js API routes / Server Components).
 * NUNCA importar desde componentes de cliente — expone la clave de cifrado.
 *
 * Formato de ciphertext almacenado:
 *   base64(iv):base64(ciphertext):base64(authTag)
 *   — IV:  12 bytes aleatorios (96 bits, recomendado por NIST para GCM)
 *   — Key: 32 bytes (256 bits) derivados de CREDENTIALS_ENCRYPTION_KEY
 *   — AuthTag: 16 bytes (128 bits, máxima seguridad)
 *
 * Rotación de clave:
 *   Cambiar CREDENTIALS_ENCRYPTION_KEY_V{N+1} en env vars,
 *   incrementar encryption_version en la tabla,
 *   y re-cifrar los registros existentes con la función reEncrypt().
 *
 * Referencias:
 *   - NIST SP 800-38D (GCM)
 *   - OWASP Cryptographic Storage Cheat Sheet
 */

import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'crypto'

// ── Constantes ────────────────────────────────────────────────────────────────
const ALGORITHM    = 'aes-256-gcm'
const IV_BYTES     = 12   // 96 bits — recomendado por NIST para GCM
const TAG_BYTES    = 16   // 128 bits — máxima integridad
const KEY_BYTES    = 32   // 256 bits
const SEPARATOR    = ':'

// Versión actual del esquema de cifrado.
// Incrementar cuando se rote la clave maestra.
export const CURRENT_ENCRYPTION_VERSION = 1

// ── Carga y validación de la clave maestra ────────────────────────────────────
function loadKey(version: number = CURRENT_ENCRYPTION_VERSION): Buffer {
  const envKey = version === 1
    ? process.env.CREDENTIALS_ENCRYPTION_KEY
    : process.env[`CREDENTIALS_ENCRYPTION_KEY_V${version}`]

  if (!envKey) {
    throw new Error(
      `[crypto] CREDENTIALS_ENCRYPTION_KEY${version > 1 ? `_V${version}` : ''} no está configurada. ` +
      'Configura esta variable de entorno antes de cifrar credenciales.'
    )
  }

  // Soporta clave como hex (64 chars) o como texto (se toma UTF-8, primeros 32 bytes)
  const keyBuf = envKey.length === 64 && /^[0-9a-fA-F]+$/.test(envKey)
    ? Buffer.from(envKey, 'hex')
    : Buffer.from(envKey.slice(0, KEY_BYTES).padEnd(KEY_BYTES, '0'))

  if (keyBuf.length !== KEY_BYTES) {
    throw new Error(`[crypto] La clave de cifrado debe ser de ${KEY_BYTES} bytes (${KEY_BYTES * 8} bits).`)
  }
  return keyBuf
}

// ── Interfaz pública ──────────────────────────────────────────────────────────
export interface EncryptResult {
  ciphertext: string  // formato: "iv:ciphertext:authTag" en base64
  version:    number  // encryption_version a guardar en BD
}

/**
 * Cifra un texto plano usando AES-256-GCM con IV aleatorio.
 *
 * @param plaintext  Texto a cifrar (contraseña, token, etc.)
 * @returns          { ciphertext, version } para almacenar en user_credentials
 */
export function encrypt(plaintext: string): EncryptResult {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('[crypto] El texto a cifrar no puede estar vacío.')
  }

  const key = loadKey(CURRENT_ENCRYPTION_VERSION)
  const iv  = randomBytes(IV_BYTES)

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_BYTES,
  })

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  // Serializar como "iv:ciphertext:authTag" en base64
  const parts = [
    iv.toString('base64'),
    encrypted.toString('base64'),
    authTag.toString('base64'),
  ].join(SEPARATOR)

  return {
    ciphertext: parts,
    version:    CURRENT_ENCRYPTION_VERSION,
  }
}

/**
 * Descifra un ciphertext previamente cifrado con encrypt().
 *
 * @param ciphertext       Formato "iv:ciphertext:authTag" en base64
 * @param encryptionVersion Versión usada al cifrar (de user_credentials.encryption_version)
 * @returns                Plaintext original
 * @throws                 Si el authTag no coincide (dato manipulado o clave incorrecta)
 */
export function decrypt(ciphertext: string, encryptionVersion: number = CURRENT_ENCRYPTION_VERSION): string {
  if (!ciphertext || typeof ciphertext !== 'string') {
    throw new Error('[crypto] El ciphertext no puede estar vacío.')
  }

  const parts = ciphertext.split(SEPARATOR)
  if (parts.length !== 3) {
    throw new Error('[crypto] Formato de ciphertext inválido. Se esperaba "iv:ciphertext:authTag".')
  }

  const [ivB64, encryptedB64, authTagB64] = parts
  const iv      = Buffer.from(ivB64, 'base64')
  const encrypted = Buffer.from(encryptedB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')

  if (iv.length !== IV_BYTES) {
    throw new Error(`[crypto] IV inválido: se esperaban ${IV_BYTES} bytes.`)
  }
  if (authTag.length !== TAG_BYTES) {
    throw new Error(`[crypto] AuthTag inválido: se esperaban ${TAG_BYTES} bytes.`)
  }

  const key = loadKey(encryptionVersion)

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_BYTES,
  })
  decipher.setAuthTag(authTag)

  try {
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])
    return decrypted.toString('utf8')
  } catch {
    // GCM authTag failure — dato manipulado, clave incorrecta, o corrupción
    throw new Error('[crypto] Error de autenticación GCM: el ciphertext fue manipulado o la clave es incorrecta.')
  }
}

/**
 * Re-cifra un ciphertext de versión antigua con la clave actual.
 * Usar durante rotación de claves: leer de BD → reEncrypt → actualizar BD.
 *
 * @param oldCiphertext     Ciphertext almacenado actualmente
 * @param oldVersion        encryption_version del registro en BD
 * @returns                 Nuevo { ciphertext, version } con la clave actual
 */
export function reEncrypt(
  oldCiphertext: string,
  oldVersion:    number
): EncryptResult {
  const plaintext = decrypt(oldCiphertext, oldVersion)
  return encrypt(plaintext)
}

/**
 * Verifica en tiempo constante si dos strings son iguales.
 * Úsalo para comparar tokens, nunca === directamente.
 */
export function safeCompare(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a)
    const bBuf = Buffer.from(b)
    if (aBuf.length !== bBuf.length) return false
    return timingSafeEqual(aBuf, bBuf)
  } catch {
    return false
  }
}
