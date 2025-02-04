// Oyun ayarları
const gridSize = 10;
const words = ["JAVASCRIPT", "HTML", "CSS", "REKLAM", "OYUN", "KELIME"];
let grid = [];
let cellElements = []; // Hücre DOM elemanlarını saklamak için

// Seçimle ilgili değişkenler
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

// Ses efektleri
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");

/* *****************************************
   Izgara ve Kelime Yerleştirme İşlemleri
******************************************* */

// Boş ızgara oluşturma
function createEmptyGrid() {
  grid = Array.from({ length: gridSize }, () => Array(gridSize).fill("."));
}

// Olası yönler; her yön bir obje olarak: dx ve dy değerleri belirler.
const directions = [
  { name: "HORIZONTAL", dx: 0, dy: 1 },
  { name: "VERTICAL", dx: 1, dy: 0 },
  { name: "DIAGONAL-DOWN", dx: 1, dy: 1 },    // sol üstten sağ alta
  { name: "DIAGONAL-UP", dx: -1, dy: 1 }        // sol alttan sağ üste
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
          // Eğer hücre boş değilse, fakat mevcut harf ile yerleştirilmek istenen harf aynı ise; sorun yok.
          grid[newRow][newCol] = word[i];
        }
        placed = true;
      }
    }
  }
}

// Kelimenin yerleşip yerleşemeyeceğini kontrol etme  
// (Eğer hücre boş değilse, ancak mevcut harf kelimenin yerleştirilecek harfiyle aynıysa izin verilir.)
function canPlaceWord(word, row, col, direction) {
  let dx = direction.dx;
  let dy = direction.dy;
  // Son hücrenin koordinatları
  const endRow = row + dx * (word.length - 1);
  const endCol = col + dy * (word.length - 1);
  
  // Sınır kontrolü
  if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) return false;
  
  for (let i = 0; i < word.length; i++) {
    let r = row + dx * i;
    let c = col + dy * i;
    if (grid[r][c] !== "." && grid[r][c] !== word[i]) return false;
  }
  return true;
}

// Izgarayı harflerle doldurma
function fillEmptySpaces() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === ".") {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }
}

/* *****************************************
   Render İşlemleri (Word List & Grid)
******************************************* */

// Kelime listesini ekrana yazdırma
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

// Izgarayı HTML'e ekleme ve hücrelere event ekleme
// … (önceki kodlar, createEmptyGrid, placeWords, vs. aynı kalır)

/* Render İşlemleri: Hücrelere dokunmatik event listener’ları ekleniyor */
function renderGrid() {
  const container = document.getElementById("game-container");
  container.innerHTML = "";
  
  cellElements = [];
  
  for (let i = 0; i < gridSize; i++) {
    cellElements[i] = [];
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement("div");
      cell.textContent = grid[i][j]; // Harf dokusu kalır.
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      
      // Fare event listener'ları
      cell.addEventListener("mousedown", cellMouseDown);
      cell.addEventListener("mouseover", cellMouseOver);
      cell.addEventListener("mouseup", cellMouseUp);
      
      // Dokunmatik cihazlar için ek event listener'ları:
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

/* *****************************************
   Dokunmatik Event Fonksiyonları
******************************************* */

/**
 * Dokunmatik başlangıç (touchstart) olayı için, mevcut mousedown fonksiyonunu çağırır.
 */
function cellTouchStart(e) {
  e.preventDefault(); // Dokunma sırasında sayfanın kaymasını engeller
  cellMouseDown.call(this, e);
}

/**
 * Dokunmatik hareket (touchmove) sırasında, parmağın bulunduğu koordinatta bulunan hücreyi tespit edip, mouseover fonksiyonunu çağırır.
 */
function cellTouchMove(e) {
  e.preventDefault();
  // İlk dokunuşu alıyoruz
  const touch = e.touches[0];
  const elem = document.elementFromPoint(touch.clientX, touch.clientY);
  if (elem && elem.classList.contains("cell")) {
    cellMouseOver.call(elem, e);
  }
}

/**
 * Dokunmatik bitiş (touchend/touchcancel) olayı için, mevcut mouseup fonksiyonunu çağırır.
 */
function cellTouchEnd(e) {
  e.preventDefault();
  // touchend olayında dokunma noktası olmadığı için, mevcut seçilen hücreler üzerinden mouseup fonksiyonunu tetikliyoruz.
  // Eğer currentSelectedCells boş değilse, onlardan sonuncusu üzerinden mouseup çağırabiliriz.
  if (currentSelectedCells.length > 0) {
    cellMouseUp.call(currentSelectedCells[currentSelectedCells.length - 1], e);
  }
}

/* *****************************************
   Kalan Fonksiyonlar (mouse event'leri, seçim, vb.)
   (cellMouseDown, cellMouseOver, cellMouseUp, clearTempSelection, clearSelection, vs. kodunuzun diğer kısımları aynı kalır)
******************************************* */

// … (önceki script.js kodunuzun geri kalanı aynı kalır)


/* *****************************************
   Seçim İşlemleri
******************************************* */

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
  
  // Seçim sırasında, sadece başlangıç hücresiyle aynı satır, sütun veya çapraz (yön farkı sabit) alan seçilsin.
  // Bunun için, seçimin x ve y farklarının aynı oranda artıp artmadığını kontrol edebiliriz.
  if (Math.abs(row - startRow) !== Math.abs(col - startCol) &&
      row !== startRow && col !== startCol) return;
  
  clearTempSelection();
  
  let cells = [];
  // Belirlenen yönde seçimi genişletmek için; 
  // Çapraz seçim durumunda, hem satır hem de sütun farkı aynı oranda artar.
  // Eğer satır veya sütun sabitse, önceki mantıkla.
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
    // Çapraz seçimde; farklar aynı olacak.
    const diff = Math.abs(row - startRow);
    const rowDir = (row - startRow) / diff;
    const colDir = (col - startCol) / diff;
    for (let i = 0; i <= diff; i++) {
      cells.push(cellElements[startRow + rowDir * i][startCol + colDir * i]);
    }
  }
  
  currentSelectedCells = cells;
  for (let cell of cells) {
    cell.classList.add("selected");
  }
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
      correctSound.currentTime = 0;
      correctSound.play();
    }
    for (let cell of currentSelectedCells) {
      cell.style.backgroundColor = foundWords[actualWord];
      cell.style.color = "#fff";
      cell.classList.remove("selected");
      cell.classList.add("found");
    }
    checkGameComplete();
  } else {
    wrongSound.currentTime = 0;
    wrongSound.play();
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

/* *****************************************
   Oyun Tamamlanma ve Süre Sonu Kontrolleri
******************************************* */

// Global değişken olarak timeout kimliği tanımlıyoruz.
let timeoutId = setTimeout(function() {
  // Süre dolduğunda (ve oyun henüz tamamlanmadıysa) timeout.html'e yönlendir.
  window.open("timeout.html", "_blank");
}, 120000);

function checkGameComplete() {
  const allFound = words.every(word => foundWords[word]);
  if (allFound) {
    // Eğer tüm kelimeler bulunduysa, timeout yönlendirmesini iptal et
    clearTimeout(timeoutId);
    // Ve yeni bir sekmede congratulations.html aç
    window.open("congratulations.html", "_blank");
  }
}


/* *****************************************
   Oyunu Başlatma
******************************************* */

function initGame() {
  createEmptyGrid();
  placeWords();
  fillEmptySpaces();
  renderGrid();
  renderWordList();
}

// Başlangıç ekranındaki "Oyuna Başla" butonuna tıklanınca oyunu başlat
document.getElementById("start-btn").addEventListener("click", function() {
  document.getElementById("start-screen").style.display = "none";
  initGame();
});
