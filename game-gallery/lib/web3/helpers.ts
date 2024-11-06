import {
  CHAIN_ID_TO_LABEL,
  SUBGRAPH_URLS,
  SUPPORTED_CHAINS,
} from './constants.js';

export const isSupportedChain = (chainId: number | string | bigint): boolean =>
  SUPPORTED_CHAINS.find(c => c.id === Number(chainId)) !== undefined;

export const getSubgraphUrl = (chainId: number): string => {
  if (!isSupportedChain(chainId)) {
    throw new Error(`ChainId ${chainId} is not supported`);
  }
  return SUBGRAPH_URLS[chainId]!;
};

export const getChainLabelFromId = (chainId: number): string | undefined => {
  if (!chainId || !isSupportedChain(chainId)) {
    return undefined;
  }

  return CHAIN_ID_TO_LABEL[chainId];
};
