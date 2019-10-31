***Initial work connecting and communicating with DGT chess board with bluetooth***

#### Create connection and wait get board status

```js
// server.js
const DGTConnectionBT = require("./DGTConnectionBT");
const connection = new DGTConnectionBT();

connection.on("data", data => {
  console.log(data);
});
```

will output
```js
86004300000000000000000000000000000000000000000000000000000500000000000000010000010000000000000000060000000000000b00000000000000000000

86004300000000000000000000000000000000000000000000000000000500000000000000010000010000000000000000060000000000000b00000000000000000000

86004300000000000000000000000000000000000000000000000000000500000000000000010000010000000000000000060000000000000000000000000000000000

...
```

TODO

- Make connection more stable (pair if not paired)
- Create node module og publish to npm
- Contact DGT to get the full spec
  - Is it possible to read out all games ?
  - Is there a algorithm to validate illigal moves etc
  - Clock integration ?