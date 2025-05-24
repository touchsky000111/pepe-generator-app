import { db, kv } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import getCache from '@/utils/getCache';
import { getHashPepe } from '@/utils/getHashPepe';
import handleServerError from '@/utils/handleServerError';
import setCache from '@/utils/setCache';

const schema = z.object({
  filters: z
    .array(
      z.object({
        traitId: z.number(),
        traitOptionId: z.number(),
      }),
    )
    .optional()
    .default([]),
  hash: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    // const cache = await getCache(pathname, result.data);
    // if (cache) {
    //   return Response.json(cache);
    // }

    const { filters, hash } = result.data;

    const hashPepe = await getHashPepe();

    let pepesQuery = db
      .selectFrom('pepes')
      .distinct()
      .select('pepes.id')
      .where('status', '!=', 'deleted');
    if (hash) {
      pepesQuery = pepesQuery.where('pepes.id', 'in', hashPepe[hash]);
    }
    if (filters.length) {
      filters.forEach((filter, index) => {
        if (filter.traitId === -2) {
          pepesQuery = pepesQuery.where('isApproved', '=', filter.traitOptionId === 1);
        } else if (filter.traitId === -1) {
          pepesQuery = pepesQuery.innerJoin(
            `pepeLabels as pl${index}`,
            `pl${index}.pepeId`,
            'pepes.id',
          ) as any;
        } else {
          pepesQuery = pepesQuery.innerJoin(
            `pepeTraits as pt${index}`,
            `pt${index}.pepeId`,
            'pepes.id',
          ) as any;
        }
      });
      pepesQuery = pepesQuery.where((eb) =>
        eb.and(
          filters
            .filter((f) => f.traitId !== -2)
            .map((filter, index) => {
              if (filter.traitId === -1) {
                return eb(`pl${index}.name` as any, '=', filter.traitOptionId);
              }
              return eb(`pt${index}.traitOptionId` as any, '=', filter.traitOptionId);
            }),
        ),
      );
    }

    const pepes = await pepesQuery.execute();

    return Response.json(
      await setCache(pathname, result.data, {
        count: pepes.length,
      }),
    );
  } catch (error) {
    return handleServerError(error);
  }
}
