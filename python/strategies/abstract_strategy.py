class AbstractStrategy:
    """The blueprint for all game strategies."""
    def get_info(self):
        return {"apiversion": "1", "author": "YourTeam", "color": "#888888", "head": "default", "tail": "default"}

    def on_game_start(self, game_state: dict):
        pass

    def on_game_move(self, game_state: dict) -> dict:
        raise NotImplementedError("You must implement the on_game_move method!")

    def on_game_end(self, game_state: dict):
        pass