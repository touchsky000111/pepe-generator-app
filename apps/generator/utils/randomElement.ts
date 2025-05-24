export const randomElement = <T>(items: T[]) => {
  return items[Math.floor(Math.random() * items.length)];
};
