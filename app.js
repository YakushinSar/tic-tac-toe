const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetGameBtn = document.getElementById('resetGame');
const resetScoreBtn = document.getElementById('resetScore');
const difficultySelect = document.getElementById('difficulty');
const xWinsEl = document.getElementById('xWins');
const oWinsEl = document.getElementById('oWins');
const drawsEl = document.getElementById('draws');

// Создаём клетки
let cells = [];
for (let i = 0; i < 9; i++) {
  const cell = document.createElement('button');
  cell.className = 'cell';
  cell.dataset.index = i;
  boardEl.appendChild(cell);
  cells.push(cell);
}

// Состояние
let board = Array(9).fill(null);
let currentPlayer = 'X'; // X — игрок, O — ИИ
let gameOver = false;
let scores = { X: 0, O: 0, draws: 0 };
let isAIThinking = false;

// Проверка победителя
function checkWinner() {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  if (board.every(Boolean)) return { winner: null, line: [] };
  return null;
}

// Получить пустые клетки
function getEmptyCells() {
  return board.map((v, i) => v === null ? i : null).filter(v => v !== null);
}

// === ИИ: Лёгкий (случайный) ===
function easyAI() {
  const empty = getEmptyCells();
  return empty[Math.floor(Math.random() * empty.length)];
}

// === ИИ: Сложный (минимакс) ===
function minimax(boardArr, depth, isMaximizing) {
  const result = checkWinner();
  if (result?.winner === 'O') return 10 - depth;
  if (result?.winner === 'X') return depth - 10;
  if (result && !result.winner) return 0;

  const empty = boardArr.map((v,i) => v === null ? i : null).filter(v => v !== null);

  if (isMaximizing) {
    let best = -Infinity;
    for (const i of empty) {
      boardArr[i] = 'O';
      const score = minimax(boardArr, depth + 1, false);
      boardArr[i] = null;
      best = Math.max(best, score);
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of empty) {
      boardArr[i] = 'X';
      const score = minimax(boardArr, depth + 1, true);
      boardArr[i] = null;
      best = Math.min(best, score);
    }
    return best;
  }
}

function hardAI() {
  const empty = getEmptyCells();
  if (empty.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = empty[0];

  for (const i of empty) {
    board[i] = 'O';
    const score = minimax(board, 0, false);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

// Ход ИИ
function makeAIMove() {
  if (isAIThinking || gameOver) return;
  const empty = getEmptyCells();
  if (empty.length === 0 || currentPlayer !== 'O') return;

  isAIThinking = true;
  statusEl.textContent = '🤔 ИИ думает...';

  setTimeout(() => {
    const difficulty = difficultySelect.value;
    const move = difficulty === 'easy' ? easyAI() : hardAI();

    if (move === null || gameOver) {
      isAIThinking = false;
      return;
    }

    // Выполняем ход
    board[move] = 'O';
    const cell = cells[move];
    cell.textContent = 'O';
    cell.classList.add('o');
    cell.disabled = true;

    const result = checkWinner();
    if (result) {
      gameOver = true;
      cells.forEach(c => c.disabled = true);
      if (result.winner) {
        highlightWinningCells(result.line);
        scores[result.winner] += 1;
        statusEl.innerHTML = `🤖 ИИ победил! <strong>O</strong>`;
      } else {
        scores.draws += 1;
        statusEl.innerHTML = '🤝 Ничья!';
      }
      updateScoreboard();
      isAIThinking = false;
      return;
    }

    currentPlayer = 'X';
    statusEl.innerHTML = `Ход: <strong>X</strong> (Вы)`;
    isAIThinking = false;
  }, 300);
}

// Обработка клика по клетке (ход игрока)
function handleCellClick(e) {
  const cell = e.currentTarget;
  const index = Number(cell.dataset.index);

  if (gameOver || isAIThinking || currentPlayer !== 'X' || board[index]) return;

  // Ход игрока
  board[index] = 'X';
  cell.textContent = 'X';
  cell.classList.add('x');
  cell.disabled = true;

  const result = checkWinner();
  if (result) {
    gameOver = true;
    cells.forEach(c => c.disabled = true);
    if (result.winner) {
      highlightWinningCells(result.line);
      scores[result.winner] += 1;
      statusEl.innerHTML = `🏆 Вы победили! <strong>X</strong>`;
    } else {
      scores.draws += 1;
      statusEl.innerHTML = '🤝 Ничья!';
    }
    updateScoreboard();
    return;
  }

  currentPlayer = 'O';
  statusEl.innerHTML = `Ход: <strong>O</strong> (ИИ)`;
  updateScoreboard();

  // Запускаем ИИ
  makeAIMove();
}

// Подсветка победной линии
function highlightWinningCells(line) {
  line.forEach(i => cells[i].classList.add('win'));
}

// Обновление счёта
function updateScoreboard() {
  xWinsEl.textContent = scores.X;
  oWinsEl.textContent = scores.O;
  drawsEl.textContent = scores.draws;
}

// Сброс игры
function resetGame() {
  if (isAIThinking) return;
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.disabled = false;
    cell.className = 'cell';
  });

  statusEl.innerHTML = `Ход: <strong>X</strong> (Вы)`;
}

// Полный сброс (счёт + игра)
function resetFull() {
  scores = { X: 0, O: 0, draws: 0 };
  updateScoreboard();
  resetGame();
}

// При смене сложности — сбрасываем игру
difficultySelect.addEventListener('change', resetGame);

// Назначаем события
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetGameBtn.addEventListener('click', resetGame);
resetScoreBtn.addEventListener('click', resetFull);

// Старт
resetGame();
updateScoreboard();
