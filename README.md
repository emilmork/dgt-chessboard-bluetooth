# DGT Wireless Bluetooth e-Board

This projects makes it easy to connect and broadcast valid chess game data from a DGT wireless chess board (bluetooth).

## Components

### DGTConnection
This module try to connect and reconnect to the board at any time
using bluetooth

 - On macos xcode and xcode developer tools is required. On linux

```js
const DGTConnection = require("./DGTConnection");
const dgtConnection = new DGTConnection();

dgtConnection.on("connected", connection => {
  console.log("Connected to board");
});

dgtConnection.on("data", buffer => {
  console.log("Raw data received from the board", data);
  // Data received from the board 0707000000000000000000000000000000000000000000000000000000000000000001010101010101010203040605040302
});
```

### Board

This component is a wrapper around DGTConnection. It reads and parses the received buffer values

```js
const DGTBoard = require("./connection/Board");
const board = new DGTBoard();

board.on("data", data => {
  console.log("data", data)
});

```

### Game logic

The game logic parses the data received from the Board component and return a valid chessjs game object

Usage in server.js
```js
const DGTBoard = require("./connection/Board");
const board = new DGTBoard();
const getGame = require("./chessLogic/game");

board.on("data", data => {
  const currentGame = getGame(data);
  console.log(currentGame.pgn());
  // 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6
});
```



TODO

- Make webscoket client with SignalR to connect to server
