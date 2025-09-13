import time
import json
import sys
import os

# Add the root project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# --- CONFIGURE YOUR TEST HERE ---
from strategies.battlesnake_ultimate import Strategy # <-- The bot you want to test
# --------------------------------

def run_test():
    """Loads a sample game state and times the bot's move function."""
    print("--- Running Bot Performance Test ---")

    # Load a sample game state from a real game
    try:
        with open('tests/sample_game_state.json', 'r') as f:
            game_state = json.load(f)
    except FileNotFoundError:
        print("ERROR: `tests/sample_game_state.json` not found. Cannot run test.")
        return

    # Instantiate your bot
    bot = Strategy()
    print(f"Testing strategy: {bot.get_info().get('author', 'Unknown')}")

    # Time the move function
    start_time = time.perf_counter()
    move = bot.on_game_move(game_state)
    end_time = time.perf_counter()

    duration_ms = (end_time - start_time) * 1000

    print(f"\nBot decided to move: {move.get('move', 'N/A')}")
    print(f"Decision took: {duration_ms:.2f} ms")

    # Check against a typical competition timeout
    timeout_ms = 500
    safety_margin = 50
    if duration_ms > (timeout_ms - safety_margin):
        print(f"\n!!! WARNING: Bot is running slow! Exceeds safety margin for a {timeout_ms}ms timeout. !!!")
    else:
        print(f"\nPerformance is within acceptable limits for a {timeout_ms}ms timeout.")

if __name__ == "__main__":
    run_test()