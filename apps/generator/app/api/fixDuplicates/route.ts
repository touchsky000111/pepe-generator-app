import { db } from 'db';

import { checkDuplicates } from '@/utils/checkDuplicates';
import handleServerError from '@/utils/handleServerError';

export const maxDuration = 60;

export async function POST(_: Request) {
  try {
    const { hashPepe } = await checkDuplicates();

    const hashes = Object.entries(hashPepe).filter(([, pepes]) => pepes.length > 1);

    const pepes = await db
      .selectFrom('pepes')
      .select(['id', 'isApproved'])
      .where(
        'id',
        'in',
        hashes.flatMap(([_, id]) => id),
      )
      .execute();

    for (let i = 0; i < hashes.length; i++) {
      const [, ids] = hashes[i];

      const approvedPepes = pepes.filter((pepe) => pepe.isApproved && ids.includes(pepe.id));
      const unapprovedPepes = pepes.filter((pepe) => !pepe.isApproved && ids.includes(pepe.id));

      const extraPepes = approvedPepes.concat(unapprovedPepes).slice(1);

      await Promise.all(
        extraPepes.map(async (pepe) => {
          await db
            .updateTable('pepes')
            .set({ status: 'deleted' })
            .where('id', '=', pepe.id)
            .execute();
        }),
      );
    }

    await checkDuplicates();

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
