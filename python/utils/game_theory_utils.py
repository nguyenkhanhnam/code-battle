# utils/game_theory_utils.py

from typing import Callable

"""
This module provides a toolbox for game theory algorithms.
These functions are generic and require you to provide game-specific logic by
passing in other functions as arguments.

- minimax: For two-player, zero-sum, turn-based games.
- expectimax: For games with chance or non-optimal opponents.
"""

def minimax(
    game_state: dict, 
    depth: int, 
    is_maximizing_player: bool, 
    evaluate_func: Callable[[dict], float], 
    get_children_func: Callable[[dict, bool], list],
    alpha: float = -float('inf'), 
    beta: float = float('inf')
) -> tuple[float, any]:
    """
    Minimax algorithm with Alpha-Beta pruning.

    Args:
        game_state: The current state of the game.
        depth: The maximum depth to search.
        is_maximizing_player: True for your turn, False for the opponent's.
        evaluate_func: A function that takes a game_state and returns a score.
        get_children_func: A function that takes (game_state, is_maximizing)
                           and returns a list of (move, child_state) tuples.
        alpha: The best value that the maximizer can guarantee.
        beta: The best value that the minimizer can guarantee.

    Returns:
        A tuple of (best_score, best_move).
    """
    children = get_children_func(game_state, is_maximizing_player)
    if depth == 0 or not children:
        return evaluate_func(game_state), None

    if is_maximizing_player:
        max_eval = -float('inf')
        best_move = None
        for move, child_state in children:
            evaluation, _ = minimax(child_state, depth - 1, False, evaluate_func, get_children_func, alpha, beta)
            if evaluation > max_eval:
                max_eval = evaluation
                best_move = move
            alpha = max(alpha, evaluation)
            if beta <= alpha:
                break  # Prune
        return max_eval, best_move
    else:  # Minimizing player
        min_eval = float('inf')
        best_move = None
        for move, child_state in children:
            evaluation, _ = minimax(child_state, depth - 1, True, evaluate_func, get_children_func, alpha, beta)
            if evaluation < min_eval:
                min_eval = evaluation
                best_move = move
            beta = min(beta, evaluation)
            if beta <= alpha:
                break  # Prune
        return min_eval, best_move

def expectimax(
    game_state: dict,
    depth: int,
    is_maximizing_player: bool,
    evaluate_func: Callable[[dict], float],
    get_children_func: Callable[[dict, bool], list]
) -> tuple[float, any]:
    """
    Expectimax algorithm for games with chance or non-optimal opponents.

    Args:
        game_state, depth, evaluate_func, get_children_func: Same as minimax.
        is_maximizing_player: True for your turn, False for the 'chance'/opponent node.

    Returns:
        A tuple of (score, best_move). For chance nodes, best_move is None.
    """
    children = get_children_func(game_state, is_maximizing_player)
    if depth == 0 or not children:
        return evaluate_func(game_state), None

    if is_maximizing_player:
        max_eval = -float('inf')
        best_move = None
        for move, child_state in children:
            evaluation, _ = expectimax(child_state, depth - 1, False, evaluate_func, get_children_func)
            if evaluation > max_eval:
                max_eval = evaluation
                best_move = move
        return max_eval, best_move
    else:  # Chance node (opponent's turn)
        avg_score = 0
        for _, child_state in children:
            evaluation, _ = expectimax(child_state, depth - 1, True, evaluate_func, get_children_func)
            avg_score += evaluation
        
        # Return the average score of all possible outcomes.
        # There is no "best move" for a chance node.
        return avg_score / len(children), None