import { db } from 'db';
import { z } from 'zod';

import ConflictError from '@/errors/ConflictError';
import UnprocessableContentError from '@/errors/UnprocessableContentError';
import { randomElement } from '@/utils/randomElement';
import { getHash } from '@/utils/getHash';
import { getAllTraits } from '@/utils/getAllTraits';
import { getAllTraitOptions } from '@/utils/getAllTraitOptions';
import { mapById } from '@/utils/mapById';
import handleServerError from '@/utils/handleServerError';
import { shuffleArray } from '@/utils/shuffleArray';
import getLiveHashPepe from '@/utils/getLiveHashPepe';
import traitOptionIsLast from '@/utils/traitOptionIsLast';
import traitOptionIsNewest from '@/utils/traitOptionIsNewest';
import traitOptionIsNew from '@/utils/traitOptionIsNew';
import traitOptionIsOld from '@/utils/traitOptionIsOld';

export const maxDuration = 60;

const schema = z.object({
  filters: z.array(
    z.object({
      traitId: z.number(),
      traitOptionId: z.number(),
    }),
    {
      required_error: 'Filters is required.',
    },
  ),
  hasSingleTraits: z.boolean().optional(),
  isBasic: z.boolean().optional(),
  traitId1: z
    .number({
      required_error: 'Trait ID 1 is required.',
    })
    .min(1, {
      message: 'Trait ID 1 must be greater than or equal to 1.',
    }),
  traitOptionId1: z.number().optional(),
  traitId2: z
    .number()
    .min(1, {
      message: 'Trait ID 2 must be greater than or equal to 1.',
    })
    .optional(),
  traitOptionId2: z.number().optional(),
  max: z
    .number({
      required_error: 'Max is required',
    })
    .min(1, {
      message: 'Max must be greater than or equal to 1.',
    })
    .max(1000, {
      message: 'Max must be less than or equal to 1000.',
    }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const {
      filters,
      hasSingleTraits,
      isBasic,
      traitId1,
      traitOptionId1,
      traitId2,
      traitOptionId2,
      max,
    } = result.data;

    const traits = await getAllTraits();
    const traitOptions = await getAllTraitOptions();

    const traitsMap = mapById(traits);
    const traitOptionsMap = mapById(traitOptions);

    const bgTrait = traits.find((trait) => trait.folder === 'bg');
    if (!bgTrait) {
      throw new ConflictError('Background does not exist.');
    }

    const eyesTrait = traits.find((trait) => trait.folder === 'eyes');
    if (!eyesTrait) {
      throw new ConflictError('Eyes does not exist.');
    }

    const frogTrait = traits.find((trait) => trait.folder === 'frog');
    if (!frogTrait) {
      throw new ConflictError('Frog does not exist.');
    }

    const mouthTrait = traits.find((trait) => trait.folder === 'mouth');
    if (!mouthTrait) {
      throw new ConflictError('Mouth does not exist.');
    }

    const bgTraitOptions = traitOptions.filter((traitOption) => traitOption.traitId === bgTrait.id);

    if (!bgTraitOptions.length) {
      throw new ConflictError('Background Options do not exist.');
    }

    const trait1AvailableOptions = traitOptions.filter(
      (traitOption) => traitOption.traitId === traitId1,
    );
    const trait2AvailableOptions = traitOptions.filter(
      (traitOption) => traitOption.traitId === traitId2,
    );

    const approvedPepes = await db
      .selectFrom('pepes')
      .select('id')
      .where('imageUrl', 'is', null)
      .where('isApproved', '=', true)
      .where('status', '=', 'active')
      .execute();

    const approvedPepeTraits = await db
      .selectFrom('pepeTraits')
      .select(['id', 'imageUrl', 'index', 'pepeId', 'traitId', 'traitOptionId'])
      .execute();

    const approvedPepeTraitsMap: Record<
      number,
      Array<{
        id: number;
        imageUrl?: string | null;
        index: number;
        traitId: number;
        traitOptionId: number;
      }>
    > = {};
    approvedPepeTraits.forEach((trait) => {
      if (!approvedPepeTraitsMap[trait.pepeId]) {
        approvedPepeTraitsMap[trait.pepeId] = [];
      }
      approvedPepeTraitsMap[trait.pepeId].push({
        id: trait.id,
        imageUrl: trait.imageUrl,
        index: trait.index,
        traitId: trait.traitId,
        traitOptionId: trait.traitOptionId,
      });
    });

    const approvedPepesWithTraits = approvedPepes.map((pepe) => ({
      ...pepe,
      traits: approvedPepeTraitsMap[pepe.id] || [],
    }));

    const hashPepe = await getLiveHashPepe(true);

    const shuffledPepes = shuffleArray(approvedPepesWithTraits);

    const similarPepes: Array<{
      hash: string;
      originalPepeId: number;
      traits: Array<{
        index: number;
        traitId: number;
        traitOptionId: number;
        imageUrl?: string | null;
      }>;
    }> = [];

    const groupedFilters: Array<{
      traitId: number;
      traitOptionIds: number[];
    }> = [];
    filters.forEach((filter) => {
      if (filter.traitId === 0) {
        return;
      }
      const groupedFilterIndex = groupedFilters.findIndex((gf) => gf.traitId === filter.traitId);
      if (groupedFilterIndex === -1) {
        groupedFilters.push({
          traitId: filter.traitId,
          traitOptionIds: [filter.traitOptionId],
        });
      } else {
        groupedFilters[groupedFilterIndex].traitOptionIds.push(filter.traitOptionId);
      }
    });

    const groups: Record<number, Record<number, number[]>> = {
      [-1]: {},
      [-2]: {},
      [-3]: {},
      [-4]: {},
    };
    traitOptions.forEach((traitOption) => {
      if (traitOptionIsLast(traitOption.createdAt.toString())) {
        if (!groups[-4][traitOption.traitId]) {
          groups[-4][traitOption.traitId] = [];
        }
        groups[-4][traitOption.traitId].push(traitOption.id);
      } else if (traitOptionIsNewest(traitOption.createdAt.toString())) {
        if (!groups[-3][traitOption.traitId]) {
          groups[-3][traitOption.traitId] = [];
        }
        groups[-3][traitOption.traitId].push(traitOption.id);
      } else if (traitOptionIsNew(traitOption.createdAt.toString())) {
        if (!groups[-2][traitOption.traitId]) {
          groups[-2][traitOption.traitId] = [];
        }
        groups[-2][traitOption.traitId].push(traitOption.id);
      } else if (traitOptionIsOld(traitOption.createdAt.toString())) {
        if (!groups[-1][traitOption.traitId]) {
          groups[-1][traitOption.traitId] = [];
        }
        groups[-1][traitOption.traitId].push(traitOption.id);
      }
    });

    const basicTraits = [bgTrait.id, frogTrait.id, eyesTrait.id, mouthTrait.id];
    if (groupedFilters) {
      groupedFilters.forEach((gf) => {
        if (!basicTraits.includes(gf.traitId)) {
          basicTraits.push(gf.traitId);
        }
      });
    }

    for (let i = 0; i < shuffledPepes.length; i++) {
      const pepe = shuffledPepes[i];

      if (
        pepe.traits.filter((trait) => trait.traitId === traitId1).length > 1 ||
        pepe.traits.filter((trait) => trait.traitId === traitId2).length > 1 ||
        (isBasic && pepe.traits.some((trait) => !basicTraits.includes(trait.traitId))) ||
        (hasSingleTraits && pepe.traits.length !== new Set(pepe.traits.map((t) => t.traitId)).size)
      ) {
        continue;
      }

      if (
        groupedFilters.length &&
        !groupedFilters.every((gf) =>
          gf.traitOptionIds.some(
            (traitOptionId) =>
              pepe.traits.findIndex((t) =>
                traitOptionId ? t.traitOptionId === traitOptionId : t.traitId === gf.traitId,
              ) > -1,
          ),
        )
      ) {
        continue;
      }

      const newPepeTraits = pepe.traits.map((trait) => {
        const traitOptionId =
          trait.traitId === traitId1
            ? !traitOptionId1
              ? randomElement(trait1AvailableOptions).id
              : traitOptionId1 < 0
                ? randomElement(groups[traitOptionId1][traitId1])
                : traitOptionId1
            : trait.traitId === traitId2
              ? !traitOptionId2
                ? randomElement(trait2AvailableOptions).id
                : traitOptionId2 < 0
                  ? randomElement(groups[traitOptionId2][traitId2])
                  : traitOptionId2
              : trait.traitId === bgTrait.id
                ? randomElement(bgTraitOptions).id
                : trait.traitOptionId;

        return {
          index: trait.index,
          traitId: trait.traitId,
          traitOptionId,
          imageUrl: traitOptionId !== trait.traitOptionId ? undefined : trait.imageUrl,
        };
      });

      if (pepe.traits.findIndex((t) => t.traitId === traitId1) === -1) {
        newPepeTraits.push({
          index: newPepeTraits.length,
          traitId: traitId1,
          traitOptionId: !traitOptionId1
            ? randomElement(trait1AvailableOptions).id
            : traitOptionId1 < 0
              ? randomElement(groups[traitOptionId1][traitId1])
              : traitOptionId1,
          imageUrl: undefined,
        });
      }

      if (traitId2 && pepe.traits.findIndex((t) => t.traitId === traitId2) === -1) {
        newPepeTraits.push({
          index: newPepeTraits.length,
          traitId: traitId2,
          traitOptionId: !traitOptionId2
            ? randomElement(trait2AvailableOptions).id
            : traitOptionId2 < 0
              ? randomElement(groups[traitOptionId2][traitId2])
              : traitOptionId2,
          imageUrl: undefined,
        });
      }

      if (newPepeTraits.some((pepeTrait) => !pepeTrait.traitOptionId)) {
        continue;
      }

      const hash = getHash(
        newPepeTraits.map((trait) => ({
          folder: traitsMap[trait.traitId].folder,
          file: traitOptionsMap[trait.traitOptionId].file,
        })),
      );

      if (hashPepe[hash]) {
        continue;
      }

      hashPepe[hash] = [pepe.id];

      similarPepes.push({
        hash,
        originalPepeId: pepe.id,
        traits: newPepeTraits,
      });

      if (similarPepes.length >= max) {
        break;
      }
    }

    const pepes: {
      id: number;
      originalPepeId?: number;
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
      const splicedPepes = similarPepes.splice(0, 1000);

      const newPepes = await db
        .insertInto('pepes')
        .values(
          splicedPepes.map(({ originalPepeId }) => ({
            isApproved: false,
            isLocked: false,
            originalPepeId,
          })),
        )
        .returning(['id', 'originalPepeId'])
        .execute();

      if (!newPepes) {
        throw new ConflictError('The Pepes could not be created.');
      }

      await db
        .insertInto('pepeTraits')
        .values(
          splicedPepes.flatMap((splicedPepe, i) => {
            pepes.push({
              id: newPepes[i].id,
              originalPepeId: newPepes[i].originalPepeId,
              traits: splicedPepe.traits
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

            return splicedPepe.traits.map((trait) => {
              return {
                imageUrl: trait.imageUrl,
                index: trait.index,
                pepeId: newPepes[i].id,
                traitId: trait.traitId,
                traitOptionId: trait.traitOptionId,
              };
            });
          }),
        )
        .execute();
    }

    return Response.json({
      pepes,
    });
  } catch (error) {
    return handleServerError(error);
  }
}
