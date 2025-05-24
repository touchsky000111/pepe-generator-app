import { db, init } from 'db';

import handleServerError from '@/utils/handleServerError';
import getCache from '@/utils/getCache';
import setCache from '@/utils/setCache';

init();

export async function POST(_: Request) {
  try {
    // const cache = await getCache('traits', {});
    // if (cache) {
    //   return Response.json(cache);
    // }

    if (!db) {
      console.log(">>>ERROR<<<");
      return Response.json({ error: 'Database not connected' }, { status: 500 });
    }

    const traits = await db
      .selectFrom('traits')
      .select(['id', 'folder', 'name'])
      .orderBy('name asc')
      .execute();

    const traitOptions = await db
      .selectFrom('traitOptions')
      .select(['id', 'createdAt', 'file', 'name', 'traitId'])
      .orderBy('name asc')
      .execute();

    const pepeTraits = await db
      .selectFrom('pepeTraits')
      .select(({ fn, val, ref }) => ['traitOptionId', fn.count<number>('id').as('count')])
      .groupBy('traitOptionId')
      .execute();

    return Response.json(
      await setCache(
        'traits',
        {},
        {
          traits: traits.map((trait) => {
            const options = traitOptions.filter((option) => option.traitId === trait.id);
            return {
              id: trait.id,
              folder: trait.folder,
              name: trait.name,
              options: options.map((option) => ({
                id: option.id,
                createdAt: option.createdAt,
                file: option.file,
                name: option.name,
                count: Number(pepeTraits.find((trait) => trait.traitOptionId === option.id)?.count),
              })),
            };
          }),
        },
      ),
    );
  } catch (error) {
    return handleServerError(error);
  }
}
