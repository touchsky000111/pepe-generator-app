import { db, kv, put } from 'db';
import { z } from 'zod';
import handleServerError from '@/utils/handleServerError';
import UnprocessableContentError from '@/errors/UnprocessableContentError';
import NotFoundError from '@/errors/NotFoundError';
import ConflictError from '@/errors/ConflictError';
import { getHash } from '@/utils/getHash';
import { getAllTraits } from '@/utils/getAllTraits';
import { getAllTraitOptions } from '@/utils/getAllTraitOptions';
import { getPepeHash } from '@/utils/getPepeHash';
import { getHashPepe } from '@/utils/getHashPepe';
import { randomElement } from '@/utils/randomElement';

const schema = z.object({
  id: z
    .number({
      required_error: 'ID is required.',
    })
    .min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new UnprocessableContentError(result.error.errors[0].message);
    }

    const { id } = result.data;

    const traits = await getAllTraits();
    const traitOptions = await getAllTraitOptions();

    const pepe = await db
      .selectFrom('pepes')
      .select(['imageUrl', 'metadataUrl'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!pepe) {
      throw new NotFoundError('Pepe not found.');
    }

    const pepeLabels = await db
      .selectFrom('pepeLabels')
      .select(['name', 'pepeId'])
      .where('pepeId', '=', id)
      .execute();

    const pepeTraits = await db
      .selectFrom('pepeTraits')
      .select(['imageUrl', 'index', 'pepeId', 'traitId', 'traitOptionId'])
      .where('pepeId', '=', id)
      .execute();

    const bgTrait = traits.find((trait) => trait.folder === 'bg');

    if (!bgTrait) {
      throw new ConflictError('Background does not exist.');
    }

    const pepeBgTraitOptionIds = pepeTraits
      .filter((pepeTrait) => pepeTrait.traitId === bgTrait.id)
      .map((pepeTrait) => pepeTrait.traitOptionId);

    const bgTraitOptions = traitOptions.filter(
      (traitOption) =>
        traitOption.traitId === bgTrait.id && !pepeBgTraitOptionIds.includes(traitOption.id),
    );

    if (!bgTraitOptions.length) {
      throw new ConflictError('Background Options do not exist.');
    }

    const newPepe = await db
      .insertInto('pepes')
      .values({
        imageUrl: pepe.imageUrl,
        isApproved: false,
        isLocked: false,
        metadataUrl: pepe.metadataUrl,
        originalPepeId: id,
      })
      .returning('id')
      .executeTakeFirst();

    if (!newPepe) {
      throw new ConflictError('Failed to create new Pepe.');
    }

    const newPepeLabels = pepeLabels.map((label) => ({
      pepeId: newPepe.id,
      name: label.name,
    }));

    if (newPepeLabels.length > 0) {
      await db.insertInto('pepeLabels').values(newPepeLabels).execute();
    }

    const newPepeTraits = pepeTraits.map((trait) => ({
      pepeId: newPepe!.id,
      index: trait.index,
      traitId: trait.traitId,
      traitOptionId:
        trait.traitId === bgTrait.id ? randomElement(bgTraitOptions).id : trait.traitOptionId,
      imageUrl: trait.imageUrl,
    }));

    if (newPepeTraits.length > 0) {
      await db.insertInto('pepeTraits').values(newPepeTraits).execute();
    }

    // const pepeHash = await getPepeHash();
    // const hashPepe = await getHashPepe();

    // pepeHash[newPepe.id] = pepeHash[id];
    // hashPepe[pepeHash[id]].push(newPepe.id);

    // const { url: pepeHashUrl } = await put('/pepe-hash', JSON.stringify(pepeHash), {
    //   access: 'public',
    // });
    // const { url: hashPepeUrl } = await put('/hash-pepe', JSON.stringify(hashPepe), {
    //   access: 'public',
    // });

    // await kv.set('/pepe-hash', pepeHashUrl);
    // await kv.set('/hash-pepe', hashPepeUrl);

    return Response.json({
      id: newPepe.id,
    });
  } catch (error) {
    return handleServerError(error);
  }
}
