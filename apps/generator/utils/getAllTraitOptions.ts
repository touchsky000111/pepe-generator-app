import { db } from 'db';

export const getAllTraitOptions = async () => {
  const traitOptions = await db
    .selectFrom('traitOptions')
    .select(['id', 'file', 'name', 'traitId', 'createdAt'])
    .execute();
  return traitOptions;
};
