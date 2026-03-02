const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

export const generateRandomSalt = () => toBase64(crypto.getRandomValues(new Uint8Array(16)));

export const deriveVaultKey = async (masterPassword, saltBase64) => {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromBase64(saltBase64),
      iterations: 250000,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encryptWithVaultKey = async (plaintext, cryptoKey, saltBase64) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    cryptoKey,
    encoder.encode(plaintext)
  );

  return {
    encryptedContent: toBase64(encrypted),
    iv: toBase64(iv),
    salt: saltBase64,
  };
};

export const decryptWithVaultKey = async ({ encryptedContent, iv }, cryptoKey) => {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: fromBase64(iv),
    },
    cryptoKey,
    fromBase64(encryptedContent)
  );

  return decoder.decode(decrypted);
};
