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
  "10": "b",
  "11": "k",
  "12": "q"
};

function parseBoardDump(data) {
  [...Array(8).keys()]
    .map(i =>
      data
        .substring(i * 16, (i + 1) * 16)
        .replace(/\d{2}/g, match => pieces[match])
        .replace(/(?<!_)_+(?!_)/g, match => match.length.toString())
    )
    .join("/");
}

module.exports = parseBoardDump;
