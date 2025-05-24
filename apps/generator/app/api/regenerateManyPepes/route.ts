import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import { checkDuplicates } from '@/utils/checkDuplicates';
import { generateRandomTraits } from '@/utils/generateRandomTraits';
import { getHash } from '@/utils/getHash';
import handleServerError from '@/utils/handleServerError';

const schema = z.object({
  ids: z
    .array(z.number(), {
      required_error: 'IDs is required.',
    })
    .min(1, {
      message: 'IDs must contain at least 1 element(s).',
    }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { ids } = result.data;

    const { hashPepe } = await checkDuplicates();
    const hashes = Object.keys(hashPepe);

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];

      while (true) {
        const randomTraits = await generateRandomTraits();

        const hash = getHash(
          randomTraits.map((trait) => ({
            folder: trait.folder,
            file: trait.file,
          })),
        );

        if (!hashes.includes(hash)) {
          await db.deleteFrom('pepeTraits').where('pepeId', '=', id).execute();

          const traits = await db
            .selectFrom('traits')
            .select(['id', 'folder', 'name'])
            .where(
              'folder',
              'in',
              randomTraits.map((trait) => trait.folder),
            )
            .execute();

          const traitOptions = await db
            .selectFrom('traitOptions')
            .select(['id', 'file', 'name', 'traitId'])
            .where(
              'traitId',
              'in',
              traits.map((trait) => trait.id),
            )
            .execute();

          await db
            .insertInto('pepeTraits')
            .values(
              randomTraits.map((randomTrait, index) => {
                const trait = traits.find((t) => t.folder === randomTrait.folder)!;
                const option = traitOptions.find((o) => o.file === randomTrait.file)!;

                return {
                  index,
                  pepeId: id,
                  traitId: trait.id,
                  traitOptionId: option.id,
                };
              }),
            )
            .execute();

          hashes.push(hash);

          break;
        }
      }
    }

    await checkDuplicates();

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
