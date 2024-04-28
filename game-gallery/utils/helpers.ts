import { GameMetaInfoFragment } from '../graphql/autogen/types.js';
import { GameMeta, Metadata } from './types.js';

const IPFS_GATEWAYS = ['https://charactersheets.mypinata.cloud'];

/**
 * Given a URI that may be ipfs, ipns, http, https, ar, or data protocol, return the fetch-able http(s) URLs for the same content
 * @param uri to convert to fetch-able http url
 */
export const uriToHttp = (uri: string): string[] => {
  try {
    const protocol = uri.split(':')[0].toLowerCase();
    switch (protocol) {
      case 'data':
        return [uri];
      case 'https':
        return [uri];
      case 'http':
        return ['https' + uri.substring(4), uri];
      case 'ipfs': {
        const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
        return IPFS_GATEWAYS.map(g => `${g}/ipfs/${hash}`);
      }
      case 'ipns': {
        const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
        return IPFS_GATEWAYS.map(g => `${g}/ipns/${name}`);
      }
      case 'ar': {
        const tx = uri.match(/^ar:(\/\/)?(.*)$/i)?.[2];
        return [`https://arweave.net/${tx}`];
      }
      default:
        return [''];
    }
  } catch (e) {
    console.error(e);
    return [''];
  }
};

const fetchMetadataFromUri = async (uri: string): Promise<Metadata> => {
  const res = await fetch(uri);
  if (!res.ok) throw new Error('Failed to fetch');
  const metadata = await res.json();
  metadata.name = metadata.name || '';
  metadata.description = metadata.description || '';
  metadata.image = metadata.image || '';
  metadata.equippable_layer = metadata.equippable_layer || null;
  metadata.attributes = metadata.attributes || [];
  return metadata;
};

const fetchMetadata = async (ipfsUri: string): Promise<Metadata> => {
  try {
    const uris = uriToHttp(ipfsUri);
    for (const u of uris) {
      try {
        const metadata = await fetchMetadataFromUri(u);
        return metadata;
      } catch (e) {
        console.error('Failed to fetch metadata from', u);
        continue;
      }
    }
  } catch (e) {
    console.error('Failed to fetch metadata from', ipfsUri);
  }
  return {
    name: '',
    description: '',
    image: '',
    equippable_layer: null,
    attributes: [],
  };
};

export const formatGameMeta = async (
  game: GameMetaInfoFragment,
): Promise<GameMeta> => {
  const metadata = await fetchMetadata(game.uri);

  return {
    id: game.id,
    startedAt: Number(game.startedAt) * 1000,
    chainId: Number(game.chainId),
    uri: game.uri,
    owner: game.owner.address,
    admins: game.admins.map(a => a.address),
    masters: game.masters.map(m => m.address),
    players: game.characters.map(c => c.player),
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    characters: game.characters,
    classes: game.classes,
    items: game.items,
    experience: game.experience,
    equippable_layer: null,
    attributes: metadata.attributes,
  };
};
