const DGTConnectionBT = require("./DGTConnectionBT");
const connection = new DGTConnectionBT();

connection.on("data", data => {
  console.log(data);
});
