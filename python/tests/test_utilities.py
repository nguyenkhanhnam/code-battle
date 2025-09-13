import unittest
import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.spatial_utils import a_star, flood_fill
from utils.game_theory_utils import expectimax

class TestSpatialUtils(unittest.TestCase):
    """Test cases for spatial utility functions"""
    
    def test_a_star_basic(self):
        # Straight line path
        path = a_star((0,0), (2,2), set(), 3, 3)
        # With 4-direction movement, shortest path is 4 steps
        self.assertEqual(len(path), 5)  # Includes start position
        self.assertEqual(path, [(0,0), (0,1), (0,2), (1,2), (2,2)])
        
    def test_a_star_obstacles(self):
        # Path around obstacle
        obstacles = {(1,1)}
        path = a_star((0,0), (2,2), obstacles, 3, 3)
        self.assertIn((0,1), path)
        self.assertNotIn((1,1), path)
        
    def test_a_star_no_path(self):
        # Blocked path
        obstacles = {(0,1), (1,0), (1,1)}
        path = a_star((0,0), (2,2), obstacles, 3, 3)
        self.assertIsNone(path)
        
    def test_flood_fill_open(self):
        # Full access
        area = flood_fill((1,1), set(), 3, 3)
        self.assertEqual(area, 9)
        
    def test_flood_fill_constrained(self):
        # Cross-shaped obstacles
        obstacles = {(0,1), (1,0), (1,2), (2,1)}
        # With all adjacent cells blocked, only starting cell is accessible
        area = flood_fill((1,1), obstacles, 3, 3)
        self.assertEqual(area, 1)

class TestGameTheoryUtils(unittest.TestCase):
    """Test cases for game theory utilities"""
    
    def test_expectimax_maximizer(self):
        # Basic max choice
        def eval_fn(state): return state['score']
        def children_fn(state, is_max):
            return [('left', {'score': 3}), ('right', {'score': 5})]
            
        score, move = expectimax({'score': 0}, 1, True, eval_fn, children_fn)
        self.assertEqual(move, 'right')
        self.assertEqual(score, 5)
        
    def test_expectimax_depth_limit(self):
        # Depth-limited decision
        def eval_fn(state): return 10
        def children_fn(state, is_max): return [('move', {'score': 0})]
        
        score, _ = expectimax({}, 0, True, eval_fn, children_fn)
        self.assertEqual(score, 10)
        
    def test_expectimax_opponent(self):
        # Opponent averaging
        def eval_fn(state): return state['value']
        def children_fn(state, is_max):
            if is_max:
                return [('max_move', {'value': 5})]
            return [('min1', {'value': 3}), ('min2', {'value': 5})]
            
        score, _ = expectimax({'value': 0}, 2, True, eval_fn, children_fn)
        self.assertEqual(score, 4)  # (3 + 5)/2 = 4
        
    def test_expectimax_no_children(self):
        # Terminal state
        score, move = expectimax({}, 1, True, lambda x: 0, lambda x,y: [])
        self.assertEqual(score, 0)
        self.assertIsNone(move)

if __name__ == '__main__':
    unittest.main()