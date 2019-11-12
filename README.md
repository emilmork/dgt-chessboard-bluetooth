***Initial work connecting and communicating with DGT chess board with bluetooth***

#### Create connection and wait get board status

```js
// server.js
board.on("data", data => {
  const currentGame = getGame(data);
  console.log(currentGame.pgn());
});
```

will output
```js
1 e4
...
```

TODO

- Make webscoket client with SignalR to connect to server