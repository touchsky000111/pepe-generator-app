export function calculateNewPage(currentPage: number, currentLimit: number, newLimit: number) {
  const startItemIndex = (currentPage - 1) * currentLimit + 1;
  const newPage = Math.ceil(startItemIndex / newLimit);
  return newPage;
}
