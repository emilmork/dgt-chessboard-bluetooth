const DGTBoard = require("./Board");
const board = new DGTBoard();

board.on("data", data => {
  console.log(data);
});

board.on("move", move => {
  console.log(move);
});
