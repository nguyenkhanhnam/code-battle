# Battlesnake Simulator

A lightweight Node.js server that simulates snakewar for testing bot algorithms locally.

## Features

- 11x11 board (hardcoded)
- Hardcoded food positions and hazards
- Compatible with the snakewar API (info, start, move, end endpoints)
- Real-time ASCII board visualization
- Solo gameplay simulation

## Usage

```bash
npm install
node index.js --name "My Snake" --url http://localhost:8000
```

## Requirements

- Node.js
- A snakewar server running on the specified URL (e.g., starter-snake-typescript)

## Board Layout

- Size: 11x11
- Hazards: Corners (0,0), (10,10), (0,10), (10,0) - shown as `░`
- Food: (3,7), (9,9), (5,3) - shown as `♦`
- Snake: Head shown as `@`, body as `■`
- Snake starts at (1,1) for first snake

## API Compatibility

The simulator sends the exact same request/response format as the official Battlesnake engine:

- `GET /` - Snake info
- `POST /start` - Game start
- `POST /move` - Request move
- `POST /end` - Game end