// AES-GCM 256-bit + PBKDF2 (200,000 iterations, SHA-256)
// 全部在瀏覽器端執行，密碼永遠不傳送到伺服器

const ITERATIONS = 200_000;
const FILE_MAGIC = "SPTWBAK1";

interface EncryptedPayload {
  magic: string;
  v: number;
  salt: string;
  iv: string;
  data: string;
}

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(buf))));
}

function fromBase64(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

async function deriveKey(
  password: string,
  salt: ArrayBuffer,
  usage: KeyUsage[]
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    usage
  );
}

export async function encrypt(plaintext: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16)).buffer;
  const iv = crypto.getRandomValues(new Uint8Array(12)).buffer;
  const key = await deriveKey(password, salt, ["encrypt"]);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );

  const payload: EncryptedPayload = {
    magic: FILE_MAGIC,
    v: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(ciphertext),
  };
  return JSON.stringify(payload);
}

export async function decrypt(encryptedJson: string, password: string): Promise<string> {
  let payload: EncryptedPayload;
  try {
    payload = JSON.parse(encryptedJson);
  } catch {
    throw new Error("檔案格式錯誤，請確認選取的是正確的備份檔");
  }

  if (payload.magic !== FILE_MAGIC) throw new Error("不是有效的備份檔案");
  if (payload.v !== 1) throw new Error(`不支援的備份版本 v${payload.v}`);

  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const ciphertext = fromBase64(payload.data);
  const key = await deriveKey(password, salt, ["decrypt"]);

  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  } catch {
    throw new Error("密碼錯誤或檔案已損毀");
  }

  return new TextDecoder().decode(plaintext);
}
