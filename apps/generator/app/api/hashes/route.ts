import { getHashPepe } from '@/utils/getHashPepe';
import handleServerError from '@/utils/handleServerError';

export async function POST(_: Request) {
  try {
    const hashPepe = await getHashPepe();

    const hashes = Object.entries(hashPepe)
      .filter(([, pepes]) => pepes.length > 1)
      .map(([hash]) => hash);

    return Response.json({
      hashes,
    });
  } catch (error) {
    return handleServerError(error);
  }
}
