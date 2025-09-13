import { describe, it } from 'mocha';
import { expect } from 'chai';
import { aStar, floodFill, bfs, dfs } from '../utils/spatialUtils';
import { expectimax, minimax } from '../utils/gameTheoryUtils';

// Simple test interface for game state
interface TestGameState {
  [key: string]: any;
}

describe('SpatialUtils', () => {
  describe('aStar', () => {
    it('should find a basic path', () => {
      // Straight line path
      const path = aStar({ x: 0, y: 0 }, { x: 2, y: 2 }, new Set(), 3, 3);
      // With 4-direction movement, shortest path is 4 steps
      expect(path).to.not.be.null;
      expect(path!.length).to.equal(5); // Includes start position
      expect(path).to.deep.equal([
        { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
      ]);
    });

    it('should find path around obstacles', () => {
      // Path around obstacle
      const obstacles = new Set(['1,1']);
      const path = aStar({ x: 0, y: 0 }, { x: 2, y: 2 }, obstacles, 3, 3);
      expect(path).to.not.be.null;
      expect(path).to.include.deep.members([{ x: 0, y: 1 }]);
      expect(path).to.not.include.deep.members([{ x: 1, y: 1 }]);
    });

    it('should return null for blocked path', () => {
      // Blocked path
      const obstacles = new Set(['0,1', '1,0', '1,1']);
      const path = aStar({ x: 0, y: 0 }, { x: 2, y: 2 }, obstacles, 3, 3);
      expect(path).to.be.null;
    });
  });

  describe('floodFill', () => {
    it('should calculate full access area', () => {
      // Full access
      const area = floodFill({ x: 1, y: 1 }, new Set(), 3, 3);
      expect(area).to.equal(9);
    });

    it('should calculate constrained area', () => {
      // Cross-shaped obstacles
      const obstacles = new Set(['0,1', '1,0', '1,2', '2,1']);
      // With all adjacent cells blocked, only starting cell is accessible
      const area = floodFill({ x: 1, y: 1 }, obstacles, 3, 3);
      expect(area).to.equal(1);
    });
  });

  describe('bfs', () => {
    it('should find shortest path', () => {
      const path = bfs({ x: 0, y: 0 }, { x: 2, y: 2 }, new Set(), 3, 3);
      expect(path).to.not.be.null;
      expect(path!.length).to.equal(5); // Includes start position
    });
  });

  describe('dfs', () => {
    it('should find a path (not necessarily shortest)', () => {
      const path = dfs({ x: 0, y: 0 }, { x: 2, y: 2 }, new Set(), 3, 3);
      expect(path).to.not.be.null;
      expect(path!.length).to.be.greaterThan(0);
      expect(path![0]).to.deep.equal({ x: 0, y: 0 });
      expect(path![path!.length - 1]).to.deep.equal({ x: 2, y: 2 });
    });
  });
});

describe('GameTheoryUtils', () => {
  describe('expectimax', () => {
    it('should choose best move for maximizer', () => {
      // Basic max choice
      const evalFn = (state: any) => state.score;
      const childrenFn = (state: any, isMax: boolean) => {
        if (isMax) {
          return [
            ['left', { score: 3 }],
            ['right', { score: 5 }]
          ] as [string, any][];
        }
        return [] as [string, any][];
      };
      
      const [score, move] = expectimax({ score: 0 }, 1, true, evalFn, childrenFn);
      expect(move).to.equal('right');
      expect(score).to.equal(5);
    });

    it('should respect depth limit', () => {
      // Depth-limited decision
      const evalFn = () => 10;
      const childrenFn = () => [['move', { score: 0 }]] as [string, any][];
      
      const [score, _] = expectimax({ score: 0 }, 0, true, evalFn, childrenFn);
      expect(score).to.equal(10);
    });

    it('should average opponent moves', () => {
      // Opponent averaging
      const evalFn = (state: any) => state.value;
      const childrenFn = (state: any, isMax: boolean) => {
        if (isMax) {
          return [['max_move', { value: 5 }]] as [string, any][];
        }
        return [
          ['min1', { value: 3 }],
          ['min2', { value: 5 }]
        ] as [string, any][];
      };
      
      const [score, _] = expectimax({ value: 0 }, 2, true, evalFn, childrenFn);
      expect(score).to.equal(4); // (3 + 5)/2 = 4
    });

    it('should handle terminal state', () => {
      const [score, move] = expectimax({ score: 0 }, 1, true, () => 0, () => []);
      expect(score).to.equal(0);
      expect(move).to.be.null;
    });
  });

  describe('minimax', () => {
    it('should choose best move for maximizer', () => {
      const evalFn = (state: any) => state.score;
      const childrenFn = (state: any, isMax: boolean) => {
        if (isMax) {
          return [
            ['left', { score: 3 }],
            ['right', { score: 5 }]
          ] as [string, any][];
        }
        return [] as [string, any][];
      };
      
      const [score, move] = minimax({ score: 0 }, 1, true, evalFn, childrenFn);
      expect(move).to.equal('right');
      expect(score).to.equal(5);
    });

    it('should respect depth limit', () => {
      const evalFn = () => 10;
      const childrenFn = () => [['move', { score: 0 }]] as [string, any][];
      
      const [score, _] = minimax({ score: 0 }, 0, true, evalFn, childrenFn);
      expect(score).to.equal(10);
    });

    it('should handle terminal state', () => {
      const [score, move] = minimax({ score: 0 }, 1, true, () => 0, () => []);
      expect(score).to.equal(0);
      expect(move).to.be.null;
    });
  });
});