import type { NextApiRequest, NextApiResponse } from 'next';

// import { db, deinit, init } from 'db';
// import { loadTraits } from '@/utils/loadTraits';
// import { generateRandomTraits } from '@/utils/generateRandomTraits';
// import { getHash } from '@/utils/getHash';
// import { checkDuplicates } from '@/utils/checkDuplicates';

export default async function handler(_: NextApiRequest, res: NextApiResponse<{}>) {
  // const max = req.body.max as number;

  // const traits = await loadTraits();
  // const hashes: string[] = [];

  // const pepes: Array<{
  //   id: number;
  //   hash: string;
  //   traits: Array<{
  //     index: number;
  //     folder: string;
  //     file: string;
  //     value: string;
  //   }>;
  // }> = [];
  // for (let i = 0; i < max; i++) {
  //   const id = i + 1;

  //   while (true) {
  //     const pepeTraits = await generateRandomTraits();

  //     const hash = getHash(
  //       pepeTraits.map((trait) => ({
  //         folder: trait.folder,
  //         file: trait.file,
  //       })),
  //     );

  //     if (!hashes.includes(hash)) {
  //       pepes.push({
  //         id,
  //         traits: pepeTraits,
  //         hash,
  //       });

  //       hashes.push(hash);

  //       break;
  //     }
  //   }
  // }

  // await deinit();
  // await init();

  // const insertedTraits = await db
  //   .insertInto('traits')
  //   .values(
  //     traits.map((trait) => ({
  //       folder: trait.folder,
  //       name: trait.label,
  //     })),
  //   )
  //   .returning(['id', 'folder'])
  //   .execute();

  // const insertedOptions = await db
  //   .insertInto('traitOptions')
  //   .values(
  //     traits.flatMap((trait) => {
  //       return trait.options.map((option) => {
  //         const insertedTrait = insertedTraits.find((t) => t.folder === trait.folder);
  //         return {
  //           traitId: insertedTrait!.id,
  //           file: option.file,
  //           name: option.label,
  //         };
  //       });
  //     }),
  //   )
  //   .returning(['id', 'name', 'traitId'])
  //   .execute();

  // await db
  //   .insertInto('pepes')
  //   .values(
  //     pepes.map((pepe) => ({
  //       name: `Pepe #${pepe.id}`,
  //       hash: pepe.hash,
  //     })),
  //   )
  //   .execute();

  // const pepeTraits = pepes.flatMap((pepe) => {
  //   return pepe.traits.map((pepeTrait) => {
  //     const insertedTrait = insertedTraits.find((t) => t.folder === pepeTrait.folder);
  //     if (!insertedTrait) {
  //       throw new Error('Inserted trait not found');
  //     }
  //     const insertedOption = insertedOptions.find(
  //       (o) => o.traitId === insertedTrait.id && o.name === pepeTrait.value,
  //     );
  //     if (!insertedOption) {
  //       throw new Error('Inserted option not found');
  //     }
  //     return {
  //       index: pepeTrait.index,
  //       pepeId: pepe.id,
  //       traitId: insertedTrait.id,
  //       traitOptionId: insertedOption.id,
  //     };
  //   });
  // });

  // while (pepeTraits.length) {
  //   await db.insertInto('pepeTraits').values(pepeTraits.splice(0, 10000)).execute();
  // }

  // await checkDuplicates();

  res.status(200).json({});
}
