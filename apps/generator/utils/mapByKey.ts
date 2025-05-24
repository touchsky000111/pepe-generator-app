export const mapByKey = <T>(array: T[], key: string) => {
  const map: Record<number, T> = {};

  array.forEach((element) => {
    map[(element as any)[key]] = element;
  });

  return map;
};
