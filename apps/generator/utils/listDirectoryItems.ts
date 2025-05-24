import { readdir } from 'fs/promises';

export const listDirectoryItems = async (dir: string) => {
  const items = await readdir(dir);

  return items;
};
