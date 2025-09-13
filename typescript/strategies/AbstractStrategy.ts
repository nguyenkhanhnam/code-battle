import { GameState, InfoResponse } from '../types';

/**
 * The blueprint for all game strategies.
 */
export abstract class AbstractStrategy {
  /**
   * Get information about the Battlesnake
   * @returns InfoResponse containing bot details
   */
  public abstract get_info(): InfoResponse;

  /**
   * Called when a game starts
   * @param gameState The initial game state
   */
  public on_game_start(gameState: GameState): void {
    // Default implementation does nothing
  }

  /**
   * Called on every turn to determine the next move
   * @param gameState The current game state
   * @returns MoveResponse containing the chosen move
   */
  public abstract on_game_move(gameState: GameState): { move: string };

  /**
   * Called when a game ends
   * @param gameState The final game state
   */
  public on_game_end(gameState: GameState): void {
    // Default implementation does nothing
  }
}