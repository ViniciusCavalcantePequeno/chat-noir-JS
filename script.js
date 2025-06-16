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
    .filter(pos =>
      pos.row >= 0 && pos.row < numRows &&
      pos.col >= 0 && pos.col < numCols
    );
}

function cpuMove() {
  const queue = [];
  const visited = Array.from({ length: numRows }, () => Array(numCols).fill(false));
  const parent = Array.from({ length: numRows }, () => Array(numCols).fill(null));

  queue.push(catPos);
  visited[catPos.row][catPos.col] = true;

  let escapeCell = null;

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.row === 0 || current.row === numRows - 1 || current.col === 0 || current.col === numCols - 1) {
      escapeCell = current;
      break;
    }

    const neighbors = getNeighborsHex(current.row, current.col);
    for (const neighbor of neighbors) {
      const cell = document.querySelector(`.cell[data-row="${neighbor.row}"][data-col="${neighbor.col}"]`);
      if (
        cell && !cell.classList.contains("blocked") &&
        !visited[neighbor.row][neighbor.col]
      ) {
        visited[neighbor.row][neighbor.col] = true;
        parent[neighbor.row][neighbor.col] = current;
        queue.push(neighbor);
      }
    }
  }

  if (escapeCell) {
    let path = [];
    let node = escapeCell;
    while (node && !(node.row === catPos.row && node.col === catPos.col)) {
      path.push(node);
      node = parent[node.row][node.col];
    }

    if (path.length > 0) {
      const nextStep = path[path.length - 1];
      catPos = { row: nextStep.row, col: nextStep.col };
      updateCatPosition();

      if (catPos.row === 0 || catPos.row === numRows - 1 || catPos.col === 0 || catPos.col === numCols - 1) {
        setTimeout(() => {
          alert("CPU venceu! O gato escapou.");
          cpuScore++;
          updateScore();
          resetGame();
        }, 200);
      }
    }
  } else {
    setTimeout(() => {
      alert("Você venceu! O gato está cercado.");
      playerScore++;
      updateScore();
      resetGame();
    }, 200);
  }
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
