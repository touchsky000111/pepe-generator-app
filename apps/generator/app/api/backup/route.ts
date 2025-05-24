import { db, put } from 'db';

import handleServerError from '@/utils/handleServerError';

export async function POST(_: Request) {
  try {
    const pepes = await db.selectFrom('pepes').selectAll().orderBy('id').execute();
    const pepeLabels = await db.selectFrom('pepeLabels').selectAll().orderBy('id').execute();
    const pepeTraits = await db.selectFrom('pepeTraits').selectAll().orderBy('id').execute();
    const traits = await db.selectFrom('traits').selectAll().orderBy('id').execute();
    const traitOptions = await db.selectFrom('traitOptions').selectAll().orderBy('id').execute();

    const file = `pepe-generator-${Date.now()}.json`;

    const { url } = await put(
      `backups/${file}`,
      JSON.stringify({ pepes, pepeLabels, pepeTraits, traits, traitOptions }, null, 2),
      {
        access: 'public',
      },
    );

    return Response.json({
      url,
    });
  } catch (error) {
    return handleServerError(error);
  }
}
