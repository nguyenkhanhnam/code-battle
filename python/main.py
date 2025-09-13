import os
import argparse
import importlib
from flask import Flask, request

# --- Dynamically Load Strategy ---
parser = argparse.ArgumentParser(description="Run a Code Battle Bot.")
parser.add_argument(
    "--strategy",
    required=True,
    help="The name of the strategy file to use (e.g., 'battlesnake_ultimate')."
)
args = parser.parse_args()

try:
    print(f"Loading strategy: '{args.strategy}'...")
    StrategyModule = importlib.import_module(f"strategies.{args.strategy}")
    strategy_instance = StrategyModule.Strategy()
    print("Strategy loaded successfully.")
except ImportError:
    print(f"ERROR: Could not find strategy file 'strategies/{args.strategy}.py'")
    exit()
except AttributeError:
    print(f"ERROR: 'strategies/{args.strategy}.py' must contain a class named 'Strategy'")
    exit()

# --- Flask Web Server ---
app = Flask(__name__)

@app.route("/")
def index():
    return strategy_instance.get_info()

@app.route("/ping")
def ping():
    return "pong"

@app.route("/start", methods=["POST"])
def start():
    strategy_instance.on_game_start(request.get_json())
    return "ok"

@app.route("/move", methods=["POST"])
def move():
    return strategy_instance.on_game_move(request.get_json())

@app.route("/end", methods=["POST"])
def end():
    strategy_instance.on_game_end(request.get_json())
    return "ok"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port, debug=False)

