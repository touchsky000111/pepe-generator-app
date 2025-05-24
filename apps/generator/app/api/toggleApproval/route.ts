import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import handleServerError from '@/utils/handleServerError';
import NotFoundError from '@/errors/NotFoundError';

const schema = z.object({
  id: z
    .number({
      required_error: 'ID is required.',
    })
    .min(1),
  isApproved: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { id, isApproved } = result.data;

    const existingPepe = await db.selectFrom('pepes').where('id', '=', id).executeTakeFirst();

    if (!existingPepe) {
      throw new NotFoundError('Pepe not found.');
    }

    await db
      .updateTable('pepes')
      .set({
        isApproved,
      })
      .where('id', '=', id)
      .execute();

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
