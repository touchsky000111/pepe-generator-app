import { camelCase, sentenceCase } from 'change-case';
import { listDirectoryFiles } from './listDirectoryFiles';
import { listDirectoryFolders } from './listDirectoryFolders';
import { cleanTraitValue } from './cleanTraitName';
import path, { extname } from 'path';

interface Trait {
  folder: string;
  label: string;
  options: Array<{
    file: string;
    label: string;
    value: string;
  }>;
  valuesWithBlanks: string[];
}

export const loadTraits = async () => {
  const traitImagesDir = path.join(process.cwd(), 'public', 'images', 'traits');

  const folders = await listDirectoryFolders(traitImagesDir);

  const traits: Trait[] = [];

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];

    const files = (await listDirectoryFiles(`${traitImagesDir}/${folder}`)).filter(
      (file) => extname(file) === '.png',
    );

    const blanks =
      folder === 'bg' || folder === 'eyes' || folder === 'mouth' || folder === 'body'
        ? []
        : Array.from({ length: 177 - files.length }, () => '');

    traits.push({
      folder,
      label: sentenceCase(folder),
      options: files.map((file) => ({
        file,
        label: cleanTraitValue(file),
        value: camelCase(
          file
            .split('_')
            .slice(-1)[0]
            .replace(/\.png$/, ''),
        ),
      })),
      valuesWithBlanks:
        folder === 'frog'
          ? [
              camelCase(
                'body_0000s_0001_happy-frog.png'
                  .split('_')
                  .slice(-1)[0]
                  .replace(/\.png$/, ''),
              ),
            ]
          : files.concat(blanks).map((file) =>
              camelCase(
                file
                  .split('_')
                  .slice(-1)[0]
                  .replace(/\.png$/, ''),
              ),
            ),
    });
  }

  return traits;
};
