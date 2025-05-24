import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import NotFoundError from '@/errors/NotFoundError';
import handleServerError from '@/utils/handleServerError';

const schema = z.object({
  ids: z.array(z.number()).min(1),
  isApproved: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { ids, isApproved } = result.data;

    const pepes = await db.selectFrom('pepes').select('id').where('id', 'in', ids).execute();

    if (ids.findIndex((id) => pepes.find((p) => p.id === id)) === -1) {
      throw new NotFoundError('Pepe not found.');
    }

    await db
      .updateTable('pepes')
      .set({
        isApproved,
      })
      .where('id', 'in', ids)
      .execute();

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
