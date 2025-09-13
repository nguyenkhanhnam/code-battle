# (Contains a_star, flood_fill, bfs, dfs)
from collections import deque
from heapq import heappush, heappop

def a_star(start_coord: tuple, end_coord: tuple, obstacles: set, width: int, height: int) -> list[tuple] | None:
    def manhattan_distance(a, b): return abs(a[0] - b[0]) + abs(a[1] - b[1])
    pq = [(0, start_coord)]; came_from = {start_coord: None}; cost_so_far = {start_coord: 0}
    while pq:
        _, current = heappop(pq)
        if current == end_coord:
            path = []
            while current is not None: path.append(current); current = came_from[current]
            return path[::-1]
        x, y = current
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            neighbor = (x + dx, y + dy)
            if not (0 <= neighbor[0] < width and 0 <= neighbor[1] < height): continue
            if neighbor in obstacles and neighbor != end_coord: continue
            new_cost = cost_so_far[current] + 1
            if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                cost_so_far[neighbor] = new_cost; priority = new_cost + manhattan_distance(end_coord, neighbor)
                heappush(pq, (priority, neighbor)); came_from[neighbor] = current
    return None

def flood_fill(start_coord: tuple, obstacles: set, width: int, height: int) -> int:
    if start_coord in obstacles: return 0
    if not (0 <= start_coord[0] < width and 0 <= start_coord[1] < height): return 0
    q = deque([start_coord]); visited = {start_coord}; count = 0
    while q:
        x, y = q.popleft(); count += 1
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            neighbor = (x + dx, y + dy)
            if neighbor not in visited and (0 <= neighbor[0] < width and 0 <= neighbor[1] < height and neighbor not in obstacles):
                visited.add(neighbor); q.append(neighbor)
    return count
# BFS and DFS omitted for brevity but would go here.