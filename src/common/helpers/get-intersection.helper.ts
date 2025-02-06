export function getIntersection(set1: Set<number>, set2: Set<number>) {
  const result = new Set<number>();

  // eslint-disable-next-line no-restricted-syntax
  for (const i of set2) {
    if (set1.has(i)) {
      result.add(i);
    }
  }

  return result;
}
