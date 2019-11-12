const parseBoardDump = require("../chessLogic/dgtUtils");

test("Should parse initial postion", () => {
  const initialBoardDump =
    "86004308090a0c0b0a09080707070707070707000000000000000000000000000000000000000000000000000000000000000001010101010101010203040605040302";

  expect(parseBoardDump(initialBoardDump)).toBe(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  );
});
