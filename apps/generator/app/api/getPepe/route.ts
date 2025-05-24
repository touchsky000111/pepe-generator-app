import { db } from 'db';
import axios from 'axios';
import { z } from 'zod';

import UnprocessableContentError from '@/errors/UnprocessableContentError';
import handleServerError from '@/utils/handleServerError';
import NotFoundError from '@/errors/NotFoundError';
import getCache from '@/utils/getCache';
import setCache from '@/utils/setCache';

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

    const pepe = await db
      .selectFrom('pepes')
      .select(['id', 'imageUrl', 'isApproved', 'metadataUrl', 'originalPepeId', 'status'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!pepe) {
      throw new NotFoundError('Pepe not found.');
    }

    const pepeLabels = await db
      .selectFrom('pepeLabels')
      .select(['id', 'name', 'pepeId'])
      .orderBy('name asc')
      .where('pepeId', '=', id)
      .execute();

    const pepeTraits = await db
      .selectFrom('pepeTraits')
      .select(['id', 'imageUrl', 'index', 'pepeId', 'traitId', 'traitOptionId'])
      .where('pepeId', '=', id)
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

    const traitOptions = pepeTraits.length
      ? await db
          .selectFrom('traitOptions')
          .select(['id', 'file', 'name', 'traitId'])
          .where(
            'traitId',
            'in',
            pepeTraits.map((pepeTrait) => pepeTrait.traitId),
          )
          .execute()
      : [];

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
        id,
        imageUrl: pepe.imageUrl || undefined,
        isApproved: pepe.isApproved,
        labels: pepeLabels.filter((pl) => pl.pepeId === pepe.id).map((pl) => pl.name),
        metadata: pepe.metadataUrl ? (await axios(pepe.metadataUrl)).data : undefined,
        originalPepeId: pepe.originalPepeId,
        status: pepe.status,
        traits: thisPepesTraits.sort((a, b) => a.index - b.index),
      },
    });
  } catch (error) {
    return handleServerError(error);
  }
}
