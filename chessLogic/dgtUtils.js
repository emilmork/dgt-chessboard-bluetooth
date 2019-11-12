const pieces = {
  0: "_",
  1: "P",
  2: "R",
  3: "N",
  4: "B",
  5: "K",
  6: "Q",
  7: "p",
  8: "r",
  9: "n",
  10: "b",
  11: "k",
  12: "q"
};

function parseBoardDump(data) {
  [...Array(8).keys()]
    .map(i =>
      data
        .slice(i * 8, (i + 1) * 8)
        .map(d => piece[d])
        .join("")
        .replace(/(?<!_)_+(?!_)/g, match => match.length.toString())
    )
    .join("/");
}

module.exports = parseBoardDump;
