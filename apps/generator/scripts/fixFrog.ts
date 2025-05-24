import 'dotenv/config';
import { db, init } from 'db';
import { getAllTraitOptions } from '../utils/getAllTraitOptions';
import { getAllTraits } from '../utils/getAllTraits';

init();

async function fixFrog() {
  const traits = await getAllTraits();
  const traitOptions = await getAllTraitOptions();

  const frogTrait = traits.find((trait) => trait.name === 'Frog');
  if (!frogTrait) {
    throw new Error('Frog trait not found');
  }

  const mouthTrait = traits.find((trait) => trait.name === 'Mouth');
  if (!mouthTrait) {
    throw new Error('Mouth trait not found');
  }

  const happyFrogTraitOption = traitOptions.find(
    (traitOption) => traitOption.traitId === frogTrait.id && traitOption.name === 'Happy frog',
  );
  if (!happyFrogTraitOption) {
    throw new Error('Happy frog trait option not found');
  }

  const sadFrogTraitOption = traitOptions.find(
    (traitOption) => traitOption.traitId === frogTrait.id && traitOption.name === 'Sad frog',
  );
  if (!sadFrogTraitOption) {
    throw new Error('Sad frog trait option not found');
  }

  const traitOptionsForSadFrogMap: Record<number, boolean> = {};
  [
    'Turt snurtle',
    'Eyemouth',
    'Pizza',
    'Gleeful',
    'Fangs',
    'Hotlips',
    'Buckteeth',
    'Daddy mouthed',
    'Sad mouthed',
    'Bored mouthed',
    'Cute mouthed',
    'Lip hooked',
    'Hot mouthed',
    'Bloody',
    'Goob mouthed',
    'Toothy red',
  ].forEach((name) => {
    const traitOption = traitOptions.find(
      (traitOption) => traitOption.traitId === mouthTrait.id && traitOption.name === name,
    );

    if (!traitOption) {
      throw new Error('Trait option not found by name');
    }

    traitOptionsForSadFrogMap[traitOption.id] = true;
  });

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

  const pepeTraitMap: Record<
    number,
    {
      frogTrait?: {
        pepeId: number;
        traitId: number;
        traitOptionId: number;
      };
      mouthTrait?: {
        pepeId: number;
        traitId: number;
        traitOptionId: number;
      };
    }
  > = {};

  pepeTraits.forEach((pepeTrait) => {
    if (!pepeTraitMap[pepeTrait.pepeId]) {
      pepeTraitMap[pepeTrait.pepeId] = {};
    }
    if (pepeTrait.traitId === frogTrait.id) {
      pepeTraitMap[pepeTrait.pepeId].frogTrait = pepeTrait;
    } else if (pepeTrait.traitId === mouthTrait.id) {
      pepeTraitMap[pepeTrait.pepeId].mouthTrait = pepeTrait;
    }
  });

  const sad: number[] = [];
  const happy: number[] = [];
  const missing: number[] = [];
  const noTraits: number[] = [];

  pepes.forEach((pepe) => {
    if (!pepeTraitMap[pepe.id]) {
      noTraits.push(pepe.id);
      return;
    }

    const pepeFrogTrait = pepeTraitMap[pepe.id].frogTrait;
    const pepeMouthTrait = pepeTraitMap[pepe.id].mouthTrait;

    if (!pepeFrogTrait) {
      missing.push(pepe.id);
      return;
    }

    if (pepeMouthTrait && traitOptionsForSadFrogMap[pepeMouthTrait.traitOptionId]) {
      if (pepeFrogTrait.traitOptionId === happyFrogTraitOption.id) {
        sad.push(pepe.id);
      }
    } else {
      if (pepeFrogTrait.traitOptionId === sadFrogTraitOption.id) {
        happy.push(pepe.id);
      }
    }
  });

  console.log(missing);
  console.log(noTraits);

  console.log(`${sad.length} sad`);
  console.log(`${happy.length} happy`);
  console.log(`${missing.length} missing`);
  console.log(`${noTraits.length} no traits`);

  if (process.env.WRITE) {
    if (sad.length) {
      await db
        .updateTable('pepeTraits')
        .set({
          traitOptionId: sadFrogTraitOption.id,
        })
        .where('traitId', '=', frogTrait.id)
        .where('pepeId', 'in', sad)
        .execute();
    }

    if (happy.length) {
      await db
        .updateTable('pepeTraits')
        .set({
          traitOptionId: happyFrogTraitOption.id,
        })
        .where('traitId', '=', frogTrait.id)
        .where('pepeId', 'in', happy)
        .execute();
    }
  }

  db.destroy();
}

fixFrog();
