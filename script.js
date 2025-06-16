const size = 11; 
let catPos = { row: 5, col: 5 }; 
let playerScore = 0;
let cpuScore = 0;

function createBoard() {
  const board = document.getElementById("game-board");
  board.innerHTML = ""; 
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.onclick = () => handlePlayerClick(r, c);
      board.appendChild(cell);
    }
  }
  updateCatPosition();
  placeFences(); 
}

function updateCatPosition() {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("cat");
  });
  const index = catPos.row * size + catPos.col;
  document.querySelectorAll(".cell")[index].classList.add("cat");
}

function handlePlayerClick(row, col) {
  if (row === catPos.row && col === catPos.col) return; 
  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  if (cell.classList.contains("blocked")) return; 

  cell.classList.add("blocked");
  cpuMove();
}

function cpuMove() {
  const directions = [
    { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
  ];

  
  for (const dir of directions) {
    const newRow = catPos.row + dir.r;
    const newCol = catPos.col + dir.c;
    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
      const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
      if (!cell.classList.contains("blocked")) {
        catPos = { row: newRow, col: newCol };
        updateCatPosition();
        checkVictory();
        return;
      }
    }
  }
  
  alert("Você venceu!");
  playerScore++;
  updateScore();
  resetGame();
}

function checkVictory() {
  if (catPos.row === 0 || catPos.row === size - 1 || catPos.col === 0 || catPos.col === size - 1) {
    alert("O gato escapou!");
    cpuScore++;
    updateScore();
    resetGame();
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
  const fenceCount = Math.floor(Math.random() * 7) + 9; 
  let placedFences = 0;

  while (placedFences < fenceCount) {
    const randomRow = Math.floor(Math.random() * size);
    const randomCol = Math.floor(Math.random() * size);

    if ((randomRow !== catPos.row || randomCol !== catPos.col) && 
        !document.querySelector(`.cell[data-row="${randomRow}"][data-col="${randomCol}"]`).classList.contains("blocked")) {

      const fenceCell = document.querySelector(`.cell[data-row="${randomRow}"][data-col="${randomCol}"]`);
      fenceCell.classList.add("blocked"); 
      placedFences++;
    }
  }
}

createBoard();
