import { db } from 'db';

export const getAllTraits = async () => {
  const traits = await db.selectFrom('traits').select(['id', 'folder', 'name']).execute();
  return traits;
};
