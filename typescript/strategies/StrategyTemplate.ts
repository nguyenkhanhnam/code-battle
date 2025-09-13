import { AbstractStrategy } from './AbstractStrategy';
import { GameState, InfoResponse, MoveResponse } from '../types';

/**
 * A blank template. COPY THIS FILE to create a new bot.
 */
export class StrategyTemplate extends AbstractStrategy {
  public get_info(): InfoResponse {
    return {
      apiversion: "1",
      author: "YourTeam",
      color: "#888888",
      head: "default",
      tail: "default"
    };
  }

  public on_game_move(gameState: GameState): { move: string } {
    console.log(`Turn ${gameState.turn}`);
    // TODO: Implement your brilliant move logic here.
    return { move: "up" };
  }
}