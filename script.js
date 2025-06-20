document.addEventListener('DOMContentLoaded', function() {
const canvas = document.getElementById("pixelCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 50;
const cellSize = 12;

let currentColor = "#000000";
let isDrawing = false;
let history = [];

// 초기 흰색 배경
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 좌표를 셀 단위로 변환
function getCellCoordinates(x, y) {
  return {
    col: Math.floor(x / cellSize),
    row: Math.floor(y / cellSize),
  };
}

function fillCell(x, y) {
  const { col, row } = getCellCoordinates(x, y);
  const px = col * cellSize;
  const py = row * cellSize;

  ctx.fillStyle = currentColor;
  ctx.fillRect(px, py, cellSize, cellSize);
}

function getCellColor(col, row) {
  const imageData = ctx.getImageData(col * cellSize, row * cellSize, cellSize, cellSize).data;
  const rgb = [imageData[0], imageData[1], imageData[2]];
  return "#" + rgb.map(x => x.toString(16).padStart(2, "0")).join("");
}

function setCellColor(col, row, color) {
  ctx.fillStyle = color;
  ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
}

function floodFill(col, row, targetColor, fillColor) {
  if (targetColor === fillColor) return;
  const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const queue = [[col, row]];
  while (queue.length) {
    const [c, r] = queue.shift();
    if (c < 0 || c >= gridSize || r < 0 || r >= gridSize) continue;
    if (visited[r][c]) continue;
    if (getCellColor(c, r).toLowerCase() !== targetColor.toLowerCase()) continue;
    setCellColor(c, r, fillColor);
    visited[r][c] = true;
    queue.push([c - 1, r], [c + 1, r], [c, r - 1], [c, r + 1]);
  }
}

// 라인 툴
const lineBtn = document.getElementById("line");
let lineStart = null;
if (lineBtn) {
  lineBtn.addEventListener("click", () => {
    setActiveTool(lineBtn);
    currentColor = lastPenColor;
    lineStart = null; // 툴 전환 시 시작점 초기화
  });
}

canvas.addEventListener("mousedown", (e) => {
  if (paintBtn.classList.contains("active")) {
    const { col, row } = getCellCoordinates(e.offsetX, e.offsetY);
    const targetColor = getCellColor(col, row);
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    floodFill(col, row, targetColor, currentColor);
    redoStack = [];
    updateUndoButton();
    updateRedoButton();
    isDrawing = false;
  } else if (lineBtn && lineBtn.classList.contains("active")) {
    if (!lineStart) {
      lineStart = { x: e.offsetX, y: e.offsetY };
    } else {
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      drawLine(lineStart.x, lineStart.y, e.offsetX, e.offsetY, currentColor);
      lineStart = null;
      redoStack = [];
      updateUndoButton();
      updateRedoButton();
    }
    isDrawing = false;
  } else {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    isDrawing = true;
    fillCell(e.offsetX, e.offsetY);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) fillCell(e.offsetX, e.offsetY);
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
});

// 팔레트 색상 목록
const paletteColors = [
  '#000', '#444', '#888', '#E0E0E0',
  '#FF5053', '#FF7322', '#FFBE27', '#D9F127',
  '#A982F2', '#3197F0', '#3AE19E', '#88DA5F'
];

const paletteContainer = document.querySelector('.pixel-color-palette');
let selectedPaletteIndex = 0;

let lastPenColor = paletteColors ? paletteColors[0] : "#444";

function setActiveTool(tool) {
  penBtn.classList.remove("active");
  paintBtn.classList.remove("active");
  eraserBtn.classList.remove("active");
  tool.classList.add("active");
}

// 펜
penBtn = document.getElementById("pen");
if (penBtn) {
  penBtn.addEventListener("click", () => {
    setActiveTool(penBtn);
    currentColor = lastPenColor;
  });
}
// 페인트
paintBtn = document.getElementById("paint");
if (paintBtn) {
  paintBtn.addEventListener("click", () => {
    setActiveTool(paintBtn);
    currentColor = lastPenColor;
  });
}
// 지우개
eraserBtn = document.getElementById("eraser");
if (eraserBtn) {
  eraserBtn.addEventListener("click", () => {
    setActiveTool(eraserBtn);
    lastPenColor = currentColor;
    currentColor = "#fff";
  });
}

// 팔레트 색상 선택 시
function renderPalette() {
  paletteContainer.innerHTML = '';
  paletteColors.forEach((color, idx) => {
    const btn = document.createElement('button');
    btn.style.background = color;
    btn.dataset.color = color;
    if (idx === selectedPaletteIndex) {
      btn.classList.add('active');
      const check = document.createElement('img');
      check.src = 'assets/icons/color_check.svg';
      check.alt = '선택됨';
      check.className = 'color-check';
      btn.appendChild(check);
    }
    btn.addEventListener('click', () => {
      selectedPaletteIndex = idx;
      lastPenColor = color;
      if (penBtn.classList.contains("active") || paintBtn.classList.contains("active")) {
        currentColor = color;
      }
      renderPalette();
    });
    paletteContainer.appendChild(btn);
  });
}

renderPalette();

const redoBtn = document.getElementById("redo");
let redoStack = [];

function updateRedoButton() {
  if (redoStack.length === 0) {
    redoBtn.classList.add("disabled");
  } else {
    redoBtn.classList.remove("disabled");
  }
}

const undoBtn = document.getElementById("undo");

function updateUndoButton() {
  if (history.length === 0) {
    undoBtn.classList.add("disabled");
  } else {
    undoBtn.classList.remove("disabled");
  }
}

// 실행취소 버튼
if (undoBtn) {
  undoBtn.addEventListener("click", () => {
    if (history.length > 0) {
      const last = history.pop();
      redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      ctx.putImageData(last, 0, 0);
      updateUndoButton();
      updateRedoButton();
    }
  });
}

// 다시 실행 버튼
if (redoBtn) {
  redoBtn.addEventListener("click", () => {
    if (redoStack.length > 0) {
      const redoImage = redoStack.pop();
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      ctx.putImageData(redoImage, 0, 0);
      updateUndoButton();
      updateRedoButton();
    }
  });
}

// 드로잉 시작 시 redoStack, undo 상태 초기화
canvas.addEventListener("mousedown", () => {
  redoStack = [];
  updateRedoButton();
  updateUndoButton();
});

// 초기 상태에서 undo/redo 비활성화
updateUndoButton();
updateRedoButton();

// 저장 버튼
const saveBtn = document.querySelector(".pixel-save-btn");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const img = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = img;
    link.download = "pixel-art.png";
    link.click();
  });
}

// 갤러리로 이동
const galleryBtn = document.getElementById("gallery");
if (galleryBtn) {
  galleryBtn.addEventListener("click", () => {
    window.location.href = "gallery.html";
  });
}

// 게시하기 버튼
const publishBtn = document.getElementById("publish");
if (publishBtn) {
  publishBtn.addEventListener("click", () => {
    const modal = document.getElementById("publishModal");
    if (modal) modal.style.display = "block";
  });
}

// 모달 닫기
const closeBtn = document.querySelector(".close");
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    const modal = document.getElementById("publishModal");
    if (modal) modal.style.display = "none";
  });
}

// 게시 폼 제출
const publishForm = document.getElementById("publishForm");
if (publishForm) {
  publishForm.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      // 입력값 검증
      const title = document.getElementById("title").value.trim();
      const content = document.getElementById("content").value.trim();
      const nickname = document.getElementById("nickname").value.trim();
      const password = document.getElementById("password").value.trim();
      if (!title || !nickname || !password) {
        alert("제목, 닉네임, 비밀번호는 필수 입력 항목입니다.");
        return;
      }
      // 캔버스 이미지를 Base64로 변환
      const imageData = canvas.toDataURL("image/png");
      if (!imageData) {
        alert("이미지 데이터를 가져오는데 실패했습니다.");
        return;
      }
      // 로컬 스토리지에서 기존 게시물 가져오기
      let posts = [];
      try {
        const storedPosts = localStorage.getItem('pixelArtPosts');
        posts = storedPosts ? JSON.parse(storedPosts) : [];
      } catch (error) {
        console.error("기존 게시물 로드 실패:", error);
        posts = [];
      }
      // 새 게시물 추가
      const newPost = {
        id: Date.now(),
        title,
        content,
        nickname,
        password,
        imageData,
        createdAt: new Date().toISOString()
      };
      posts.push(newPost);
      // 로컬 스토리지에 저장
      try {
        localStorage.setItem('pixelArtPosts', JSON.stringify(posts));
        console.log("게시물 저장 성공");
      } catch (error) {
        console.error("게시물 저장 실패:", error);
        alert("게시물 저장에 실패했습니다. 로컬 스토리지 용량을 확인해주세요.");
        return;
      }
      // 모달 닫기
      const modal = document.getElementById("publishModal");
      if (modal) modal.style.display = "none";
      // 폼 초기화
      publishForm.reset();
      // 갤러리로 이동
      window.location.href = "gallery.html";
    } catch (error) {
      console.error("게시 중 오류 발생:", error);
      alert("게시 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  });
}

// 페이지 로드 시 3개 중 하나는 반드시 active
if (!penBtn.classList.contains("active") && !paintBtn.classList.contains("active") && !eraserBtn.classList.contains("active")) {
  penBtn.classList.add("active");
}

const paletteIconBtn = document.getElementById("palette");
const palettePopup = document.getElementById("pixel-palette-popup");
const palettePopupConfirm = document.getElementById("palette-popup-confirm");
if (paletteIconBtn && palettePopup) {
  paletteIconBtn.addEventListener("click", () => {
    palettePopup.style.display = "flex";
  });
}
if (palettePopupConfirm && palettePopup) {
  palettePopupConfirm.addEventListener("click", () => {
    palettePopup.style.display = "none";
  });
}

// Bresenham's line algorithm for pixel art
function drawLine(x0, y0, x1, y1, color) {
  const { col: col0, row: row0 } = getCellCoordinates(x0, y0);
  const { col: col1, row: row1 } = getCellCoordinates(x1, y1);
  let dx = Math.abs(col1 - col0), sx = col0 < col1 ? 1 : -1;
  let dy = -Math.abs(row1 - row0), sy = row0 < row1 ? 1 : -1;
  let err = dx + dy, e2;
  let x = col0, y = row0;
  while (true) {
    setCellColor(x, y, color);
    if (x === col1 && y === row1) break;
    e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}
});
