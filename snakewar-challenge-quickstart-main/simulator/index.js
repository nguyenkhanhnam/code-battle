const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const BOARD_WIDTH = 11;
const BOARD_HEIGHT = 11;
const TIMEOUT = 500;

// Hardcoded food and hazards for 11x11 board
const INITIAL_FOOD = [
  { x: 3, y: 7 },
  { x: 9, y: 9 },
  { x: 5, y: 3 }
];

const HAZARDS = [
  { x: 0, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
  { x: 10, y: 0 }
];

class GameSimulator {
  constructor() {
    this.gameId = 'sim-' + Date.now();
    this.turn = 0;
    this.snakes = [];
    this.food = [...INITIAL_FOOD];
    this.hazards = [...HAZARDS];
    this.gameOver = false;
  }

  addSnake(name, url) {
    const snake = {
      id: 'snake-' + this.snakes.length,
      name: name,
      url: url,
      health: 100,
      body: [{ x: 1 + this.snakes.length * 2, y: 1 }, { x: 1 + this.snakes.length * 2, y: 0 }],
      latency: '0',
      head: 'default',
      tail: 'default',
      color: '#888888',
      author: '',
      version: '',
      eliminated: false,
      eliminatedCause: ''
    };
    snake.head = snake.body[0];
    snake.length = snake.body.length;
    this.snakes.push(snake);
    return snake;
  }

  async getSnakeInfo(snake) {
    try {
      const response = await axios.get(snake.url, { timeout: TIMEOUT });
      const info = response.data;
      
      snake.head = info.head || 'default';
      snake.tail = info.tail || 'default';
      snake.color = info.color || '#888888';
      snake.author = info.author || '';
      snake.version = info.version || '';
      
      console.log(`Snake ${snake.name} info retrieved: ${snake.color}`);
    } catch (error) {
      console.log(`Failed to get info for ${snake.name}: ${error.message}`);
    }
  }

  async sendStartRequest(snake) {
    const gameState = this.createGameState(snake);
    try {
      await axios.post(`${snake.url}/start`, gameState, { 
        timeout: TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`Start request sent to ${snake.name}`);
    } catch (error) {
      console.log(`Failed to send start request to ${snake.name}: ${error.message}`);
    }
  }

  async sendMoveRequest(snake) {
    if (snake.eliminated) return { move: 'up' };
    
    const gameState = this.createGameState(snake);
    try {
      const response = await axios.post(`${snake.url}/move`, gameState, { 
        timeout: TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const move = response.data.move;
      if (!['up', 'down', 'left', 'right'].includes(move)) {
        console.log(`Invalid move from ${snake.name}: ${move}`);
        return { move: 'up' };
      }
      
      console.log(`${snake.name} chose: ${move}`);
      return { move };
    } catch (error) {
      console.log(`Failed to get move from ${snake.name}: ${error.message}`);
      return { move: 'up' };
    }
  }

  async sendEndRequest(snake) {
    const gameState = this.createGameState(snake);
    try {
      await axios.post(`${snake.url}/end`, gameState, { 
        timeout: TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`End request sent to ${snake.name}`);
    } catch (error) {
      console.log(`Failed to send end request to ${snake.name}: ${error.message}`);
    }
  }

  createGameState(forSnake) {
    const aliveSnakes = this.snakes.filter(s => !s.eliminated).map(snake => ({
      id: snake.id,
      name: snake.name,
      health: snake.health,
      body: snake.body,
      head: snake.body[0],
      length: snake.body.length,
      latency: snake.latency,
      shout: '',
      customizations: {
        color: snake.color,
        head: snake.head,
        tail: snake.tail
      }
    }));

    return {
      game: {
        id: this.gameId,
        ruleset: {
          name: 'solo',
          version: 'cli',
          settings: {
            foodSpawnChance: 15,
            minimumFood: 1,
            hazardDamagePerTurn: 14
          }
        },
        map: 'standard',
        timeout: TIMEOUT,
        source: 'simulator'
      },
      turn: this.turn,
      board: {
        height: BOARD_HEIGHT,
        width: BOARD_WIDTH,
        food: this.food,
        hazards: this.hazards,
        snakes: aliveSnakes
      },
      you: aliveSnakes.find(s => s.id === forSnake.id) || aliveSnakes[0]
    };
  }

  moveSnake(snake, direction) {
    if (snake.eliminated) return;

    const head = { ...snake.body[0] };
    
    switch (direction) {
      case 'up':
        head.y += 1;
        break;
      case 'down':
        head.y -= 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }

    // Check for wall collision
    if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
      this.eliminateSnake(snake, 'wall-collision');
      return;
    }

    // Check for self collision
    for (const segment of snake.body) {
      if (head.x === segment.x && head.y === segment.y) {
        this.eliminateSnake(snake, 'self-collision');
        return;
      }
    }

    // Check for other snake collision
    for (const otherSnake of this.snakes) {
      if (otherSnake.id !== snake.id && !otherSnake.eliminated) {
        for (const segment of otherSnake.body) {
          if (head.x === segment.x && head.y === segment.y) {
            this.eliminateSnake(snake, 'snake-collision');
            return;
          }
        }
      }
    }

    // Move snake
    snake.body.unshift(head);

    // Check if food eaten
    let foodEaten = false;
    this.food = this.food.filter(food => {
      if (food.x === head.x && food.y === head.y) {
        foodEaten = true;
        snake.health = 100; // Restore health
        return false;
      }
      return true;
    });

    // Remove tail if no food eaten
    if (!foodEaten) {
      snake.body.pop();
      snake.health -= 1;
    }

    // Check starvation
    if (snake.health <= 0) {
      this.eliminateSnake(snake, 'starvation');
    }

    snake.length = snake.body.length;
  }

  eliminateSnake(snake, cause) {
    snake.eliminated = true;
    snake.eliminatedCause = cause;
    console.log(`${snake.name} eliminated: ${cause}`);
  }

  isGameOver() {
    const aliveSnakes = this.snakes.filter(s => !s.eliminated);
    return aliveSnakes.length === 0 || this.turn >= 500;
  }

  printBoard() {
    console.log(`\nTurn ${this.turn}:`);
    console.log('═'.repeat(BOARD_WIDTH + 2));
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      let row = '║';
      for (let x = 0; x < BOARD_WIDTH; x++) {
        let cell = ' ';
        
        // Check for hazards
        if (this.hazards.some(h => h.x === x && h.y === y)) {
          cell = '░';
        }
        
        // Check for food
        if (this.food.some(f => f.x === x && f.y === y)) {
          cell = '♦';
        }
        
        // Check for snakes
        for (let i = 0; i < this.snakes.length; i++) {
          const snake = this.snakes[i];
          if (!snake.eliminated) {
            for (let j = 0; j < snake.body.length; j++) {
              const segment = snake.body[j];
              if (segment.x === x && segment.y === y) {
                cell = j === 0 ? '@' : '■'; // Head vs body
              }
            }
          }
        }
        
        row += cell;
      }
      row += '║';
      console.log(row);
    }
    
    console.log('═'.repeat(BOARD_WIDTH + 2));
    
    // Print snake status
    this.snakes.forEach(snake => {
      const status = snake.eliminated ? `ELIMINATED (${snake.eliminatedCause})` : `Health: ${snake.health}`;
      console.log(`${snake.name}: ${status}`);
    });
  }

  async runGame() {
    console.log(`Starting game ${this.gameId}`);
    console.log(`Board: ${BOARD_WIDTH}x${BOARD_HEIGHT}`);
    
    // Get snake info
    for (const snake of this.snakes) {
      await this.getSnakeInfo(snake);
    }
    
    // Send start requests
    for (const snake of this.snakes) {
      await this.sendStartRequest(snake);
    }
    
    this.printBoard();
    
    // Game loop
    while (!this.isGameOver()) {
      this.turn++;
      
      // Get moves from all snakes
      const moves = [];
      for (const snake of this.snakes) {
        if (!snake.eliminated) {
          const moveResponse = await this.sendMoveRequest(snake);
          moves.push({ snake, move: moveResponse.move });
        }
      }
      
      // Apply moves
      for (const { snake, move } of moves) {
        this.moveSnake(snake, move);
      }
      
      this.printBoard();
      
      // Add small delay for visualization
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Send end requests
    for (const snake of this.snakes) {
      await this.sendEndRequest(snake);
    }
    
    const winner = this.snakes.find(s => !s.eliminated);
    if (winner) {
      console.log(`\nGame Over! Winner: ${winner.name}`);
    } else {
      console.log('\nGame Over! No winner (draw)');
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: node index.js --name "Snake Name" --url http://localhost:8000');
    process.exit(1);
  }
  
  const nameIndex = args.indexOf('--name');
  const urlIndex = args.indexOf('--url');
  
  if (nameIndex === -1 || urlIndex === -1) {
    console.log('Usage: node index.js --name "Snake Name" --url http://localhost:8000');
    process.exit(1);
  }
  
  const name = args[nameIndex + 1];
  const url = args[urlIndex + 1];
  
  const game = new GameSimulator();
  game.addSnake(name, url);
  
  game.runGame().catch(error => {
    console.error('Game error:', error);
    process.exit(1);
  });
}

module.exports = GameSimulator;