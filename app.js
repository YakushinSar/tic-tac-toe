const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const cells = [...boardEl.querySelectorAll(".cell")];

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;

function checkWinner() {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  if (board.every(Boolean)) {
    return { winner: null, line: [] };
  }

  return null;
}

function updateStatus(result) {
  if (result?.winner) {
    statusEl.innerHTML = `Победил: <strong>${result.winner}</strong>`;
    return;
  }

  if (result && !result.winner) {
    statusEl.textContent = "Ничья!";
    return;
  }

  statusEl.innerHTML = `Ход: <strong>${currentPlayer}</strong>`;
}

function highlightWinningCells(line) {
  line.forEach((index) => {
    cells[index].classList.add("win");
  });
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (gameOver || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.disabled = true;

  const result = checkWinner();
  if (result) {
    gameOver = true;
    cells.forEach((c) => (c.disabled = true));
    if (result.line.length) {
      highlightWinningCells(result.line);
    }
    updateStatus(result);
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(null);
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.className = "cell";
  });

  updateStatus(null);
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);

updateStatus(null);
