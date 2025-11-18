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

// Player object
let player = {
    x: 400,
    y: 250,
    width: 50,
    height: 50,
    speed: 4
};

// Cat list
let cats = [];

// Score + Timer
let score = 0;
let timeLeft = 30;

// Keyboard input
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Spawn cats
function spawnCat() {
    cats.push({
        x: Math.random() * (canvas.width - 60),
        y: Math.random() * (canvas.height - 60),
        width: 48,
        height: 48,
        bad: Math.random() < 0.25 // 25% chance bad cat
    });
}
setInterval(spawnCat, 1000);

// Timer countdown
setInterval(() => {
    if (timeLeft > 0) timeLeft--;
}, 1000);

// Update player movement
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
    for (let i = cats.length - 1; i >= 0; i--) {
        let c = cats[i];

        if (
            player.x < c.x + c.width &&
            player.x + player.width > c.x &&
            player.y < c.y + c.height &&
            player.y + player.height > c.y
        ) {
            // Collision detected
            if (c.bad) score -= 1;
            else score += 1;

            cats.splice(i, 1); // remove cat
        }
    }
}

// Draw objects
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw cats
    cats.forEach(c => {
        ctx.drawImage(
            c.bad ? badCatImg : catImg,
            c.x, c.y, c.width, c.height
        );
    });

    // UI
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Time Left: ${timeLeft}`, 20, 60);

    if (timeLeft <= 0) {
        ctx.fillStyle = "black";
        ctx.font = "48px Arial";
        ctx.fillText("GAME OVER", 260, 240);

        ctx.font = "32px Arial";
        ctx.fillText(`Final Score: ${score}`, 300, 290);

        return; // stop the game
    }

    requestAnimationFrame(gameLoop);
}

// Main game loop
function gameLoop() {
    updatePlayer();
    checkCollisions();
    draw();
}

gameLoop();
