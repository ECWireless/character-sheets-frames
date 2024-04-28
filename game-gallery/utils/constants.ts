import 'dotenv/config';

export const SUBGRAPH_URL = process.env.SUBGRAPH_URL ?? '';

if (!SUBGRAPH_URL) {
  throw new Error('Missing SUBGRAPH_URL environment variable');
}
