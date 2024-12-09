const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const gameSpeed = 100; // Fixed game speed (in ms)
let snake = [{ x: 200, y: 200 }];
let snakeDirection = "RIGHT";
let food = generateFood();
let gameRunning = false;
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0; // Persistent high score
let gameTimeout;

// Responsive canvas resizing
function resizeCanvas() {
  const size = Math.min(window.innerWidth - 20, 400); // Max width of 400px
  canvas.width = size;
  canvas.height = size;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initial resize

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("restartButton").addEventListener("click", restartGame);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && snakeDirection !== "DOWN") {
    snakeDirection = "UP";
  } else if (event.key === "ArrowDown" && snakeDirection !== "UP") {
    snakeDirection = "DOWN";
  } else if (event.key === "ArrowLeft" && snakeDirection !== "RIGHT") {
    snakeDirection = "LEFT";
  } else if (event.key === "ArrowRight" && snakeDirection !== "LEFT") {
    snakeDirection = "RIGHT";
  }
});

// Touch event handlers
let touchStartX = 0;
let touchStartY = 0;
const threshold = 30; // Sensitivity threshold

canvas.addEventListener("touchstart", (event) => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
});

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  const touchEndX = event.touches[0].clientX;
  const touchEndY = event.touches[0].clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
    if (deltaX > 0 && snakeDirection !== "LEFT") {
      snakeDirection = "RIGHT";
    } else if (deltaX < 0 && snakeDirection !== "RIGHT") {
      snakeDirection = "LEFT";
    }
  } else if (Math.abs(deltaY) > threshold) {
    if (deltaY > 0 && snakeDirection !== "UP") {
      snakeDirection = "DOWN";
    } else if (deltaY < 0 && snakeDirection !== "DOWN") {
      snakeDirection = "UP";
    }
  }

  touchStartX = touchEndX;
  touchStartY = touchEndY;
});

function startGame() {
  snake = [{ x: 200, y: 200 }];
  snakeDirection = "RIGHT";
  score = 0;
  food = generateFood();
  gameRunning = true;
  document.getElementById("startButton").disabled = true;
  document.getElementById("restartButton").disabled = false;
  updateGame();
}

function restartGame() {
  clearTimeout(gameTimeout);
  gameRunning = false;
  document.getElementById("startButton").disabled = false;
  document.getElementById("restartButton").disabled = true;
  startGame();
}

function updateGame() {
  if (!gameRunning) return;

  const head = { ...snake[0] };

  if (snakeDirection === "UP") head.y -= gridSize;
  if (snakeDirection === "DOWN") head.y += gridSize;
  if (snakeDirection === "LEFT") head.x -= gridSize;
  if (snakeDirection === "RIGHT") head.x += gridSize;

  if (head.x < 0) head.x = canvas.width - gridSize;
  if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - gridSize;
  if (head.y >= canvas.height) head.y = 0;

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameRunning = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore); // Save high score
    }
    alert("Game Over! Your score: " + score);
    document.getElementById("startButton").disabled = false;
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    food = generateFood();
  } else {
    snake.pop();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();
  drawScore();
  drawHighScore();

  gameTimeout = setTimeout(updateGame, gameSpeed);
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#228B22" : "#32CD32"; // Head color vs body color
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  });
}

function drawFood() {
  ctx.fillStyle = "#FF4500"; // Food color
  ctx.fillRect(food.x, food.y, gridSize, gridSize);
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

function drawHighScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("High Score: " + highScore, canvas.width - 150, 30);
}

function generateFood() {
  let x, y;
  do {
    x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
  } while (snake.some(segment => segment.x === x && segment.y === y));
  return { x, y };
}
