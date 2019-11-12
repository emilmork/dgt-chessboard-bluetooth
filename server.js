const WebSocket = require("ws");

const SERVER_URI = process.env.SOCKET_SERVER_URI;
if (!SERVER_URI) {
  console.error("No server socket uri is provided (SOCKET_SERVER_URI)");
  process.exit(22);
}

const DGTBoard = require("./Board");
const board = new DGTBoard();

const socket = new WebSocket(SERVER_URI);
socket.on("open", connection => {
  board.on("data", data => {
    connection.send(data);
  });
});

process.on("uncaughtException", err => {
  console.log("Caught unhandled exception: " + err);
});
