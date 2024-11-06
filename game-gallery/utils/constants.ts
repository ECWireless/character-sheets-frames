import 'dotenv/config';

export const PINATA_JWT = process.env.PINATA_JWT ?? '';
export const SECRET = process.env.SECRET ?? '';

if (!PINATA_JWT) {
  throw new Error('Missing PINATA_JWT environment variable');
}

if (!SECRET) {
  throw new Error('Missing SECRET environment variable');
}
