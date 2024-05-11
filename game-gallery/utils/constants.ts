import 'dotenv/config';

export const ENVIRONMENT = process.env.ENVIRONMENT ?? 'dev';
export const PINATA_JWT = process.env.PINATA_JWT ?? '';
export const SUBGRAPH_URL = process.env.SUBGRAPH_URL ?? '';

if (!PINATA_JWT) {
  throw new Error('Missing PINATA_JWT environment variable');
}

if (!SUBGRAPH_URL) {
  throw new Error('Missing SUBGRAPH_URL environment variable');
}
