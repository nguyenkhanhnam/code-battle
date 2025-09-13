import copy
from strategies.abstract_strategy import AbstractStrategy
from utils.spatial_utils import a_star, flood_fill
from utils.game_theory_utils import expectimax

class Strategy(AbstractStrategy):
    """The ultimate Battlesnake AI using Expectimax and a powerful heuristic."""
    SEARCH_DEPTH = 3
    HEURISTIC_WEIGHTS = {'space_adv_weight': 1.0, 'health_adv_weight': 0.1, 'food_control_weight': 5.0}

    def get_info(self):
        return {"apiversion": "1", "author": "UltimateBot", "color": "#FFFFFF", "head": "all-seeing", "tail": "ghost"}

    def on_game_move(self, game_state: dict) -> dict:
        print(f"Turn")
        
        return {"apiversion": "1", "author": "UltimateBot", "color": "#FFFFFF", "head": "all-seeing", "tail": "ghost"}
        
        # _, best_move = expectimax(
        #     game_state=game_state, depth=self.SEARCH_DEPTH, is_maximizing_player=True,
        #     evaluate_func=self._evaluate_heuristic, get_children_func=self._get_children
        # )
        # print(f"Turn {game_state['turn']}: ULTIMATE - Best move is {best_move.upper() if best_move else 'UP'}")
        # return {"move": best_move if best_move else "up"}

    def _evaluate_heuristic(self, game_state: dict) -> float:
        my_snake = game_state['you']
        if not self._is_snake_alive(my_snake['id'], game_state): return -float('inf')
        opponent = self._get_opponent(game_state)
        if opponent and not self._is_snake_alive(opponent['id'], game_state): return float('inf')
        obstacles = self._get_obstacles_from_state(game_state)
        board_width = game_state['board']['width']; board_height = game_state['board']['height']
        my_head = (my_snake['head']['x'], my_snake['head']['y'])
        my_space = flood_fill(my_head, obstacles, board_width, board_height)
        opp_space = 0
        if opponent:
            opp_head = (opponent['head']['x'], opponent['head']['y'])
            opp_space = flood_fill(opp_head, obstacles, board_width, board_height)
        space_advantage = my_space - opp_space
        health_advantage = my_snake['health'] - (opponent['health'] if opponent else 0)
        food_control_score = 0
        for food in game_state['board']['food']:
            food_coord = (food['x'], food['y'])
            my_path = a_star(my_head, food_coord, obstacles, board_width, board_height)
            opp_path = None
            if opponent: opp_path = a_star(opp_head, food_coord, obstacles, board_width, board_height)
            if my_path and (not opp_path or len(my_path) < len(opp_path)): food_control_score += 1
        return (space_advantage * self.HEURISTIC_WEIGHTS['space_adv_weight']) + \
               (health_advantage * self.HEURISTIC_WEIGHTS['health_adv_weight']) + \
               (food_control_score * self.HEURISTIC_WEIGHTS['food_control_weight'])

    def _get_children(self, game_state: dict, is_maximizing_player: bool) -> list:
        children = []
        snake_to_move = game_state['you'] if is_maximizing_player else self._get_opponent(game_state)
        if not snake_to_move or not self._is_snake_alive(snake_to_move['id'], game_state): return []
        safe_moves = self._get_safe_moves(snake_to_move, game_state)
        for move_name, next_coord in safe_moves.items():
            new_state = copy.deepcopy(game_state)
            sim_snake = self._find_snake_in_state(snake_to_move['id'], new_state)
            self._simulate_move(sim_snake, new_state, next_coord)
            children.append((move_name, new_state))
        return children

    def _simulate_move(self, snake: dict, state: dict, next_head: tuple):
        eats_food = False
        for food in state['board']['food']:
            if (food['x'], food['y']) == next_head:
                eats_food = True; state['board']['food'].remove(food); snake['health'] = 100
                break
        snake['body'].insert(0, {'x': next_head[0], 'y': next_head[1]})
        snake['head'] = {'x': next_head[0], 'y': next_head[1]}
        if not eats_food: snake['body'].pop(); snake['health'] -= 1
        snake['length'] = len(snake['body'])

    def _get_safe_moves(self, snake: dict, game_state: dict) -> dict:
        safe_moves = {}; head = (snake['head']['x'], snake['head']['y'])
        possible_moves = {"up": (0, -1), "down": (0, 1), "left": (-1, 0), "right": (1, 0)}
        for move_name, (dx, dy) in possible_moves.items():
            target_coord = (head[0] + dx, head[1] + dy)
            if not (0 <= target_coord[0] < game_state['board']['width'] and 0 <= target_coord[1] < game_state['board']['height']): continue
            is_deadly = False
            for s in game_state['board']['snakes']:
                if target_coord in {(p['x'],p['y']) for p in s['body'][:-1]}: is_deadly = True; break
            if is_deadly: continue
            for opponent in game_state['board']['snakes']:
                if opponent['id'] == snake['id']: continue
                if target_coord == (opponent['head']['x'], opponent['head']['y']):
                    if snake['length'] <= opponent['length']: is_deadly = True; break
            if is_deadly: continue
            safe_moves[move_name] = target_coord
        return safe_moves

    def _get_obstacles_from_state(self, game_state: dict) -> set:
        obstacles = set();
        for snake in game_state['board']['snakes']:
            for part in snake['body'][:-1]: obstacles.add((part['x'], part['y']))
        return obstacles

    def _get_opponent(self, game_state: dict):
        for snake in game_state['board']['snakes']:
            if snake['id'] != game_state['you']['id']: return snake
        return None

    def _find_snake_in_state(self, snake_id: str, game_state: dict):
        for snake in game_state['board']['snakes']:
            if snake['id'] == snake_id: return snake
        return None

    def _is_snake_alive(self, snake_id: str, game_state: dict):
        for snake in game_state['board']['snakes']:
            if snake['id'] == snake_id: return snake['health'] > 0
        return False