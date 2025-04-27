// Glitter Maze Runner - game.js
// A pink and glittery maze runner game

class GlitterMazeRunner {
    constructor() {
        // Game canvas and context
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.cellSize = 30;
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.maze = [];
        this.player = { x: 1, y: 1 };
        this.exit = { x: this.cols - 2, y: this.rows - 2 };
        
        // Game state
        this.gameStarted = false;
        this.gameWon = false;
        this.timeLeft = 120; // 2 minutes
        this.level = 1;
        this.timerInterval = null;
        this.glitters = [];
        this.maxGlitters = 20;
        
        // Colors
        this.colors = {
            background: '#ffb6c1',
            wall: '#ff85c2',
            wallBorder: '#ff1493',
            player: '#ff1493',
            playerGlow: '#ff85c2',
            exit: '#ffffff',
            exitGlow: '#ff85c2',
            glitter: ['#ff85c2', '#ff1493', '#ffb6c1', '#ffc0cb', '#ffffff']
        };
        
        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.startGame = this.startGame.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.update = this.update.bind(this);
        
        // Event listeners
        document.getElementById('start-button').addEventListener('click', this.startGame);
        document.getElementById('reset-button').addEventListener('click', this.resetGame);
        
        // Initial setup
        this.initializeGame();
    }
    
    initializeGame() {
        // Generate initial maze
        this.generateMaze();
        
        // Draw initial state
        this.draw();
        
        // Create initial glitters
        this.createGlitters(10);
    }
    
    startGame() {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        this.gameWon = false;
        
        // Reset player position
        this.player = { x: 1, y: 1 };
        
        // Start timer
        this.startTimer();
        
        // Add keyboard controls
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Start game loop
        requestAnimationFrame(this.update);
    }
    
    resetGame() {
        // Stop timer
        clearInterval(this.timerInterval);
        
        // Reset game state
        this.gameStarted = false;
        this.gameWon = false;
        this.timeLeft = 120;
        this.level = 1;
        this.player = { x: 1, y: 1 };
        
        // Update UI
        document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
        document.getElementById('level').textContent = this.level;
        
        // Generate new maze
        this.generateMaze();
        
        // Remove keyboard controls
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Draw new state
        this.draw();
    }
    
    startTimer() {
        // Clear existing timer
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // Update timer display
        document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
        
        // Start new timer
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.gameOver();
            }
        }, 1000);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    generateMaze() {
        // Initialize maze with walls
        this.maze = [];
        for (let y = 0; y < this.rows; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.maze[y][x] = 1; // 1 = wall
            }
        }
        
        // Recursive backtracking maze generation
        const stack = [];
        const startX = 1;
        const startY = 1;
        
        // Mark start position as path
        this.maze[startY][startX] = 0; // 0 = path
        stack.push({ x: startX, y: startY });
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const { x, y } = current;
            
            // Get unvisited neighbors
            const neighbors = [];
            
            if (y >= 2 && this.maze[y - 2][x] === 1) neighbors.push({ x, y: y - 2, direction: 'up' });
            if (y <= this.rows - 3 && this.maze[y + 2][x] === 1) neighbors.push({ x, y: y + 2, direction: 'down' });
            if (x >= 2 && this.maze[y][x - 2] === 1) neighbors.push({ x: x - 2, y, direction: 'left' });
            if (x <= this.cols - 3 && this.maze[y][x + 2] === 1) neighbors.push({ x: x + 2, y, direction: 'right' });
            
            if (neighbors.length > 0) {
                // Choose random neighbor
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Remove wall between current and next
                if (next.direction === 'up') this.maze[y - 1][x] = 0;
                if (next.direction === 'down') this.maze[y + 1][x] = 0;
                if (next.direction === 'left') this.maze[y][x - 1] = 0;
                if (next.direction === 'right') this.maze[y][x + 1] = 0;
                
                // Mark next cell as path
                this.maze[next.y][next.x] = 0;
                
                // Push next cell to stack
                stack.push({ x: next.x, y: next.y });
            } else {
                // Backtrack
                stack.pop();
            }
        }
        
        // Ensure exit is accessible
        this.maze[this.exit.y][this.exit.x] = 0;
        
        // Add some random paths for easier navigation
        const pathsToAdd = Math.floor(this.level * 1.5);
        for (let i = 0; i < pathsToAdd; i++) {
            const x = Math.floor(Math.random() * (this.cols - 2)) + 1;
            const y = Math.floor(Math.random() * (this.rows - 2)) + 1;
            if (x % 2 === 1 || y % 2 === 1) {
                this.maze[y][x] = 0;
            }
        }
    }
    
    handleKeyDown(e) {
        if (!this.gameStarted || this.gameWon) return;
        
        let newX = this.player.x;
        let newY = this.player.y;
        
        // Handle arrow keys and WASD
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                newY--;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                newY++;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                newX--;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                newX++;
                break;
            default:
                return;
        }
        
        // Check if new position is valid
        if (newX >= 0 && newX < this.cols && newY >= 0 && newY < this.rows && this.maze[newY][newX] === 0) {
            this.player.x = newX;
            this.player.y = newY;
            
            // Check if player reached exit
            if (this.player.x === this.exit.x && this.player.y === this.exit.y) {
                this.levelComplete();
            }
        }
        
        // Prevent default behavior (page scrolling)
        e.preventDefault();
    }
    
    levelComplete() {
        this.gameWon = true;
        clearInterval(this.timerInterval);
        
        // Add bonus time for next level
        this.timeLeft += 30;
        
        // Increase level
        this.level++;
        document.getElementById('level').textContent = this.level;
        
        // Show level complete message
        this.showMessage(`Level ${this.level - 1} Complete! +30 seconds bonus!`);
        
        // Generate new maze after delay
        setTimeout(() => {
            this.gameWon = false;
            this.player = { x: 1, y: 1 };
            this.generateMaze();
            this.startTimer();
        }, 2000);
    }
    
    gameOver() {
        this.gameStarted = false;
        document.removeEventListener('keydown', this.handleKeyDown);
        this.showMessage('Game Over! Press Start to play again.');
    }
    
    showMessage(text) {
        // Draw message on canvas
        this.ctx.fillStyle = 'rgba(255, 20, 147, 0.8)';
        this.ctx.fillRect(50, this.canvas.height / 2 - 40, this.canvas.width - 100, 80);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(50, this.canvas.height / 2 - 40, this.canvas.width - 100, 80);
        
        this.ctx.font = '24px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 + 10);
    }
    
    createGlitters(count) {
        for (let i = 0; i < count; i++) {
            if (this.glitters.length >= this.maxGlitters) break;
            
            // Find random empty cell
            let x, y;
            do {
                x = Math.floor(Math.random() * this.cols);
                y = Math.floor(Math.random() * this.rows);
            } while (this.maze[y][x] !== 0 || (x === this.player.x && y === this.player.y) || (x === this.exit.x && y === this.exit.y));
            
            // Create glitter
            this.glitters.push({
                x,
                y,
                size: Math.random() * 10 + 5,
                color: this.colors.glitter[Math.floor(Math.random() * this.colors.glitter.length)],
                alpha: 1,
                fadeSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    updateGlitters() {
        for (let i = this.glitters.length - 1; i >= 0; i--) {
            const glitter = this.glitters[i];
            
            // Fade out glitter
            glitter.alpha -= glitter.fadeSpeed;
            
            // Remove faded glitters
            if (glitter.alpha <= 0) {
                this.glitters.splice(i, 1);
            }
        }
        
        // Add new glitters
        if (Math.random() < 0.1) {
            this.createGlitters(1);
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.maze[y][x] === 1) {
                    // Draw wall
                    this.ctx.fillStyle = this.colors.wall;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                    
                    // Draw wall border
                    this.ctx.strokeStyle = this.colors.wallBorder;
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
        
        // Draw glitters
        for (const glitter of this.glitters) {
            this.ctx.globalAlpha = glitter.alpha;
            this.ctx.fillStyle = glitter.color;
            this.ctx.beginPath();
            this.ctx.arc(
                glitter.x * this.cellSize + this.cellSize / 2,
                glitter.y * this.cellSize + this.cellSize / 2,
                glitter.size / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
        
        // Draw exit
        this.ctx.fillStyle = this.colors.exit;
        this.ctx.beginPath();
        this.ctx.arc(
            this.exit.x * this.cellSize + this.cellSize / 2,
            this.exit.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 2.5,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw exit glow
        this.ctx.shadowColor = this.colors.exitGlow;
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.beginPath();
        this.ctx.arc(
            this.exit.x * this.cellSize + this.cellSize / 2,
            this.exit.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Draw player
        if (this.gameStarted) {
            // Draw player glow
            this.ctx.shadowColor = this.colors.playerGlow;
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = this.colors.player;
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x * this.cellSize + this.cellSize / 2,
                this.player.y * this.cellSize + this.cellSize / 2,
                this.cellSize / 2.5,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Draw player face
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x * this.cellSize + this.cellSize / 2 - 3,
                this.player.y * this.cellSize + this.cellSize / 2 - 2,
                3,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x * this.cellSize + this.cellSize / 2 + 3,
                this.player.y * this.cellSize + this.cellSize / 2 - 2,
                3,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Draw smile
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x * this.cellSize + this.cellSize / 2,
                this.player.y * this.cellSize + this.cellSize / 2 + 2,
                5,
                0.1 * Math.PI,
                0.9 * Math.PI,
                false
            );
            this.ctx.stroke();
        }
    }
    
    update() {
        // Update game state
        this.updateGlitters();
        
        // Draw everything
        this.draw();
        
        // Continue game loop
        if (this.gameStarted) {
            requestAnimationFrame(this.update);
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new GlitterMazeRunner();
});
