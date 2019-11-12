const pieces = {
  "00": "_",
  "01": "P",
  "02": "R",
  "03": "N",
  "04": "B",
  "05": "K",
  "06": "Q",
  "07": "p",
  "08": "r",
  "09": "n",
  "0a": "b",
  "0b": "k",
  "0c": "q"
};

function parseBoardDump(data) {
  return [...Array(8).keys()]
    .map(i =>
      data
        .substring(6)
        .substring(i * 16, (i + 1) * 16)
        .replace(/.{2}/g, match => pieces[match])
        .replace(/_+/g, match => match.length.toString())
    )
    .join("/");
}

module.exports = parseBoardDump;
