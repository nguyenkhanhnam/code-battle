import os
import argparse
import importlib
import json
import sys
from flask import Flask, request, jsonify

# --- Command Line Arguments ---
parser = argparse.ArgumentParser(description="Run a Code Battle Bot.")
parser.add_argument(
    "--strategy",
    default="battlesnake_ultimate",
    help="The name of the strategy file to use (e.g., 'battlesnake_ultimate')."
)
parser.add_argument(
    "--port",
    type=int,
    default=8080,
    help="Port to run the bot on (default: 8080)."
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
    return jsonify(strategy_instance.get_info())

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
    port = int(os.environ.get("PORT", args.port))
    app.run(host="0.0.0.0", port=port, debug=False)

