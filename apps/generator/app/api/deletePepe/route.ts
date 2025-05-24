import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import NotFoundError from '@/errors/NotFoundError';
import { checkDuplicates } from '@/utils/checkDuplicates';
import handleServerError from '@/utils/handleServerError';

const schema = z.object({
  id: z
    .number({
      required_error: 'ID is required.',
    })
    .min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { id } = result.data;

    const pepe = await db.selectFrom('pepes').where('id', '=', id).executeTakeFirst();

    if (!pepe) {
      throw new NotFoundError('Pepe not found.');
    }

    await db
      .updateTable('pepes')
      .set({
        status: 'deleted',
      })
      .where('id', '=', id)
      .execute();

    // await checkDuplicates();

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
