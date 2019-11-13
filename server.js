const signalR = require("@aspnet/signalr");
const getGame = require("./chessLogic/game");
const DGTBoard = require("./connection/Board");

const board = new DGTBoard();

// Url and channel for signalR socket server
const WEBSOCKET_SERVER_URI =
  process.env.ENPASSANT_SOCKET_SERVER_URL || "https://localhost";
const WEBSCOKET_SERVER_CHANNEL =
  process.env.ENPASSANT_SOCKET_CHANNEL || "update";

if (process.env.NODE_ENV === "production") {
  let connection = new signalR.HubConnectionBuilder()
    .withUrl(`${WEBSOCKET_SERVER_URI}/${WEBSCOKET_SERVER_CHANNEL}`)
    .build();

  connection.on("send", data => {
    console.log(data);
  });

  connection.start().then(() => {
    board.on("data", boardObservation => {
      const currentGame = getGame(boardObservation);
      connection.invoke("update", {
        pgn: currentGame.pgn()
      });
    });
  });
} else {
  board.on("data", boardObservation => {
    const currentGame = getGame(boardObservation);
    console.log(currentGame.pgn());
  });
}

process.on("uncaughtException", err => {
  console.error("Caught unhandled exception: " + err);
});
