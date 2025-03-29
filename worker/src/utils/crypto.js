// Placeholder; replace with real AES-256 via Web Crypto API
export function encrypt(data, key) {
    return Buffer.from(data).toString("base64"); // Temporary
  }
  export function decrypt(data, key) {
    return Buffer.from(data, "base64").toString(); // Temporary
  }