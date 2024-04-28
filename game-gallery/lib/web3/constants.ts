import { base, gnosis, optimism, polygon, sepolia } from 'viem/chains';

import { ENVIRONMENT } from '../../utils/constants.js';

export const SUBGRAPH_URLS: { [key: number]: string } = {
  [gnosis.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-gnosis/version/latest',
  [sepolia.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-sepolia/version/latest',
  [base.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-base/version/latest',
  [polygon.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-polygon/version/latest',
  [optimism.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-optimism/version/latest',
};

const ALL_SUPPORTED_CHAINS = [gnosis, sepolia, polygon, optimism, base];

export const SUPPORTED_CHAINS = (() => {
  switch (ENVIRONMENT) {
    case 'main':
      return ALL_SUPPORTED_CHAINS.filter(chain => !!chain.testnet === false);
    case 'dev':
    default:
      return ALL_SUPPORTED_CHAINS.filter(chain => chain.testnet === true);
  }
})();

const validateConfig = () => {
  SUPPORTED_CHAINS.forEach(chain => {
    if (!SUBGRAPH_URLS[chain.id]) {
      throw new Error(`SUBGRAPH_URLS[${chain.id}] is not set`);
    }
  });
};

validateConfig();
