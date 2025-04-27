/**
 * Advanced Brick Breaker - Main Application
 * main.js - Game initialization and main entry point
 */

// Wait for DOM to be fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Brick Breaker Game...');
    
    // Initialize game
    initGame();
});

// Main game instance
let game = null;

// Game initialization
function initGame() {
    // Get canvas element
    const canvas = document.getElementById('gameCanvas');
    
    // Make sure canvas is properly sized for the container
    resizeCanvas();
    
    // Create game instance
    game = new Game('gameCanvas');
    
    // Initialize game subsystems
    initGameSystems();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show start screen
    showScreen('startScreen');
}

// Initialize all game subsystems
function initGameSystems() {
    // Initialize level system
    initLevelSystem(game);
    
    // Initialize powerup system
    initPowerupSystem(game);
    
    // Initialize audio system
    initAudioSystem(game);
    
    // Set default game state
    game.state = GAME_STATES.MENU;
}

// Set up all event listeners
function setupEventListeners() {
    // Button event listeners
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('continueButton').addEventListener('click', continueGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    document.getElementById('playAgainButton').addEventListener('click', restartGame);
    
    // Keyboard event listeners for global controls
    window.addEventListener('keydown', handleKeyDown);
    
    // Window resize event
    window.addEventListener('resize', resizeCanvas);
    
    // Prevent space and arrow keys from scrolling the page
    window.addEventListener('keydown', function(e) {
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);
    
    // Touch events for mobile
    setupTouchEvents();
}

// Handle keyboard input
function handleKeyDown(e) {
    // Pause game on 'p' key
    if ((e.key === 'p' || e.key === 'P') && game.state === GAME_STATES.PLAYING) {
        togglePause();
    }
    
    // Start/continue game on Enter key
    if (e.key === 'Enter') {
        if (game.state === GAME_STATES.MENU) {
            startGame();
        } else if (game.state === GAME_STATES.LEVEL_TRANSITION) {
            continueGame();
        } else if (game.state === GAME_STATES.GAME_OVER || game.state === GAME_STATES.VICTORY) {
            restartGame();
        }
    }
    
    // Launch ball on space key
    if (e.key === ' ' && game.state === GAME_STATES.PLAYING) {
        if (game.ball.attached) {
            game.ball.attached = false;
        }
    }
    
    // Mute/unmute on 'm' key
    if (e.key === 'm' || e.key === 'M') {
        if (game.audioSystem) {
            game.audioSystem.toggleMute();
        }
    }
}

// Set up touch events for mobile play
function setupTouchEvents() {
    const canvas = document.getElementById('gameCanvas');
    
    // Touch start - launch ball
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        
        if (game.state === GAME_STATES.PLAYING && game.ball.attached) {
            game.ball.attached = false;
        }
    }, { passive: false });
    
    // Double tap - pause game
    let lastTap = 0;
    canvas.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            if (game.state === GAME_STATES.PLAYING || game.state === GAME_STATES.PAUSED) {
                togglePause();
            }
            e.preventDefault();
        }
        
        lastTap = currentTime;
    });
}

// Resize canvas to fit container
function resizeCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const container = canvas.parentElement;
    
    // Get container dimensions
    const containerWidth = container.clientWidth;
    
    // Maintain aspect ratio (4:3)
    const aspectRatio = 3/4;
    
    // Calculate new dimensions
    const newWidth = Math.min(800, containerWidth - 20);
    const newHeight = newWidth * aspectRatio;
    
    // Set canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // Update game dimensions if game is initialized
    if (game) {
        game.width = newWidth;
        game.height = newHeight;
        
        // Reposition paddle and ball
        if (game.paddle) {
            game.paddle.width = newWidth / 8;
            game.paddle.x = Math.min(game.paddle.x, newWidth - game.paddle.width);
            game.paddle.y = newHeight - 30;
        }
        
        if (game.ball && game.ball.attached) {
            game.ball.x = newWidth / 2;
            game.ball.y = newHeight - 50;
        }
        
        // Recalculate brick positions
        if (game.bricks && game.bricks.length > 0) {
            game.adjustBricksForResize();
        }
    }
    
    // Update UI positions
    updateUIPositions();
}

// Update UI element positions based on canvas size
function updateUIPositions() {
    const canvas = document.getElementById('gameCanvas');
    const screens = ['startScreen', 'levelScreen', 'gameOverScreen', 'victoryScreen'];
    
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.width = '80%';
            screen.style.maxWidth = '500px';
        }
    });
}

// Show a specific screen and hide others
function showScreen(screenId) {
    const screens = ['startScreen', 'levelScreen', 'gameOverScreen', 'victoryScreen'];
    
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            screen.style.display = id === screenId ? 'block' : 'none';
        }
    });
    
    // Apply screen-specific animations
    if (screenId === 'startScreen') {
        animateStartScreen();
    } else if (screenId === 'levelScreen') {
        animateLevelScreen();
    } else if (screenId === 'gameOverScreen') {
        animateGameOverScreen();
    } else if (screenId === 'victoryScreen') {
        animateVictoryScreen();
    }
}

// Screen animations
function animateStartScreen() {
    const title = document.querySelector('#startScreen h2');
    if (title) {
        title.style.animation = 'none';
        setTimeout(() => {
            title.style.animation = 'fadeInDown 1s ease-out';
        }, 10);
    }
    
    const button = document.getElementById('startButton');
    if (button) {
        button.style.animation = 'none';
        setTimeout(() => {
            button.style.animation = 'pulse 1.5s infinite alternate';
        }, 10);
    }
}

function animateLevelScreen() {
    const levelNumber = document.getElementById('levelNumber');
    if (levelNumber) {
        levelNumber.classList.add('level-up');
        setTimeout(() => {
            levelNumber.classList.remove('level-up');
        }, 1000);
    }
}

function animateGameOverScreen() {
    const title = document.querySelector('#gameOverScreen h2');
    if (title) {
        title.style.animation = 'none';
        setTimeout(() => {
            title.style.animation = 'pulseRed 1.5s infinite alternate';
        }, 10);
    }
    
    const score = document.getElementById('finalScore');
    if (score) {
        score.classList.add('score-up');
        setTimeout(() => {
            score.classList.remove('score-up');
        }, 1000);
    }
}

function animateVictoryScreen() {
    const title = document.querySelector('#victoryScreen h2');
    if (title) {
        title.style.animation = 'none';
        setTimeout(() => {
            title.style.animation = 'pulseGreen 1.5s infinite alternate';
        }, 10);
    }
    
    const score = document.getElementById('victoryScore');
    if (score) {
        score.classList.add('score-up');
        setTimeout(() => {
            score.classList.remove('score-up');
        }, 1000);
    }
}

// Game control functions
function startGame() {
    // Hide start screen
    showScreen(null);
    
    // Start the game
    game.startGame();
    
    // Play button click sound
    game.playSound('buttonClick');
    
    // Play game start sound
    game.playSound('gameStart');
}

function continueGame() {
    // Hide level screen
    showScreen(null);
    
    // Resume game
    game.state = GAME_STATES.PLAYING;
    
    // Play button click sound
    game.playSound('buttonClick');
}

function restartGame() {
    // Hide game over or victory screen
    showScreen(null);
    
    // Start a new game
    game.startGame();
    
    // Play button click sound
    game.playSound('buttonClick');
}

function togglePause() {
    if (game.state === GAME_STATES.PLAYING) {
        game.state = GAME_STATES.PAUSED;
        
        // Play pause sound
        game.playSound('pause');
        
        // Create pause overlay
        createPauseOverlay();
    } else if (game.state === GAME_STATES.PAUSED) {
        game.state = GAME_STATES.PLAYING;
        
        // Play button click sound
        game.playSound('buttonClick');
        
        // Remove pause overlay
        removePauseOverlay();
    }
}

// Create pause overlay
function createPauseOverlay() {
    // Check if overlay already exists
    if (document.getElementById('pauseOverlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'pauseOverlay';
    overlay.className = 'pause-overlay';
    
    const pauseText = document.createElement('div');
    pauseText.className = 'pause-text';
    pauseText.textContent = 'PAUSED';
    
    const resumeText = document.createElement('div');
    resumeText.style.color = '#ffffff';
    resumeText.style.marginTop = '20px';
    resumeText.style.fontSize = '16px';
    resumeText.textContent = 'Press P to resume';
    
    overlay.appendChild(pauseText);
    overlay.appendChild(resumeText);
    
    document.getElementById('gameContainer').appendChild(overlay);
    
    // Add click event to resume
    overlay.addEventListener('click', togglePause);
}

// Remove pause overlay
function removePauseOverlay() {
    const overlay = document.getElementById('pauseOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Add CSS animations
function addCssAnimations() {
    // Check if animations are already added
    if (document.getElementById('gameAnimations')) return;
    
    const style = document.createElement('style');
    style.id = 'gameAnimations';
    style.textContent = `
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            100% {
                transform: scale(1.05);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
            }
        }
        
        @keyframes scoreUp {
            0% {
                transform: scale(1);
                color: #ffffff;
            }
            50% {
                transform: scale(1.5);
                color: #4dff88;
            }
            100% {
                transform: scale(1);
                color: #ffffff;
            }
        }
        
        @keyframes levelUp {
            0% {
                transform: scale(1);
                color: #ffffff;
            }
            50% {
                transform: scale(1.8);
                color: #00b8ff;
            }
            100% {
                transform: scale(1);
                color: #ffffff;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize animations
addCssAnimations();

// Check for browser compatibility
function checkBrowserCompatibility() {
    const canvas = document.getElementById('gameCanvas');
    
    // Check if canvas is supported
    if (!canvas.getContext) {
        showCompatibilityError("Your browser doesn't support HTML5 Canvas. Please upgrade to a modern browser.");
        return false;
    }
    
    // Check if Web Audio API is supported
    if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
        console.warn("Web Audio API is not supported in this browser. Game will use fallback audio.");
    }
    
    // Check if localStorage is supported
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        console.warn("localStorage is not supported. Game settings won't be saved.");
    }
    
    return true;
}

// Show compatibility error
function showCompatibilityError(message) {
    const container = document.getElementById('gameContainer');
    
    // Clear container
    container.innerHTML = '';
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.style.padding = '20px';
    errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    errorDiv.style.border = '1px solid #ff0000';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.color = '#ffffff';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.margin = '20px';
    
    errorDiv.innerHTML = `
        <h2>Compatibility Error</h2>
        <p>${message}</p>
        <p>Recommended browsers: Chrome, Firefox, Edge, Safari</p>
    `;
    
    container.appendChild(errorDiv);
}

// Check browser compatibility
if (checkBrowserCompatibility()) {
    console.log('Browser compatibility check passed.');
} else {
    console.error('Browser compatibility check failed.');
}

// Add game version info
const GAME_VERSION = '1.0.0';
console.log(`Advanced Brick Breaker v${GAME_VERSION}`);

// Add a small info panel in the corner
function addInfoPanel() {
    const infoPanel = document.createElement('div');
    infoPanel.id = 'infoPanel';
    infoPanel.style.position = 'absolute';
    infoPanel.style.bottom = '10px';
    infoPanel.style.left = '10px';
    infoPanel.style.fontSize = '12px';
    infoPanel.style.color = 'rgba(255, 255, 255, 0.5)';
    infoPanel.style.zIndex = '100';
    infoPanel.textContent = `v${GAME_VERSION} | Controls: Arrows/Mouse, Space, P=Pause, M=Mute`;
    
    document.getElementById('gameContainer').appendChild(infoPanel);
}

// Add info panel
addInfoPanel();

// Add help button
function addHelpButton() {
    const helpButton = document.createElement('button');
    helpButton.id = 'helpButton';
    helpButton.textContent = '?';
    helpButton.style.position = 'absolute';
    helpButton.style.top = '10px';
    helpButton.style.left = '10px';
    helpButton.style.width = '30px';
    helpButton.style.height = '30px';
    helpButton.style.borderRadius = '50%';
    helpButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    helpButton.style.border = 'none';
    helpButton.style.color = '#ffffff';
    helpButton.style.fontSize = '16px';
    helpButton.style.cursor = 'pointer';
    helpButton.style.zIndex = '100';
    
    helpButton.addEventListener('click', showHelpModal);
    
    document.getElementById('gameContainer').appendChild(helpButton);
}

// Show help modal
function showHelpModal() {
    // Check if modal already exists
    if (document.getElementById('helpModal')) return;
    
    // Play button click sound
    if (game) game.playSound('buttonClick');
    
    const modal = document.createElement('div');
    modal.id = 'helpModal';
    modal.style.position = 'absolute';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    modal.style.padding = '20px';
    modal.style.borderRadius = '10px';
    modal.style.zIndex = '200';
    modal.style.maxWidth = '80%';
    modal.style.maxHeight = '80%';
    modal.style.overflow = 'auto';
    modal.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    modal.style.border = '1px solid #444';
    
    modal.innerHTML = `
        <h2 style="color: #ff9900; margin-top: 0;">Game Help</h2>
        
        <h3 style="color: #00b8ff;">Controls:</h3>
        <ul>
            <li>Move paddle: Arrow keys or mouse</li>
            <li>Launch ball: Space bar or click/tap</li>
            <li>Pause game: P key or double tap</li>
            <li>Mute sound: M key</li>
        </ul>
        
        <h3 style="color: #00b8ff;">Power-ups:</h3>
        <ul>
            <li><span style="color: #ff4d4d;">♥</span> - Extra Life: Gives you an additional life</li>
            <li><span style="color: #4dff88;">↔</span> - Expand Paddle: Makes your paddle wider</li>
            <li><span style="color: #ffcc00;">↕</span> - Shrink Paddle: Makes your paddle narrower</li>
            <li><span style="color: #00b8ff;">↑</span> - Speed Ball: Increases ball speed</li>
            <li><span style="color: #cc66ff;">↓</span> - Slow Ball: Decreases ball speed</li>
            <li><span style="color: #ff9900;">●</span> - Multi Ball: Adds additional balls</li>
            <li><span style="color: #00cc99;">≡</span> - Sticky Paddle: Ball sticks to paddle</li>
            <li><span style="color: #ff66cc;">⚡</span> - Laser Paddle: Shoot lasers from paddle</li>
            <li><span style="color: #aaaaff;">◌</span> - Ghost Ball: Ball passes through bricks</li>
            <li><span style="color: #ff6600;">🔥</span> - Fire Ball: Destroys bricks in one hit</li>
            <li><span style="color: #ffff44;">×2</span> - Score Multiplier: Doubles your score</li>
        </ul>
        
        <h3 style="color: #00b8ff;">Tips:</h3>
        <ul>
            <li>Hit the ball with different parts of the paddle to control angle</li>
            <li>Try to keep multiple balls in play when you have Multi Ball</li>
            <li>Some bricks require multiple hits to break</li>
            <li>The game gets progressively harder with each level</li>
        </ul>
        
        <button id="closeHelpButton" style="
            background-color: #ff9900;
            color: #000;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
            display: block;
            margin: 20px auto 0;
        ">Close</button>
    `;
    
    document.getElementById('gameContainer').appendChild(modal);
    
    // Add close button event
    document.getElementById('closeHelpButton').addEventListener('click', function() {
        modal.remove();
        if (game) game.playSound('buttonClick');
    });
}

// Add help button
addHelpButton();

// Add high score functionality
let highScores = [];

// Load high scores from localStorage
function loadHighScores() {
    try {
        const savedScores = localStorage.getItem('brickBreakerHighScores');
        if (savedScores) {
            highScores = JSON.parse(savedScores);
        }
    } catch (e) {
        console.error('Error loading high scores:', e);
        highScores = [];
    }
}

// Save high scores to localStorage
function saveHighScores() {
    try {
        localStorage.setItem('brickBreakerHighScores', JSON.stringify(highScores));
    } catch (e) {
        console.error('Error saving high scores:', e);
    }
}

// Add score to high scores
function addHighScore(score) {
    // Load current high scores
    loadHighScores();
    
    // Add new score
    highScores.push({
        score: score,
        date: new Date().toISOString(),
        level: game.level
    });
    
    // Sort high scores
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    highScores = highScores.slice(0, 10);
    
    // Save high scores
    saveHighScores();
    
    // Return position in high scores
    return highScores.findIndex(s => s.score === score) + 1;
}

// Show high scores
function showHighScores() {
    // Load high scores
    loadHighScores();
    
    // Create high scores modal
    const modal = document.createElement('div');
    modal.id = 'highScoresModal';
    modal.style.position = 'absolute';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    modal.style.padding = '20px';
    modal.style.borderRadius = '10px';
    modal.style.zIndex = '200';
    modal.style.minWidth = '300px';
    modal.style.maxWidth = '80%';
    modal.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    modal.style.border = '1px solid #444';
    
    // Create high scores content
    let content = `
        <h2 style="color: #ff9900; margin-top: 0; text-align: center;">High Scores</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #444; color: #00b8ff;">Rank</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #444; color: #00b8ff;">Score</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #444; color: #00b8ff;">Level</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #444; color: #00b8ff;">Date</th>
            </tr>
    `;
    
    if (highScores.length === 0) {
        content += `
            <tr>
                <td colspan="4" style="padding: 20px; text-align: center; color: #ccc;">No high scores yet. Start playing!</td>
            </tr>
        `;
    } else {
        highScores.forEach((score, index) => {
            const date = new Date(score.date);
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            
            content += `
                <tr>
                    <td style="padding: 8px; text-align: center; border-bottom: 1px solid #333;">${index + 1}</td>
                    <td style="padding: 8px; text-align: center; border-bottom: 1px solid #333;">${score.score}</td>
                    <td style="padding: 8px; text-align: center; border-bottom: 1px solid #333;">${score.level || '-'}</td>
                    <td style="padding: 8px; text-align: center; border-bottom: 1px solid #333;">${formattedDate}</td>
                </tr>
            `;
        });
    }
    
    content += `
        </table>
        <button id="closeHighScoresButton" style="
            background-color: #ff9900;
            color: #000;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
            display: block;
            margin: 20px auto 0;
        ">Close</button>
    `;
    
    modal.innerHTML = content;
    
    document.getElementById('gameContainer').appendChild(modal);
    
    // Add close button event
    document.getElementById('closeHighScoresButton').addEventListener('click', function() {
        modal.remove();
        if (game) game.playSound('buttonClick');
    });
}

// Add high scores button to start screen
function addHighScoresButton() {
    const startScreen = document.getElementById('startScreen');
    
    // Check if button already exists
    if (document.getElementById('highScoresButton')) return;
    
    const button = document.createElement('button');
    button.id = 'highScoresButton';
    button.textContent = 'High Scores';
    button.style.marginTop = '10px';
    button.style.marginLeft = '10px';
    button.style.marginRight = '10px';
    
    // Insert before the start button
    const startButton = document.getElementById('startButton');
    startScreen.insertBefore(button, startButton);
    
    // Add event listener
    button.addEventListener('click', function() {
        showHighScores();
        if (game) game.playSound('buttonClick');
    });
}

// Add high scores button
addHighScoresButton();

// Override game over and victory methods to save high scores
const originalGameOver = Game.prototype.gameOver;
Game.prototype.gameOver = function() {
    // Call original method
    originalGameOver.call(this);
    
    // Add score to high scores
    const position = addHighScore(this.score);
    
    // Show high score position if in top 10
    if (position <= 10) {
        const finalScore = document.getElementById('finalScore');
        finalScore.textContent = `${this.score} (New High Score: #${position})`;
    }
};

const originalVictory = Game.prototype.victory;
Game.prototype.victory = function() {
    // Call original method
    originalVictory.call(this);
    
    // Add score to high scores
    const position = addHighScore(this.score);
    
    // Show high score position if in top 10
    if (position <= 10) {
        const victoryScore = document.getElementById('victoryScore');
        victoryScore.textContent = `${this.score} (New High Score: #${position})`;
    }
};
