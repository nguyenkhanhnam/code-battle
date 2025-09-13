import * as fs from 'fs';
import * as path from 'path';
import { BattlesnakeUltimate } from '../strategies/BattlesnakeUltimate';

/**
 * Loads a sample game state and times the bot's move function.
 */
function runTest(): void {
  console.log("--- Running Bot Performance Test ---");

  // Load a sample game state from a real game
  let gameState: any;
  try {
    const filePath = path.join(__dirname, 'sample_game_state.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    gameState = JSON.parse(fileContent);
  } catch (error) {
    console.error("ERROR: `tests/sample_game_state.json` not found. Cannot run test.");
    return;
  }

  // Instantiate your bot
  const bot = new BattlesnakeUltimate();
  console.log(`Testing strategy: ${bot.get_info().author || 'Unknown'}`);

  // Time the move function
  const startTime = performance.now();
  const move = bot.on_game_move(gameState);
  const endTime = performance.now();

  const durationMs = endTime - startTime;

  console.log(`\nBot decided to move: ${move.move || 'N/A'}`);
  console.log(`Decision took: ${durationMs.toFixed(2)} ms`);

  // Check against a typical competition timeout
  const timeoutMs = 500;
  const safetyMargin = 50;
  if (durationMs > (timeoutMs - safetyMargin)) {
    console.log(`\n!!! WARNING: Bot is running slow! Exceeds safety margin for a ${timeoutMs}ms timeout. !!!`);
  } else {
    console.log(`\nPerformance is within acceptable limits for a ${timeoutMs}ms timeout.`);
  }
}

// Run the test
if (require.main === module) {
  runTest();
}

export { runTest };