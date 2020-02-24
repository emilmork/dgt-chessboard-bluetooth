const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const port = new SerialPort("/dev/tty.DGT_BT_23710-RNI-SPP");
port.on("open", () => {
  console.log("connected");
  port.write(Buffer.from("00", "hex"), err => {
    if (err) {
      console.log("Connection lost. Retry connection [detectConnectionLost]");
    } else {
      console.log("Wrote to board");
    }
  });
});

const parser = new Readline();
port.pipe(parser);

parser.on("data", line => console.log(`> ${line}`));
port.write("ROBOT POWER ON\n");
