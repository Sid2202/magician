# Graph Report - .  (2026-04-25)

## Corpus Check
- Corpus is ~3,924 words - fits in a single context window. You may not need a graph.

## Summary
- 163 nodes · 226 edges · 14 communities detected
- Extraction: 69% EXTRACTED · 31% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Collision & EventBus|Collision & EventBus]]
- [[_COMMUNITY_Game & Light Controller|Game & Light Controller]]
- [[_COMMUNITY_NPC Controller|NPC Controller]]
- [[_COMMUNITY_Item Controller|Item Controller]]
- [[_COMMUNITY_Game Manager Core|Game Manager Core]]
- [[_COMMUNITY_Movement & Parallax|Movement & Parallax]]
- [[_COMMUNITY_Player Input & Control|Player Input & Control]]
- [[_COMMUNITY_Object Pooling|Object Pooling]]
- [[_COMMUNITY_Math Utilities|Math Utilities]]
- [[_COMMUNITY_Game Constants|Game Constants]]
- [[_COMMUNITY_Player Model|Player Model]]
- [[_COMMUNITY_Item Model|Item Model]]
- [[_COMMUNITY_Game State Model|Game State Model]]
- [[_COMMUNITY_Item View|Item View]]

## God Nodes (most connected - your core abstractions)
1. `GameManager` - 14 edges
2. `GameController` - 12 edges
3. `SpawnSystem` - 11 edges
4. `MathUtil` - 7 edges
5. `PoolingSystem` - 7 edges
6. `InputSystem` - 7 edges
7. `NPCController` - 7 edges
8. `InventoryModel` - 6 edges
9. `MovementSystem` - 6 edges
10. `ItemController` - 6 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Collision & EventBus"
Cohesion: 0.11
Nodes (5): CollisionSystem, EventBus, InventoryModel, LightPointModel, TradeSystem

### Community 1 - "Game & Light Controller"
Cohesion: 0.12
Nodes (3): GameController, LightPointView, LightSystem

### Community 2 - "NPC Controller"
Cohesion: 0.18
Nodes (2): NPCController, SpawnSystem

### Community 3 - "Item Controller"
Cohesion: 0.12
Nodes (3): ItemController, NPCModel, NPCView

### Community 4 - "Game Manager Core"
Cohesion: 0.14
Nodes (1): GameManager

### Community 5 - "Movement & Parallax"
Cohesion: 0.15
Nodes (2): MovementSystem, PlayerView

### Community 6 - "Player Input & Control"
Cohesion: 0.17
Nodes (2): InputSystem, PlayerController

### Community 7 - "Object Pooling"
Cohesion: 0.38
Nodes (1): PoolingSystem

### Community 8 - "Math Utilities"
Cohesion: 0.29
Nodes (1): MathUtil

### Community 9 - "Game Constants"
Cohesion: 0.33
Nodes (5): CollisionConstants, LightConstants, PlayerConstants, SpawnConstants, WorldConstants

### Community 10 - "Player Model"
Cohesion: 0.5
Nodes (1): PlayerModel

### Community 11 - "Item Model"
Cohesion: 0.5
Nodes (1): ItemModel

### Community 12 - "Game State Model"
Cohesion: 0.5
Nodes (1): GameStateModel

### Community 13 - "Item View"
Cohesion: 0.5
Nodes (1): ItemView

## Knowledge Gaps
- **5 isolated node(s):** `PlayerConstants`, `WorldConstants`, `LightConstants`, `SpawnConstants`, `CollisionConstants`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `NPC Controller`** (20 nodes): `NPCController.ts`, `.randomRange()`, `NPCController`, `.activate()`, `.deactivate()`, `.getModel()`, `.onLoad()`, `.scrollX()`, `.getFromPool()`, `SpawnSystem`, `.init()`, `.recycleCollectedItem()`, `._recycleItem()`, `.recycleNPC()`, `._resetTimers()`, `.scrollActiveObjects()`, `._spawnItem()`, `._spawnNPC()`, `.tick()`, `SpawnSystem.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Game Manager Core`** (16 nodes): `GameManager.ts`, `GameManager`, `.collision()`, `.lightSystem()`, `._onGameOver()`, `._onLightRestored()`, `.onLoad()`, `.pooling()`, `.spawn()`, `.start()`, `._startGame()`, `.state()`, `._subscribeEvents()`, `.init()`, `.onLoad()`, `.stop()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Movement & Parallax`** (14 nodes): `.readInto()`, `MovementSystem`, `.clearParallaxLayers()`, `.registerParallaxLayer()`, `.setScrollSpeed()`, `.updatePlayer()`, `.updateWorld()`, `.setPosition()`, `.update()`, `PlayerView`, `.setFacingDirection()`, `.setPosition()`, `MovementSystem.ts`, `PlayerView.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Player Input & Control`** (12 nodes): `PlayerController.ts`, `InputSystem`, `.destroy()`, `.init()`, `._onKeyDown()`, `._onKeyUp()`, `.setJoystickAxis()`, `PlayerController`, `.getModel()`, `.onDestroy()`, `._onGameOver()`, `InputSystem.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Object Pooling`** (7 nodes): `PoolingSystem`, `._getOrCreatePool()`, `.init()`, `.registerPrefab()`, `.returnToPool()`, `.seed()`, `PoolingSystem.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Math Utilities`** (7 nodes): `MathUtil`, `.approachZero()`, `.clamp()`, `.lerp()`, `.randomInt()`, `.remap()`, `MathUtil.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Player Model`** (4 nodes): `PlayerModel.ts`, `PlayerModel`, `.hasInput()`, `.reset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Item Model`** (4 nodes): `ItemModel`, `.deactivate()`, `.reset()`, `ItemModel.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Game State Model`** (4 nodes): `GameStateModel`, `.isPlaying()`, `.reset()`, `GameStateModel.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Item View`** (4 nodes): `ItemView`, `.setPosition()`, `.setVisible()`, `ItemView.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameManager` connect `Game Manager Core` to `Game & Light Controller`, `Item Controller`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `GameController` connect `Game & Light Controller` to `Collision & EventBus`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `PlayerController` connect `Player Input & Control` to `Game Manager Core`, `Movement & Parallax`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `PlayerConstants`, `WorldConstants`, `LightConstants` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Collision & EventBus` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Game & Light Controller` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Item Controller` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._