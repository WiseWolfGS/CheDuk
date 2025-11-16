# CheDuk Rulebook

### 0. Summary
CheDuk is a 2-player abstract strategy board game inspired by Chess and Janggi, played on a hexagonal tile board. The unique feature of CheDuk is the co-existence of two distinct victory conditions:

Spy (諜) Information Route – Instantly win by acquiring information 5 times from the opponent's Territory.

Chief (首) Capture Route – Win by capturing the opponent's Chief.

The core of the game revolves around the Embassy (使館) and Territory system, as well as the unique abilities of each piece.

---

### 1. Game Components

#### 1.1. Game Board
![CheDuk Game Board](../images/Board_CheDuk.svg)
The CheDuk board consists of 11 (width) by 12 (height) regular hexagonal tiles.

#### 1.2. Pieces
![CheDuk Pieces](../images/Pieces_CheDuk.svg)
Each player commands 11 pieces of 6 different types.

---

### 2. Piece Rules

#### 2.1. Chief (首) ×1
- **Role:** Equivalent to the King in Chess or the Gung in Janggi. If captured, the game is lost immediately.

- **Movement:** Can move 1 step to any of the 6 adjacent empty tiles.

- **Territory Restriction:** By default, the Chief can only move within its own Territory (including the boundary tiles).

- **Special Movement (Castling):** The Chief can only leave its Territory and move to the Neutral Zone by performing 'Castling' with the Diplomat (外). (See 6.1. Castling Rules for details)

#### 2.2. Diplomat (外) ×1
- **Movement:** Moves any number of unobstructed steps in a straight line (6 directions) to move or capture.

- **Special Ability:** Can swap positions with the 'Chief (首)' in a Castling maneuver.

#### 2.3. Special Envoy (特) ×2
- **Role:** Similar to the Cannon (砲) in Janggi, this piece attacks by jumping over another piece.

- **Movement/Attack:** Can jump over exactly one piece (friendly or enemy) in a straight line, landing on any empty tile or capturing an enemy piece behind the jumped piece.

- **Restrictions:**
    - A Special Envoy cannot jump over or capture another 'Special Envoy (特)'.
    - It cannot capture an 'Ambassador (使)'.
    - An 'Embassy' tile that is currently occupied by an opponent cannot be used as a jump path or a destination. (This restriction is lifted immediately if the Embassy is liberated.)

#### 2.4. Ambassador (使) ×1
- **Role:** Establishes the 'Embassy' by determining its starting position, which in turn defines the player's Territory.

- **Start:** Before the game begins, the player places this piece on a valid tile, which becomes the 'Embassy'.

- **Movement (Moving Away from Embassy):**
    - Moves in an 'L' shape, similar to a Knight in Chess. (Moves 1 adjacent step, then 1 more step at a 60° angle, turning left or right).
    ![Ambassador Move Example](../images/Amb_Move_CheDuk.png)
    - It can jump over the intermediate tile, even if it's occupied.

- **Movement (Returning to Embassy):**
    - Moves 1 step to any of the 6 adjacent tiles.
    - **Resurrection:** If captured, the Ambassador can be resurrected on its 'Embassy' tile by spending 1 turn, provided the Embassy is not currently occupied.
    - **Note:** Resurrection is not allowed on the same turn a friendly piece recaptures the Embassy. It is available from the following turn.

#### 2.5. Spy (諜) ×5
- **Role:** The key piece for achieving an 'Information Victory'.

- **Movement:** The Spy's movement is asymmetrical and depends on the player's faction.

- **Red Team Spy:** Can move 1 step in the 60°, 120°, 180°, and 240° directions from its current position.

- **Blue Team Spy:** Can move 1 step in the 0°, 60°, 240°, and 300° directions from its current position.

- **Gather Information (Standard):**
    - While in the opponent's Territory, a Spy can spend 1 turn to perform 'Gather Information'.
    - After gathering info, the Spy remains on that tile, and this action ends the turn.
    - On a subsequent turn, it can spend 1 more turn to 'Return' to any empty tile within its own friendly Territory.
    - Information cannot be gathered more than once from the same tile.

- **Gather Information (Special - Embassy Capture):**
    - If a Spy moves onto and occupies the opponent's Embassy tile, it immediately gains 1 information point.
    - In this case, the Spy immediately 'Returns' to its friendly Territory without spending an additional turn.
    - **Resurrection:** If captured, a Spy can be resurrected an unlimited number of times. It costs 1 turn to place it on any empty tile within its friendly Territory. This action consumes the entire turn.

#### 2.6. Guard (守) ×1
- **Role:** Protects key pieces and counters enemy Spies.

- **Movement:** Can move 1 or 2 steps in a straight line (6 directions).

- **Chief Protection:** If the Guard is on one of the 6 tiles adjacent to its 'Chief (首)', and the Chief is attacked, the Guard is captured instead of the Chief.

- **Capture Rule:** When the Chief Protection rule is activated, only the Guard is removed. The attacking piece remains in its original position, and the Chief is unharmed. This applies even if the attacker is a Special Envoy.

- **Spy Interference:** An enemy Spy cannot 'Gather Information' on a tile that is adjacent to a Guard.

---

### 3. Game Setup

#### 3.1. Initial Placement
![Initial position of CheDuk](../images/Basic_CheDuk.png)
The 'Chief (首)', 'Diplomat (外)', 'Special Envoy (特)', and 'Guard (守)' pieces start in fixed positions.

#### 3.2. Ambassador Placement & First Player
![CheDuk Placement Area](../images/Board_Base_CheDuk.png)
1. The game board displays numbers on certain tiles, indicating the distance from that faction's central reference point (these are 'Starting Placement' tiles). Both players, without the opponent seeing, choose one of their colored tiles marked with a 3 or less to place their 'Ambassador (使)'. This tile becomes their 'Embassy'.

2. The player who placed their Ambassador closer to their central reference point gets to move first (becomes the first player).

#### 3.3. Spy Placement
1. After Ambassadors are placed, the player who moves second places their first 'Spy (諜)', followed by the first player, alternating until all 5 Spies for each player are placed.

2. Spies must be placed on a 'Starting Placement' tile (with a number) that is within their own Territory.

3. **Tie-breaker:** If both players placed their Ambassadors at the same distance, the first player is determined after Spy placement. The total distance of all 5 Spies from their central reference point is calculated for each player. The player with the smaller total distance goes first. If still tied, the first player is chosen randomly (e.g., coin toss).

---

### 4. Territory (영역) & Neutral Zone

#### 4.1. Definition of Territory
![Territory and First](../images/Territory_CheDuk.png)
The Territory is a wedge-shaped area defined by two lines extending from the Embassy in specific directions, bounded by the board's edges.

- Blue Team Territory: The area enclosed by two lines drawn West (W) and Northeast (NE) from the Blue Embassy.

- Red Team Territory: The area enclosed by two lines drawn East (E) and Southwest (SW) from the Red Embassy.

- The two territories do not overlap.

#### 4.2. Neutral Zone
All tiles that do not belong to either player's Territory are the 'Neutral Zone'.

- All standard movements and combat are allowed in the Neutral Zone.
- However, a Spy's 'Gather Information', 'Return', and 'Resurrect' actions cannot be performed in the Neutral Zone.

---

### 5. Turn Structure and Actions
On your turn, you must choose one of your pieces and perform one of the following actions:

1. **Move/Attack:** Move the piece according to its rules, potentially capturing an opponent's piece.

2. **Special Action:** Use a turn-consuming unique ability, such as Gather Information, Return, Resurrect, or Castling.

---

### 6. Special Rules - Details

#### 6.1. Castling (Chief ↔ Diplomat)
- Can only be used once per game.

- All tiles between the Chief and the Diplomat must be empty.

- Can be used even if either piece has moved before.

- When used, both pieces swap positions simultaneously as a single turn's action.

#### 6.2. Embassy Occupation
If an enemy piece moves onto a friendly Embassy tile, it becomes 'Occupied'.

- **Effects:**
    1. The occupying player immediately gains 1 Information Point (this bonus is granted only for the first occupation of that Embassy per game).
    2. While occupied, an enemy 'Special Envoy' cannot use this tile as a path to jump over.
    3. **Liberation:** If a friendly piece recaptures the Embassy, it immediately returns to an 'unoccupied' state, and the Special Envoy's movement restriction is lifted.

---

### 7. End of Game

#### 7.1. Victory Conditions
- **Information Victory:** You win immediately if you successfully 'Gather Information' 5 times using your Spies.

- **Chief Capture Victory:** You win immediately if you capture the opponent's 'Chief'.

#### 7.2. Draw Conditions

- **3-Fold Repetition:** If the exact same game state (piece positions and all other relevant states) is repeated 3 times, the system will propose a draw. If both players agree, the game is a draw.

- **Mutual Agreement:** Players can agree to restart or end the game in a draw at any time.

---

### 8. Implementation Notes
- **Judgment Priority:** All checks should be performed in this order: ① Game End → ② Information Gain → ③ Capture → ④ Move → ⑤ Resurrect/Return. If a higher-priority event occurs, lower-priority ones are ignored.

- **Ambassador Move Coordinates:** On a pointy-top hex board, if the first move's direction index is i (0-5), the final "L-shape" destination can be calculated by adding the direction vector of (i + 1) % 6 or (i - 1 + 6) % 6.

- **Randomness:** Any random elements (like the tie-breaker) should use a seed-based Pseudo Random Number Generator (RNG) in online mode to ensure games are reproducible.