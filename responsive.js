// responsive.js

function adjustResponsive() {
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;
  const isLandscape = winWidth > winHeight;

  // Dinamik hücre boyutu hesaplaması:
  // Örnek: Küçük ekranlarda (320px) 30px, büyük ekranlarda (1024px) 40px olmak üzere lineer interpolasyon
  const minWin = 320, maxWin = 1024;
  const minCellSize = 30, maxCellSize = 40;
  let cellSize = minCellSize + ((Math.min(winWidth, maxWin) - minWin) / (maxWin - minWin)) * (maxCellSize - minCellSize);
  
  // Eğer yatay moddaysa, yükseklik baz alınarak da yeniden hesaplayabiliriz
  if (isLandscape) {
    // Örneğin: ekran yüksekliğinin %7'si ile sınırlayalım (maksimum maxCellSize)
    cellSize = Math.min(maxCellSize, winHeight * 0.07);
  }
  
  const gap = 5; // Hücreler arası boşluk (sabit)
  const gridCount = 10; // 10x10 matris
  const containerWidth = gridCount * (cellSize + gap) - gap;

  // Üst kısımdaki header ve kelime listesi ayarları:
  const headerH1 = document.querySelector("header h1");
  const wordItems = document.querySelectorAll(".word-item");
  
  // Yön farkına göre (portrait vs. landscape) header ve kelime listesi boyutlarını ayarla:
  if (isLandscape) {
    if (headerH1) headerH1.style.fontSize = "1.5rem";
    wordItems.forEach(item => {
      item.style.fontSize = "0.8rem";
      item.style.padding = "3px 6px";
    });
  } else {
    if (headerH1) headerH1.style.fontSize = "1.8rem";
    wordItems.forEach(item => {
      item.style.fontSize = "1rem";
      item.style.padding = "5px 10px";
    });
  }
  
  // Matris kapsayıcısının (game-container) genişlik ve yüksekliğini güncelle:
  const gameContainer = document.getElementById("game-container");
  if (gameContainer) {
    gameContainer.style.width = containerWidth + "px";
    gameContainer.style.height = containerWidth + "px"; // Kare alan
    gameContainer.style.gridTemplateColumns = `repeat(${gridCount}, ${cellSize}px)`;
    gameContainer.style.gridTemplateRows = `repeat(${gridCount}, ${cellSize}px)`;
    gameContainer.style.gap = gap + "px";
    // Ölçekleme uygulanmadan önce eski transform sıfırlansın:
    gameContainer.style.transform = "none";
  }
  
  // Tüm hücrelerin boyutlarını ve font boyutunu ayarla:
  const cells = document.querySelectorAll(".cell");
  const cellFontSize = cellSize * 0.8; // Hücre içi yazı boyutu oranı
  cells.forEach(cell => {
    cell.style.width = cellSize + "px";
    cell.style.height = cellSize + "px";
    cell.style.fontSize = cellFontSize + "px";
  });
  
  // Artık mevcut viewport'a göre matrisin tamamını gösterecek şekilde ölçeklendirme yap:
  updateGameScale();
}

function updateGameScale() {
  const gameContainer = document.getElementById("game-container");
  if (!gameContainer) return;
  
  // Hesaplama için, üstteki header ve kelime listesinin yüksekliğini çıkaralım:
  const header = document.querySelector("header");
  const wordList = document.getElementById("word-list");
  const headerHeight = header ? header.offsetHeight : 0;
  const wordListHeight = wordList ? wordList.offsetHeight : 0;
  
  // Kullanılabilir alan: pencere yüksekliği eksi header, kelime listesi ve biraz margin (20px)
  const availableHeight = window.innerHeight - headerHeight - wordListHeight - 20;
  // Kullanılabilir genişlik (biraz margin ile)
  const availableWidth = window.innerWidth - 20;
  
  // Matris kapsayıcısının orijinal genişliği ve yüksekliği:
  const containerWidth = gameContainer.offsetWidth;
  const containerHeight = gameContainer.offsetHeight;
  
  // Ölçek faktörü: mevcut alan ile matrisin orijinal boyutları arasındaki oran
  const scaleFactor = Math.min(1, availableWidth / containerWidth, availableHeight / containerHeight);
  
  // Eğer scaleFactor < 1 ise, oyunun tamamı görünür hale gelsin:
  gameContainer.style.transform = `scale(${scaleFactor})`;
  gameContainer.style.transformOrigin = "top center";
}

// Pencere yüklendiğinde ve yeniden boyutlandırıldığında çalıştır:
window.addEventListener("load", adjustResponsive);
window.addEventListener("resize", adjustResponsive);
