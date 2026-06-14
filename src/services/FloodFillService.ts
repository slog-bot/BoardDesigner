import type { CellTile, MapState } from '../types';

export interface CellChange {
  row: number;
  col: number;
  previous: CellTile;
  next: CellTile;
}

export function floodFillRegion(
  map: MapState,
  startRow: number,
  startCol: number,
  replacement: CellTile,
): CellChange[] {
  const target = map.cells[startRow]?.[startCol] ?? null;

  if (target === replacement) {
    return [];
  }

  const changes: CellChange[] = [];
  const visited = new Set<string>();
  const queue: [number, number][] = [[startRow, startCol]];

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const key = `${row},${col}`;

    if (visited.has(key)) {
      continue;
    }

    if (row < 0 || row >= map.height || col < 0 || col >= map.width) {
      continue;
    }

    if (map.cells[row][col] !== target) {
      continue;
    }

    visited.add(key);
    changes.push({
      row,
      col,
      previous: target,
      next: replacement,
    });

    queue.push([row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]);
  }

  return changes;
}
