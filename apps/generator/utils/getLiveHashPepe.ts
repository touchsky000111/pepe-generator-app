import { db } from 'db';

import { getAllTraits } from './getAllTraits';
import { getAllTraitOptions } from './getAllTraitOptions';
import { mapById } from './mapById';
import { getHash } from './getHash';

export default async function getLiveHashPepe(encode = false) {
  const traits = await getAllTraits();
  const traitOptions = await getAllTraitOptions();

  const traitsMap = mapById(traits);
  const traitOptionsMap = mapById(traitOptions);

  const bgTrait = traits.find((trait) => trait.folder === 'bg')!;

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
    .where('traitId', '!=', bgTrait.id)
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

  const hashPepe: Record<string, number[]> = {};

  for (let i = 0; i < pepes.length; i++) {
    const pepe = pepes[i];

    const filteredTraits = pepeTraitMap[pepe.id] || [];

    const hash = getHash(filteredTraits, encode);

    if (!hashPepe[hash]) {
      hashPepe[hash] = [];
    }
    hashPepe[hash].push(pepe.id);
  }

  return hashPepe;
}
