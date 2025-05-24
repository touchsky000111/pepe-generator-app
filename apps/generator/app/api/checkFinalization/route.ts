import { existsSync } from 'fs';

import { listDirectoryFolders } from '@/utils/listDirectoryFolders';
import handleServerError from '@/utils/handleServerError';

export async function POST(_: Request) {
  try {
    if (!existsSync('./public/images/generated')) {
      return Response.json({
        remaining: 10000,
      });
    }

    const folders = await listDirectoryFolders('./public/images/generated');

    return Response.json({
      remaining: 10000 - folders.length,
    });
  } catch (error) {
    return handleServerError(error);
  }
}
