"use strict";
// Indovina la Coppia: Matching Game per 2 player

const numRows = 4;
const numCols = 4;
let boardValues = [];
let boardState = [];  // "hidden" o "revealed"
let firstCard = null;
let secondCard = null;
let busy = false;
let currentPlayer = 1; // 1 = Giocatore 1 (Rosso), 2 = Giocatore 2 (Blu)
let score = { player1: 0, player2: 0 };

const gameBoardEl = document.getElementById("gameBoard");
const messageEl = document.getElementById("message");
const closeButton = document.getElementById("closeButton");

closeButton.addEventListener("click", () => {
  if (confirm("Vuoi davvero abbandonare il gioco?")) {
    window.parent.closeGame();
  }
});

function initGame() {
  let values = [];
  for (let i = 1; i <= 8; i++) {
    values.push(i);
    values.push(i);
  }
  values = shuffle(values);
  boardValues = [];
  boardState = [];
  for (let r = 0; r < numRows; r++) {
    boardValues[r] = values.slice(r * numCols, r * numCols + numCols);
    boardState[r] = Array(numCols).fill("hidden");
  }
  currentPlayer = 1;
  score = { player1: 0, player2: 0 };
  firstCard = null;
  secondCard = null;
  busy = false;
  updateMessage();
  renderBoard();
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function renderBoard() {
  gameBoardEl.innerHTML = "";
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const cardEl = document.createElement("div");
      cardEl.classList.add("card");
      cardEl.dataset.row = r;
      cardEl.dataset.col = c;
      if (boardState[r][c] === "revealed") {
        cardEl.classList.add("revealed");
        cardEl.innerText = boardValues[r][c];
      }
      cardEl.addEventListener("click", onCardClick);
      gameBoardEl.appendChild(cardEl);
    }
  }
}

function updateMessage(extra="") {
  const turnText = currentPlayer === 1 ? "Giocatore 1 (Rosso)" : "Giocatore 2 (Blu)";
  messageEl.innerText = `Turno: ${turnText} ${extra} | Punteggio: R:${score.player1} - B:${score.player2}`;
}

function onCardClick(e) {
  if (busy) return;
  const row = parseInt(e.currentTarget.dataset.row);
  const col = parseInt(e.currentTarget.dataset.col);
  if (boardState[row][col] === "revealed") return;
  revealCard(row, col);
  if (!firstCard) {
    firstCard = { row, col };
  } else if (!secondCard && (row !== firstCard.row || col !== firstCard.col)) {
    secondCard = { row, col };
    busy = true;
    setTimeout(checkMatch, 1000);
  }
}

function revealCard(row, col) {
  boardState[row][col] = "revealed";
  renderBoard();
}

function hideCard(row, col) {
  boardState[row][col] = "hidden";
}

function checkMatch() {
  const { row: r1, col: c1 } = firstCard;
  const { row: r2, col: c2 } = secondCard;
  if (boardValues[r1][c1] === boardValues[r2][c2]) {
    if (currentPlayer === 1) { score.player1++; }
    else { score.player2++; }
  } else {
    hideCard(r1, c1);
    hideCard(r2, c2);
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }
  firstCard = null;
  secondCard = null;
  busy = false;
  updateMessage();
  renderBoard();
  if (isGameOver()) { endGame(); }
}

function isGameOver() {
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (boardState[r][c] === "hidden") return false;
    }
  }
  return true;
}

function endGame() {
  let result = "draw";
  if (score.player1 > score.player2) { result = "red"; }
  else if (score.player1 < score.player2) { result = "blue"; }
  updateMessage(" - Gioco Terminato!");
  setTimeout(() => { window.parent.reportGameResult(result); }, 1000);
}

initGame();
