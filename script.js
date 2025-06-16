const numRows = 11;
const numCols = 11;

let catPos = { row: 5, col: 5 };
let playerScore = 0;
let cpuScore = 0;

function createBoard() {
  const board = document.getElementById("game-board");
  board.innerHTML = "";

  for (let r = 0; r < numRows; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    if (r % 2 !== 0) rowDiv.classList.add("offset");

    for (let c = 0; c < numCols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.onclick = () => handlePlayerClick(r, c);
      rowDiv.appendChild(cell);
    }

    board.appendChild(rowDiv);
  }

  updateCatPosition();
  placeFences();
}

function updateCatPosition() {
  document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("cat"));
  const cell = document.querySelector(`.cell[data-row="${catPos.row}"][data-col="${catPos.col}"]`);
  if (cell) cell.classList.add("cat");
}

function handlePlayerClick(row, col) {
  if (row === catPos.row && col === catPos.col) return;

  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  if (cell.classList.contains("blocked")) return;

  cell.classList.add("blocked");
  cpuMove();
}

function getNeighborsHex(row, col) {
  const evenRow = row % 2 === 0;
  const directions = evenRow
    ? [
        { row: -1, col: 0 },
        { row: -1, col: -1 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: -1 }
      ]
    : [
        { row: -1, col: 1 },
        { row: -1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 1, col: 0 }
      ];

  return directions
    .map(dir => ({ row: row + dir.row, col: col + dir.col }))
    .filter(n => n.row >= 0 && n.row < numRows && n.col >= 0 && n.col < numCols);
}

function cpuMove() {
  const depth = 3;
  const blockedSet = getBlockedSet();
  const bestMove = minimax(catPos, depth, true, blockedSet, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);

  if (bestMove.move) {
    catPos = bestMove.move;
    updateCatPosition();

    if (isOnEdge(catPos)) {
      setTimeout(() => {
        alert("O gato escapou! CPU venceu.");
        cpuScore++;
        updateScore();
        resetGame();
      }, 300);
    }
  } else {
    setTimeout(() => {
      alert("Você venceu! O gato está cercado.");
      playerScore++;
      updateScore();
      resetGame();
    }, 300);
  }
}

function getBlockedSet() {
  const blocked = new Set();
  document.querySelectorAll(".cell.blocked").forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    blocked.add(row + "," + col);
  });
  return blocked;
}

function minimax(pos, depth, maximizing, blockedSet, alpha, beta) {
  if (depth === 0 || isOnEdge(pos) || isSurrounded(pos, blockedSet)) {
    const score = evaluate(pos, blockedSet);
    return { score: score, move: null };
  }

  if (maximizing) {
    let maxEval = Number.NEGATIVE_INFINITY;
    let bestMove = null;
    for (const neighbor of getAvailableNeighbors(pos, blockedSet)) {
      const result = minimax(neighbor, depth - 1, false, blockedSet, alpha, beta);
      if (result.score > maxEval) {
        maxEval = result.score;
        bestMove = neighbor;
      }
      alpha = Math.max(alpha, maxEval);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Number.POSITIVE_INFINITY;
    for (const block of getPossibleBlocks(pos, blockedSet)) {
      const newBlocked = new Set(blockedSet);
      newBlocked.add(block.row + "," + block.col);

      const result = minimax(pos, depth - 1, true, newBlocked, alpha, beta);
      if (result.score < minEval) {
        minEval = result.score;
      }
      beta = Math.min(beta, minEval);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: null };
  }
}

function getAvailableNeighbors(pos, blockedSet) {
  return getNeighborsHex(pos.row, pos.col).filter(n => {
    const key = n.row + "," + n.col;
    return !blockedSet.has(key);
  });
}

function getPossibleBlocks(pos, blockedSet) {
  const blocks = [];
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const key = r + "," + c;
      if (!(r === pos.row && c === pos.col) && !blockedSet.has(key)) {
        blocks.push({ row: r, col: c });
      }
    }
  }
  return blocks;
}

function isSurrounded(pos, blockedSet) {
  return getAvailableNeighbors(pos, blockedSet).length === 0;
}

function evaluate(pos, blockedSet) {
  const visited = new Set();
  const queue = [{ pos, dist: 0 }];
  visited.add(pos.row + "," + pos.col);

  while (queue.length > 0) {
    const { pos: current, dist } = queue.shift();
    if (isOnEdge(current)) return 100 - dist;

    for (const neighbor of getAvailableNeighbors(current, blockedSet)) {
      const key = neighbor.row + "," + neighbor.col;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ pos: neighbor, dist: dist + 1 });
      }
    }
  }
  return -100;
}

function isOnEdge(pos) {
  return pos.row === 0 || pos.row === numRows - 1 || pos.col === 0 || pos.col === numCols - 1;
}

function updateScore() {
  document.getElementById("player-score").textContent = playerScore;
  document.getElementById("cpu-score").textContent = cpuScore;
}

function resetGame() {
  catPos = { row: 5, col: 5 };
  createBoard();
}

function placeFences() {
  const fenceCount = Math.floor(Math.random() * 7) + 12;
  let placed = 0;

  while (placed < fenceCount) {
    const r = Math.floor(Math.random() * numRows);
    const c = Math.floor(Math.random() * numCols);
    if (r === catPos.row && c === catPos.col) continue;

    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    if (cell && !cell.classList.contains("blocked")) {
      cell.classList.add("blocked");
      placed++;
    }
  }
}

createBoard();
