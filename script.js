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

// Player object
let player = { x: 400, y: 250, width: 50, height: 50, speed: 4 };

// Game data
let cats = []; // array to store all cats currently on screen
let score = 0; // current score
let highScore = 0;
let timeLeft = 60;
let gameOver = false; // check if the game has ended

// Keyboard input
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true); //key pressed
document.addEventListener("keyup", e => keys[e.key] = false); // key released

// Spawn cats function
function spawnCat() {
    if (gameOver) return; //dont spawn cats if the game is over

    cats.push({
        x: Math.random() * (canvas.width - 60), // random horizontal position
        y: Math.random() * (canvas.height - 60), //random vertical position
        width: 48, // cat width
        height: 48, // cat height
        bad: Math.random() < 0.25, // set 25% chance that the cat is "bad"
        spawnTime: Date.now() // for tracking how long the cat has been on screen
    });
}

// Player movement
function updatePlayer() {
    // Move player based on keys pressed
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

    // Stay inside canvas
    if (player.x < 0) player.x = 0; // left boundary
    if (player.y < 0) player.y = 0; // top boundary
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Collision detection
function checkCollisions() {
    let padding = 10; //shrink the collision box so its not too sensitive

    // loop through cats array from end to start to safely remove caught cats
    for (let i = cats.length - 1; i >= 0; i--) {
        let c = cats[i];
        
        // check if player's rectangle overlaps cat's rectangle (with padding)
        if (
            player.x + padding < c.x + c.width - padding &&
            player.x + player.width - padding > c.x + padding &&
            player.y + padding < c.y + c.height - padding &&
            player.y + player.height - padding > c.y + padding
        ) {
            // to update the score
            if (c.bad) score -= 1;
            else score += 1;

            cats.splice(i, 1); // to remove tje cat from array after collision
            scoreText.textContent = score; // update the score in HTML
        }
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas before drawing

    // Update sidebar time
    timeText.textContent = timeLeft;

    // Remove cats older than 5 seconds
    const now = Date.now();
    cats = cats.filter(c => now - c.spawnTime < 5000);

    // Draw cats
    cats.forEach(c => {
        ctx.drawImage(c.bad ? badCatImg : catImg, c.x, c.y, c.width, c.height);
    });

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw UI
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

        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreText.textContent = highScore;
        }
    }
}

// Main game loop
let gameRunning = false; // to make sure the game loop only start once
function gameLoop() {
    if (!gameOver) {
        updatePlayer();  // move the player
        checkCollisions(); // check if player collected any cats
    }
    draw(); // redraw everything
    requestAnimationFrame(gameLoop); // always keep the loop running
}

// --- Timer & Spawn intervals ---
let timerInterval;   
let spawnInterval;

// --- Start / Restart logic ---
function restartGame() {
    // Clear old intervals to prevent multiple timers
    clearInterval(timerInterval);
    clearInterval(spawnInterval);

    // Reset player position & game data
    player.x = 400;
    player.y = 250;
    score = 0;
    timeLeft = 60;
    cats = [];
    gameOver = false;
    scoreText.textContent = score;
    timeText.textContent = timeLeft;

    // Start timer
    timerInterval = setInterval(() => {
        if (!gameOver && timeLeft > 0) timeLeft--;
        if (timeLeft <= 0) gameOver = true;
    }, 1000);

    // Spawn cats every second
    spawnInterval = setInterval(spawnCat, 1000);

    // Focus canvas so payer can use keyboard controls immediately
    canvas.focus();
}

// Start button
startBtn.addEventListener("click", () => {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop(); //start the main loop
    }
    restartGame(); // reset the game when starting
});

// Restart button
restartBtn.addEventListener("click", () => {
    restartGame();
});
