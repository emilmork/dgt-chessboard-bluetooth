module.exports = DGTConnection;

const util = require("util");
const EventEmitter = require("events").EventEmitter;
const SerialPort = require("serialport");
const serialport = new SerialPort("/dev/tty.DGT_BT_23710-RNI-SPP", {
  baudRate: 9600
});

function DGTConnection() {
  let self = this;
  this.connection = null;
  this.detectLostConnectionInterval = null;

  function onConnect() {
    console.log("Connected to board");
    self.connection = serialport;
    self.emit("connected", serialport);
    // On connect
    serialport.on("data", buf => {
      self.emit("data", buf);
    });
  }

  function connectToSerialport() {
    serialport.on("open", connection => {
      onConnect(connection);
    });
  }

  connectToSerialport();
}

DGTConnection.prototype.write = function(message) {
  if (!this.connection) return;

  this.connection.write(message, () => void 0);
};

util.inherits(DGTConnection, EventEmitter);
