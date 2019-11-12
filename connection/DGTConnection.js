module.exports = DGTConnection;

const util = require("util");
const EventEmitter = require("events").EventEmitter;
const bluetooth = require("node-bluetooth");
const device = new bluetooth.DeviceINQ();

function DGTConnection() {
  let self = this;
  this.connection = null;
  this.detectLostConnectionInterval = null;

  function onConnect(connection) {
    console.log("Connected to board");
    self.connection = connection;
    self.emit("connected", connection);
    // On connect
    connection.on("data", buf => {
      self.emit("data", buf);
    });

    detectConnectionLost();
  }

  function detectConnectionLost() {
    if (self.detectLostConnectionInterval) return;

    self.detectLostConnectionInterval = setInterval(() => {
      try {
        self.connection.write(Buffer.from("00", "hex"), err => {
          if (err) {
            console.log(
              "Connection lost. Retry connection [detectConnectionLost]"
            );
            self.connection.close(() => {
              self.connection = null;
              console.log("Connection closed");
              findAndConnectPairedDevices();
            });
            clearInterval(self.detectLostConnectionInterval);
            self.detectLostConnectionInterval = null;
          }
        });
      } catch (err) {
        console.error("Lost connection to board. Try reconnect");
        clearInterval(self.detectLostConnectionInterval);
        self.detectLostConnectionInterval = null;
        findAndConnectPairedDevices();
      }
    }, 1000);
  }

  function findAndConnectPairedDevices() {
    console.log("Find and connect to dgt board..");
    device.listPairedDevices(devices => {
      const dgtBoard = devices.find(d => d.name.indexOf("DGT") >= 0);
      if (!dgtBoard) {
        console.error("Could not find board, Pair board!");
      }

      function connect() {
        console.log("Connecting..");
        bluetooth.connect(
          dgtBoard.address,
          dgtBoard.services[0].channel,
          (err, connection) => {
            if (err) {
              console.log("Could not connect to board. Retry", err);
              setTimeout(() => {
                findAndConnectPairedDevices();
              }, 3000);
              return;
            }

            onConnect(connection);
          }
        );
      }

      connect();
    });
  }

  findAndConnectPairedDevices();
}

DGTConnection.prototype.write = function(message) {
  if (!this.connection) return;
  this.connection.write(message, () => void 0);
};

util.inherits(DGTConnection, EventEmitter);
