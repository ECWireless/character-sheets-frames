import { formatFullCharacter } from '../utils/helpers.js';
import { Character } from '../utils/types.js';
import {
  CharacterInfoFragment,
  GetCharacterDocument,
} from './autogen/types.js';
import { getGraphClient } from './client.js';

export const getCharacterForChainId = async (
  chainId: number,
  characterId: string,
): Promise<{
  character: Character | null;
  error: Error | undefined;
}> => {
  try {
    const { data, error } = await getGraphClient(chainId).query(
      GetCharacterDocument,
      {
        characterId: characterId?.toLowerCase(),
      },
    );

    const character = await formatFullCharacter(
      data?.character as CharacterInfoFragment,
    );

    return {
      character,
      error,
    };
  } catch (e) {
    console.error('Error fetching character for chainId', chainId, e);
    return {
      character: null,
      error: e as Error,
    };
  }
};
