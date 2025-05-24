export default function traitOptionIsOld(createdAt: string) {
  const date = +new Date(createdAt);
  return date < +new Date('2024-02-01T00:00:00Z');
}
