import { db } from 'db';

export const getTraitOptionsMap = async () => {
  const traitOptions = await db
    .selectFrom('traitOptions')
    .select(['id', 'file', 'name', 'traitId'])
    .execute();

  const traitOptionsMap: Record<
    number,
    {
      file: string;
      name: string;
      traitId: number;
    }
  > = {};

  traitOptions.forEach((traitOption) => {
    traitOptionsMap[traitOption.id] = {
      file: traitOption.file,
      name: traitOption.name,
      traitId: traitOption.traitId,
    };
  });

  return traitOptionsMap;
};
