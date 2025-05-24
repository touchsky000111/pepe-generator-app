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
  label: z.string({
    required_error: 'Label is required.',
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { pepeId, label } = result.data;

    const existingPepe = await db.selectFrom('pepes').where('id', '=', pepeId).executeTakeFirst();

    if (!existingPepe) {
      throw new NotFoundError('Pepe not found.');
    }

    const existingLabel = await db
      .selectFrom('pepeLabels')
      .where('pepeId', '=', pepeId)
      .where('name', '=', label)
      .executeTakeFirst();

    if (!existingLabel) {
      await db
        .insertInto('pepeLabels')
        .values({
          pepeId,
          name: label,
        })
        .executeTakeFirst();
    }

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
