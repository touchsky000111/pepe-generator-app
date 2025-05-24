export default function traitOptionIsLast(createdAt: string) {
  const date = +new Date(createdAt);
  return date > +new Date('2024-02-26T00:00:00Z');
}
