const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const gameSpeed = 100; // Fixed game speed (in ms)
let snake = [{ x: 200, y: 200 }];
let snakeDirection = "RIGHT";
let food = generateFood();
let gameRunning = false;
let score = 0;
let highScore = 0;
let gameTimeout; // Timeout variable

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

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0 && snakeDirection !== "LEFT") {
      snakeDirection = "RIGHT";
    } else if (deltaX < 0 && snakeDirection !== "RIGHT") {
      snakeDirection = "LEFT";
    }
  } else {
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
  // Stop the current game loop
  clearTimeout(gameTimeout);

  gameRunning = false;
  document.getElementById("startButton").disabled = false;
  document.getElementById("restartButton").disabled = true;
  startGame();
}

function updateGame() {
  if (!gameRunning) return;

  const head = { ...snake[0] };

  // Move the snake's head
  if (snakeDirection === "UP") head.y -= gridSize;
  if (snakeDirection === "DOWN") head.y += gridSize;
  if (snakeDirection === "LEFT") head.x -= gridSize;
  if (snakeDirection === "RIGHT") head.x += gridSize;

  // Wrap the snake around the canvas edges
  if (head.x < 0) head.x = canvas.width - gridSize;
  if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - gridSize;
  if (head.y >= canvas.height) head.y = 0;

  // Check if the snake runs into itself
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameRunning = false;
    if (score > highScore) {
      highScore = score; // Update high score
    }
    alert("Game Over! Your score: " + score);
    document.getElementById("startButton").disabled = false;
    return;
  }

  snake.unshift(head);

  // Check if the snake eats food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    food = generateFood();
  } else {
    snake.pop();
  }

  // Draw the game
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();
  drawScore();
  drawHighScore();

  gameTimeout = setTimeout(updateGame, gameSpeed); // Fixed game speed
}

function drawSnake() {
  snake.forEach((segment, index) => {
    let color = "#32CD32"; // Default green color
    if (index === 0) {
      color = "#228B22"; // Dark green for head
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(segment.x + gridSize / 2, segment.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2); // Head circle
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(segment.x + gridSize / 3, segment.y + gridSize / 3, gridSize / 8, 0, Math.PI * 2); // Left eye
      ctx.fill();
      ctx.beginPath();
      ctx.arc(segment.x + 2 * gridSize / 3, segment.y + gridSize / 3, gridSize / 8, 0, Math.PI * 2); // Right eye
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(segment.x + gridSize / 3, segment.y + gridSize / 3, gridSize / 16, 0, Math.PI * 2); // Left pupil
      ctx.fill();
      ctx.beginPath();
      ctx.arc(segment.x + 2 * gridSize / 3, segment.y + gridSize / 3, gridSize / 16, 0, Math.PI * 2); // Right pupil
      ctx.fill();

      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(segment.x + gridSize / 2, segment.y + gridSize / 2, gridSize / 3, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(segment.x + gridSize / 2, segment.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const tail = snake[snake.length - 1];
  ctx.fillStyle = "#FFD700"; // Gold tail color
  ctx.beginPath();
  ctx.moveTo(tail.x + gridSize / 2, tail.y + gridSize / 2);
  ctx.lineTo(tail.x, tail.y);
  ctx.lineTo(tail.x + gridSize, tail.y);
  ctx.closePath();
  ctx.fill();
}

function drawFood() {
  const cakeWidth = gridSize;
  const cakeHeight = gridSize;

  ctx.fillStyle = "#FF4500"; // Cake color
  ctx.fillRect(food.x, food.y, cakeWidth, cakeHeight);

  ctx.fillStyle = "#FFFFFF"; // Icing color
  ctx.fillRect(food.x, food.y + cakeHeight / 4, cakeWidth, cakeHeight / 2); 

  const sprinkleColors = ["#FF5733", "#FFB3BA", "#BAE1FF"];
  for (let i = 0; i < 5; i++) {
    const sprinkleX = food.x + Math.random() * cakeWidth;
    const sprinkleY = food.y + Math.random() * cakeHeight;
    ctx.fillStyle = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
    ctx.beginPath();
    ctx.arc(sprinkleX, sprinkleY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
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
