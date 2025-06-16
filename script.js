
const size = 9;
let catPos = { row: 4, col: 4 };
let playerScore = 0;
let cpuScore = 0;

function createBoard() {
  const board = document.getElementById("game-board");
  board.innerHTML = "";

  for (let r = 0; r < size; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    if (r % 2 !== 0) rowDiv.classList.add("offset");

    for (let c = 0; c < size; c++) {
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
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("cat");
  });
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

  return directions.map(dir => ({
    row: row + dir.row,
    col: col + dir.col
  }));
}

function cpuMove() {
  const directions = getNeighborsHex(catPos.row, catPos.col);
  let foundEscape = false;

  for (const neighbor of directions) {
    if (
      neighbor.row < 0 || neighbor.row >= size ||
      neighbor.col < 0 || neighbor.col >= size
    ) {
      foundEscape = true;
      break;
    }
  }

  if (foundEscape) {
    setTimeout(() => {
      alert("O gato escapou!");
      cpuScore++;
      updateScore();
      resetGame();
    }, 500); 
    return;
  }

  const queue = [];
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const parent = Array.from({ length: size }, () => Array(size).fill(null));

  queue.push(catPos);
  visited[catPos.row][catPos.col] = true;

  let escapeCell = null;

  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = getNeighborsHex(current.row, current.col);

    for (const neighbor of neighbors) {
      if (
        neighbor.row < 0 || neighbor.row >= size ||
        neighbor.col < 0 || neighbor.col >= size
      ) {
        escapeCell = current;
        break;
      }

      if (
        neighbor.row >= 0 && neighbor.row < size &&
        neighbor.col >= 0 && neighbor.col < size &&
        !visited[neighbor.row][neighbor.col]
      ) {
        const cell = document.querySelector(`.cell[data-row="${neighbor.row}"][data-col="${neighbor.col}"]`);
        if (cell && !cell.classList.contains("blocked")) {
          visited[neighbor.row][neighbor.col] = true;
          parent[neighbor.row][neighbor.col] = current;
          queue.push(neighbor);
        }
      }
    }

    if (escapeCell) break;
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
      setTimeout(() => {
        catPos = { row: nextStep.row, col: nextStep.col };
        updateCatPosition();
      }, 100);
      return;
    }
  }

  setTimeout(() => {
    alert("Você venceu!");
    playerScore++;
    updateScore();
    resetGame();
  }, 200);
}

function updateScore() {
  document.getElementById("player-score").textContent = playerScore;
  document.getElementById("cpu-score").textContent = cpuScore;
}

function resetGame() {
  catPos = { row: 4, col: 4 };
  createBoard();
}

function placeFences() {
  const fenceCount = Math.floor(Math.random() * 7) + 9;
  let placed = 0;

  while (placed < fenceCount) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (r === catPos.row && c === catPos.col) continue;

    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    if (cell && !cell.classList.contains("blocked")) {
      cell.classList.add("blocked");
      placed++;
    }
  }
}

createBoard();