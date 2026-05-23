/* ─── Constants ─────────────────────────────────────────── */

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

const CONFETTI_COLORS = [
  '#7F77DD', '#1D9E75', '#EF9F27',
  '#D85A30', '#D4537E', '#378ADD',
];

const CONGRATS_MESSAGES = [
  'Congratulations, you crushed it!',
  'Brilliant move — well played!',
  "You're on fire, champion!",
  'Masterclass performance!',
  'Unstoppable! Great game!',
];

/* ─── State ─────────────────────────────────────────────── */

let board        = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver      = false;
let scores        = { X: 0, O: 0, draw: 0 };

/* ─── DOM refs ──────────────────────────────────────────── */

const boardEl          = document.getElementById('board');
const overlay          = document.getElementById('result-overlay');
const resultTitle      = document.getElementById('result-title');
const resultMsg        = document.getElementById('result-msg');
const resultEmoji      = document.getElementById('result-emoji');
const currentPlayerEl  = document.getElementById('current-player');
const confettiContainer = document.getElementById('confetti-container');

const cells = []; // filled during board construction

/* ─── Board construction ────────────────────────────────── */

function buildBoard() {
  boardEl.innerHTML = '';
  cells.length = 0;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.setAttribute('role', 'button');
    cell.setAttribute('aria-label', `cell ${i + 1}, empty`);
    cell.setAttribute('tabindex', '0');

    const mark = document.createElement('span');
    mark.className = 'mark';
    cell.appendChild(mark);

    cell.addEventListener('click',   () => handleMove(i));
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') handleMove(i);
    });

    boardEl.appendChild(cell);
    cells.push(cell);
  }
}

/* ─── Game logic ────────────────────────────────────────── */

function handleMove(index) {
  if (gameOver || board[index]) return;

  // Update state
  board[index] = currentPlayer;

  // Update cell appearance
  const cell = cells[index];
  cell.classList.add('taken', currentPlayer === 'X' ? 'x-mark' : 'o-mark');
  cell.querySelector('.mark').textContent = currentPlayer;
  cell.setAttribute('aria-label', `cell ${index + 1}, ${currentPlayer}`);

  // Trigger spring animation on next paint
  requestAnimationFrame(() => requestAnimationFrame(() => cell.classList.add('pop')));

  // Check outcome
  const winLine = getWinLine();

  if (winLine) {
    gameOver = true;
    highlightWinners(winLine);
    scores[currentPlayer]++;
    updateScoreboard();
    setTimeout(() => showResult('win', currentPlayer), 420);

  } else if (board.every(Boolean)) {
    gameOver = true;
    scores.draw++;
    updateScoreboard();
    setTimeout(() => showResult('draw'), 320);

  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
  }
}

function getWinLine() {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

function highlightWinners(line) {
  line.forEach((idx, i) => {
    setTimeout(() => cells[idx].classList.add('winner-cell'), i * 80);
  });
}

/* ─── UI updates ────────────────────────────────────────── */

function updateTurnIndicator() {
  currentPlayerEl.textContent = currentPlayer;
  currentPlayerEl.style.color = currentPlayer === 'X' ? '#7F77DD' : '#1D9E75';
}

function updateScoreboard() {
  document.getElementById('val-x').textContent    = scores.X;
  document.getElementById('val-o').textContent    = scores.O;
  document.getElementById('val-draw').textContent = scores.draw;
}

function showResult(type, winner) {
  if (type === 'win') {
    resultEmoji.textContent = '🎉';
    resultTitle.textContent = `Player ${winner} wins!`;
    resultMsg.textContent   = randomCongrats();
    launchConfetti();
  } else {
    resultEmoji.textContent = '🤝';
    resultTitle.textContent = "It's a draw!";
    resultMsg.textContent   = 'Neck and neck — try again!';
  }
  overlay.classList.add('show');
}

function randomCongrats() {
  return CONGRATS_MESSAGES[Math.floor(Math.random() * CONGRATS_MESSAGES.length)];
}

/* ─── Confetti ──────────────────────────────────────────── */

function launchConfetti() {
  confettiContainer.innerHTML = '';

  for (let i = 0; i < 60; i++) {
    const piece    = document.createElement('div');
    piece.className = 'confetti-piece';

    const color    = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const left     = Math.random() * 100;
    const delay    = Math.random() * 0.9;
    const duration = 1.2 + Math.random() * 1.3;
    const size     = 8 + Math.floor(Math.random() * 9);
    const isCircle = Math.random() > 0.5;

    piece.style.cssText = `
      left: ${left}%;
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: ${isCircle ? '50%' : '3px'};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;

    confettiContainer.appendChild(piece);
  }

  // Clean up after animations finish
  setTimeout(() => { confettiContainer.innerHTML = ''; }, 3000);
}

/* ─── Round / score reset ───────────────────────────────── */

function resetRound() {
  board         = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver      = false;

  overlay.classList.remove('show');

  cells.forEach((cell, i) => {
    cell.className = 'cell';
    cell.querySelector('.mark').textContent = '';
    cell.setAttribute('aria-label', `cell ${i + 1}, empty`);
    cell.setAttribute('tabindex', '0');
  });

  updateTurnIndicator();
}

function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
  resetRound();
}

/* ─── Event listeners ───────────────────────────────────── */

document.getElementById('play-again-btn').addEventListener('click', resetRound);
document.getElementById('reset-btn').addEventListener('click', resetScores);

/* ─── Init ──────────────────────────────────────────────── */

buildBoard();
updateTurnIndicator();