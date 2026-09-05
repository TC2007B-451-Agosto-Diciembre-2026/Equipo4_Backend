import {
  createHmac,
  timingSafeEqual,
} from 'crypto';

const SECRET = 'agenda-secret-2026';

const ACCESS_TTL = 60 * 15; // 15 minutes
const REFRESH_TTL = 60 * 60 * 24 * 7; // 7 days

export type JwtPayload = {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
};

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(input: string): string {
  input = input.replace(/-/g, '+').replace(/_/g, '/');

  while (input.length % 4) {
    input += '=';
  }

  return Buffer.from(input, 'base64').toString('utf8');
}

export function sign(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  ttlSeconds: number,
): string {
  const now = Math.floor(Date.now() / 1000);

  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSeconds,
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));

  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac('sha256', SECRET)
    .update(data)
    .digest();

  return `${data}.${base64url(signature)}`;
}

export function verify(token: string): JwtPayload {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid token');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const data = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = createHmac('sha256', SECRET)
    .update(data)
    .digest();

  let receivedSignature: Buffer;

  try {
    receivedSignature = Buffer.from(
      encodedSignature.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    );
  } catch {
    throw new Error('Invalid signature');
  }

  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(
    base64urlDecode(encodedPayload),
  ) as JwtPayload;

  const now = Math.floor(Date.now() / 1000);

  if (payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}

export const JWT_TTL = {
  access: ACCESS_TTL,
  refresh: REFRESH_TTL,
};