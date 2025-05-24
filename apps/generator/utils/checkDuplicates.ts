import { db, kv, put } from 'db';

import { getAllTraitOptions } from './getAllTraitOptions';
import { getAllTraits } from './getAllTraits';
import { getHash } from './getHash';
import { mapById } from './mapById';

export const checkDuplicates = async () => {
  const traits = await getAllTraits();
  const traitOptions = await getAllTraitOptions();

  const traitsMap = mapById(traits);
  const traitOptionsMap = mapById(traitOptions);

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

  const pepeIds = pepes.map((pepe) => pepe.id);
  const pepeTraits = pepeTraitsUnfiltered.filter((pepeTrait) => pepeIds.includes(pepeTrait.pepeId));

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

  const { url: pepeHashUrl } = await put('/pepe-hash', JSON.stringify(pepeHash), {
    access: 'public',
  });
  const { url: hashPepeUrl } = await put('/hash-pepe', JSON.stringify(hashPepe), {
    access: 'public',
  });

  await kv.set('/pepe-hash', pepeHashUrl);
  await kv.set('/hash-pepe', hashPepeUrl);

  return {
    pepeHash,
    hashPepe,
  };
};
