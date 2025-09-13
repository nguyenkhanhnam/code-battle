from strategies.abstract_strategy import AbstractStrategy

class Strategy(AbstractStrategy):
    """A blank template. COPY THIS FILE to create a new bot."""
    def on_game_move(self, game_state: dict) -> dict:
        print(f"Turn {game_state.get('turn')}")
        # TODO: Implement your brilliant move logic here.
        return {"move": "up"}