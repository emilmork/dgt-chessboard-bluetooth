module.exports = Board;

const util = require("util");
const EventEmitter = require("events").EventEmitter;
const chess = require("chess.js");
const DGTConnection = require("./DGTConnection");
const protocol = require("./protocol.json");
const dgtConnection = new DGTConnection();

var piecesIndex = createPiecesIndex();

function Board(path, options) {
  var self = this;

  this.options = options || {};
  this.changes = [];

  this._buffer = Buffer.alloc(0);
  this._queue = [];
  this._fields = Array(64);

  this.serialNo = null;
  this.versionNo = null;
  this.connection = null;

  // create new chess logic instance and clear its board
  this.chess = new chess.Chess();
  this.chess.clear();

  dgtConnection.on("connected", connection => {
    self.connection = connection;
    dgtConnection.write(Buffer.from(protocol.commands.DGT_SEND_RESET, "hex"));
    // read in static information and send 'ready' event
    self._prepareReadyEvent();
  });

  dgtConnection.on("data", buf => {
    self._buffer = Buffer.concat([self._buffer, buf]);

    var currLength;
    while (self._queue[0] <= self._buffer.length) {
      currLength = self._queue.shift();
      self._queue.shift()(self._buffer.slice(0, currLength));
      self._buffer = self._buffer.slice(currLength);
    }
  });
}

/**
 * Make Board an EventEmitter instance.
 */
util.inherits(Board, EventEmitter);

/**
 * Read in serial number and version and fire the 'ready' event once finished.
 * Additionally initiates the other events by calling the _setMode() method.
 */
Board.prototype._prepareReadyEvent = function() {
  var self = this;

  self._queue = [];
  self.queue(protocol.commands.DGT_RETURN_SERIALNR, 8, function(data) {
    self.serialNo = data.toString("ascii");

    self.queue(protocol.commands.DGT_SEND_VERSION, 5, function(data) {
      self.versionNo = data.readInt8(3) + "." + data.readInt8(4);

      self.getBoard(function() {
        self.emit("ready");

        self._setMode();
      });
    });
  });
};

Board.prototype.queue = function(cmd, msgLength, handler) {
  if (!msgLength) {
    msgLength = 0;
    handler = function() {};
  }

  this._queue.push(msgLength, handler);
  if (cmd) {
    dgtConnection.write(Buffer.from(cmd, "hex"));
  }
};

Board.prototype.listen = function(msgLength, handler) {
  var self = this;

  self.queue(null, msgLength, function(data) {
    handler(data);
    self.listen(msgLength, handler);
  });
};

Board.prototype.getBoard = function(cb) {
  var self = this;
  self.queue(protocol.commands.DGT_SEND_BRD, 67, function(data) {
    var fields = data.slice(3);

    var field;
    for (var i = 0; i < fields.length; i++) {
      field = fields.readInt8(i);
      if (field > 0 && typeof piecesIndex[field] !== "undefined") {
        self._fields[protocol.fields[i]] = piecesIndex[field];
        self.chess.put(
          getObjectFromPiece(self.chess, piecesIndex[field]),
          protocol.fields[i]
        );
      }
    }

    cb();
  });
};

/**
 * Sets the Update Mode and creates the 'data' events.
 */
Board.prototype._setMode = function() {
  var connection = this.connection;
  var self = this;

  // set mode
  this.options.mode = this.options.mode || Board.defaults.mode;
  if (typeof protocol.commands[this.options.mode] === "undefined") {
    this.options.mode = Board.defaults.mode;
  }
  dgtConnection.write(Buffer.from(protocol.commands[this.options.mode], "hex"));

  self.listen(5, function(data) {
    var obj = {
      field: protocol.fields[data.readInt8(3)],
      piece: piecesIndex[data.readInt8(4)]
    };

    self.emit("data", obj);
    self._changed(obj);
  });
};

Board.prototype.setBoard = function(msg) {
  if (msg.id !== "DGT_BOARD_DUMP" || !msg.fields) {
    return false;
  }

  // clear board
  this.chess.clear();

  for (var field in msg.fields) {
    this.chess.put(getObjectFromPiece(this.chess, msg.fields[field]), field);
  }
};

Board.prototype._changed = function(curr) {
  if (this.changes.length === 0) {
    this.changes.push(curr);
    return;
  }

  var prev = this.changes.slice(-1)[0];
  if (prev.piece === "EMPTY" && curr.piece !== "EMPTY") {
    // this might be a move
    // check if possible
    var move = this.chess.move({ from: prev.field, to: curr.field });
    if (move === null) {
      // not possible -- add to queue
      this.changes.push(curr);
    } else {
      this.emit("move", move);
      this.changes = [];
    }
  }
};

/**
 * Some defaults.
 * @type {Object}
 */
Board.defaults = {
  mode: "DGT_SEND_UPDATE_BRD"
};

/*
Board.prototype.createRepl = function() {
  function runCommand(cmd) {
    if (Object.hasKey(protocol.commands, cmd)) {
      // TODO
    } else return false;
  }

  var r = repl.start("board > ");
  r.context.run = runCommand;
} */

/**
 * Return a chess.js compatible object representing this piece.
 * @param  {String} piece DGT named piece
 * @return {Object}       chess.js compatible representation
 */
function getObjectFromPiece(chess, piece) {
  if (piece === "EMPTY") {
    return null;
  }

  var color = piece[0] === "W" ? chess.WHITE : chess.BLACK;
  var pieceType = chess[piece.slice(1)];
  return { type: pieceType, color: color };
}

/**
 * Create an Index over the pieces.
 * @return {Object} Index of the form { Num1: Piece1, Num2: Piece2, ... }
 */
function createPiecesIndex() {
  var pieces = {};
  for (var piece in protocol.pieces) {
    pieces[parseInt(protocol.pieces[piece], 16)] = piece;
  }
  return pieces;
}
