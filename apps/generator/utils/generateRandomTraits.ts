import { ORDERED_TRAITS } from '@/constants/ORDERED_TRAITS';
import { loadTraits } from './loadTraits';

export const generateRandomTraits = async () => {
  const traits = await loadTraits();

  const pepeTraits: {
    index: number;
    folder: string;
    file: string;
    value: string;
  }[] = [];

  for (let i = 0; i < ORDERED_TRAITS.length; i++) {
    const category = ORDERED_TRAITS[i];
    const trait = traits.find((t) => t.folder === category);
    console.log(">>>>");
    console.log(category);
    console.log(trait?.options.length);
    console.log(trait?.valuesWithBlanks.length);
    if (!trait) {
      console.warn(`Trait not found for category: ${category}`);
      continue;
    }

    if (!trait.valuesWithBlanks || trait.valuesWithBlanks.length === 0) {
      console.warn(`No valuesWithBlanks for trait: ${category}`);
      continue;
    }

    const random = trait.valuesWithBlanks[Math.floor(Math.random() * trait.valuesWithBlanks.length)];
    console.log(random);
    if (!random) {
      // If it's an empty string or undefined/null
      continue;
    }

    const option = trait.options.find((o) => o.value === random);
    console.log(option);
    if (!option) { 
      console.warn(`No matching option for random value: ${random} in category: ${category}`);
      continue;
    }

    pepeTraits.push({
      index: pepeTraits.length,
      folder: trait.folder,
      file: option.file,
      value: option.label,
    });
  }

  return pepeTraits;
};
