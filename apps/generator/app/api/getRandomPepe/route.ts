import { db } from 'db';
import axios from 'axios';

import ConflictError from '@/errors/ConflictError';
import NotFoundError from '@/errors/NotFoundError';
import handleServerError from '@/utils/handleServerError';
import { shuffleArray } from '@/utils/shuffleArray';

export async function POST(_: Request) {
  try {
    const pepes = await db
      .selectFrom('pepes')
      .select(['pepes.id', 'imageUrl', 'metadataUrl'])
      .where('isApproved', '=', true)
      .where('isLocked', '=', false)
      .execute();

    if (!pepes.length) {
      throw new ConflictError('No available Pepes.');
    }

    const pepe = shuffleArray(pepes)[0];

    if (!pepe) {
      throw new NotFoundError('Pepe not found.');
    }

    const pepeLabels = await db
      .selectFrom('pepeLabels')
      .select(['id', 'name', 'pepeId'])
      .where('pepeId', '=', pepe.id)
      .execute();

    const pepeTraits = await db
      .selectFrom('pepeTraits')
      .select(['id', 'imageUrl', 'index', 'pepeId', 'traitId', 'traitOptionId'])
      .where('pepeId', '=', pepe.id)
      .execute();

    const traits = pepeTraits.length
      ? await db
          .selectFrom('traits')
          .select(['id', 'folder', 'name'])
          .where(
            'id',
            'in',
            pepeTraits.map((pepeTrait) => pepeTrait.traitId),
          )
          .execute()
      : [];

    const traitOptions = await db
      .selectFrom('traitOptions')
      .select(['id', 'file', 'name', 'traitId'])
      .where(
        'traitId',
        'in',
        pepeTraits.map((pepeTrait) => pepeTrait.traitId),
      )
      .execute();

    const thisPepesTraits = pepeTraits
      .filter((pt) => pt.pepeId === pepe.id)
      .map((pt) => {
        const trait = traits.find((trait) => trait.id === pt.traitId)!;
        const option = traitOptions.find((option) => option.id === pt.traitOptionId)!;

        return {
          id: trait.id,
          imageUrl: pt.imageUrl,
          index: pt.index,
          optionId: option.id,
          folder: trait.folder,
          file: option.file,
          name: trait.name,
          value: option.name,
        };
      })
      .sort((a, b) => a.index - b.index);

    return Response.json({
      pepe: {
        id: pepe.id,
        imageUrl: pepe.imageUrl || undefined,
        isApproved: true,
        labels: pepeLabels.filter((pl) => pl.pepeId === pepe.id).map((pl) => pl.name),
        metadata: pepe.metadataUrl ? (await axios(pepe.metadataUrl)).data : undefined,
        traits: thisPepesTraits.sort((a, b) => a.index - b.index),
      },
    });
  } catch (error) {
    return handleServerError(error);
  }
}
