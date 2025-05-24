'use server';

import { db } from 'db';

import handleServerActionError from '@/utils/handleServerActionError';

export default async function listTraitsAction() {
  try {
    const traits = await db
      .selectFrom('traits')
      .select(['id', 'folder', 'name'])
      .orderBy('name asc')
      .execute();

    const traitOptions = await db
      .selectFrom('traitOptions')
      .select(['id', 'file', 'name', 'traitId'])
      .orderBy('name asc')
      .execute();

    const pepeTraits = await db
      .selectFrom('pepeTraits')
      .select(({ fn, val, ref }) => ['traitOptionId', fn.count<number>('id').as('count')])
      .groupBy('traitOptionId')
      .execute();

    return {
      traits: traits.map((trait) => {
        const options = traitOptions.filter((option) => option.traitId === trait.id);
        return {
          id: trait.id,
          folder: trait.folder,
          name: trait.name,
          options: options.map((option) => ({
            id: option.id,
            file: option.file,
            name: option.name,
            count: Number(pepeTraits.find((trait) => trait.traitOptionId === option.id)?.count),
          })),
        };
      }),
    };
  } catch (error) {
    return handleServerActionError(error);
  }
}
