import { base, gnosis, optimism, polygon } from 'viem/chains';

export const CHAIN_ID_TO_LABEL: { [key: number]: string } = {
  [base.id]: 'base',
  [gnosis.id]: 'gnosis',
  [optimism.id]: 'optimism',
  [polygon.id]: 'polygon',
};

export const SUBGRAPH_URLS: { [key: number]: string } = {
  [gnosis.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-gnosis/version/latest',
  [base.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-base/version/latest',
  [polygon.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-polygon/version/latest',
  [optimism.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-optimism/version/latest',
};

export const SUPPORTED_CHAINS = [gnosis, polygon, optimism, base];

const validateConfig = () => {
  SUPPORTED_CHAINS.forEach(chain => {
    if (!SUBGRAPH_URLS[chain.id]) {
      throw new Error(`SUBGRAPH_URLS[${chain.id}] is not set`);
    }
  });
};

validateConfig();
