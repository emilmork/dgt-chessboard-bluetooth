const protocol = require("./protocol.json");
const EventEmitter = require("events").EventEmitter;
const util = require("util");
const DGTConnection = require("./DGTConnection");
const dgtConnection = new DGTConnection();

function buffersAreEqual(buf1, buf2) {
  return Buffer.compare(buf1, buf2) === 0;
}

function DGTBTConnection() {
  const _self = this;
  _self.timer = null;
  _self.bufferReadInterval = null;
  _self._buffer = Buffer.alloc(0);
  _self.lastMessage = Buffer.alloc(0);

  // Read from concatinated buffer and try creating a complete message
  function readBuffer() {
    if (!_self.bufferReadInterval) {
      _self.bufferReadInterval = setInterval(() => {
        if (_self._buffer.length >= 67) {
          const message = _self._buffer.slice(0, 67);
          _self._buffer = _self._buffer.slice(67);

          if (buffersAreEqual(_self.lastMessage, message)) {
            return;
          }

          _self.lastMessage = message;
          _self.emit("data", message.toString("hex"));
        }
      }, 50);
    }
  }

  // Initiate reading data from the board
  function init() {
    dgtConnection.on("connected", con => {
      // Reset buffer
      _self._buffer = Buffer.alloc(0);

      if (!_self.timer) {
        _self.timer = setInterval(() => {
          dgtConnection.write(
            Buffer.from(protocol.commands.DGT_SEND_BRD, "hex")
          );
        }, 100);
      }
    });

    dgtConnection.on("data", buffer => {
      _self._buffer = Buffer.concat([_self._buffer, buffer]);
    });
  }

  init();
  readBuffer();
}

util.inherits(DGTBTConnection, EventEmitter);
module.exports = DGTBTConnection;
