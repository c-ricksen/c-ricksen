/**
 * Advanced Brick Breaker - Level System
 * levels.js - Defines game levels, layouts, and progression
 */

// Level system for Brick Breaker game
class LevelSystem {
    constructor(game) {
        this.game = game;
        this.currentLevel = 1;
        this.maxLevel = LEVELS.length;
        
        // Initialize level data
        this.initializeLevels();
    }
    
    initializeLevels() {
        // Set max level in game
        this.game.maxLevel = this.maxLevel;
        
        // Add level descriptions to DOM
        this.updateLevelDescriptions();
    }
    
    updateLevelDescriptions() {
        // Update level description in level screen
        const levelDescription = document.getElementById('levelDescription');
        if (levelDescription) {
            levelDescription.textContent = LEVELS[this.currentLevel - 1].description || 'Break all the bricks to advance!';
        }
    }
    
    loadLevel(levelNumber) {
        // Validate level number
        if (levelNumber < 1 || levelNumber > this.maxLevel) {
            console.error(`Invalid level number: ${levelNumber}`);
            return false;
        }
        
        // Update current level
        this.currentLevel = levelNumber;
        
        // Get level data
        const levelData = LEVELS[levelNumber - 1];
        
        // Clear existing bricks
        this.game.bricks = [];
        
        // Create bricks based on level layout
        this.createBricksFromLayout(levelData);
        
        // Apply level settings
        this.applyLevelSettings(levelData);
        
        // Update level description
        this.updateLevelDescriptions();
        
        // Apply visual theme
        this.applyVisualTheme(levelData.theme);
        
        return true;
    }
    
    createBricksFromLayout(levelData) {
        const layout = levelData.layout;
        const rows = layout.length;
        const cols = layout[0].length;
        
        // Calculate brick dimensions based on canvas size
        const brickWidth = (this.game.width - 40) / cols;
        const brickHeight = Math.min(30, (this.game.height * 0.5) / rows);
        const topMargin = 50;
        
        // Create bricks based on layout
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const brickCode = layout[row][col];
                
                // Skip empty spaces (0)
                if (brickCode === 0) continue;
                
                // Calculate brick position
                const brickX = col * brickWidth + 20;
                const brickY = row * brickHeight + topMargin;
                
                // Get brick properties based on code
                const brickProps = this.getBrickProperties(brickCode, levelData);
                
                // Create brick and add to game
                this.game.bricks.push(new Brick(
                    brickX,
                    brickY,
                    brickWidth - 4,
                    brickHeight - 4,
                    brickProps.health,
                    brickProps.points,
                    brickProps.color
                ));
            }
        }
    }
    
    getBrickProperties(code, levelData) {
        // Default properties
        let health = 1;
        let points = 10;
        let color = '#ff4d4d';
        
        // Check if level has custom brick types
        if (levelData.brickTypes && levelData.brickTypes[code]) {
            const brickType = levelData.brickTypes[code];
            health = brickType.health || health;
            points = brickType.points || points;
            color = brickType.color || color;
        } else {
            // Default brick types based on code
            switch (code) {
                case 1: // Basic brick
                    color = '#ff4d4d'; // Red
                    health = 1;
                    points = 10;
                    break;
                case 2: // Medium brick
                    color = '#ffcc00'; // Yellow
                    health = 2;
                    points = 20;
                    break;
                case 3: // Hard brick
                    color = '#4dff88'; // Green
                    health = 3;
                    points = 30;
                    break;
                case 4: // Super brick
                    color = '#00b8ff'; // Blue
                    health = 4;
                    points = 50;
                    break;
                case 5: // Ultra brick
                    color = '#cc66ff'; // Purple
                    health = 5;
                    points = 100;
                    break;
                default:
                    // For any other code, use basic brick
                    color = '#ffffff';
                    health = 1;
                    points = 10;
            }
        }
        
        // Apply level multipliers
        points *= (levelData.pointsMultiplier || 1);
        
        return { health, points, color };
    }
    
    applyLevelSettings(levelData) {
        // Apply ball speed
        if (levelData.ballSpeed) {
            this.game.ball.speed = levelData.ballSpeed;
        } else {
            // Default: increase speed with level
            this.game.ball.speed = Math.min(
                PHYSICS.BALL_SPEED_MIN + (this.currentLevel - 1) * 0.5,
                PHYSICS.BALL_SPEED_MAX
            );
        }
        
        // Apply paddle settings
        if (levelData.paddleWidth) {
            this.game.paddle.width = levelData.paddleWidth;
        } else {
            // Default paddle width (gets smaller in higher levels)
            const widthReduction = Math.min(0.3, (this.currentLevel - 1) * 0.05);
            this.game.paddle.width = this.game.width / 8 * (1 - widthReduction);
        }
        
        // Apply powerup settings
        if (levelData.powerupChance !== undefined) {
            this.game.powerupChance = levelData.powerupChance;
        } else {
            // Default powerup chance
            this.game.powerupChance = 0.1 + (this.currentLevel * 0.02);
        }
        
        // Apply any other level-specific settings
        if (levelData.gravity !== undefined) {
            PHYSICS.GRAVITY = levelData.gravity;
        }
        
        if (levelData.paddleSpeed !== undefined) {
            this.game.paddle.speed = levelData.paddleSpeed;
        }
    }
    
    applyVisualTheme(theme) {
        if (!theme) return;
        
        // Apply background colors
        const container = document.getElementById('gameContainer');
        if (container) {
            container.style.backgroundColor = theme.containerBg || '';
        }
        
        // Apply text colors
        const headings = document.querySelectorAll('h1, h2');
        if (headings && theme.headingColor) {
            headings.forEach(heading => {
                heading.style.color = theme.headingColor;
            });
        }
        
        // Apply UI colors
        const uiElements = document.querySelectorAll('.ui-element');
        if (uiElements && theme.uiColor) {
            uiElements.forEach(element => {
                element.style.color = theme.uiColor;
            });
        }
        
        // Store theme for use in rendering
        this.game.currentTheme = theme;
    }
    
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            return this.loadLevel(this.currentLevel);
        } else {
            return false; // No more levels
        }
    }
}

// Level definitions
const LEVELS = [
    // Level 1: Introduction
    {
        name: "Brick Basics",
        description: "Welcome to Brick Breaker! Break all the bricks to advance.",
        layout: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0]
        ],
        ballSpeed: 5,
        paddleWidth: 100,
        powerupChance: 0.1,
        pointsMultiplier: 1,
        theme: {
            containerBg: '#121212',
            headingColor: '#ff9900',
            uiColor: '#ffffff',
            backgroundColor: '#1a1a2e',
            backgroundGradient: ['#1a1a2e', '#16213e']
        }
    },
    
    // Level 2: Basic Patterns
    {
        name: "Pattern Play",
        description: "Different brick patterns require different strategies!",
        layout: [
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 2, 2, 2, 0, 1],
            [1, 0, 2, 0, 0, 2, 0, 1],
            [1, 0, 2, 2, 2, 2, 0, 1]
        ],
        ballSpeed: 5.5,
        paddleWidth: 90,
        powerupChance: 0.15,
        pointsMultiplier: 1.2,
        theme: {
            containerBg: '#121212',
            headingColor: '#4dff88',
            uiColor: '#ffffff',
            backgroundColor: '#0a2342',
            backgroundGradient: ['#0a2342', '#0e345a']
        }
    },
    
    // Level 3: Fortress
    {
        name: "Brick Fortress",
        description: "Some bricks take multiple hits to break!",
        layout: [
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 3, 0, 0, 3, 2, 1],
            [0, 1, 2, 2, 2, 2, 1, 0]
        ],
        brickTypes: {
            1: { health: 1, points: 10, color: '#ff4d4d' },
            2: { health: 2, points: 20, color: '#ffcc00' },
            3: { health: 3, points: 30, color: '#4dff88' }
        },
        ballSpeed: 6,
        paddleWidth: 85,
        powerupChance: 0.2,
        pointsMultiplier: 1.5,
        theme: {
            containerBg: '#121212',
            headingColor: '#ffcc00',
            uiColor: '#ffffff',
            backgroundColor: '#2c3e50',
            backgroundGradient: ['#2c3e50', '#1c2e40']
        }
    },
    
    // Level 4: Wall Defense
    {
        name: "Wall Defense",
        description: "Break through the defensive walls!",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        ballSpeed: 6.5,
        paddleWidth: 80,
        powerupChance: 0.25,
        pointsMultiplier: 1.8,
        theme: {
            containerBg: '#121212',
            headingColor: '#00b8ff',
            uiColor: '#ffffff',
            backgroundColor: '#34495e',
            backgroundGradient: ['#34495e', '#2c3e50']
        }
    },
    
    // Level 5: Diamond Challenge
    {
        name: "Diamond Challenge",
        description: "Can you break the diamond formation?",
        layout: [
            [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 2, 2, 2, 2, 1, 0, 0],
            [0, 1, 2, 3, 3, 3, 3, 2, 1, 0],
            [1, 2, 3, 4, 4, 4, 4, 3, 2, 1],
            [1, 2, 3, 4, 5, 5, 4, 3, 2, 1],
            [1, 2, 3, 4, 5, 5, 4, 3, 2, 1],
            [1, 2, 3, 4, 4, 4, 4, 3, 2, 1],
            [0, 1, 2, 3, 3, 3, 3, 2, 1, 0],
            [0, 0, 1, 2, 2, 2, 2, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 0, 0]
        ],
        ballSpeed: 7,
        paddleWidth: 75,
        powerupChance: 0.3,
        pointsMultiplier: 2,
        gravity: 0.1,
        theme: {
            containerBg: '#121212',
            headingColor: '#cc66ff',
            uiColor: '#ffffff',
            backgroundColor: '#16213e',
            backgroundGradient: ['#16213e', '#0a2342']
        }
    },
    
    // Level 6: Maze Runner
    {
        name: "Maze Runner",
        description: "Navigate the ball through this brick maze!",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 3, 3, 3, 3, 3, 3, 0, 1],
            [1, 0, 3, 0, 0, 0, 0, 3, 0, 1],
            [1, 0, 3, 0, 4, 4, 0, 3, 0, 1],
            [1, 0, 3, 0, 4, 4, 0, 3, 0, 1],
            [1, 0, 3, 0, 0, 0, 0, 3, 0, 1],
            [1, 0, 3, 3, 3, 3, 3, 3, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        ballSpeed: 7.5,
        paddleWidth: 70,
        powerupChance: 0.35,
        pointsMultiplier: 2.5,
        theme: {
            containerBg: '#121212',
            headingColor: '#4dff88',
            uiColor: '#ffffff',
            backgroundColor: '#1a472a',
            backgroundGradient: ['#1a472a', '#0d2818']
        }
    },
    
    // Level 7: Invader
    {
        name: "Space Invader",
        description: "Destroy the space invader before it reaches you!",
        layout: [
            [0, 0, 3, 0, 0, 0, 0, 3, 0, 0],
            [0, 0, 0, 3, 0, 0, 3, 0, 0, 0],
            [0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
            [0, 3, 0, 3, 3, 3, 3, 0, 3, 0],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 0, 3, 3, 3, 3, 3, 3, 0, 3],
            [3, 0, 3, 0, 0, 0, 0, 3, 0, 3],
            [0, 0, 0, 4, 0, 0, 4, 0, 0, 0]
        ],
        ballSpeed: 8,
        paddleWidth: 65,
        powerupChance: 0.4,
        pointsMultiplier: 3,
        theme: {
            containerBg: '#121212',
            headingColor: '#00b8ff',
            uiColor: '#ffffff',
            backgroundColor: '#000033',
            backgroundGradient: ['#000033', '#000022']
        }
    },
    
    // Level 8: Hard Fortress
    {
        name: "Impenetrable Fortress",
        description: "These bricks are tough! Can you break through?",
        layout: [
            [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            [4, 3, 3, 3, 3, 3, 3, 3, 3, 4],
            [4, 3, 2, 2, 2, 2, 2, 2, 3, 4],
            [4, 3, 2, 5, 5, 5, 5, 2, 3, 4],
            [4, 3, 2, 5, 0, 0, 5, 2, 3, 4],
            [4, 3, 2, 5, 0, 0, 5, 2, 3, 4],
            [4, 3, 2, 5, 5, 5, 5, 2, 3, 4],
            [4, 3, 2, 2, 2, 2, 2, 2, 3, 4],
            [4, 3, 3, 3, 3, 3, 3, 3, 3, 4],
            [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
        ],
        brickTypes: {
            2: { health: 2, points: 20, color: '#ffcc00' },
            3: { health: 3, points: 30, color: '#4dff88' },
            4: { health: 4, points: 40, color: '#00b8ff' },
            5: { health: 5, points: 100, color: '#cc66ff' }
        },
        ballSpeed: 8.5,
        paddleWidth: 60,
        powerupChance: 0.45,
        pointsMultiplier: 4,
        gravity: 0.15,
        theme: {
            containerBg: '#121212',
            headingColor: '#ff4d4d',
            uiColor: '#ffffff',
            backgroundColor: '#300a24',
            backgroundGradient: ['#300a24', '#200718']
        }
    },
    
    // Level 9: Zigzag Challenge
    {
        name: "Zigzag Challenge",
        description: "Navigate through the zigzag pattern!",
        layout: [
            [5, 0, 0, 0, 0, 0, 0, 0, 0, 5],
            [5, 4, 0, 0, 0, 0, 0, 0, 4, 5],
            [0, 5, 4, 0, 0, 0, 0, 4, 5, 0],
            [0, 0, 5, 4, 0, 0, 4, 5, 0, 0],
            [0, 0, 0, 5, 4, 4, 5, 0, 0, 0],
            [0, 0, 0, 5, 4, 4, 5, 0, 0, 0],
            [0, 0, 5, 4, 0, 0, 4, 5, 0, 0],
            [0, 5, 4, 0, 0, 0, 0, 4, 5, 0],
            [5, 4, 0, 0, 0, 0, 0, 0, 4, 5],
            [5, 0, 0, 0, 0, 0, 0, 0, 0, 5]
        ],
        ballSpeed: 9,
        paddleWidth: 55,
        powerupChance: 0.5,
        pointsMultiplier: 5,
        theme: {
            containerBg: '#121212',
            headingColor: '#ffcc00',
            uiColor: '#ffffff',
            backgroundColor: '#4a235a',
            backgroundGradient: ['#4a235a', '#3a1845']
        }
    },
    
    // Level 10: Final Challenge
    {
        name: "Ultimate Challenge",
        description: "The final test of your brick breaking skills!",
        layout: [
            [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
            [5, 4, 4, 4, 4, 4, 4, 4, 4, 5],
            [5, 4, 3, 3, 3, 3, 3, 3, 4, 5],
            [5, 4, 3, 2, 2, 2, 2, 3, 4, 5],
            [5, 4, 3, 2, 1, 1, 2, 3, 4, 5],
            [5, 4, 3, 2, 1, 1, 2, 3, 4, 5],
            [5, 4, 3, 2, 2, 2, 2, 3, 4, 5],
            [5, 4, 3, 3, 3, 3, 3, 3, 4, 5],
            [5, 4, 4, 4, 4, 4, 4, 4, 4, 5],
            [5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        ],
        ballSpeed: 10,
        paddleWidth: 50,
        powerupChance: 0.6,
        pointsMultiplier: 10,
        gravity: 0.2,
        paddleSpeed: 12,
        theme: {
            containerBg: '#121212',
            headingColor: '#ff9900',
            uiColor: '#ffffff',
            backgroundColor: '#1a1a2e',
            backgroundGradient: ['#1a1a2e', '#16213e']
        }
    }
];

// Initialize level system
function initLevelSystem(game) {
    // Create level system
    game.levelSystem = new LevelSystem(game);
    
    // Add level loading to game object
    game.loadLevel = function(levelNumber) {
        return this.levelSystem.loadLevel(levelNumber);
    };
    
    // Add next level function to game object
    game.nextLevel = function() {
        if (this.levelSystem.nextLevel()) {
            this.state = GAME_STATES.LEVEL_TRANSITION;
            document.getElementById('levelScreen').style.display = 'block';
        } else {
            this.victory();
        }
    };
    
    // Load first level
    game.loadLevel(1);
}
