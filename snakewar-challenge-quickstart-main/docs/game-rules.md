# Game Rules 
**Winning a game of Snakewar is deceptively simple**; be the last Snakewar remaining. To do this your Snakewar requires two things: **space to move** and **health to survive** - if it runs out of either, it will be eliminated!

As the game progresses, all Snakewars will move and grow in length. Eventually they will all run out of room and health, so finding the best path forward is critical to success.

### Board Boundaries

Snakewar is played on a rectangular grid with several Snakewars competing at the same time, each of variable length.

You'll want to be aware of the boundaries of the game board at all times. Depending on what map you're playing on, moving outside these boundaries could result in immediate elimination.

### Collisions

During gameplay there are three types of collisions that can occur.

*   **Self Collisions.** If your Snakewar collides with its own body, it will be eliminated immediately. This is the easiest type of collision to avoid, and is a good starting goal for new Snakewar developers.
    
*   **Body Collisions.** Snakewar is a game of not just wits, but also deep honor. If your Snakewar attempts to consume another Snakewar by moving into it, it will be eliminated from the game for unsports-snake-like conduct.
    
*   **Head-to-Head Collisions.** An exception to Body Collisions is when two Snakewars meet head-to-head on the same grid location. In this scenario, the outcome is a little more complex: the longer Snakewar will survive and the shorter will be eliminated. If both Snakewars are the same length, then both are eliminated.
    

tip

Competitive Snakewar developers use head-to-head collisions to gain advantages over their opponents and force eliminations.

### Starting Positions

At the start of a game your Snakewar may be coiled up on a single square. This is naturally very uncomfortable for them, and as they make their first few moves they will stretch out to their full length.

### Health

On most maps each Snakewar will begin the game with full health, and on every turn your Snakewar will lose one point of health — Snakewars are lethargic creatures and moving takes a lot of effort!

Snakewars that reach zero health will be eliminated, meaning that to stay alive as long as possible, you must find ways to replenish your health.

### Consuming Food

The most common way to restore health is consuming the traditional food of Snakewars; brightly colored nutrition discs. These delicious discs will appear on the game board throughout the game, and Snakewars that enter the same grid location as one will consume it, filling their health to its maximum value (usually 100 points).

However, ravenous consumption comes at a cost. Each time a Snakewar consumes food it will grow longer on the next turn, making it more challenging for itself (and others!) to survive.

info

Consuming food costs no health, meaning a Snakewar with a single health point can safely eat and be rejuventated in time to keep moving.

### Food Spawn

Food spawn timing and location will depend on which maps you're playing on.

In most cases, some amount of food will be placed around the board at the start. On subsequent turns additional food may be added. It's also possible for multiple pieces of food to appear on a single turn.


### Hazards

Some game maps like Royale also feature hazards. Moving into a hazard will drain additional health from your Snakewar, possibly eliminating it.

Your Snakewar should only enter a hazard if it's sure it can survive, or if given no other choice.

Turn Resolution
---------------------------------------------------------------------

Snakewar is much more than a game of moving and eating, it's also about creative thinking and competitive strategy. Understanding how the game engine operates and turns are resolved can be useful to getting the upper hand over your opponents.

Each turn in every game is divided into three stages.

**1\. Identical requests are sent to every Snakewar.** The game engine will do this in parallel, and each request includes detailed information about the game board and all Snakewars on it, including health and location. 

**2\. Snakewars respond with their next move.** After receiving the request, each Snakewar has limited time to respond with their next move. If a Snakewar's cybernetic brain fails to provide a valid response in time, momentum takes over and they will continue moving in the same direction as the previous turn - even if that means certain doom.

**3\. Moves are resolved simultaneously by the game engine.** After all moves have been received, the game engine will update the game board accordingly. This happens in a very specific order:

*   Each Snakewar will have its chosen move applied:
    
    *   A new body part is added to the board in the direction they moved.
    *   Their last body part (tail) is removed from the board.
    *   Health is reduced by 1.
*   Any Snakewar that has found food will consume it:
    
    *   Health is reset to maximum.
    *   An additional body part is placed on top of their current tail (this will extend their visible length by one on the next turn).
    *   The food is removed from the board.
*   Any new food will be placed in empty squares on the board.
    
*   Any Snakewar that has been eliminated is removed from the game board:
    
    *   Health less than or equal to 0
    *   Moved out of bounds
    *   Collided with themselves
    *   Collided with another Snakewar
    *   Collided head-to-head and lost
*   Repeat until one Snakewar remains.
    