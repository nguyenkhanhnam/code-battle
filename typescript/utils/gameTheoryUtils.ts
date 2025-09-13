/**
 * This module provides a toolbox for game theory algorithms.
 * These functions are generic and require you to provide game-specific logic by
 * passing in other functions as arguments.
 *
 * - minimax: For two-player, zero-sum, turn-based games.
 * - expectimax: For games with chance or non-optimal opponents.
 */

import { GameState } from '../types';

// Generic type for game state
type GenericGameState = Record<string, any>;

type EvaluateFunction<T extends GenericGameState> = (gameState: T) => number;
type GetChildrenFunction<T extends GenericGameState> = (gameState: T, isMaximizingPlayer: boolean) => [string, T][];

export function minimax<T extends GenericGameState>(
  gameState: T,
  depth: number,
  isMaximizingPlayer: boolean,
  evaluateFunc: EvaluateFunction<T>,
  getChildrenFunc: GetChildrenFunction<T>,
  alpha: number = -Infinity,
  beta: number = Infinity
): [number, string | null] {
  /**
   * Minimax algorithm with Alpha-Beta pruning.
   *
   * Args:
   *     gameState: The current state of the game.
   *     depth: The maximum depth to search.
   *     isMaximizingPlayer: True for your turn, False for the opponent's.
   *     evaluateFunc: A function that takes a gameState and returns a score.
   *     getChildrenFunc: A function that takes (gameState, isMaximizing)
   *                      and returns a list of [move, childState] tuples.
   *     alpha: The best value that the maximizer can guarantee.
   *     beta: The best value that the minimizer can guarantee.
   *
   * Returns:
   *     A tuple of [bestScore, bestMove].
   */
  const children = getChildrenFunc(gameState, isMaximizingPlayer);
  if (depth === 0 || children.length === 0) {
    return [evaluateFunc(gameState), null];
  }

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    let bestMove: string | null = null;
    
    for (const [move, childState] of children) {
      const [evaluation, _] = minimax(
        childState, depth - 1, false, evaluateFunc, getChildrenFunc, alpha, beta
      );
      
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break; // Prune
      }
    }
    return [maxEval, bestMove];
  } else { // Minimizing player
    let minEval = Infinity;
    let bestMove: string | null = null;
    
    for (const [move, childState] of children) {
      const [evaluation, _] = minimax(
        childState, depth - 1, true, evaluateFunc, getChildrenFunc, alpha, beta
      );
      
      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
      
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break; // Prune
      }
    }
    return [minEval, bestMove];
  }
}

export function expectimax<T extends GenericGameState>(
  gameState: T,
  depth: number,
  isMaximizingPlayer: boolean,
  evaluateFunc: EvaluateFunction<T>,
  getChildrenFunc: GetChildrenFunction<T>
): [number, string | null] {
  /**
   * Expectimax algorithm for games with chance or non-optimal opponents.
   *
   * Args:
   *     gameState, depth, evaluateFunc, getChildrenFunc: Same as minimax.
   *     isMaximizingPlayer: True for your turn, False for the 'chance'/opponent node.
   *
   * Returns:
   *     A tuple of [score, bestMove]. For chance nodes, bestMove is null.
   */
  const children = getChildrenFunc(gameState, isMaximizingPlayer);
  if (depth === 0 || children.length === 0) {
    return [evaluateFunc(gameState), null];
  }

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    let bestMove: string | null = null;
    
    for (const [move, childState] of children) {
      const [evaluation, _] = expectimax(
        childState, depth - 1, false, evaluateFunc, getChildrenFunc
      );
      
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
    }
    return [maxEval, bestMove];
  } else { // Chance node (opponent's turn)
    let avgScore = 0;
    
    for (const [, childState] of children) {
      const [evaluation, _] = expectimax(
        childState, depth - 1, true, evaluateFunc, getChildrenFunc
      );
      avgScore += evaluation;
    }
    
    // Return the average score of all possible outcomes.
    // There is no "best move" for a chance node.
    return [avgScore / children.length, null];
  }
}