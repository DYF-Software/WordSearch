// responsive.js

function adjustResponsive() {
    const winWidth = window.innerWidth;
    let cellSize; // Hücre boyutu (px)
  
    // Ekran genişliğine göre hücre boyutunu ayarla:
    if (winWidth < 480) {
      cellSize = 30; // Küçük ekran
    } else if (winWidth < 768) {
      cellSize = 35; // Orta ekran
    } else {
      cellSize = 40; // Büyük ekran
    }
  
    const gap = 5; // Hücreler arası boşluk (sabit)
    // Matrisin kapsayıcısı genişliği: 10 hücre + 9 gap
    const containerWidth = (10 * cellSize) + (9 * gap);
  
    // Üst kısımdaki header ve kelime listesi ayarları:
    const headerH1 = document.querySelector("header h1");
    const wordItems = document.querySelectorAll(".word-item");
    
    if (winWidth < 480) {
      if (headerH1) headerH1.style.fontSize = "1.5rem";
      wordItems.forEach(item => {
        item.style.fontSize = "0.8rem";
        item.style.padding = "3px 6px";
      });
    } else if (winWidth < 768) {
      if (headerH1) headerH1.style.fontSize = "1.7rem";
      wordItems.forEach(item => {
        item.style.fontSize = "0.85rem";
        item.style.padding = "4px 7px";
      });
    } else {
      if (headerH1) headerH1.style.fontSize = "1.8rem";
      wordItems.forEach(item => {
        item.style.fontSize = "0.9rem";
        item.style.padding = "4px 8px";
      });
    }
  
    // Matris kapsayıcısının genişliğini ve grid-template-columns'ını güncelle:
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.style.width = containerWidth + "px";
      // Dinamik grid sütunlarını ayarla: 10 sütun, her sütun cellSize px genişliğinde
      gameContainer.style.gridTemplateColumns = `repeat(10, ${cellSize}px)`;
      // Eğer gap'ı da inline olarak ayarlamak isterseniz:
      gameContainer.style.gap = gap + "px";
    }
  
    // Tüm hücrelerin boyutlarını ve font boyutunu ayarla:
    const cells = document.querySelectorAll(".cell");
    // Hücre içi yazı boyutunu, hücre boyutunun %80’i olarak ayarlıyoruz.
    const cellFontSize = cellSize * 0.8;
    cells.forEach(cell => {
      cell.style.width = cellSize + "px";
      cell.style.height = cellSize + "px";
      cell.style.fontSize = cellFontSize + "px";
    });
  }
  
  window.addEventListener("load", adjustResponsive);
  window.addEventListener("resize", adjustResponsive);
  