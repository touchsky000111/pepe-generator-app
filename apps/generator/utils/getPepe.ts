import { db } from 'db';

export const getPepe = async (id: number) => {
  const existingPepe = await db
    .selectFrom('pepes')
    .select(['imageUrl', 'isApproved', 'metadataUrl'])
    .where('id', '=', id)
    .executeTakeFirst();

  if (!existingPepe) {
    return;
  }

  const pepeLabels = await db
    .selectFrom('pepeLabels')
    .select(['name'])
    .where('pepeId', '=', id)
    .execute();

  const pepeTraits = await db
    .selectFrom('pepeTraits')
    .select(['imageUrl', 'index', 'pepeId', 'traitId', 'traitOptionId'])
    .where('pepeId', '=', id)
    .execute();

  return {
    ...existingPepe,
    labels: pepeLabels,
    traits: pepeTraits,
  };
};
