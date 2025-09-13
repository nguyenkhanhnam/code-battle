import * as fs from 'fs';
import * as path from 'path';
import express, { Request, Response } from 'express';
import { BattlesnakeUltimate } from './strategies/BattlesnakeUltimate';
import { StrategyTemplate } from './strategies/StrategyTemplate';
import { GameState, InfoResponse, MoveResponse } from './types';

// --- Command Line Arguments ---
const args = process.argv.slice(2);
let strategyName = 'battlesnake_ultimate'; // Default strategy
let port = 8080; // Default port

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--strategy' && i + 1 < args.length) {
    strategyName = args[i + 1];
    i++;
  } else if (args[i] === '--port' && i + 1 < args.length) {
    port = parseInt(args[i + 1], 10);
    i++;
  }
}

console.log(`Loading strategy: '${strategyName}'...`);

let strategyInstance: any;

// Dynamically load the strategy
try {
  switch (strategyName) {
    case 'battlesnake_ultimate':
      strategyInstance = new BattlesnakeUltimate();
      break;
    case 'template':
      strategyInstance = new StrategyTemplate();
      break;
    default:
      // Try to load a custom strategy
      try {
        const StrategyClass = require(`./strategies/${strategyName}`).default;
        strategyInstance = new StrategyClass();
      } catch (error) {
        console.error(`ERROR: Could not find strategy '${strategyName}'`);
        console.error('Available strategies: battlesnake_ultimate, template');
        process.exit(1);
      }
  }
  console.log('Strategy loaded successfully.');
} catch (error) {
  console.error(`ERROR: Could not load strategy '${strategyName}'`);
  process.exit(1);
}

// --- Express Web Server ---
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  const info: InfoResponse = strategyInstance.get_info();
  res.json(info);
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/start", (req, res) => {
  const gameState: GameState = req.body;
  strategyInstance.on_game_start(gameState);
  res.send("ok");
});

app.post("/move", (req, res) => {
  const gameState: GameState = req.body;
  const moveResponse: MoveResponse = strategyInstance.on_game_move(gameState);
  res.json(moveResponse);
});

app.post("/end", (req, res) => {
  const gameState: GameState = req.body;
  strategyInstance.on_game_end(gameState);
  res.send("ok");
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : port;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Battlesnake server running at http://${HOST}:${PORT}`);
  console.log(`Strategy: ${strategyName}`);
});