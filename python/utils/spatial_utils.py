# utils/spatial_utils.py

from collections import deque
from heapq import heappush, heappop

"""
This module provides a toolbox of common algorithms for grid-based games.
These functions are designed to work with a simple, generic representation of a board.

- a_star: Finds the shortest path using a heuristic (e.g., Manhattan distance).
- flood_fill: Measures the size of a contiguous area.
- bfs: A simple shortest-path algorithm for unweighted grids.
- dfs: Finds a path, but not necessarily the shortest one.
"""

def a_star(start_coord: tuple, end_coord: tuple, obstacles: set, width: int, height: int) -> list[tuple] | None:
    """
    A* pathfinding algorithm to find the shortest path between two points.

    Args:
        start_coord: (x, y) tuple for the starting point.
        end_coord: (x, y) tuple for the destination.
        obstacles: A set of (x, y) tuples representing blocked squares.
        width: The width of the board.
        height: The height of the board.

    Returns:
        A list of (x, y) tuples representing the path from start to end,
        or None if no path exists.
    """
    def manhattan_distance(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    pq = [(0, start_coord)]  # (priority, coordinate)
    came_from = {start_coord: None}
    cost_so_far = {start_coord: 0}

    while pq:
        _, current = heappop(pq)

        if current == end_coord:
            path = []
            while current is not None:
                path.append(current)
                current = came_from[current]
            return path[::-1]  # Reverse to get path from start to end

        x, y = current
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            neighbor = (x + dx, y + dy)
            nx, ny = neighbor

            if not (0 <= nx < width and 0 <= ny < height): continue
            if neighbor in obstacles and neighbor != end_coord: continue

            new_cost = cost_so_far[current] + 1
            if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                cost_so_far[neighbor] = new_cost
                priority = new_cost + manhattan_distance(end_coord, neighbor)
                heappush(pq, (priority, neighbor))
                came_from[neighbor] = current
    return None

def flood_fill(start_coord: tuple, obstacles: set, width: int, height: int) -> int:
    """
    Calculates the number of reachable empty squares from a starting coordinate.
    Uses a Breadth-First Search (BFS) approach.

    Args:
        start_coord: (x, y) tuple for the starting point.
        obstacles: A set of (x, y) tuples representing blocked squares.
        width: The width of the board.
        height: The height of the board.

    Returns:
        The total number of squares in the filled area (including the start).
    """
    if start_coord in obstacles: return 0
    if not (0 <= start_coord[0] < width and 0 <= start_coord[1] < height): return 0

    q = deque([start_coord])
    visited = {start_coord}
    count = 0

    while q:
        x, y = q.popleft()
        count += 1
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            neighbor = (x + dx, y + dy)
            if neighbor not in visited:
                if (0 <= neighbor[0] < width and 0 <= neighbor[1] < height and neighbor not in obstacles):
                    visited.add(neighbor)
                    q.append(neighbor)
    return count

def bfs(start_coord: tuple, end_coord: tuple, obstacles: set, width: int, height: int) -> list[tuple] | None:
    """
    Breadth-First Search to find the shortest path on an unweighted grid.

    Returns:
        A list of (x, y) tuples representing the path, or None.
    """
    q = deque([(start_coord, [start_coord])]) # (coord, path_list)
    visited = {start_coord}

    while q:
        current, path = q.popleft()
        if current == end_coord:
            return path
        
        x, y = current
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            neighbor = (x + dx, y + dy)
            if neighbor not in visited:
                if (0 <= neighbor[0] < width and 0 <= neighbor[1] < height and neighbor not in obstacles):
                    visited.add(neighbor)
                    new_path = list(path)
                    new_path.append(neighbor)
                    q.append((neighbor, new_path))
    return None

def dfs(start_coord: tuple, end_coord: tuple, obstacles: set, width: int, height: int) -> list[tuple] | None:
    """
    Depth-First Search. Finds a path, but NOT guaranteed to be the shortest.
    Useful for maze-solving or checking connectivity.

    Returns:
        A list of (x, y) tuples representing a path, or None.
    """
    stack = [(start_coord, [start_coord])] # (coord, path_list)
    visited = set()

    while stack:
        current, path = stack.pop()
        if current in visited:
            continue
        visited.add(current)
        
        if current == end_coord:
            return path
        
        x, y = current
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            neighbor = (x + dx, y + dy)
            if (0 <= neighbor[0] < width and 0 <= neighbor[1] < height and neighbor not in obstacles):
                new_path = list(path)
                new_path.append(neighbor)
                stack.append((neighbor, new_path))
    return None