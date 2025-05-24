interface Base {
  id: number;
}

export const mapById = <T extends Base>(array: T[]) => {
  const map: Record<number, Omit<T, 'id'>> = {};

  array.forEach((element) => {
    map[element.id] = element;
  });

  return map;
};
