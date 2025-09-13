import { AbstractStrategy } from './AbstractStrategy';
import { GameState, InfoResponse, MoveResponse } from '../types';
import { aStar, floodFill } from '../utils/spatialUtils';
import { expectimax } from '../utils/gameTheoryUtils';

interface Coord {
  x: number;
  y: number;
}

interface Snake {
  id: string;
  health: number;
  body: Coord[];
  head: Coord;
  length: number;
}

interface Board {
  width: number;
  height: number;
  food: Coord[];
  snakes: Snake[];
}

/**
 * The ultimate Battlesnake AI using Expectimax and a powerful heuristic.
 */
export class BattlesnakeUltimate extends AbstractStrategy {
  private readonly SEARCH_DEPTH = 3;
  private readonly HEURISTIC_WEIGHTS = {
    space_adv_weight: 1.0,
    health_adv_weight: 0.1,
    food_control_weight: 5.0
  };

  public get_info(): InfoResponse {
    return {
      apiversion: "1",
      author: "UltimateBot",
      color: "#FFFFFF",
      head: "all-seeing",
      tail: "ghost"
    };
  }

  public on_game_move(gameState: GameState): { move: string } {
    const [score, bestMove] = expectimax(
      gameState,
      this.SEARCH_DEPTH,
      true,
      this._evaluateHeuristic.bind(this),
      this._getChildren.bind(this)
    );
    
    const move = bestMove || 'up';
    console.log(`Turn ${gameState.turn}: ULTIMATE - Best move is ${move.toUpperCase()}`);
    return { move };
  }

  private _evaluateHeuristic(gameState: GameState): number {
    const mySnake = gameState.you;
    if (!this._isSnakeAlive(mySnake.id, gameState)) return -Infinity;
    
    const opponent = this._getOpponent(gameState);
    if (opponent && !this._isSnakeAlive(opponent.id, gameState)) return Infinity;
    
    const obstacles = this._getObstaclesFromState(gameState);
    const board: Board = gameState.board;
    const myHead = mySnake.head;
    const mySpace = floodFill(myHead, obstacles, board.width, board.height);
    
    let oppSpace = 0;
    if (opponent) {
      const oppHead = opponent.head;
      oppSpace = floodFill(oppHead, obstacles, board.width, board.height);
    }
    
    const spaceAdvantage = mySpace - oppSpace;
    const healthAdvantage = mySnake.health - (opponent?.health || 0);
    
    let foodControlScore = 0;
    for (const food of board.food) {
      const myPath = aStar(myHead, food, obstacles, board.width, board.height);
      let oppPath: Coord[] | null = null;
      
      if (opponent) {
        oppPath = aStar(opponent.head, food, obstacles, board.width, board.height);
      }
      
      if (myPath && (!oppPath || myPath.length < oppPath.length)) {
        foodControlScore += 1;
      }
    }
    
    return (
      spaceAdvantage * this.HEURISTIC_WEIGHTS.space_adv_weight +
      healthAdvantage * this.HEURISTIC_WEIGHTS.health_adv_weight +
      foodControlScore * this.HEURISTIC_WEIGHTS.food_control_weight
    );
  }

  private _getChildren(gameState: GameState, isMaximizingPlayer: boolean): [string, GameState][] {
    const children: [string, GameState][] = [];
    const snakeToMove = isMaximizingPlayer ? gameState.you : this._getOpponent(gameState);
    
    if (!snakeToMove || !this._isSnakeAlive(snakeToMove.id, gameState)) {
      return [];
    }
    
    const safeMoves = this._getSafeMoves(snakeToMove, gameState);
    
    for (const [moveName, nextCoord] of Object.entries(safeMoves)) {
      const newState = this._deepcopyGameState(gameState);
      const simSnake = this._findSnakeInState(snakeToMove.id, newState);
      if (simSnake) {
        this._simulateMove(simSnake, newState, nextCoord);
        children.push([moveName, newState]);
      }
    }
    
    return children;
  }

  private _simulateMove(snake: Snake, state: GameState, nextHead: Coord): void {
    let eatsFood = false;
    const board = state.board;
    
    // Check if snake eats food
    for (let i = 0; i < board.food.length; i++) {
      const food = board.food[i];
      if (food.x === nextHead.x && food.y === nextHead.y) {
        eatsFood = true;
        board.food.splice(i, 1);
        snake.health = 100;
        break;
      }
    }
    
    // Move snake
    snake.body.unshift({ x: nextHead.x, y: nextHead.y });
    snake.head = { x: nextHead.x, y: nextHead.y };
    
    if (!eatsFood) {
      snake.body.pop();
      snake.health -= 1;
    }
    
    snake.length = snake.body.length;
  }

  private _getSafeMoves(snake: Snake, gameState: GameState): Record<string, Coord> {
    const safeMoves: Record<string, Coord> = {};
    const head = snake.head;
    const possibleMoves: Record<string, [number, number]> = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0]
    };
    
    for (const [moveName, [dx, dy]] of Object.entries(possibleMoves)) {
      const targetCoord: Coord = { x: head.x + dx, y: head.y + dy };
      
      // Check bounds
      if (
        targetCoord.x < 0 || targetCoord.x >= gameState.board.width ||
        targetCoord.y < 0 || targetCoord.y >= gameState.board.height
      ) {
        continue;
      }
      
      // Check collision with other snakes' bodies
      let isDeadly = false;
      for (const s of gameState.board.snakes) {
        for (let i = 0; i < s.body.length - 1; i++) {
          const part = s.body[i];
          if (part.x === targetCoord.x && part.y === targetCoord.y) {
            isDeadly = true;
            break;
          }
        }
        if (isDeadly) break;
      }
      if (isDeadly) continue;
      
      // Check head-to-head collision
      for (const opponent of gameState.board.snakes) {
        if (opponent.id === snake.id) continue;
        
        if (
          opponent.head.x === targetCoord.x &&
          opponent.head.y === targetCoord.y
        ) {
          if (snake.length <= opponent.length) {
            isDeadly = true;
            break;
          }
        }
      }
      if (isDeadly) continue;
      
      safeMoves[moveName] = targetCoord;
    }
    
    return safeMoves;
  }

  private _getObstaclesFromState(gameState: GameState): Set<string> {
    const obstacles = new Set<string>();
    
    for (const snake of gameState.board.snakes) {
      for (let i = 0; i < snake.body.length - 1; i++) {
        const part = snake.body[i];
        obstacles.add(`${part.x},${part.y}`);
      }
    }
    
    return obstacles;
  }

  private _getOpponent(gameState: GameState): Snake | null {
    for (const snake of gameState.board.snakes) {
      if (snake.id !== gameState.you.id) {
        return snake;
      }
    }
    return null;
  }

  private _findSnakeInState(snakeId: string, gameState: GameState): Snake | null {
    for (const snake of gameState.board.snakes) {
      if (snake.id === snakeId) {
        return snake;
      }
    }
    return null;
  }

  private _isSnakeAlive(snakeId: string, gameState: GameState): boolean {
    for (const snake of gameState.board.snakes) {
      if (snake.id === snakeId) {
        return snake.health > 0;
      }
    }
    return false;
  }

  private _deepcopyGameState(gameState: GameState): GameState {
    // Deep copy game state for simulation
    return JSON.parse(JSON.stringify(gameState));
  }
}