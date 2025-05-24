import { db } from 'db';
import { z } from 'zod';

import ConflictError from '@/errors/ConflictError';
import NotFoundError from '@/errors/NotFoundError';
import UnprocessableContentError from '@/errors/UnprocessableContentError';
import { randomElement } from '@/utils/randomElement';
import getLiveHashPepe from '@/utils/getLiveHashPepe';
import { getPepe } from '@/utils/getPepe';
import { getHash } from '@/utils/getHash';
import { getAllTraits } from '@/utils/getAllTraits';
import { getAllTraitOptions } from '@/utils/getAllTraitOptions';
import { mapById } from '@/utils/mapById';
import handleServerError from '@/utils/handleServerError';

const schema = z.object({
  id: z
    .number({
      required_error: 'ID is required.',
    })
    .min(1, {
      message: 'ID must be greater than or equal to 1.',
    }),
  traitId: z
    .number({
      required_error: 'Trait ID is required.',
    })
    .min(1, {
      message: 'Trait ID must be greater than or equal to 1.',
    }),
  traitOptionId: z
    .number()
    .min(1, {
      message: 'Trait Option ID must be greater than or equal to 1.',
    })
    .optional(),
});

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { id, traitId, traitOptionId } = result.data;

    const hashPepe = await getLiveHashPepe(true);

    const existingPepe = await getPepe(id);

    if (!existingPepe) {
      throw new NotFoundError('Pepe not found.');
    }

    if (existingPepe.imageUrl) {
      throw new ConflictError('Pepe has custom image.');
    }

    const traits = await getAllTraits();
    const traitOptions = await getAllTraitOptions();

    const traitsMap = mapById(traits);
    const traitOptionsMap = mapById(traitOptions);

    if (traitsMap[traitId].name === 'Bg') {
      throw new ConflictError('Background cannot be used to generate similar Pepes.');
    }

    const bgTrait = traits.find((trait) => trait.folder === 'bg');

    if (!bgTrait) {
      throw new ConflictError('Background does not exist.');
    }

    const bgTraitOptions = traitOptions.filter((traitOption) => traitOption.traitId === bgTrait.id);

    if (!bgTraitOptions.length) {
      throw new ConflictError('Background Options do not exist.');
    }

    const pepeTraitOptionIds = existingPepe.traits
      .filter((t) => t.traitId === traitId && t.traitOptionId)
      .map((t) => t.traitOptionId);

    if (pepeTraitOptionIds.length > 1 && !traitOptionId) {
      throw new ConflictError(
        'This feature is not available to Pepes with multiple options of the same trait.',
      );
    }

    const similarTraitOptions = traitOptions.filter(
      (o) => o.traitId === traitId && !pepeTraitOptionIds.includes(o.id),
    );

    if (!similarTraitOptions.length) {
      throw new ConflictError('There are no more options available.');
    }

    const similarPepes: Array<{
      hash: string;
      traits: Array<{
        index: number;
        traitId: number;
        traitOptionId: number;
        imageUrl?: string | null;
      }>;
    }> = similarTraitOptions
      .map((_, i) => {
        const newPepeTraits = existingPepe.traits.map((trait) => ({
          index: trait.index,
          traitId: trait.traitId,
          traitOptionId:
            pepeTraitOptionIds.length === 1 && trait.traitId === traitId
              ? similarTraitOptions[i].id
              : pepeTraitOptionIds.length > 1 && trait.traitOptionId === traitOptionId
                ? similarTraitOptions[i].id
                : trait.traitId === bgTrait.id
                  ? randomElement(bgTraitOptions).id
                  : trait.traitOptionId,
          imageUrl:
            trait.traitId === traitId && (!traitOptionId || trait.traitOptionId === traitOptionId)
              ? undefined
              : trait.imageUrl,
        }));

        if (existingPepe.traits.findIndex((t) => t.traitId === traitId) === -1) {
          newPepeTraits.push({
            index: newPepeTraits.length,
            traitId,
            traitOptionId: similarTraitOptions[i].id,
            imageUrl: undefined,
          });
        }

        const hash = getHash(
          newPepeTraits.map((trait) => ({
            folder: traitsMap[trait.traitId].folder,
            file: traitOptionsMap[trait.traitOptionId].file,
          })),
        );

        if (hashPepe[hash]) {
          return {
            hash: '',
            traits: [],
          };
        }

        hashPepe[hash] = [-1];

        return {
          hash,
          traits: newPepeTraits,
        };
      })
      .filter((similarPepe) => !!similarPepe.hash);

    if (!similarPepes.length) {
      return Response.json({
        pepes: [],
      });
    }

    const newPepes = await db
      .insertInto('pepes')
      .values(
        similarPepes.map(() => ({
          isApproved: false,
          isLocked: false,
          originalPepeId: id,
        })),
      )
      .returning('id')
      .execute();

    if (!newPepes) {
      throw new ConflictError('The Pepes could not be created.');
    }

    const newPepeLabels = newPepes.flatMap((newPepe) =>
      existingPepe.labels.map((label) => ({
        pepeId: newPepe.id,
        name: label.name,
      })),
    );

    if (newPepeLabels.length > 0) {
      await db.insertInto('pepeLabels').values(newPepeLabels).execute();
    }

    const pepes: {
      id: number;
      traits: {
        id: number;
        file: string;
        folder: string;
        imageUrl?: string | null;
        index: number;
        optionId: number;
      }[];
    }[] = [];

    while (similarPepes.length) {
      await db
        .insertInto('pepeTraits')
        .values(
          similarPepes.splice(0, 10000).flatMap((similarPepe, i) => {
            pepes.push({
              id: newPepes[i].id,
              traits: similarPepe.traits
                .map((trait) => ({
                  id: trait.traitId,
                  folder: traits.find((t) => t.id === trait.traitId)!.folder,
                  file: traitOptions.find((o) => o.id === trait.traitOptionId)!.file,
                  imageUrl: trait.imageUrl,
                  index: trait.index,
                  optionId: trait.traitOptionId,
                }))
                .sort((a, b) => a.index - b.index),
            });

            const newPepeTraits = similarPepe.traits.map((trait) => ({
              pepeId: newPepes[i].id,
              ...trait,
            }));

            return newPepeTraits;
          }),
        )
        .execute();
    }

    return Response.json({ pepes });
  } catch (error) {
    return handleServerError(error);
  }
}
