export function createAscendingArray(start: number, end: number): number[] {
  if (start > end) {
    throw new Error('Start number must be less than or equal to the end number');
  }

  const result: number[] = [];

  for (let i = start; i <= end; i++) {
    result.push(i);
  }

  return result;
}
