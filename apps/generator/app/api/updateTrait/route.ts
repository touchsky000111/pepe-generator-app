import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import handleServerError from '@/utils/handleServerError';

const schema = z.object({
  pepeId: z
    .number({
      required_error: 'Pepe ID is required.',
    })
    .min(1),
  traitId: z
    .number({
      required_error: 'Trait ID is required.',
    })
    .min(1),
  traitOptionId: z
    .number({
      required_error: 'Trait Option ID is required.',
    })
    .min(0),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { pepeId, traitId, traitOptionId } = result.data;

    const existingTrait = await db
      .selectFrom('pepeTraits')
      .select('id')
      .where('pepeId', '=', pepeId)
      .where('traitId', '=', traitId)
      .executeTakeFirst();

    if (existingTrait) {
      if (traitOptionId === 0) {
        await db.deleteFrom('pepeTraits').where('id', '=', existingTrait.id).executeTakeFirst();
      } else {
        await db
          .updateTable('pepeTraits')
          .set({
            traitOptionId,
          })
          .where('id', '=', existingTrait.id)
          .executeTakeFirst();
      }
    } else {
      const pepeTraits = await db
        .selectFrom('pepeTraits')
        .select('id')
        .where('pepeId', '=', pepeId)
        .execute();

      await db
        .insertInto('pepeTraits')
        .values({
          index: pepeTraits.length,
          pepeId,
          traitId,
          traitOptionId,
        })
        .executeTakeFirst();
    }

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
