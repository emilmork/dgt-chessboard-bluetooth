const { updateGame, observationMatchesPosition } = require("./chessTracker");
const parseBoardDump = require("./dgtUtils");
const ChessGame = require("chess.js").Chess;

const START_POSITION = new ChessGame().fen();

let game = new ChessGame();
function getGame(boardObservationHex) {
  if (!boardObservationHex) return game;

  const boardObservation = parseBoardDump(boardObservationHex);

  // Reset game if observation equals start position
  if (observationMatchesPosition(boardObservation, START_POSITION)) {
    game = new ChessGame();
  }

  updateGame(game, boardObservation);
  return game;
}

module.exports = getGame;
