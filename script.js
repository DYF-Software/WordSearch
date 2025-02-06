/*********************
 * Oyun Ayarları
 *********************/
const gridSize = 10;
const words = ["JAVASCRIPT", "HTML", "CSS", "REKLAM", "OYUN", "KELIME"];
let grid = [];
let cellElements = []; // Hücre DOM elemanlarını saklamak için

// Seçim ile ilgili değişkenler
let isMouseDown = false;
let startRow = null;
let startCol = null;
let currentSelectedCells = [];

// Bulunan kelimeleri ve atanan renkleri saklamak için
const foundWords = {}; // Örneğin: { "HTML": "#AABBCC", ... }

// Rastgele renk üretimi
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Ses efektleri (HTML’de uygun id'ye sahip <audio> elementleri olmalı)
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");

/*********************
 * Izgara ve Kelime Yerleştirme İşlemleri
 *********************/
// Boş ızgara oluşturma
function createEmptyGrid() {
  grid = Array.from({ length: gridSize }, () => Array(gridSize).fill("."));
}

// Olası yönler: kelimeler yatay, dikey, çapraz yönlerde yerleştirilsin
const directions = [
  { name: "HORIZONTAL", dx: 0, dy: 1 },
  { name: "VERTICAL", dx: 1, dy: 0 },
  { name: "DIAGONAL-DOWN", dx: 1, dy: 1 },    // Sol üstten sağ alta
  { name: "DIAGONAL-UP", dx: -1, dy: 1 }        // Sol alttan sağ üste
];

// Kelimeleri ızgaraya yerleştirme
function placeWords() {
  for (let word of words) {
    let placed = false;
    while (!placed) {
      let row = Math.floor(Math.random() * gridSize);
      let col = Math.floor(Math.random() * gridSize);
      // Rastgele bir yön seç
      let dir = directions[Math.floor(Math.random() * directions.length)];
      if (canPlaceWord(word, row, col, dir)) {
        for (let i = 0; i < word.length; i++) {
          const newRow = row + dir.dx * i;
          const newCol = col + dir.dy * i;
          // Eğer hücre boş değilse fakat mevcut harf ile yerleştirilecek harf aynı ise sorun yok
          grid[newRow][newCol] = word[i];
        }
        placed = true;
      }
    }
  }
}

// Kelimenin yerleşip yerleşemeyeceğini kontrol etme
function canPlaceWord(word, row, col, direction) {
  const dx = direction.dx, dy = direction.dy;
  const endRow = row + dx * (word.length - 1);
  const endCol = col + dy * (word.length - 1);
  // Sınır kontrolü
  if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) return false;
  for (let i = 0; i < word.length; i++) {
    const r = row + dx * i;
    const c = col + dy * i;
    if (grid[r][c] !== "." && grid[r][c] !== word[i]) return false;
  }
  return true;
}

// Boş kalan hücreleri rastgele harflerle doldurma
function fillEmptySpaces() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === ".") {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }
}

/*********************
 * Render İşlemleri (Kelime Listesi ve Izgara)
 *********************/
function renderWordList() {
  const listContainer = document.getElementById("word-list");
  listContainer.innerHTML = "";
  for (let word of words) {
    const span = document.createElement("span");
    span.textContent = word;
    span.classList.add("word-item");
    if (foundWords[word]) {
      span.classList.add("found");
    }
    listContainer.appendChild(span);
  }
}

function renderGrid() {
  const container = document.getElementById("game-container");
  container.innerHTML = "";
  cellElements = [];
  for (let i = 0; i < gridSize; i++) {
    cellElements[i] = [];
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement("div");
      cell.textContent = grid[i][j]; // Harfler dokuda kalır
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      
      // Mouse event listener'ları
      cell.addEventListener("mousedown", cellMouseDown);
      cell.addEventListener("mouseover", cellMouseOver);
      cell.addEventListener("mouseup", cellMouseUp);
      
      // Dokunmatik event listener'ları
      cell.addEventListener("touchstart", cellTouchStart);
      cell.addEventListener("touchmove", cellTouchMove);
      cell.addEventListener("touchend", cellTouchEnd);
      cell.addEventListener("touchcancel", cellTouchEnd);
      
      container.appendChild(cell);
      cellElements[i][j] = cell;
    }
  }
  document.addEventListener("mouseup", clearSelection);
}

/*********************
 * Event Fonksiyonları (Mouse & Touch)
 *********************/
function cellMouseDown(e) {
  isMouseDown = true;
  const row = parseInt(this.dataset.row);
  const col = parseInt(this.dataset.col);
  startRow = row;
  startCol = col;
  currentSelectedCells = [this];
  this.classList.add("selected");
}

function cellMouseOver(e) {
  if (!isMouseDown) return;
  const row = parseInt(this.dataset.row);
  const col = parseInt(this.dataset.col);
  
  // Yalnızca aynı satır, sütun ya da doğru orantılı çapraz seçim
  if (Math.abs(row - startRow) !== Math.abs(col - startCol) &&
      row !== startRow && col !== startCol) return;
  
  clearTempSelection();
  let cells = [];
  if (row === startRow) {
    const start = Math.min(startCol, col);
    const end = Math.max(startCol, col);
    for (let j = start; j <= end; j++) {
      cells.push(cellElements[row][j]);
    }
  } else if (col === startCol) {
    const start = Math.min(startRow, row);
    const end = Math.max(startRow, row);
    for (let i = start; i <= end; i++) {
      cells.push(cellElements[i][col]);
    }
  } else {
    const diff = Math.abs(row - startRow);
    const rowDir = (row - startRow) / diff;
    const colDir = (col - startCol) / diff;
    for (let i = 0; i <= diff; i++) {
      cells.push(cellElements[startRow + rowDir * i][startCol + colDir * i]);
    }
  }
  currentSelectedCells = cells;
  cells.forEach(cell => cell.classList.add("selected"));
}

function cellMouseUp(e) {
  if (!isMouseDown) return;
  isMouseDown = false;
  
  let selectedWord = currentSelectedCells.map(cell => cell.textContent).join("");
  let reversedWord = selectedWord.split("").reverse().join("");
  let actualWord = null;
  if (words.includes(selectedWord)) {
    actualWord = selectedWord;
  } else if (words.includes(reversedWord)) {
    actualWord = reversedWord;
  }
  
  if (actualWord) {
    if (!foundWords[actualWord]) {
      foundWords[actualWord] = getRandomColor();
      renderWordList();
      if (correctSound) {
        correctSound.currentTime = 0;
        correctSound.play();
      }
    }
    currentSelectedCells.forEach(cell => {
      cell.style.backgroundColor = foundWords[actualWord];
      cell.style.color = "#fff";
      cell.classList.remove("selected");
      cell.classList.add("found");
    });
    checkGameComplete();
  } else {
    if (wrongSound) {
      wrongSound.currentTime = 0;
      wrongSound.play();
    }
    clearTempSelection();
  }
  
  currentSelectedCells = [];
  startRow = null;
  startCol = null;
}

function clearTempSelection() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (!cellElements[i][j].classList.contains("found")) {
        cellElements[i][j].classList.remove("selected");
        cellElements[i][j].style.backgroundColor = "";
      }
    }
  }
}

function clearSelection() {
  if (!isMouseDown) {
    clearTempSelection();
    currentSelectedCells = [];
    startRow = null;
    startCol = null;
  }
}

// Dokunmatik event fonksiyonları
function cellTouchStart(e) {
  e.preventDefault();
  cellMouseDown.call(this, e);
}

function cellTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const elem = document.elementFromPoint(touch.clientX, touch.clientY);
  if (elem && elem.classList.contains("cell")) {
    cellMouseOver.call(elem, e);
  }
}

function cellTouchEnd(e) {
  e.preventDefault();
  if (currentSelectedCells.length > 0) {
    cellMouseUp.call(currentSelectedCells[currentSelectedCells.length - 1], e);
  }
}

/*********************
 * Oyun Tamamlanma ve Süre Sonu Kontrolleri
 *********************/
let timeoutId = setTimeout(function () {
  window.open("timeout.html", "_blank");
}, 120000);

function checkGameComplete() {
  const allFound = words.every(word => foundWords[word]);
  if (allFound) {
    clearTimeout(timeoutId);
    window.open("congratulations.html", "_blank");
  }
}

/*********************
 * Oyunu Başlatma
 *********************/
function initGame() {
  createEmptyGrid();
  placeWords();
  fillEmptySpaces();
  renderGrid();
  renderWordList();
}

// Başlangıç ekranındaki "Oyuna Başla" butonuna tıklanınca oyunu başlat
document.getElementById("start-btn").addEventListener("click", function () {
  document.getElementById("start-screen").style.display = "none";
  initGame();
});
