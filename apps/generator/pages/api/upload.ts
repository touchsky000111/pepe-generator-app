import { IncomingForm } from 'formidable';
import { put } from '@vercel/blob';
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

  const fileStream = createReadStream(files!.image![0].filepath);

  const { url: imageUrl } = await put(`/pepes/${fields!.id![0]}`, fileStream, {
    access: 'public',
  });

  await db
    .updateTable('pepes')
    .set({
      imageUrl,
    })
    .where('id', '=', Number(fields!.id![0]))
    .executeTakeFirst();

  res.status(200).json({});
}
