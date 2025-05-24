import { createHash } from 'crypto';

export const getHash = (
  traits: Array<{
    folder: string;
    file: string;
  }>,
  encode = true,
) => {
  const input = traits
    .filter(
      (trait) =>
        trait.folder !== 'bg' &&
        (trait.folder !== 'frog' || trait.file === 'frog_0000s_0000_skull.png'),
    )
    .map((trait) => `${trait.folder}/${trait.file}`)
    .sort((a, b) => a.localeCompare(b));

  const parsedInput = JSON.stringify(input);

  if (!encode) {
    return parsedInput;
  }

  const hash = createHash('sha256');
  hash.update(parsedInput);
  return hash.digest('hex');
};
