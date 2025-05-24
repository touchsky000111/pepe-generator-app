import { db } from 'db';
import { rm } from 'fs/promises';
import path from 'path';

export default async function deinitTestSuite() {
  const dir = path.join(process.cwd(), 'tmp');
  await rm(dir, { force: true, recursive: true });

  await db.destroy();
}
