import { kv, put } from 'db';
import { z } from 'zod';

import handleServerError from '@/utils/handleServerError';
import UnprocessableContentError from '@/errors/UnprocessableContentError';
import { getHashPepe } from '@/utils/getHashPepe';
import { getPepeHash } from '@/utils/getPepeHash';

const schema = z.object({
  hash: z.string({
    required_error: 'Hash is required.',
  }),
  pepeId: z
    .number({
      required_error: 'Pepe ID is required.',
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

    const { hash, pepeId } = result.data;

    const hashPepe = await getHashPepe();
    const pepeHash = await getPepeHash();

    hashPepe[hash].forEach((oldPepeId) => {
      if (oldPepeId !== pepeId) {
        delete pepeHash[oldPepeId];
      }
    });
    hashPepe[hash] = [pepeId];

    const { url: pepeHashUrl } = await put('/pepe-hash', JSON.stringify(pepeHash), {
      access: 'public',
    });
    const { url: hashPepeUrl } = await put('/hash-pepe', JSON.stringify(hashPepe), {
      access: 'public',
    });

    await kv.set('/pepe-hash', pepeHashUrl);
    await kv.set('/hash-pepe', hashPepeUrl);

    return Response.json({
      pepeHash,
      hashPepe,
    });
  } catch (error) {
    return handleServerError(error);
  }
}
