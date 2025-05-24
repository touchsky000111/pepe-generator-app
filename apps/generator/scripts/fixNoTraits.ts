import 'dotenv/config';
import { db, init } from 'db';

init();

async function fixNoTraits() {
  const pepes = await db
    .selectFrom('pepes')
    .select('id')
    .where('isApproved', '=', false)
    .where('status', '!=', 'deleted')
    .execute();

  const pepeTraits = await db
    .selectFrom('pepeTraits')
    .select(['pepeId', 'traitId', 'traitOptionId'])
    .execute();

  const pepeTraitsMap: Record<number, number> = {};
  pepeTraits.forEach((pepeTrait) => {
    if (!pepeTraitsMap[pepeTrait.pepeId]) {
      pepeTraitsMap[pepeTrait.pepeId] = 0;
    }
    pepeTraitsMap[pepeTrait.pepeId]++;
  });

  const pepesWithNoTraits: number[] = [];
  pepes.forEach((pepe) => {
    if (!pepeTraitsMap[pepe.id]) {
      pepesWithNoTraits.push(pepe.id);
    }
  });

  console.log(pepesWithNoTraits);

  console.log(`${pepesWithNoTraits.length} total`);

  if (process.env.WRITE) {
    if (pepesWithNoTraits.length) {
      await db
        .updateTable('pepes')
        .set({
          status: 'deleted',
        })
        .where('id', 'in', pepesWithNoTraits)
        .execute();
    }
  }

  db.destroy();
}

fixNoTraits();
