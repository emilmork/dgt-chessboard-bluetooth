export function updateGame(game, observation) {
  return (
    observationMatchesPosition(observation, game.fen()) ||
    tryGotoState(game, getMatchingChild(game, observation)) ||
    tryGotoState(game, getMatchingParent(game, observation)) ||
    tryGotoState(game, getMatchingSibling(game, observation))
  );
}

function tryGotoState(game, state) {
  if (!state) return false;
  game.load_pgn(state.pgn());
  return true;
}

function getMatchingChild(state, observation) {
  return getChildren(state).filter(child =>
    observationMatchesPosition(observation, child.fen())
  )[0];
}

function getMatchingParent(state, observation) {
  const parent = getParent(state);
  return parent && observationMatchesPosition(observation, parent.fen())
    ? parent
    : null;
}

function getMatchingSibling(state, observation) {
  const parent = getParent(state);
  return parent ? getMatchingChild(parent, observation) : null;
}

function observationMatchesPosition(observation, position) {
  return observation === position.split(" ")[0];
}

function getChildren(state) {
  return state.moves().map(move => {
    const child = copyGame(state);
    child.move(move);
    return child;
  });
}

function getParent(state) {
  const parent = copyGame(state);
  return parent.undo() ? parent : null;
}

function copyGame(game) {
  const copy = new Chess();
  copy.load_pgn(game.pgn());
  return copy;
}
