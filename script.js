// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const playerImg = new Image();
playerImg.src = "player.png";

const catImg = new Image();
catImg.src = "cat.png";

const badCatImg = new Image();
badCatImg.src = "badcat.png";

// Player
let player = {
    x: 400,
    y: 250,
    width: 50,
    height: 50,
    speed: 4
};

// Game data
let cats = [];
let score = 0;
let timeLeft = 30;
let gameOver = false;

// Keyboard input
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Spawn cats
function spawnCat() {
    if (gameOver) return;

    cats.push({
        x: Math.random() * (canvas.width - 60),
        y: Math.random() * (canvas.height - 60),
        width: 48,
        height: 48,
        bad: Math.random() < 0.25
    });
}
setInterval(spawnCat, 1000);

// Timer
setInterval(() => {
    if (!gameOver && timeLeft > 0) timeLeft--;
    if (timeLeft <= 0) gameOver = true;
}, 1000);

// Player movement
function updatePlayer() {
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

    // Stay inside canvas
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Collision detection

function checkCollisions() {
    let padding = 10; // shrink collision area

    for (let i = cats.length - 1; i >= 0; i--) {
        let c = cats[i];

        if (
            player.x + padding < c.x + c.width - padding &&
            player.x + player.width - padding > c.x + padding &&
            player.y + padding < c.y + c.height - padding &&
            player.y + player.height - padding > c.y + padding
        ) {
            if (c.bad) score -= 1;
            else score += 1;

            cats.splice(i, 1);
        }
    }
}

function checkCollisions() {
    let padding = 10; // shrink collision area

    for (let i = cats.length - 1; i >= 0; i--) {
        let c = cats[i];

        if (
            player.x + padding < c.x + c.width - padding &&
            player.x + player.width - padding > c.x + padding &&
            player.y + padding < c.y + c.height - padding &&
            player.y + player.height - padding > c.y + padding
        ) {
            if (c.bad) score -= 1;
            else score += 1;

            cats.splice(i, 1);
        }
    }
}

// Restart game
function restartGame() {
    player.x = 400;
    player.y = 250;
    score = 0;
    timeLeft = 30;
    cats = [];
    gameOver = false;

    gameLoop();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cats
    cats.forEach(c => {
        ctx.drawImage(c.bad ? badCatImg : catImg, c.x, c.y, c.width, c.height);
    });

    // Player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // UI
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Time Left: ${timeLeft}`, 20, 60);

    // Game over screen
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("GAME OVER", 260, 240);

        ctx.font = "32px Arial";
        ctx.fillText(`Final Score: ${score}`, 300, 290);

        // Show restart button
        showRestartButton();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Create restart button (only once)
let restartButtonCreated = false;

function showRestartButton() {
    if (restartButtonCreated) return;

    const btn = document.createElement("button");
    btn.innerText = "Restart Game";
    btn.style.position = "absolute";
    btn.style.top = "550px";
    btn.style.left = "50%";
    btn.style.transform = "translateX(-50%)";
    btn.style.padding = "12px 25px";
    btn.style.fontSize = "18px";
    btn.style.borderRadius = "10px";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
        btn.remove();
        restartButtonCreated = false;
        restartGame();
    };

    document.body.appendChild(btn);
    restartButtonCreated = true;
}

// Main game loop
function gameLoop() {
    updatePlayer();
    checkCollisions();
    draw();
}

gameLoop();
