import { db, deinit, init, seed } from 'db';

import { loadTraits } from './loadTraits';

export default async function initTestSuite() {
  await deinit();
  await init();
  await seed();

  const traits = await loadTraits();

  const insertedTraits = await db
    .insertInto('traits')
    .values(
      traits.map((trait) => ({
        folder: trait.folder,
        name: trait.label,
      })),
    )
    .returning(['id', 'folder'])
    .execute();

  await db
    .insertInto('traitOptions')
    .values(
      traits.flatMap((trait) => {
        return trait.options.map((option) => {
          const insertedTrait = insertedTraits.find((t) => t.folder === trait.folder);
          return {
            traitId: insertedTrait!.id,
            file: option.file,
            name: option.label,
          };
        });
      }),
    )
    .returning(['id', 'name', 'traitId'])
    .execute();
}
