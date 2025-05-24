import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
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

    await db
      .updateTable('pepes')
      .set({
        imageUrl: null,
      })
      .where('id', '=', id)
      .executeTakeFirst();

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
