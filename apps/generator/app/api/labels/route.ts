import { db } from 'db';

import handleServerError from '@/utils/handleServerError';

export async function POST(_: Request) {
  try {
    const labels = await db
      .selectFrom('pepeLabels')
      .select('name')
      .orderBy('name asc')
      .groupBy(['id', 'name'])
      .execute();

    return Response.json({
      labels: labels.map((label) => label.name),
    });
  } catch (error) {
    return handleServerError(error);
  }
}
