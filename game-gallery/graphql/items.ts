import { formatItem } from '../utils/helpers.js';
import { Item } from '../utils/types.js';
import { GetItemDocument, ItemInfoFragment } from './autogen/types.js';
import { getGraphClient } from './client.js';

export const getItemById = async (
  chainId: number,
  itemId: string,
): Promise<{
  item: Item | null;
  error: Error | undefined;
}> => {
  try {
    const { data, error } = await getGraphClient(chainId).query(
      GetItemDocument,
      {
        itemId: itemId?.toLowerCase(),
      },
    );

    const item = await formatItem(data?.item as ItemInfoFragment);

    return {
      item,
      error,
    };
  } catch (e) {
    console.error('Error fetching item for chainId', chainId, e);
    return {
      item: null,
      error: e as Error,
    };
  }
};
