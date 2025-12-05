// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Buttons & score
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreText = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const timeText = document.getElementById("timeLeft");

// Load images
const playerImg = new Image();
playerImg.src = "assets/player.png";

const catImg = new Image();
catImg.src = "assets/cat.png";

const badCatImg = new Image();
badCatImg.src = "assets/badcat.png";

const fatCatImg = new Image();
fatCatImg.src = "assets/fatcat.png";

// Player object
let player = { x: 400, y: 250, width: 50, height: 50, speed: 4 };

// Game data
let cats = [];
let score = 0;
let highScore = 0;
let timeLeft = 60;
let gameOver = false;

// Bad cat spawn chance
let badCatChance = 0.25;

// Floating score texts
let floatTexts = [];

// Speed-up message
let speedNotice = "";
let speedNoticeTime = 0;

// Keyboard
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Spawn cats
function spawnCat() {
    if (gameOver) return;

    let isFat = Math.random() < 0.10;
    let isBad = !isFat && Math.random() < badCatChance;

    let width = isFat ? 60 : 48;
    let height = isFat ? 60 : 48;

    // Moving cats
    let dx = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1);
    let dy = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1);

    cats.push({
        x: Math.random() * (canvas.width - width),
        y: Math.random() * (canvas.height - height),
        width,
        height,
        bad: isBad,
        fat: isFat,
        dx,
        dy,
        spawnTime: Date.now()
    });
}

// Player movement
function updatePlayer() {
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Update moving cats
function updateCats() {
    cats.forEach(c => {
        c.x += c.dx;
        c.y += c.dy;

        if (c.x < 0 || c.x + c.width > canvas.width) c.dx *= -1;
        if (c.y < 0 || c.y + c.height > canvas.height) c.dy *= -1;
    });
}

// Add floating text
function addFloatText(text, x, y, color) {
    floatTexts.push({
        text,
        x,
        y,
        alpha: 1,
        dy: -1, // upward movement
        color
    });
}

// Update floating text
function updateFloatTexts() {
    floatTexts.forEach(t => {
        t.y += t.dy;
        t.alpha -= 0.02;
    });

    floatTexts = floatTexts.filter(t => t.alpha > 0);
}

// Collision detection (with reduced hitbox for fairness)
function checkCollisions() {
    for (let i = cats.length - 1; i >= 0; i--) {
        let c = cats[i];

    
        const hitboxShrink = 10;

        const catLeft   = c.x + hitboxShrink;
        const catRight  = c.x + c.width - hitboxShrink;
        const catTop    = c.y + hitboxShrink;
        const catBottom = c.y + c.height - hitboxShrink;

        const playerLeft   = player.x;
        const playerRight  = player.x + player.width;
        const playerTop    = player.y;
        const playerBottom = player.y + player.height;

        // Check collision using SHRUNK cat box
        if (
            playerRight  > catLeft &&
            playerLeft   < catRight &&
            playerBottom > catTop &&
            playerTop    < catBottom
        ) {
            // Scoring logic
            if (c.fat) {
                score += 2;
                addFloatText("+2", c.x, c.y, "orange");
            } else if (c.bad) {
                score -= 1;
                addFloatText("-1", c.x, c.y, "red");
            } else {
                score += 1;
                addFloatText("+1", c.x, c.y, "green");
            }

            cats.splice(i, 1);
            scoreText.textContent = score;
        }
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    timeText.textContent = timeLeft;

    const now = Date.now();
    cats = cats.filter(c => now - c.spawnTime < 5000);

    // Draw cats
    cats.forEach(c => {
        let img = c.fat ? fatCatImg : (c.bad ? badCatImg : catImg);
        ctx.drawImage(img, c.x, c.y, c.width, c.height);
    });

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw floating texts
    floatTexts.forEach(t => {
        ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;
        ctx.font = "24px Arial";
        ctx.fillText(t.text, t.x, t.y);
        ctx.globalAlpha = 1;
    });

    // UI
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Time Left: ${timeLeft}`, 20, 60);

    if (Date.now() - speedNoticeTime < 1200) {
        ctx.fillStyle = "yellow";
        ctx.font = "30px Arial";
        ctx.fillText(speedNotice, 330, 50);
    }

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("GAME OVER", 260, 240);

        ctx.font = "32px Arial";
        ctx.fillText(`Final Score: ${score}`, 300, 290);

        if (score > highScore) {
            highScore = score;
            highScoreText.textContent = highScore;
        }
    }
}

// Main loop
let gameRunning = false;
function gameLoop() {
    if (!gameOver) {
        updatePlayer();
        updateCats();
        checkCollisions();
        updateFloatTexts(); // NEW
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Timer & spawn
let timerInterval;
let spawnInterval;

// Restart
function restartGame() {
    clearInterval(timerInterval);
    clearInterval(spawnInterval);

    player.x = 400;
    player.y = 250;
    player.speed = 4;
    score = 0;
    timeLeft = 60;
    cats = [];
    floatTexts = [];
    badCatChance = 0.25;
    gameOver = false;

    scoreText.textContent = score;
    timeText.textContent = timeLeft;

    timerInterval = setInterval(() => {
        if (!gameOver && timeLeft > 0) {
            timeLeft--;

            if (timeLeft % 10 === 0) {
                player.speed += 0.5;
                speedNotice = "Speed Up!";
                speedNoticeTime = Date.now();

                badCatChance += 0.10;
                if (badCatChance > 0.70) badCatChance = 0.70;
            }
        }

        if (timeLeft <= 0) gameOver = true;

    }, 1000);

    spawnInterval = setInterval(spawnCat, 1000);  // normal rate
    extraSpawn1 = setInterval(spawnCat, 1100);    // additional cats
    extraSpawn2 = setInterval(spawnCat, 1200);    // additional cats
    canvas.focus();
}

// Buttons
startBtn.addEventListener("click", () => {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop();
    }
    restartGame();
});

restartBtn.addEventListener("click", restartGame);
