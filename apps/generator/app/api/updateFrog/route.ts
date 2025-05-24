import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import NotFoundError from '@/errors/NotFoundError';
import handleServerError from '@/utils/handleServerError';
import { getAllTraits } from '@/utils/getAllTraits';
import { getAllTraitOptions } from '@/utils/getAllTraitOptions';
import ConflictError from '@/errors/ConflictError';

const schema = z.object({
  ids: z.array(z.number()).min(1),
  type: z.enum(['happy', 'sad']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { ids, type } = result.data;

    const pepes = await db.selectFrom('pepes').select('id').where('id', 'in', ids).execute();

    if (ids.findIndex((id) => pepes.find((p) => p.id === id)) === -1) {
      throw new NotFoundError('Pepe not found.');
    }

    const allTraits = await getAllTraits();
    const allTraitOptions = await getAllTraitOptions();

    const frogTrait = allTraits.find((trait) => trait.name === 'Frog');
    if (!frogTrait) {
      throw new ConflictError('Frog trait not found');
    }

    const frogTraitOption = allTraitOptions.find((traitOption) => {
      if (traitOption.traitId !== frogTrait.id) {
        return false;
      }

      if (type === 'happy' && traitOption.name === 'Happy frog') {
        return true;
      }

      if (type === 'sad' && traitOption.name === 'Sad frog') {
        return true;
      }

      return false;
    });
    if (!frogTraitOption) {
      throw new ConflictError('Frog trait option not found');
    }

    const currentTraits = await db
      .selectFrom('pepeTraits')
      .select(['imageUrl', 'pepeId', 'traitOptionId'])
      .where('pepeId', 'in', ids)
      .where('traitId', '=', frogTrait.id)
      .execute();

    const hasChangedMap: Record<number, boolean> = {};
    currentTraits.forEach((currentTrait) => {
      hasChangedMap[currentTrait.pepeId] = currentTrait.traitOptionId !== frogTraitOption.id;
    });

    const updateIds = ids.filter((id) => hasChangedMap[id]);

    if (updateIds.length) {
      await db
        .updateTable('pepeTraits')
        .set({ imageUrl: null, traitOptionId: frogTraitOption.id })
        .where('pepeId', 'in', updateIds)
        .where('traitId', '=', frogTrait.id)
        .execute();
    }

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
