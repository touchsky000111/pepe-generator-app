import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';

import { db } from 'db';
import { createReadStream } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<{}>) {
  const form = new IncomingForm();

  const [fields, files] = await form.parse(req);

  const id = Number(fields!.id![0]);
  const traits = JSON.parse(fields!.traits![0]) as Array<{
    id: number;
    index: number;
    optionId: number;
  }>;

  const existingPepe = await db.selectFrom('pepes').where('id', '=', id).executeTakeFirst();

  if (!existingPepe) {
    res.status(404).json({});
    return;
  }

  const currentPepeTraits = await db
    .selectFrom('pepeTraits')
    .select('id')
    .where('pepeId', '=', id)
    .execute();

  for (let i = 0; i < traits.length; i++) {
    const trait = traits[i];

    const imageUrl = await (async () => {
      const imageFile = files?.[`trait-${trait.index}`]?.[0];

      if (imageFile) {
        const fileStream = createReadStream(imageFile.filepath);

        const { url: imageUrl } = await put(`pepes/${id}/traits/${trait.index}`, fileStream, {
          access: 'public',
        });

        return imageUrl;
      }

      return null;
    })();

    await db
      .insertInto('pepeTraits')
      .values({
        imageUrl,
        index: trait.index,
        pepeId: id,
        traitId: trait.id,
        traitOptionId: trait.optionId,
      })
      .executeTakeFirst();
  }

  await db
    .deleteFrom('pepeTraits')
    .where('pepeId', '=', id)
    .where(
      'id',
      'in',
      currentPepeTraits.map((pepeTrait) => pepeTrait.id),
    )
    .execute();

  res.status(200).json({});
}
