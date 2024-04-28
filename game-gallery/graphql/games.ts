import { formatGameMeta } from '../utils/helpers.js';
import { GameMeta } from '../utils/types.js';
import { GameMetaInfoFragment, GetGameMetaDocument } from './autogen/types.js';
import { getGraphClient } from './client.js';

export const getGameMetaForChainId = async (
  chainId: number,
  gameId: string,
): Promise<GameMeta | null> => {
  const { data, error } = await getGraphClient(chainId).query(
    GetGameMetaDocument,
    {
      gameId: gameId.toLowerCase(),
    },
  );

  if (error) {
    console.error('Error getting game', error);
    return null;
  }

  const game = data?.game as GameMetaInfoFragment | undefined;

  if (!game) {
    console.error('Game not found');
    return null;
  }

  return formatGameMeta(game);
};
