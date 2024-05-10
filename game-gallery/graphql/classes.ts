import { formatClass } from '../utils/helpers.js';
import { Class } from '../utils/types.js';
import { ClassInfoFragment, GetClassDocument } from './autogen/types.js';
import { getGraphClient } from './client.js';

export const getClassById = async (
  chainId: number,
  classId: string,
): Promise<{
  classEntity: Class | null;
  error: Error | undefined;
}> => {
  try {
    const { data, error } = await getGraphClient(chainId).query(
      GetClassDocument,
      {
        classId: classId?.toLowerCase(),
      },
    );

    const classEntity = await formatClass(data?.class as ClassInfoFragment);

    return {
      classEntity,
      error,
    };
  } catch (e) {
    console.error('Error fetching class for chainId', chainId, e);
    return {
      classEntity: null,
      error: e as Error,
    };
  }
};
