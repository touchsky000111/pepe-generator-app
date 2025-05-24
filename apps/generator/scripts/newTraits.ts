import { db } from 'db';
import path, { extname } from 'path';

import { cleanTraitValue } from '../utils/cleanTraitName';
import { getAllTraitOptions } from '../utils/getAllTraitOptions';
import { getAllTraits } from '../utils/getAllTraits';
import { listDirectoryFiles } from '../utils/listDirectoryFiles';
import { listDirectoryFolders } from '../utils/listDirectoryFolders';

export async function newTraits() {
  const allTraits = await getAllTraits();
  const allTraitOptions = await getAllTraitOptions();

  const traitImagesDir = path.join(process.cwd(), 'public', 'images', 'traits', 'new');

  const folders = await listDirectoryFolders(traitImagesDir);

  const allTraitsMap: Record<
    string,
    {
      id: number;
      folder: string;
      name: string;
    }
  > = {};
  allTraits.forEach((trait) => {
    allTraitsMap[trait.folder] = trait;
  });

  const allTraitOptionsMap: Record<string, boolean> = {};
  allTraitOptions.forEach((traitOption) => {
    allTraitOptionsMap[traitOption.file] = true;
  });

  const traitOptions = (
    await Promise.all(
      folders.flatMap(async (folder) => {
        const trait = allTraitsMap[folder];

        const files = (await listDirectoryFiles(`${traitImagesDir}/${folder}`)).filter(
          (file) => extname(file) === '.png',
        );

        return files.map((file) => ({
          name: cleanTraitValue(file),
          file: file,
          traitId: trait.id,
        }));
      }),
    )
  ).flatMap((t) => t);

  console.log(traitOptions);

  traitOptions.forEach((traitOption) => {
    if (allTraitOptionsMap[traitOption.file]) {
      throw new Error(`Trait option already exists: ${traitOption.file}`);
    }
  });

  if (process.env.WRITE) {
    await db.insertInto('traitOptions').values(traitOptions).execute();
  }

  db.destroy();
}

newTraits();
