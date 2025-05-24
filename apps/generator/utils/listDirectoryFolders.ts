import { statSync } from 'fs';

import { listDirectoryItems } from './listDirectoryItems';

export const listDirectoryFolders = async (dir: string) => {
  const items = await listDirectoryItems(dir);

  const folders = items.filter((folder) => statSync(`${dir}/${folder}`).isDirectory());

  return folders;
};
