module.exports = DGTConnection;

const util = require("util");
const EventEmitter = require("events").EventEmitter;
const SerialPort = require("serialport");
const serialport = new SerialPort(process.env.SERIAL_PATH, {
  baudRate: 9600
});

function DGTConnection() {
  let self = this;
  this.connection = null;

  serialport.on("open", () => {
    console.log("Connected to board.");
    self.connection = serialport;
    self.emit("connected", serialport);
    // On connect
    serialport.on("data", buf => {
      self.emit("data", buf);
    });
  });
}

DGTConnection.prototype.write = function(message) {
  if (!this.connection) return;

  this.connection.write(message, () => void 0);
};

util.inherits(DGTConnection, EventEmitter);
