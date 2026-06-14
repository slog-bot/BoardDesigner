/** Tile filename assigned to a cell, or null when empty. */
export type CellTile = string | null;

/** Serializable map format used for save/load. */
export interface MapData {
  width: number;
  height: number;
  cells: CellTile[][];
}

/** Runtime map state with helpers for future extensions. */
export interface MapState {
  width: number;
  height: number;
  cells: CellTile[][];
}

export function createEmptyMap(width: number, height: number): MapState {
  return {
    width,
    height,
    cells: Array.from({ length: height }, () =>
      Array.from<CellTile>({ length: width }).fill(null),
    ),
  };
}

export function mapStateToData(map: MapState): MapData {
  return {
    width: map.width,
    height: map.height,
    cells: map.cells.map((row) => [...row]),
  };
}

export function mapDataToState(data: MapData): MapState {
  if (data.cells.length !== data.height) {
    throw new Error(
      `Invalid map: expected ${data.height} rows, got ${data.cells.length}`,
    );
  }
  for (let row = 0; row < data.height; row++) {
    if (data.cells[row].length !== data.width) {
      throw new Error(
        `Invalid map: row ${row} has ${data.cells[row].length} columns, expected ${data.width}`,
      );
    }
  }
  return {
    width: data.width,
    height: data.height,
    cells: data.cells.map((row) => [...row]),
  };
}
