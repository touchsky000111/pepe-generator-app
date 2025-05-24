import { statSync } from 'fs';

import { listDirectoryItems } from './listDirectoryItems';

export const listDirectoryFiles = async (dir: string) => {
  const items = await listDirectoryItems(dir);

  const files = items.filter((item) => statSync(`${dir}/${item}`).isFile());

  return files;
};
