/**
 * Advanced Brick Breaker - Core Game Engine
 * game.js - Contains the main game logic and classes
 */

// Game Constants and Configuration
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_TRANSITION: 'level_transition',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

// Physics and gameplay constants
const PHYSICS = {
    BALL_SPEED_MIN: 5,
    BALL_SPEED_MAX: 15,
    BALL_SPEED_INCREMENT: 0.05,
    PADDLE_SPEED: 10,
    EDGE_BOUNCE_DAMPENING: 0.98,
    PADDLE_BOUNCE_INFLUENCE: 0.3,
    GRAVITY: 0.2
};

// Game class - Main game controller
class Game {
    constructor(canvasId) {
        // Canvas and rendering context
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.maxLevel = 5; // Will be set by levels.js
        
        // Game objects
        this.ball = new Ball(this.width / 2, this.height - 100, 10);
        this.paddle = new Paddle(this.width / 2 - 50, this.height - 30, 100, 15);
        this.bricks = [];
        this.powerups = [];
        
        // Input tracking
        this.keys = {};
        this.mouseX = 0;
        this.touchX = 0;
        this.useMouseControl = true;
        
        // Animation frame ID for game loop
        this.animationId = null;
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Initialize the game
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial brick setup (will be overridden by level data)
        this.createDefaultBricks();
        
        // Start the game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Pause game on 'p' key
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
            
            // Switch control mode on 'm' key
            if (e.key === 'm' || e.key === 'M') {
                this.useMouseControl = !this.useMouseControl;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.touchX = e.touches[0].clientX - rect.left;
        }, { passive: false });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    handleResize() {
        // Adjust canvas size based on parent container
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        // Maintain aspect ratio
        const aspectRatio = this.canvas.height / this.canvas.width;
        
        // Set new dimensions
        const newWidth = Math.min(800, containerWidth - 20);
        const newHeight = newWidth * aspectRatio;
        
        // Update canvas size
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        
        // Update game dimensions
        this.width = newWidth;
        this.height = newHeight;
        
        // Reposition paddle and ball
        this.paddle.width = newWidth / 8;
        this.paddle.x = Math.min(this.paddle.x, newWidth - this.paddle.width);
        this.paddle.y = newHeight - 30;
        
        if (this.state !== GAME_STATES.PLAYING) {
            this.ball.x = newWidth / 2;
            this.ball.y = newHeight - 50;
        }
        
        // Recalculate brick positions
        this.adjustBricksForResize();
    }
    
    adjustBricksForResize() {
        // Get the current brick layout dimensions
        if (this.bricks.length === 0) return;
        
        const oldWidth = Math.max(...this.bricks.map(brick => brick.x + brick.width));
        const oldHeight = Math.max(...this.bricks.map(brick => brick.y + brick.height));
        
        // Calculate scale factors
        const scaleX = this.width / oldWidth;
        const scaleY = (this.height * 0.6) / oldHeight; // Use only top 60% of screen for bricks
        
        // Reposition and resize all bricks
        this.bricks.forEach(brick => {
            brick.x *= scaleX;
            brick.y *= scaleY;
            brick.width *= scaleX;
            brick.height *= scaleY;
        });
    }
    
    createDefaultBricks() {
        // Create a simple grid of bricks (will be replaced by level data)
        const rows = 5;
        const cols = 8;
        const brickWidth = (this.width - 50) / cols;
        const brickHeight = 25;
        const topMargin = 50;
        
        this.bricks = [];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const brickX = col * brickWidth + 25;
                const brickY = row * brickHeight + topMargin;
                const health = Math.floor(Math.random() * 2) + 1; // Random health between 1-2
                const points = (rows - row) * 10; // More points for higher rows
                
                this.bricks.push(new Brick(
                    brickX,
                    brickY,
                    brickWidth - 5,
                    brickHeight - 5,
                    health,
                    points,
                    this.getBrickColorByRow(row)
                ));
            }
        }
    }
    
    getBrickColorByRow(row) {
        const colors = [
            '#ff4d4d', // Red
            '#ffcc00', // Yellow
            '#4dff88', // Green
            '#00b8ff', // Blue
            '#cc66ff'  // Purple
        ];
        return colors[row % colors.length];
    }
    
    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Reset ball and paddle
        this.resetBallAndPaddle();
        
        // Load first level
        this.loadLevel(this.level);
        
        // Update UI
        this.updateUI();
    }
    
    loadLevel(levelNumber) {
        // This function will be enhanced by levels.js
        // For now, we'll just create default bricks with increasing difficulty
        this.level = levelNumber;
        
        // Clear existing bricks
        this.bricks = [];
        
        // Create bricks with increasing difficulty
        const rows = 3 + Math.min(levelNumber, 5);
        const cols = 6 + Math.min(levelNumber, 4);
        const brickWidth = (this.width - 50) / cols;
        const brickHeight = 25;
        const topMargin = 50;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const brickX = col * brickWidth + 25;
                const brickY = row * brickHeight + topMargin;
                
                // Higher levels have stronger bricks
                const health = Math.min(3, Math.ceil(levelNumber / 2));
                const points = (rows - row) * 10 * levelNumber;
                
                this.bricks.push(new Brick(
                    brickX,
                    brickY,
                    brickWidth - 5,
                    brickHeight - 5,
                    health,
                    points,
                    this.getBrickColorByRow(row)
                ));
            }
        }
        
        // Reset ball and paddle
        this.resetBallAndPaddle();
        
        // Increase ball speed with level
        this.ball.speed = Math.min(
            PHYSICS.BALL_SPEED_MIN + (levelNumber - 1),
            PHYSICS.BALL_SPEED_MAX
        );
        
        // Show level transition screen
        document.getElementById('levelNumber').textContent = levelNumber;
        document.getElementById('levelScreen').style.display = 'block';
        
        // Update UI
        this.updateUI();
    }
    
    resetBallAndPaddle() {
        // Reset paddle position
        this.paddle.x = this.width / 2 - this.paddle.width / 2;
        this.paddle.y = this.height - 30;
        
        // Reset ball position
        this.ball.x = this.width / 2;
        this.ball.y = this.height - 50;
        
        // Reset ball direction (upward with slight angle)
        const angle = Math.PI * 1.5 + (Math.random() * 0.5 - 0.25);
        this.ball.dx = Math.cos(angle) * this.ball.speed;
        this.ball.dy = Math.sin(angle) * this.ball.speed;
        
        // Reset ball attached state
        this.ball.attached = true;
        this.ball.attachedOffset = this.paddle.width / 2;
    }
    
    togglePause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
        } else if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            // Restart the game loop if it was canceled
            if (!this.animationId) {
                this.lastTime = performance.now();
                this.gameLoop();
            }
        }
    }
    
    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').style.display = 'block';
    }
    
    victory() {
        this.state = GAME_STATES.VICTORY;
        document.getElementById('victoryScore').textContent = this.score;
        document.getElementById('victoryScreen').style.display = 'block';
    }
    
    nextLevel() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.loadLevel(this.level);
        } else {
            this.victory();
        }
    }
    
    updateUI() {
        // Update score, level, and lives display
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    update(deltaTime) {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        // Update paddle position based on input
        this.updatePaddlePosition();
        
        // Update ball position
        if (this.ball.attached) {
            // Keep ball attached to paddle
            this.ball.x = this.paddle.x + this.ball.attachedOffset;
            this.ball.y = this.paddle.y - this.ball.radius - 1;
            
            // Launch ball on space, click or touch
            if (this.keys[' '] || this.keys['Enter']) {
                this.ball.attached = false;
                this.keys[' '] = false;
                this.keys['Enter'] = false;
            }
        } else {
            // Move ball
            this.ball.update(deltaTime);
            
            // Check for collisions
            this.checkCollisions();
        }
        
        // Update powerups
        this.updatePowerups(deltaTime);
        
        // Check if level is completed
        if (this.bricks.length === 0) {
            this.nextLevel();
        }
    }
    
    updatePaddlePosition() {
        // Keyboard controls
        if (!this.useMouseControl) {
            if (this.keys['ArrowLeft']) {
                this.paddle.moveLeft(this.width);
            }
            if (this.keys['ArrowRight']) {
                this.paddle.moveRight(this.width);
            }
        } 
        // Mouse controls
        else if (this.mouseX > 0) {
            // Set paddle position centered on mouse x
            const paddleCenter = this.mouseX;
            this.paddle.x = paddleCenter - (this.paddle.width / 2);
            
            // Keep paddle within canvas bounds
            if (this.paddle.x < 0) {
                this.paddle.x = 0;
            } else if (this.paddle.x + this.paddle.width > this.width) {
                this.paddle.x = this.width - this.paddle.width;
            }
        }
        // Touch controls
        else if (this.touchX > 0) {
            // Set paddle position centered on touch x
            const paddleCenter = this.touchX;
            this.paddle.x = paddleCenter - (this.paddle.width / 2);
            
            // Keep paddle within canvas bounds
            if (this.paddle.x < 0) {
                this.paddle.x = 0;
            } else if (this.paddle.x + this.paddle.width > this.width) {
                this.paddle.x = this.width - this.paddle.width;
            }
        }
    }
    
    updatePowerups(deltaTime) {
        // This will be enhanced by powerups.js
        // For now, just handle basic powerup movement
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            // Move powerup down
            powerup.y += powerup.speed * deltaTime;
            
            // Check if powerup is caught by paddle
            if (this.checkPowerupPaddleCollision(powerup)) {
                // Apply powerup effect
                this.applyPowerup(powerup);
                
                // Remove powerup
                this.powerups.splice(i, 1);
            }
            // Remove powerups that go off screen
            else if (powerup.y > this.height) {
                this.powerups.splice(i, 1);
            }
        }
    }
    
    checkPowerupPaddleCollision(powerup) {
        return (
            powerup.x + powerup.width > this.paddle.x &&
            powerup.x < this.paddle.x + this.paddle.width &&
            powerup.y + powerup.height > this.paddle.y &&
            powerup.y < this.paddle.y + this.paddle.height
        );
    }
    
    applyPowerup(powerup) {
        // This will be enhanced by powerups.js
        // Basic powerup effects
        switch (powerup.type) {
            case 'extraLife':
                this.lives++;
                break;
            case 'expandPaddle':
                this.paddle.width *= 1.5;
                break;
            case 'shrinkPaddle':
                this.paddle.width /= 1.5;
                break;
            case 'speedBall':
                this.ball.speed *= 1.2;
                break;
            case 'slowBall':
                this.ball.speed *= 0.8;
                break;
            default:
                break;
        }
        
        // Update UI
        this.updateUI();
    }
    
    checkCollisions() {
        // Ball-Wall collisions
        this.checkWallCollisions();
        
        // Ball-Paddle collisions
        this.checkPaddleCollision();
        
        // Ball-Brick collisions
        this.checkBrickCollisions();
    }
    
    checkWallCollisions() {
        // Left and right walls
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.dx = -this.ball.dx * PHYSICS.EDGE_BOUNCE_DAMPENING;
            this.playSound('wallHit');
        } else if (this.ball.x + this.ball.radius > this.width) {
            this.ball.x = this.width - this.ball.radius;
            this.ball.dx = -this.ball.dx * PHYSICS.EDGE_BOUNCE_DAMPENING;
            this.playSound('wallHit');
        }
        
        // Top wall
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.dy = -this.ball.dy * PHYSICS.EDGE_BOUNCE_DAMPENING;
            this.playSound('wallHit');
        }
        
        // Bottom - lose a life
        if (this.ball.y + this.ball.radius > this.height) {
            this.loseLife();
        }
    }
    
    checkPaddleCollision() {
        // Check if ball collides with paddle
        if (
            this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x + this.ball.radius > this.paddle.x &&
            this.ball.x - this.ball.radius < this.paddle.x + this.paddle.width
        ) {
            // Calculate where on the paddle the ball hit (0 to 1)
            const hitPosition = (this.ball.x - this.paddle.x) / this.paddle.width;
            
            // Calculate new angle based on hit position
            // Middle of paddle sends ball straight up, edges send at an angle
            const angle = Math.PI * (1.5 - (hitPosition - 0.5) * PHYSICS.PADDLE_BOUNCE_INFLUENCE);
            
            // Set new velocity
            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            this.ball.dx = Math.cos(angle) * speed;
            this.ball.dy = Math.sin(angle) * speed;
            
            // Ensure ball is above paddle
            this.ball.y = this.paddle.y - this.ball.radius;
            
            // Slightly increase ball speed
            this.ball.speed = Math.min(
                this.ball.speed + PHYSICS.BALL_SPEED_INCREMENT,
                PHYSICS.BALL_SPEED_MAX
            );
            
            // Play sound
            this.playSound('paddleHit');
        }
    }
    
    checkBrickCollisions() {
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            
            if (this.checkBallBrickCollision(brick)) {
                // Damage the brick
                brick.health--;
                
                // If brick is destroyed
                if (brick.health <= 0) {
                    // Add score
                    this.score += brick.points;
                    
                    // Chance to spawn powerup
                    if (Math.random() < 0.2) { // 20% chance
                        this.spawnPowerup(brick);
                    }
                    
                    // Remove brick
                    this.bricks.splice(i, 1);
                    
                    // Play sound
                    this.playSound('brickDestroy');
                } else {
                    // Play sound for hit but not destroyed
                    this.playSound('brickHit');
                }
                
                // Update UI
                this.updateUI();
            }
        }
    }
    
    checkBallBrickCollision(brick) {
        // Find closest point on brick to ball center
        const closestX = Math.max(brick.x, Math.min(this.ball.x, brick.x + brick.width));
        const closestY = Math.max(brick.y, Math.min(this.ball.y, brick.y + brick.height));
        
        // Calculate distance between closest point and ball center
        const distanceX = this.ball.x - closestX;
        const distanceY = this.ball.y - closestY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // Check if distance is less than ball radius (collision)
        if (distance < this.ball.radius) {
            // Determine bounce direction
            // If ball center is inside brick, find nearest edge
            if (this.ball.x >= brick.x && this.ball.x <= brick.x + brick.width) {
                // Vertical collision
                this.ball.dy = -this.ball.dy;
            } else if (this.ball.y >= brick.y && this.ball.y <= brick.y + brick.height) {
                // Horizontal collision
                this.ball.dx = -this.ball.dx;
            } else {
                // Corner collision - reflect based on angle
                const dx = this.ball.x - closestX;
                const dy = this.ball.y - closestY;
                const angle = Math.atan2(dy, dx);
                
                const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
                this.ball.dx = Math.cos(angle) * speed;
                this.ball.dy = Math.sin(angle) * speed;
            }
            
            return true;
        }
        
        return false;
    }
    
    spawnPowerup(brick) {
        // This will be enhanced by powerups.js
        // Basic powerup types
        const powerupTypes = [
            'extraLife',
            'expandPaddle',
            'shrinkPaddle',
            'speedBall',
            'slowBall'
        ];
        
        // Random powerup type
        const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        // Create powerup
        const powerup = {
            x: brick.x + brick.width / 2 - 15,
            y: brick.y + brick.height / 2 - 15,
            width: 30,
            height: 30,
            type: type,
            speed: 2,
            color: this.getPowerupColor(type)
        };
        
        // Add to powerups array
        this.powerups.push(powerup);
    }
    
    getPowerupColor(type) {
        switch (type) {
            case 'extraLife': return '#ff4d4d'; // Red
            case 'expandPaddle': return '#4dff88'; // Green
            case 'shrinkPaddle': return '#ffcc00'; // Yellow
            case 'speedBall': return '#00b8ff'; // Blue
            case 'slowBall': return '#cc66ff'; // Purple
            default: return '#ffffff'; // White
        }
    }
    
    loseLife() {
        this.lives--;
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetBallAndPaddle();
            this.updateUI();
        }
        
        // Play sound
        this.playSound('loseLife');
    }
    
    playSound(soundId) {
        // This will be enhanced by audio.js
        // For now, just a placeholder
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects
        this.ball.draw(this.ctx);
        this.paddle.draw(this.ctx);
        
        // Draw bricks
        this.bricks.forEach(brick => brick.draw(this.ctx));
        
        // Draw powerups
        this.drawPowerups();
        
        // Draw pause overlay if paused
        if (this.state === GAME_STATES.PAUSED) {
            this.drawPauseOverlay();
        }
    }
    
    drawBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    drawPowerups() {
        this.powerups.forEach(powerup => {
            // Draw powerup
            this.ctx.fillStyle = powerup.color;
            this.ctx.beginPath();
            this.ctx.arc(
                powerup.x + powerup.width / 2,
                powerup.y + powerup.height / 2,
                powerup.width / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Draw icon based on powerup type
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            let icon = '';
            switch (powerup.type) {
                case 'extraLife': icon = '♥'; break;
                case 'expandPaddle': icon = '↔'; break;
                case 'shrinkPaddle': icon = '↕'; break;
                case 'speedBall': icon = '↑'; break;
                case 'slowBall': icon = '↓'; break;
                default: icon = '?'; break;
            }
            
            this.ctx.fillText(
                icon,
                powerup.x + powerup.width / 2,
                powerup.y + powerup.height / 2
            );
        });
    }
    
    drawPauseOverlay() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Pause text
        this.ctx.fillStyle = '#ff9900';
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
        
        // Instructions
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press P to resume', this.width / 2, this.height / 2 + 50);
    }
    
    gameLoop(currentTime = 0) {
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Limit delta time to prevent jumps after tab switch
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        
        // Update game state
        this.update(this.deltaTime);
        
        // Render game
        this.render();
        
        // Continue game loop if not game over
        if (this.state !== GAME_STATES.GAME_OVER && this.state !== GAME_STATES.VICTORY) {
            this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
}

// Ball class
class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = PHYSICS.BALL_SPEED_MIN;
        this.dx = 0;
        this.dy = -this.speed;
        this.attached = true;
        this.attachedOffset = 0;
        this.color = '#ffffff';
        this.trail = [];
        this.maxTrailLength = 5;
    }
    
    update(deltaTime) {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        
        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Update position
        this.x += this.dx;
        this.y += this.dy;
    }
    
    draw(ctx) {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = i / this.trail.length * 0.5;
            const size = this.radius * (i / this.trail.length);
            
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }
        
        // Draw ball
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Create gradient for ball
        const gradient = ctx.createRadialGradient(
            this.x - this.radius / 3,
            this.y - this.radius / 3,
            0,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#00b8ff');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw highlight
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius / 3,
            this.y - this.radius / 3,
            this.radius / 4,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
}

// Paddle class
class Paddle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = PHYSICS.PADDLE_SPEED;
        this.color = '#00b8ff';
    }
    
    moveLeft() {
        this.x -= this.speed;
        if (this.x < 0) {
            this.x = 0;
        }
    }
    
    moveRight(canvasWidth) {
        this.x += this.speed;
        if (this.x + this.width > canvasWidth) {
            this.x = canvasWidth - this.width;
        }
    }
    
    draw(ctx) {
        // Create gradient for paddle
        const gradient = ctx.createLinearGradient(
            this.x,
            this.y,
            this.x,
            this.y + this.height
        );
        gradient.addColorStop(0, '#00b8ff');
        gradient.addColorStop(1, '#0077ff');
        
        // Draw paddle body
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, [8]);
        ctx.fill();
        
        // Draw paddle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height / 3, [8, 8, 0, 0]);
        ctx.fill();
        
        // Draw paddle edges
        ctx.fillStyle = '#00d8ff';
        ctx.fillRect(this.x, this.y, 5, this.height);
        ctx.fillRect(this.x + this.width - 5, this.y, 5, this.height);
    }
}

// Brick class
class Brick {
    constructor(x, y, width, height, health, points, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
        this.points = points;
        this.baseColor = color;
        this.isHit = false;
        this.hitTimer = 0;
    }
    
    draw(ctx) {
        // Calculate color based on health
        let color = this.baseColor;
        if (this.health < this.maxHealth) {
            // Darken color for damaged bricks
            color = this.darkenColor(this.baseColor, (this.maxHealth - this.health) / this.maxHealth * 0.5);
        }
        
        // Create gradient for brick
        const gradient = ctx.createLinearGradient(
            this.x,
            this.y,
            this.x,
            this.y + this.height
        );
        gradient.addColorStop(0, this.lightenColor(color, 0.2));
        gradient.addColorStop(1, this.darkenColor(color, 0.2));
        
        // Draw brick body with rounded corners
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, [4]);
        ctx.fill();
        
        // Draw brick highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height / 3, [4, 4, 0, 0]);
        ctx.fill();
        
        // Draw brick border
        ctx.strokeStyle = this.darkenColor(color, 0.3);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, [4]);
        ctx.stroke();
        
        // Draw health indicator for multi-hit bricks
        if (this.maxHealth > 1) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.health.toString(),
                this.x + this.width / 2,
                this.y + this.height / 2
            );
        }
    }
    
    // Helper methods for color manipulation
    lightenColor(color, amount) {
        return this.adjustColor(color, amount, true);
    }
    
    darkenColor(color, amount) {
        return this.adjustColor(color, amount, false);
    }
    
    adjustColor(color, amount, lighten) {
        // Convert hex to RGB
        let r = parseInt(color.substring(1, 3), 16);
        let g = parseInt(color.substring(3, 5), 16);
        let b = parseInt(color.substring(5, 7), 16);
        
        // Adjust color
        if (lighten) {
            r = Math.min(255, r + Math.round(255 * amount));
            g = Math.min(255, g + Math.round(255 * amount));
            b = Math.min(255, b + Math.round(255 * amount));
        } else {
            r = Math.max(0, r - Math.round(255 * amount));
            g = Math.max(0, g - Math.round(255 * amount));
            b = Math.max(0, b - Math.round(255 * amount));
        }
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
