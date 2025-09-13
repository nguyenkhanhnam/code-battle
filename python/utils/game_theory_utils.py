# (Contains minimax and expectimax)
from typing import Callable

def expectimax(game_state: dict, depth: int, is_maximizing_player: bool, evaluate_func: Callable[[dict], float], get_children_func: Callable[[dict, bool], list]) -> tuple[float, any]:
    children = get_children_func(game_state, is_maximizing_player)
    if depth == 0 or not children: return evaluate_func(game_state), None
    if is_maximizing_player:
        max_eval = -float('inf'); best_move = None
        for move, child_state in children:
            evaluation, _ = expectimax(child_state, depth - 1, False, evaluate_func, get_children_func)
            if evaluation > max_eval: max_eval = evaluation; best_move = move
        return max_eval, best_move
    else:
        avg_score = 0
        # For multi-player, this needs to handle all combinations of opponent moves.
        # This simplified version assumes a 1v1 or averages all individual opponent moves.
        for _, child_state in children:
            evaluation, _ = expectimax(child_state, depth - 1, True, evaluate_func, get_children_func)
            avg_score += evaluation
        if not children: return 0, None
        return avg_score / len(children), None