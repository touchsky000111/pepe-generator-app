import { PepeTrait } from '@/stores/editor';

export function arrayMove(arr: PepeTrait[], fromIndex: number, toIndex: number) {
  const newArray = JSON.parse(JSON.stringify(arr)) as PepeTrait[];

  const element = newArray[fromIndex];
  newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, element);

  return newArray;
}
