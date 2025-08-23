const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET as string;
const USER_SECRET = process.env.USER_JWT_SECRET as string;

// Base64 URL decode function
function base64UrlDecode(str: string): string {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

// Base64 URL encode function  
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// HMAC SHA256 function using Web Crypto API
async function hmacSha256(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export async function verifyEdgeJWT(token: string, isAdmin: boolean = false): Promise<boolean> {
  try {
    const secret = isAdmin ? ADMIN_SECRET : USER_SECRET;
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.log("Invalid JWT format");
      return false;
    }

    const [header, payload, signature] = parts;
    
    // Verify signature
    const data = `${header}.${payload}`;
    const expectedSignature = await hmacSha256(secret, data);
    
    if (signature !== expectedSignature) {
      console.log("JWT signature verification failed");
      return false;
    }

    // Check expiration
    const decodedPayload = JSON.parse(base64UrlDecode(payload));
    const now = Math.floor(Date.now() / 1000);
    
    if (decodedPayload.exp && decodedPayload.exp < now) {
      console.log("JWT token expired");
      return false;
    }

    console.log("Edge JWT verification successful:", decodedPayload);
    return true;
  } catch (error) {
    console.log("Edge JWT verification failed:", error);
    return false;
  }
}

export async function decodeEdgeJWT<T = any>(token: string): Promise<T | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(base64UrlDecode(parts[1])) as T;
    return payload;
  } catch {
    return null;
  }
}