import { sentenceCase } from 'change-case';

export const cleanTraitValue = (value: string) => {
  return sentenceCase(
    value
      .split('_')
      .slice(-1)[0]
      .replace(/\.png$/, ''),
  );
};
