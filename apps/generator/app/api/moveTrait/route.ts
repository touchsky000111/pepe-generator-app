import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import handleServerError from '@/utils/handleServerError';
import NotFoundError from '@/errors/NotFoundError';

const schema = z.object({
  pepeId: z
    .number({
      required_error: 'Pepe ID is required.',
    })
    .min(1),
  traitIds: z
    .array(z.number(), {
      required_error: 'Trait IDs is required.',
    })
    .min(1, {
      message: 'Trait IDs must contain at least 1 element(s)',
    }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { pepeId, traitIds } = result.data;

    const existingPepe = await db.selectFrom('pepes').where('id', '=', pepeId).executeTakeFirst();

    if (!existingPepe) {
      throw new NotFoundError('Pepe not found.');
    }

    for (let i = 0; i < traitIds.length; i++) {
      await db
        .updateTable('pepeTraits')
        .set({
          index: i,
        })
        .where('pepeId', '=', pepeId)
        .where('traitId', '=', traitIds[i])
        .executeTakeFirst();
    }

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
