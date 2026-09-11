// AES-256-GCM + payload container, shared by the page (browser) and the build tools (Node).
// Payload layout: [u32 BE header length][header JSON][media bytes]; encrypted blob: iv(12) || ciphertext+tag.

const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_RE = /^[A-Za-z0-9_-]{43}$/;

export function b64urlEncode(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Returns the 32-byte key from a URL fragment, or null for anything that is not exactly a key. */
export function parseKey(fragment) {
  const s = String(fragment ?? '').replace(/^#/, '');
  if (!KEY_RE.test(s)) return null;
  const key = b64urlDecode(s);
  return key.length === 32 ? key : null;
}

const importKey = (raw, usage) => crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [usage]);

export async function encrypt(key, plain) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await importKey(key, 'encrypt'), plain);
  const out = new Uint8Array(IV_BYTES + ct.byteLength);
  out.set(iv);
  out.set(new Uint8Array(ct), IV_BYTES);
  return out;
}

export async function decrypt(key, blob) {
  if (blob.length <= IV_BYTES + TAG_BYTES) throw new Error('payload too short');
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: blob.subarray(0, IV_BYTES) },
    await importKey(key, 'decrypt'),
    blob.subarray(IV_BYTES),
  );
  return new Uint8Array(pt);
}

export function packPayload(data, media = null) {
  const head = new TextEncoder().encode(JSON.stringify({ data, media: media ? { type: media.type } : null }));
  const body = media ? media.bytes : new Uint8Array(0);
  const out = new Uint8Array(4 + head.length + body.length);
  new DataView(out.buffer).setUint32(0, head.length);
  out.set(head, 4);
  out.set(body, 4 + head.length);
  return out;
}

export function unpackPayload(bytes) {
  if (bytes.length < 4) throw new Error('payload too short');
  const len = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
  if (4 + len > bytes.length) throw new Error('payload truncated');
  const head = JSON.parse(new TextDecoder().decode(bytes.subarray(4, 4 + len)));
  const media = head.media ? { type: String(head.media.type), bytes: bytes.subarray(4 + len) } : null;
  return { data: head.data, media };
}
