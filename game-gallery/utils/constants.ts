import 'dotenv/config';

export const ENVIRONMENT = process.env.ENVIRONMENT ?? 'dev';
export const SUBGRAPH_URL = process.env.SUBGRAPH_URL ?? '';

if (!SUBGRAPH_URL) {
  throw new Error('Missing SUBGRAPH_URL environment variable');
}
