import { db } from 'db';

import { getHash } from './getHash';
import { getTraitsMap } from './getTraitsMap';
import { getTraitOptionsMap } from './getTraitOptionsMap';

export default async function softCheckDuplicates() {
  const traitsMap = await getTraitsMap();
  const traitOptionsMap = await getTraitOptionsMap();

  const pepes = await db
    .selectFrom('pepes')
    .select(['id'])
    .where('status', '=', 'active')
    .orderBy('id')
    .execute();

  const pepeTraitsUnfiltered = await db
    .selectFrom('pepeTraits')
    .select(['pepeId', 'traitId', 'traitOptionId'])
    .orderBy(['traitId', 'traitOptionId'])
    .execute();

  const pepeIdsMap: Record<number, boolean> = {};
  pepes.forEach((pepe) => {
    pepeIdsMap[pepe.id] = true;
  });
  const pepeTraits = pepeTraitsUnfiltered.filter((pepeTrait) => pepeIdsMap[pepeTrait.pepeId]);

  const pepeTraitMap: Record<number, Array<{ folder: string; file: string }>> = {};

  pepeTraits.map((pepeTrait) => {
    if (!pepeTraitMap[pepeTrait.pepeId]) {
      pepeTraitMap[pepeTrait.pepeId] = [];
    }
    pepeTraitMap[pepeTrait.pepeId].push({
      folder: traitsMap[pepeTrait.traitId].folder,
      file: traitOptionsMap[pepeTrait.traitOptionId].file,
    });
  });

  const pepesWithTraits = pepes.map((pepe) => {
    const filteredTraits = pepeTraitMap[pepe.id] || [];

    const hash = getHash(filteredTraits);

    return {
      id: pepe.id,
      hash,
      traits: filteredTraits,
    };
  });

  const pepeHash: Record<number, string> = {};
  const hashPepe: Record<string, number[]> = {};

  pepesWithTraits.forEach((pepe) => {
    pepeHash[pepe.id] = pepe.hash;
    if (!hashPepe[pepe.hash]) {
      hashPepe[pepe.hash] = [];
    }
    hashPepe[pepe.hash].push(pepe.id);
  });

  return {
    pepeHash,
    hashPepe,
  };
}
