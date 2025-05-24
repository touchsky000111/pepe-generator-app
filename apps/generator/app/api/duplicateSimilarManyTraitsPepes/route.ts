import { db } from 'db';
import { z } from 'zod';

import ConflictError from '@/errors/ConflictError';
import NotFoundError from '@/errors/NotFoundError';
import UnprocessableContentError from '@/errors/UnprocessableContentError';
import { randomElement } from '@/utils/randomElement';
import { getPepe } from '@/utils/getPepe';
import { getHash } from '@/utils/getHash';
import { getAllTraits } from '@/utils/getAllTraits';
import { getAllTraitOptions } from '@/utils/getAllTraitOptions';
import { mapById } from '@/utils/mapById';
import handleServerError from '@/utils/handleServerError';
import { shuffleArray } from '@/utils/shuffleArray';
import getLiveHashPepe from '@/utils/getLiveHashPepe';

const schema = z.object({
  id: z
    .number({
      required_error: 'ID is required.',
    })
    .min(1, {
      message: 'ID must be greater than or equal to 1.',
    }),
  traitIds: z
    .array(
      z
        .number({
          required_error: 'Trait ID is required.',
        })
        .min(1, {
          message: 'Trait ID must be greater than or equal to 1.',
        }),
      {
        required_error: 'Trait IDs is required',
      },
    )
    .min(1, {
      message: 'Trait IDs must be greater than or equal to 1.',
    }),
  max: z
    .number({
      required_error: 'Max is required',
    })
    .min(0, {
      message: 'Max must be greater than or equal to 1.',
    }),
});

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { id, traitIds, max } = result.data;

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

    if (traitIds.some((traitId) => traitsMap[traitId].name === 'Bg')) {
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

    if (
      traitIds.some(
        (traitId) =>
          existingPepe.traits.filter((t) => t.traitId === traitId && t.traitOptionId).length > 1,
      )
    ) {
      throw new ConflictError(
        'This feature is not available to Pepes with multiple options of the same trait.',
      );
    }

    const similarTraitOptions = traitIds
      .map((traitId) => {
        const pepeTraitOptionIds = existingPepe.traits
          .filter((t) => t.traitId === traitId && t.traitOptionId)
          .map((t) => t.traitOptionId);

        return {
          traitId,
          options: traitOptions.filter(
            (o) => o.traitId === traitId && !pepeTraitOptionIds.includes(o.id),
          ),
        };
      })
      .sort((a, b) => b.options.length - a.options.length);

    const similarPepes: Array<{
      hash: string;
      traits: Array<{
        index: number;
        traitId: number;
        traitOptionId: number;
        imageUrl?: string | null;
      }>;
    }> = [];

    function generateCombinations(data: any): any {
      if (data.length === 1) {
        return data[0].options.map((option: any) => ({
          traits: [{ traitId: data[0].traitId, traitOptionId: option.id }],
        }));
      }

      const combinations = [];
      const currentTrait = data[0];
      const remainingTraits = data.slice(1);
      const remainingCombinations = generateCombinations(remainingTraits);

      for (const option of currentTrait.options) {
        for (const combination of remainingCombinations) {
          combinations.push({
            traits: [
              { traitId: currentTrait.traitId, traitOptionId: option.id },
              ...combination.traits,
            ],
          });
        }
      }

      return combinations;
    }

    const combos: Array<{
      traits: Array<{
        traitId: number;
        traitOptionId: number;
      }>;
    }> = generateCombinations(similarTraitOptions);

    for (let i = 0; i < combos.length; i++) {
      const combo = combos[i];
      const traits = existingPepe.traits.map((trait) => {
        const comboTrait = combo.traits.find((t) => t.traitId === trait.traitId);

        return {
          index: trait.index,
          traitId: trait.traitId,
          traitOptionId: comboTrait
            ? comboTrait.traitOptionId
            : trait.traitId === bgTrait.id
              ? randomElement(bgTraitOptions).id
              : trait.traitOptionId,
          imageUrl: comboTrait ? undefined : trait.imageUrl,
        };
      });

      combo.traits.forEach((trait) => {
        if (existingPepe.traits.findIndex((t) => t.traitId === trait.traitId) === -1) {
          traits.push({
            index: traits.length,
            traitId: trait.traitId,
            traitOptionId: trait.traitOptionId,
            imageUrl: undefined,
          });
        }
      });

      const hash = getHash(
        traits.map((trait) => ({
          folder: traitsMap[trait.traitId].folder,
          file: traitOptionsMap[trait.traitOptionId].file,
        })),
      );

      if (hashPepe[hash]) {
        continue;
      }

      hashPepe[hash] = [-1];

      similarPepes.push({
        hash,
        traits,
      });
    }

    const shuffledPepes = shuffleArray(similarPepes);
    const maxedPepes = max > 0 ? shuffledPepes.slice(0, max) : shuffledPepes.slice();

    if (!maxedPepes.length) {
      return Response.json({
        pepes: [],
      });
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

    while (maxedPepes.length) {
      const splicedPepes = maxedPepes.splice(0, 1000);

      const newPepes = await db
        .insertInto('pepes')
        .values(
          splicedPepes.map(() => ({
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

      await db
        .insertInto('pepeTraits')
        .values(
          splicedPepes.flatMap((similarPepe, i) => {
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

    return Response.json({ pepes: pepes.slice(0, 10000) });
  } catch (error) {
    console.log(error);
    return handleServerError(error);
  }
}
