import handleServerError from '@/utils/handleServerError';
import getLiveHashPepe from '@/utils/getLiveHashPepe';

export const maxDuration = 30;

export async function POST(_: Request) {
  try {
    const hashPepe = await getLiveHashPepe(true);

    const duplicates = Object.entries(hashPepe)
      .map(([hash, pepeIds]) => ({
        hash,
        pepeIds,
      }))
      .filter((duplicate) => duplicate.pepeIds.length > 1);

    return Response.json({
      duplicates,
    });
  } catch (error) {
    return handleServerError(error);
  }
}
