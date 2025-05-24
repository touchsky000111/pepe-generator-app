import { db } from 'db';

export const getTraitsMap = async () => {
  const traits = await db.selectFrom('traits').select(['id', 'folder', 'name']).execute();

  const traitMap: Record<
    number,
    {
      folder: string;
      name: string;
    }
  > = {};

  traits.forEach((trait) => {
    traitMap[trait.id] = {
      folder: trait.folder,
      name: trait.name,
    };
  });

  return traitMap;
};
