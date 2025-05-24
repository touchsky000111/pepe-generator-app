import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import { generateRandomTraits } from '@/utils/generateRandomTraits';
import { getAllTraitOptions } from '@/utils/getAllTraitOptions';
import { getAllTraits } from '@/utils/getAllTraits';
import { getHash } from '@/utils/getHash';
import handleServerError from '@/utils/handleServerError';
import { getHashPepe } from '@/utils/getHashPepe';

const schema = z.object({
  max: z.number({
    required_error: 'Max is required.',
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { max } = result.data;

    const hashPepe = await getHashPepe();
    const hashes = Object.keys(hashPepe);

    const traits = await getAllTraits();
    const traitOptions = await getAllTraitOptions();

    const pepes: Array<{
      hash: string;
      traits: Array<{
        index: number;
        folder: string;
        file: string;
        value: string;
      }>;
    }> = [];
    for (let i = 0; i < max; i++) {
      const id = i + 1;

      while (true) {
        const pepeTraits = await generateRandomTraits();

        const hash = getHash(
          pepeTraits.map((trait) => ({
            folder: trait.folder,
            file: trait.file,
          })),
        );

        if (!hashes.includes(hash)) {
          pepes.push({
            traits: pepeTraits,
            hash,
          });

          hashes.push(hash);

          break;
        }
      }
    }

    const newPepes = await db
      .insertInto('pepes')
      .values(
        pepes.map(() => ({
          isApproved: false,
          isLocked: false,
        })),
      )
      .returning('id')
      .execute();

    const pepeTraits = pepes.flatMap((pepe, index) => {
      return pepe.traits.map((pepeTrait) => {
        const insertedTrait = traits.find((t) => t.folder === pepeTrait.folder);
        if (!insertedTrait) {
          throw new Error('Inserted trait not found');
        }

        const normalize = (str: string) =>
          str.toLowerCase().replace(/[_\-\[\]]/g, ''); // Normalizing the trait values

        // Debugging logs
        console.log('Normalizing o.name:', insertedTrait.folder);
        console.log('Normalizing pepeTrait.value:', pepeTrait.value);

        const insertedOption = traitOptions.find(
          (o) =>
            o.traitId === insertedTrait.id
        );
        // && 
        // (normalize(o.name).includes(normalize(pepeTrait.value)) ||
        //   normalize(o.name).endsWith(`_${normalize(pepeTrait.value)}`)) 

        if (!insertedOption) {
          console.log('Missing trait option', {
            traitFolder: insertedTrait.folder,
            traitName: insertedTrait.name,
            traitValue: pepeTrait.value,
            availableOptions: traitOptions
              .filter((o) => o.traitId === insertedTrait.id)
              .map((o) => o.name),
          });
          throw new Error('Inserted option not found');
        }
        return {
          index: pepeTrait.index,
          pepeId: newPepes[index].id,
          traitId: insertedTrait.id,
          traitOptionId: insertedOption.id,
        };
      });
    });

    while (pepeTraits.length) {
      await db.insertInto('pepeTraits').values(pepeTraits.splice(0, 10000)).execute();
    }

    return Response.json({});
  } catch (error) {
    return handleServerError(error);
  }
}
