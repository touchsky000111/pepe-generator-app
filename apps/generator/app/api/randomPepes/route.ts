import { db } from 'db';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import { getHashPepe } from '@/utils/getHashPepe';
import { getPepeHash } from '@/utils/getPepeHash';
import handleServerError from '@/utils/handleServerError';
import setCache from '@/utils/setCache';
import { getTraitsMap } from '@/utils/getTraitsMap';
import { getTraitOptionsMap } from '@/utils/getTraitOptionsMap';
import { shuffleArray } from '@/utils/shuffleArray';

const schema = z.object({});

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const traitsMap = await getTraitsMap();
    const traitOptionsMap = await getTraitOptionsMap();

    const pepeHash = await getPepeHash();
    const hashPepe = await getHashPepe();

    const allPepes = await db
      .selectFrom('pepes')
      .select(['id', 'imageUrl', 'isApproved'])
      .where('isApproved', '=', true)
      .where('status', '!=', 'deleted')
      .execute();

    const pepes = shuffleArray(allPepes).slice(0, 100);

    const pepeIds = pepes.map((pepe) => pepe.id);

    const pepeLabels = pepes.length
      ? await db
          .selectFrom('pepeLabels')
          .select(['id', 'name', 'pepeId'])
          .where('pepeId', 'in', pepeIds)
          .execute()
      : [];

    const pepeLabelsMap: Record<number, string[]> = {};
    pepeLabels.forEach((label) => {
      if (!pepeLabelsMap[label.pepeId]) {
        pepeLabelsMap[label.pepeId] = [];
      }
      pepeLabelsMap[label.pepeId].push(label.name);
    });

    const pepeTraits = pepes.length
      ? await db
          .selectFrom('pepeTraits')
          .select(['id', 'imageUrl', 'index', 'pepeId', 'traitId', 'traitOptionId'])
          .where('pepeId', 'in', pepeIds)
          .orderBy('index asc')
          .execute()
      : [];

    const pepeTraitsMap: Record<
      number,
      Array<{
        id: number;
        imageUrl?: string | null;
        index: number;
        pepeId: number;
        traitId: number;
        traitOptionId: number;
      }>
    > = {};
    pepeTraits.forEach((pepeTrait) => {
      if (!pepeTraitsMap[pepeTrait.pepeId]) {
        pepeTraitsMap[pepeTrait.pepeId] = [];
      }
      pepeTraitsMap[pepeTrait.pepeId].push(pepeTrait);
    });

    const pepesWithTraits = pepes.map((pepe) => {
      const thisPepesTraits = (pepeTraitsMap[pepe.id] || []).map((pt) => {
        const trait = traitsMap[pt.traitId];
        const option = traitOptionsMap[pt.traitOptionId];

        return {
          id: pt.traitId,
          imageUrl: pt.imageUrl,
          index: pt.index,
          optionId: pt.traitOptionId,
          folder: trait.folder,
          file: option.file,
          name: trait.name,
          value: option.name,
        };
      });

      return {
        id: pepe.id,
        hash: pepeHash[pepe.id] || '',
        imageUrl: pepe.imageUrl,
        isApproved: pepe.isApproved,
        labels: pepeLabelsMap[pepe.id],
        traits: thisPepesTraits,
        copies: hashPepe[pepeHash[pepe.id] || '']?.length || 0,
      };
    });

    return Response.json(
      await setCache(pathname, result.data, {
        pepes: pepesWithTraits,
      }),
    );
  } catch (error) {
    return handleServerError(error);
  }
}
