/**
 * This module provides a toolbox of common algorithms for grid-based games.
 * These functions are designed to work with a simple, generic representation of a board.
 *
 * - aStar: Finds the shortest path using a heuristic (e.g., Manhattan distance).
 * - floodFill: Measures the size of a contiguous area.
 * - bfs: A simple shortest-path algorithm for unweighted grids.
 * - dfs: Finds a path, but not necessarily the shortest one.
 */

interface Coord {
  x: number;
  y: number;
}

export function aStar(
  startCoord: Coord,
  endCoord: Coord,
  obstacles: Set<string>,
  width: number,
  height: number
): Coord[] | null {
  /**
   * A* pathfinding algorithm to find the shortest path between two points.
   *
   * Args:
   *     startCoord: {x, y} object for the starting point.
   *     endCoord: {x, y} object for the destination.
   *     obstacles: A Set of "x,y" strings representing blocked squares.
   *     width: The width of the board.
   *     height: The height of the board.
   *
   * Returns:
   *     An array of {x, y} objects representing the path from start to end,
   *     or null if no path exists.
   */
  const manhattanDistance = (a: Coord, b: Coord): number => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  };

  const coordToString = (coord: Coord): string => `${coord.x},${coord.y}`;
  const stringToCoord = (str: string): Coord => {
    const [x, y] = str.split(',').map(Number);
    return { x, y };
  };

  const pq: [number, string][] = [[0, coordToString(startCoord)]];
  const cameFrom: Record<string, string | null> = {};
  const costSoFar: Record<string, number> = {};

  cameFrom[coordToString(startCoord)] = null;
  costSoFar[coordToString(startCoord)] = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [_, currentStr] = pq.shift()!;
    const current = stringToCoord(currentStr);

    if (current.x === endCoord.x && current.y === endCoord.y) {
      const path: Coord[] = [];
      let currentCoord: Coord | null = current;
      while (currentCoord) {
        path.unshift(currentCoord);
        const currentStr = coordToString(currentCoord);
        const prevStr = cameFrom[currentStr];
        currentCoord = prevStr ? stringToCoord(prevStr) : null;
      }
      return path;
    }

    const directions = [
      { dx: 0, dy: 1 },   // down
      { dx: 0, dy: -1 },  // up
      { dx: 1, dy: 0 },   // right
      { dx: -1, dy: 0 }   // left
    ];

    for (const { dx, dy } of directions) {
      const neighbor: Coord = { x: current.x + dx, y: current.y + dy };
      const neighborStr = coordToString(neighbor);

      if (
        neighbor.x < 0 || neighbor.x >= width ||
        neighbor.y < 0 || neighbor.y >= height
      ) {
        continue;
      }

      if (
        obstacles.has(neighborStr) &&
        !(neighbor.x === endCoord.x && neighbor.y === endCoord.y)
      ) {
        continue;
      }

      const newCost = costSoFar[coordToString(current)] + 1;
      if (
        !costSoFar.hasOwnProperty(neighborStr) ||
        newCost < costSoFar[neighborStr]
      ) {
        costSoFar[neighborStr] = newCost;
        const priority = newCost + manhattanDistance(endCoord, neighbor);
        pq.push([priority, neighborStr]);
        cameFrom[neighborStr] = coordToString(current);
      }
    }
  }
  return null;
}

export function floodFill(
  startCoord: Coord,
  obstacles: Set<string>,
  width: number,
  height: number
): number {
  /**
   * Calculates the number of reachable empty squares from a starting coordinate.
   * Uses a Breadth-First Search (BFS) approach.
   *
   * Args:
   *     startCoord: {x, y} object for the starting point.
   *     obstacles: A Set of "x,y" strings representing blocked squares.
   *     width: The width of the board.
   *     height: The height of the board.
   *
   * Returns:
   *     The total number of squares in the filled area (including the start).
   */
  const coordToString = (coord: Coord): string => `${coord.x},${coord.y}`;

  if (obstacles.has(coordToString(startCoord))) return 0;
  if (
    startCoord.x < 0 || startCoord.x >= width ||
    startCoord.y < 0 || startCoord.y >= height
  ) {
    return 0;
  }

  const queue: Coord[] = [startCoord];
  const visited = new Set<string>();
  visited.add(coordToString(startCoord));
  let count = 0;

  const directions = [
    { dx: 0, dy: 1 },   // down
    { dx: 0, dy: -1 },  // up
    { dx: 1, dy: 0 },   // right
    { dx: -1, dy: 0 }   // left
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    count++;

    for (const { dx, dy } of directions) {
      const neighbor: Coord = { x: current.x + dx, y: current.y + dy };
      const neighborStr = coordToString(neighbor);

      if (!visited.has(neighborStr)) {
        if (
          neighbor.x >= 0 && neighbor.x < width &&
          neighbor.y >= 0 && neighbor.y < height &&
          !obstacles.has(neighborStr)
        ) {
          visited.add(neighborStr);
          queue.push(neighbor);
        }
      }
    }
  }
  return count;
}

export function bfs(
  startCoord: Coord,
  endCoord: Coord,
  obstacles: Set<string>,
  width: number,
  height: number
): Coord[] | null {
  /**
   * Breadth-First Search to find the shortest path on an unweighted grid.
   *
   * Returns:
   *     An array of {x, y} objects representing the path, or null.
   */
  const coordToString = (coord: Coord): string => `${coord.x},${coord.y}`;

  const queue: [Coord, Coord[]][] = [[startCoord, [startCoord]]];
  const visited = new Set<string>();
  visited.add(coordToString(startCoord));

  const directions = [
    { dx: 0, dy: 1 },   // down
    { dx: 0, dy: -1 },  // up
    { dx: 1, dy: 0 },   // right
    { dx: -1, dy: 0 }   // left
  ];

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    
    if (current.x === endCoord.x && current.y === endCoord.y) {
      return path;
    }

    for (const { dx, dy } of directions) {
      const neighbor: Coord = { x: current.x + dx, y: current.y + dy };
      const neighborStr = coordToString(neighbor);

      if (!visited.has(neighborStr)) {
        if (
          neighbor.x >= 0 && neighbor.x < width &&
          neighbor.y >= 0 && neighbor.y < height &&
          !obstacles.has(neighborStr)
        ) {
          visited.add(neighborStr);
          const newPath = [...path, neighbor];
          queue.push([neighbor, newPath]);
        }
      }
    }
  }
  return null;
}

export function dfs(
  startCoord: Coord,
  endCoord: Coord,
  obstacles: Set<string>,
  width: number,
  height: number
): Coord[] | null {
  /**
   * Depth-First Search. Finds a path, but NOT guaranteed to be the shortest.
   * Useful for maze-solving or checking connectivity.
   *
   * Returns:
   *     An array of {x, y} objects representing a path, or null.
   */
  const coordToString = (coord: Coord): string => `${coord.x},${coord.y}`;

  const stack: [Coord, Coord[]][] = [[startCoord, [startCoord]]];
  const visited = new Set<string>();

  const directions = [
    { dx: 0, dy: 1 },   // down
    { dx: 0, dy: -1 },  // up
    { dx: 1, dy: 0 },   // right
    { dx: -1, dy: 0 }   // left
  ];

  while (stack.length > 0) {
    const [current, path] = stack.pop()!;
    const currentStr = coordToString(current);

    if (visited.has(currentStr)) {
      continue;
    }
    visited.add(currentStr);

    if (current.x === endCoord.x && current.y === endCoord.y) {
      return path;
    }

    for (const { dx, dy } of directions) {
      const neighbor: Coord = { x: current.x + dx, y: current.y + dy };
      
      if (
        neighbor.x >= 0 && neighbor.x < width &&
        neighbor.y >= 0 && neighbor.y < height &&
        !obstacles.has(coordToString(neighbor))
      ) {
        const newPath = [...path, neighbor];
        stack.push([neighbor, newPath]);
      }
    }
  }
  return null;
}