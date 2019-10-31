const bluetooth = require("node-bluetooth");
const protocol = require("./protocol.json");
const EventEmitter = require("events").EventEmitter;
const util = require("util");
const device = new bluetooth.DeviceINQ();

function buffersAreEqual(buf1, buf2) {
  return Buffer.compare(buf1, buf2) === 0;
}

function DGTBTConnection() {
  const _self = this;
  _self.timer = null;
  _self.bufferReadInterval = null;
  _self._buffer = Buffer.alloc(0);
  _self.lastMessage = Buffer.alloc(0);

  function readBuffer() {
    if (_self.bufferReadInterval) return;
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
    }, 10);
  }

  function init() {
    device.listPairedDevices(devices => {
      const dgtBoard = devices.find(d => d.name.indexOf("DGT") >= 0);
      if (!dgtBoard) {
        console.log("Could not find board");
        return;
      }
      bluetooth.connect(
        dgtBoard.address,
        dgtBoard.services[0].channel,
        function(err, connection) {
          if (err) return console.error(err);

          connection.on("data", buffer => {
            _self._buffer = Buffer.concat([_self._buffer, buffer]);
          });

          if (!_self.timer) {
            _self.timer = setInterval(() => {
              connection.write(
                Buffer.from(protocol.commands.DGT_SEND_BRD, "hex"),
                () => {}
              );
            }, 100);
          }
        }
      );
    });
  }

  init();
  readBuffer();
}

util.inherits(DGTBTConnection, EventEmitter);
module.exports = DGTBTConnection;
