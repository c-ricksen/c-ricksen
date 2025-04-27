/**
 * Advanced Brick Breaker - Powerup System
 * powerups.js - Defines powerup types, effects, and management
 */

// Powerup constants
const POWERUP_TYPES = {
    EXTRA_LIFE: {
        id: 'extraLife',
        name: 'Extra Life',
        color: '#ff4d4d',
        icon: '♥',
        duration: 0, // Instant effect
        probability: 0.05, // Rare
        stackable: false
    },
    EXPAND_PADDLE: {
        id: 'expandPaddle',
        name: 'Expand Paddle',
        color: '#4dff88',
        icon: '↔',
        duration: 15000, // 15 seconds
        probability: 0.15,
        stackable: true,
        maxStacks: 2
    },
    SHRINK_PADDLE: {
        id: 'shrinkPaddle',
        name: 'Shrink Paddle',
        color: '#ffcc00',
        icon: '↕',
        duration: 10000, // 10 seconds
        probability: 0.1,
        stackable: false,
        negative: true
    },
    SPEED_BALL: {
        id: 'speedBall',
        name: 'Speed Ball',
        color: '#00b8ff',
        icon: '↑',
        duration: 12000, // 12 seconds
        probability: 0.1,
        stackable: true,
        maxStacks: 2
    },
    SLOW_BALL: {
        id: 'slowBall',
        name: 'Slow Ball',
        color: '#cc66ff',
        icon: '↓',
        duration: 8000, // 8 seconds
        probability: 0.1,
        stackable: false
    },
    MULTI_BALL: {
        id: 'multiBall',
        name: 'Multi Ball',
        color: '#ff9900',
        icon: '●',
        duration: 0, // Instant effect
        probability: 0.1,
        stackable: false
    },
    STICKY_PADDLE: {
        id: 'stickyPaddle',
        name: 'Sticky Paddle',
        color: '#00cc99',
        icon: '≡',
        duration: 15000, // 15 seconds
        probability: 0.1,
        stackable: false
    },
    LASER_PADDLE: {
        id: 'laserPaddle',
        name: 'Laser Paddle',
        color: '#ff66cc',
        icon: '⚡',
        duration: 10000, // 10 seconds
        probability: 0.08,
        stackable: false
    },
    GHOST_BALL: {
        id: 'ghostBall',
        name: 'Ghost Ball',
        color: '#aaaaff',
        icon: '◌',
        duration: 8000, // 8 seconds
        probability: 0.08,
        stackable: false
    },
    FIRE_BALL: {
        id: 'fireBall',
        name: 'Fire Ball',
        color: '#ff6600',
        icon: '🔥',
        duration: 12000, // 12 seconds
        probability: 0.08,
        stackable: false
    },
    SCORE_MULTIPLIER: {
        id: 'scoreMultiplier',
        name: 'Score x2',
        color: '#ffff44',
        icon: '×2',
        duration: 20000, // 20 seconds
        probability: 0.06,
        stackable: true,
        maxStacks: 3
    }
};

// Powerup class - represents a single powerup instance
class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.typeInfo = POWERUP_TYPES[type];
        this.color = this.typeInfo.color;
        this.icon = this.typeInfo.icon;
        this.speed = 2;
        this.rotation = 0;
        this.active = false;
        this.startTime = 0;
        this.duration = this.typeInfo.duration;
        this.elapsedTime = 0;
        this.stacks = 1;
        this.pulsePhase = 0;
    }
    
    update(deltaTime) {
        // Update position if not active
        if (!this.active) {
            this.y += this.speed * deltaTime * 60;
            this.rotation += 2 * deltaTime;
            this.pulsePhase += 5 * deltaTime;
        } 
        // Update timer if active and has duration
        else if (this.duration > 0) {
            this.elapsedTime = Date.now() - this.startTime;
        }
    }
    
    isExpired() {
        return this.active && this.duration > 0 && this.elapsedTime >= this.duration;
    }
    
    getRemainingTime() {
        if (this.duration === 0) return 0;
        return Math.max(0, this.duration - this.elapsedTime);
    }
    
    getRemainingPercentage() {
        if (this.duration === 0) return 0;
        return Math.max(0, (this.duration - this.elapsedTime) / this.duration);
    }
    
    activate() {
        this.active = true;
        this.startTime = Date.now();
        this.elapsedTime = 0;
    }
    
    draw(ctx) {
        // Only draw if not active
        if (this.active) return;
        
        // Save context
        ctx.save();
        
        // Calculate pulse effect (0 to 1)
        const pulse = 0.8 + 0.2 * Math.sin(this.pulsePhase);
        
        // Move to center of powerup
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Rotate
        ctx.rotate(this.rotation);
        
        // Draw powerup background (circle)
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2 * pulse, 0, Math.PI * 2);
        
        // Create gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2 * pulse);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.adjustColor(this.color, -30));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw glow effect
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2 * pulse + 5, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}33`; // 20% opacity
        ctx.filter = 'blur(5px)';
        ctx.fill();
        ctx.filter = 'none';
        
        // Draw icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        // Restore context
        ctx.restore();
    }
    
    // Helper method to adjust color brightness
    adjustColor(color, amount) {
        // Convert hex to RGB
        let r = parseInt(color.substring(1, 3), 16);
        let g = parseInt(color.substring(3, 5), 16);
        let b = parseInt(color.substring(5, 7), 16);
        
        // Adjust color
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// PowerupSystem class - manages all powerups
class PowerupSystem {
    constructor(game) {
        this.game = game;
        this.powerups = []; // Falling powerups
        this.activePowerups = []; // Currently active powerups
        this.powerupChance = 0.2; // Base chance of spawning a powerup
        
        // Laser system properties
        this.lasers = [];
        this.laserCooldown = 0;
        
        // UI elements for active powerups
        this.powerupUI = document.createElement('div');
        this.powerupUI.id = 'powerupUI';
        this.powerupUI.style.position = 'absolute';
        this.powerupUI.style.top = '10px';
        this.powerupUI.style.right = '10px';
        this.powerupUI.style.display = 'flex';
        this.powerupUI.style.flexDirection = 'column';
        this.powerupUI.style.gap = '5px';
        this.powerupUI.style.zIndex = '100';
        document.getElementById('gameContainer').appendChild(this.powerupUI);
        
        // Initialize powerup system
        this.init();
    }
    
    init() {
        // Replace the game's spawnPowerup method
        this.game.spawnPowerup = this.spawnPowerup.bind(this);
        
        // Add powerup check to game's update method
        const originalUpdate = this.game.update;
        this.game.update = (deltaTime) => {
            originalUpdate.call(this.game, deltaTime);
            this.update(deltaTime);
        };
        
        // Add powerup rendering to game's render method
        const originalRender = this.game.render;
        this.game.render = () => {
            originalRender.call(this.game);
            this.render();
        };
    }
    
    update(deltaTime) {
        if (this.game.state !== GAME_STATES.PLAYING) return;
        
        // Update falling powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            // Update powerup
            powerup.update(deltaTime);
            
            // Check if powerup is caught by paddle
            if (this.checkPowerupPaddleCollision(powerup)) {
                // Apply powerup effect
                this.activatePowerup(powerup);
                
                // Remove powerup
                this.powerups.splice(i, 1);
                
                // Play sound
                this.game.playSound('powerup');
            }
            // Remove powerups that go off screen
            else if (powerup.y > this.game.height) {
                this.powerups.splice(i, 1);
            }
        }
        
        // Update active powerups
        for (let i = this.activePowerups.length - 1; i >= 0; i--) {
            const powerup = this.activePowerups[i];
            
            // Update powerup
            powerup.update(deltaTime);
            
            // Check if powerup is expired
            if (powerup.isExpired()) {
                // Remove powerup effect
                this.deactivatePowerup(powerup);
                
                // Remove powerup
                this.activePowerups.splice(i, 1);
                
                // Update UI
                this.updatePowerupUI();
            }
        }
        
        // Update lasers
        this.updateLasers(deltaTime);
    }
    
    render() {
        // Draw falling powerups
        this.powerups.forEach(powerup => {
            powerup.draw(this.game.ctx);
        });
        
        // Draw lasers
        this.renderLasers();
    }
    
    spawnPowerup(brick) {
        // Check if powerup should spawn
        if (Math.random() > this.getPowerupChance()) return;
        
        // Get available powerup types
        const availableTypes = this.getAvailablePowerupTypes();
        
        // Select random powerup type based on probability weights
        const selectedType = this.selectWeightedPowerupType(availableTypes);
        
        // Create powerup
        const powerup = new Powerup(
            brick.x + brick.width / 2 - 15,
            brick.y + brick.height / 2 - 15,
            selectedType
        );
        
        // Add to powerups array
        this.powerups.push(powerup);
    }
    
    getPowerupChance() {
        // Base chance modified by level
        let chance = this.powerupChance;
        
        // Increase chance based on level
        chance += (this.game.level - 1) * 0.02;
        
        // Increase chance if few powerups active
        if (this.activePowerups.length < 2) {
            chance += 0.1;
        }
        
        return Math.min(0.5, chance); // Cap at 50%
    }
    
    getAvailablePowerupTypes() {
        // Get all powerup types
        const allTypes = Object.keys(POWERUP_TYPES);
        
        // Filter based on game state
        return allTypes.filter(type => {
            const typeInfo = POWERUP_TYPES[type];
            
            // Don't spawn extra lives if at max lives
            if (type === 'EXTRA_LIFE' && this.game.lives >= 5) {
                return false;
            }
            
            // Don't spawn negative powerups if player has few lives
            if (typeInfo.negative && this.game.lives === 1) {
                return false;
            }
            
            // Don't spawn multi-ball if too many balls already
            if (type === 'MULTI_BALL' && this.game.balls && this.game.balls.length >= 4) {
                return false;
            }
            
            return true;
        });
    }
    
    selectWeightedPowerupType(availableTypes) {
        // Calculate total probability
        let totalProbability = 0;
        availableTypes.forEach(type => {
            totalProbability += POWERUP_TYPES[type].probability;
        });
        
        // Select random powerup based on probability
        let random = Math.random() * totalProbability;
        let cumulativeProbability = 0;
        
        for (const type of availableTypes) {
            cumulativeProbability += POWERUP_TYPES[type].probability;
            if (random <= cumulativeProbability) {
                return type;
            }
        }
        
        // Fallback to first type
        return availableTypes[0];
    }
    
    checkPowerupPaddleCollision(powerup) {
        return (
            powerup.x + powerup.width > this.game.paddle.x &&
            powerup.x < this.game.paddle.x + this.game.paddle.width &&
            powerup.y + powerup.height > this.game.paddle.y &&
            powerup.y < this.game.paddle.y + this.game.paddle.height
        );
    }
    
    activatePowerup(powerup) {
        // Check if this powerup type is already active
        const existingPowerup = this.activePowerups.find(p => p.type === powerup.type);
        
        if (existingPowerup && POWERUP_TYPES[powerup.type].stackable) {
            // Stack powerup if stackable
            const maxStacks = POWERUP_TYPES[powerup.type].maxStacks || 1;
            if (existingPowerup.stacks < maxStacks) {
                existingPowerup.stacks++;
                // Reset duration
                existingPowerup.startTime = Date.now();
                existingPowerup.elapsedTime = 0;
            }
        } else if (!existingPowerup) {
            // Activate new powerup
            powerup.activate();
            this.activePowerups.push(powerup);
            
            // Apply powerup effect
            this.applyPowerupEffect(powerup);
        }
        
        // Update UI
        this.updatePowerupUI();
    }
    
    deactivatePowerup(powerup) {
        // Remove powerup effect
        this.removePowerupEffect(powerup);
        
        // Show expiration animation
        this.showPowerupExpiration(powerup);
    }
    
    applyPowerupEffect(powerup) {
        switch (powerup.type) {
            case 'EXTRA_LIFE':
                this.game.lives = Math.min(5, this.game.lives + 1);
                this.game.updateUI();
                // Show animation
                document.getElementById('lives').classList.add('score-up');
                setTimeout(() => {
                    document.getElementById('lives').classList.remove('score-up');
                }, 500);
                break;
                
            case 'EXPAND_PADDLE':
                // Expand paddle by 30% per stack
                const expandFactor = 1.3 * powerup.stacks;
                this.game.paddle.width = Math.min(
                    this.game.width / 3, // Max 1/3 of screen
                    this.game.paddle.width * expandFactor
                );
                break;
                
            case 'SHRINK_PADDLE':
                // Shrink paddle by 30%
                this.game.paddle.width = Math.max(
                    40, // Min width
                    this.game.paddle.width * 0.7
                );
                break;
                
            case 'SPEED_BALL':
                // Increase ball speed by 20% per stack
                const speedFactor = 1.2 * powerup.stacks;
                if (this.game.balls) {
                    // Multi-ball mode
                    this.game.balls.forEach(ball => {
                        ball.speed = Math.min(
                            PHYSICS.BALL_SPEED_MAX,
                            ball.speed * speedFactor
                        );
                    });
                } else {
                    // Single ball
                    this.game.ball.speed = Math.min(
                        PHYSICS.BALL_SPEED_MAX,
                        this.game.ball.speed * speedFactor
                    );
                }
                break;
                
            case 'SLOW_BALL':
                // Decrease ball speed by 30%
                if (this.game.balls) {
                    // Multi-ball mode
                    this.game.balls.forEach(ball => {
                        ball.speed = Math.max(
                            PHYSICS.BALL_SPEED_MIN,
                            ball.speed * 0.7
                        );
                    });
                } else {
                    // Single ball
                    this.game.ball.speed = Math.max(
                        PHYSICS.BALL_SPEED_MIN,
                        this.game.ball.speed * 0.7
                    );
                }
                break;
                
            case 'MULTI_BALL':
                this.activateMultiBall();
                break;
                
            case 'STICKY_PADDLE':
                this.game.stickyPaddle = true;
                break;
                
            case 'LASER_PADDLE':
                this.game.laserPaddle = true;
                break;
                
            case 'GHOST_BALL':
                if (this.game.balls) {
                    this.game.balls.forEach(ball => {
                        ball.ghostMode = true;
                    });
                } else {
                    this.game.ball.ghostMode = true;
                }
                break;
                
            case 'FIRE_BALL':
                if (this.game.balls) {
                    this.game.balls.forEach(ball => {
                        ball.fireMode = true;
                    });
                } else {
                    this.game.ball.fireMode = true;
                }
                break;
                
            case 'SCORE_MULTIPLIER':
                // Multiply score by 2 per stack (up to x6)
                this.game.scoreMultiplier = Math.min(6, 2 * powerup.stacks);
                break;
        }
    }
    
    removePowerupEffect(powerup) {
        switch (powerup.type) {
            case 'EXPAND_PADDLE':
                // Reset paddle width
                this.game.paddle.width = this.game.width / 8;
                break;
                
            case 'SHRINK_PADDLE':
                // Reset paddle width
                this.game.paddle.width = this.game.width / 8;
                break;
                
            case 'SPEED_BALL':
                // Reset ball speed
                if (this.game.balls) {
                    this.game.balls.forEach(ball => {
                        ball.speed = PHYSICS.BALL_SPEED_MIN + (this.game.level - 1) * 0.5;
                    });
                } else {
                    this.game.ball.speed = PHYSICS.BALL_SPEED_MIN + (this.game.level - 1) * 0.5;
                }
                break;
                
            case 'SLOW_BALL':
                // Reset ball speed
                if (this.game.balls) {
                    this.game.balls.forEach(ball => {
                        ball.speed = PHYSICS.BALL_SPEED_MIN + (this.game.level - 1) * 0.5;
                    });
                } else {
                    this.game.ball.speed = PHYSICS.BALL_SPEED_MIN + (this.game.level - 1) * 0.5;
                }
                break;
                
            case 'STICKY_PADDLE':
                this.game.stickyPaddle = false;
                break;
                
            case 'LASER_PADDLE':
                this.game.laserPaddle = false;
                break;
                
            case 'GHOST_BALL':
                if (this.game.balls) {
                    this.game.balls.forEach(ball => {
                        ball.ghostMode = false;
                    });
                } else {
                    this.game.ball.ghostMode = false;
                }
                break;
                
            case 'FIRE_BALL':
                if (this.game.balls) {
                    this.game.balls.forEach(ball => {
                        ball.fireMode = false;
                    });
                } else {
                    this.game.ball.fireMode = false;
                }
                break;
                
            case 'SCORE_MULTIPLIER':
                this.game.scoreMultiplier = 1;
                break;
        }
    }
    
    activateMultiBall() {
        // If we already have a ball array, add to it
        if (this.game.balls) {
            const ballCount = this.game.balls.length;
            
            // Add 2 more balls
            for (let i = 0; i < 2; i++) {
                // Clone properties from a random existing ball
                const sourceBall = this.game.balls[Math.floor(Math.random() * ballCount)];
                
                // Create new ball with slight angle variation
                const angle = Math.random() * Math.PI * 2;
                const newBall = new Ball(sourceBall.x, sourceBall.y, sourceBall.radius);
                newBall.speed = sourceBall.speed;
                newBall.dx = Math.cos(angle) * newBall.speed;
                newBall.dy = Math.sin(angle) * newBall.speed;
                newBall.attached = false;
                
                // Copy special properties
                if (sourceBall.ghostMode) newBall.ghostMode = true;
                if (sourceBall.fireMode) newBall.fireMode = true;
                
                // Add to ball array
                this.game.balls.push(newBall);
            }
        } 
        // First multi-ball activation - convert single ball to array
        else {
            // Create ball array with existing ball
            this.game.balls = [this.game.ball];
            
            // Add 2 more balls
            for (let i = 0; i < 2; i++) {
                // Create new ball with different angle
                const angle = Math.PI * 1.5 + (Math.random() * Math.PI - Math.PI/2);
                const newBall = new Ball(this.game.ball.x, this.game.ball.y, this.game.ball.radius);
                newBall.speed = this.game.ball.speed;
                newBall.dx = Math.cos(angle) * newBall.speed;
                newBall.dy = Math.sin(angle) * newBall.speed;
                newBall.attached = false;
                
                // Copy special properties
                if (this.game.ball.ghostMode) newBall.ghostMode = true;
                if (this.game.ball.fireMode) newBall.fireMode = true;
                
                // Add to ball array
                this.game.balls.push(newBall);
            }
            
            // Override game methods to handle multiple balls
            this.setupMultiBallMode();
        }
    }
    
    setupMultiBallMode() {
        // Store original update method
        const originalUpdate = this.game.update;
        
        // Override update method to handle multiple balls
        this.game.update = function(deltaTime) {
            if (this.state !== GAME_STATES.PLAYING) return;
            
            // Update paddle position
            this.updatePaddlePosition();
            
            // Update all balls
            for (let i = this.balls.length - 1; i >= 0; i--) {
                const ball = this.balls[i];
                
                if (ball.attached) {
                    // Keep ball attached to paddle
                    ball.x = this.paddle.x + ball.attachedOffset;
                    ball.y = this.paddle.y - ball.radius - 1;
                    
                    // Launch ball on space or click
                    if (this.keys[' '] || this.keys['Enter']) {
                        ball.attached = false;
                        this.keys[' '] = false;
                        this.keys['Enter'] = false;
                    }
                } else {
                    // Move ball
                    ball.update(deltaTime);
                    
                    // Check for collisions
                    this.checkBallCollisions(ball, i);
                }
            }
            
            // Check if all balls are lost
            if (this.balls.length === 0) {
                this.loseLife();
                
                // Revert to single ball mode
                this.balls = null;
                this.ball = new Ball(this.width / 2, this.height - 100, 10);
                this.ball.attached = true;
                this.ball.attachedOffset = this.paddle.width / 2;
                
                // Restore original update method
                this.update = originalUpdate;
            }
            
            // Update powerups
            this.powerupSystem.update(deltaTime);
            
            // Check if level is completed
            if (this.bricks.length === 0) {
                this.nextLevel();
            }
        };
        
        // Store original checkCollisions method
        const originalCheckCollisions = this.game.checkCollisions;
        
        // Create new method to check collisions for a specific ball
        this.game.checkBallCollisions = function(ball, ballIndex) {
            // Ball-Wall collisions
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.dx = -ball.dx * PHYSICS.EDGE_BOUNCE_DAMPENING;
                this.playSound('wallHit');
            } else if (ball.x + ball.radius > this.width) {
                ball.x = this.width - ball.radius;
                ball.dx = -ball.dx * PHYSICS.EDGE_BOUNCE_DAMPENING;
                this.playSound('wallHit');
            }
            
            // Top wall
            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.dy = -ball.dy * PHYSICS.EDGE_BOUNCE_DAMPENING;
                this.playSound('wallHit');
            }
            
            // Bottom - lose ball
            if (ball.y + ball.radius > this.height) {
                // Remove this ball
                this.balls.splice(ballIndex, 1);
                this.playSound('loseLife');
                return;
            }
            
            // Ball-Paddle collisions
            if (
                ball.y + ball.radius > this.paddle.y &&
                ball.y - ball.radius < this.paddle.y + this.paddle.height &&
                ball.x + ball.radius > this.paddle.x &&
                ball.x - ball.radius < this.paddle.x + this.paddle.width
            ) {
                // Calculate where on the paddle the ball hit (0 to 1)
                const hitPosition = (ball.x - this.paddle.x) / this.paddle.width;
                
                // If sticky paddle is active, attach the ball
                if (this.stickyPaddle) {
                    ball.attached = true;
                    ball.attachedOffset = ball.x - this.paddle.x;
                    return;
                }
                
                // Calculate new angle based on hit position
                const angle = Math.PI * (1.5 - (hitPosition - 0.5) * PHYSICS.PADDLE_BOUNCE_INFLUENCE);
                
                // Set new velocity
                const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                ball.dx = Math.cos(angle) * speed;
                ball.dy = Math.sin(angle) * speed;
                
                // Ensure ball is above paddle
                ball.y = this.paddle.y - ball.radius;
                
                // Slightly increase ball speed
                ball.speed = Math.min(
                    ball.speed + PHYSICS.BALL_SPEED_INCREMENT,
                    PHYSICS.BALL_SPEED_MAX
                );
                
                // Play sound
                this.playSound('paddleHit');
            }
            
            // Ball-Brick collisions
            for (let i = this.bricks.length - 1; i >= 0; i--) {
                const brick = this.bricks[i];
                
                if (this.checkBallBrickCollision(ball, brick)) {
                    // Ghost ball passes through bricks without bouncing
                    if (ball.ghostMode) {
                        // Damage the brick without changing ball direction
                        brick.health--;
                        
                        // If brick is destroyed
                        if (brick.health <= 0) {
                            // Add score
                            this.score += brick.points * (this.scoreMultiplier || 1);
                            
                            // Chance to spawn powerup
                            this.spawnPowerup(brick);
                            
                            // Remove brick
                            this.bricks.splice(i, 1);
                            
                            // Play sound
                            this.playSound('brickDestroy');
                        } else {
                            // Play sound for hit but not destroyed
                            this.playSound('brickHit');
                        }
                    }
                    // Fire ball always destroys bricks in one hit
                    else if (ball.fireMode) {
                        // Add score
                        this.score += brick.points * (this.scoreMultiplier || 1);
                        
                        // Chance to spawn powerup
                        this.spawnPowerup(brick);
                        
                        // Remove brick
                        this.bricks.splice(i, 1);
                        
                        // Play sound
                        this.playSound('brickDestroy');
                        
                        // Don't change ball direction
                    }
                    // Normal ball collision
                    else {
                        // Damage the brick
                        brick.health--;
                        
                        // If brick is destroyed
                        if (brick.health <= 0) {
                            // Add score
                            this.score += brick.points * (this.scoreMultiplier || 1);
                            
                            // Chance to spawn powerup
                            this.spawnPowerup(brick);
                            
                            // Remove brick
                            this.bricks.splice(i, 1);
                            
                            // Play sound
                            this.playSound('brickDestroy');
                        } else {
                            // Play sound for hit but not destroyed
                            this.playSound('brickHit');
                        }
                    }
                    
                    // Update UI
                    this.updateUI();
                }
            }
        };
        
        // Store original render method
        const originalRender = this.game.render;
        
        // Override render method to draw multiple balls
        this.game.render = function() {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Draw background
            this.drawBackground();
            
            // Draw paddle
            this.paddle.draw(this.ctx);
            
            // Draw all balls
            if (this.balls) {
                this.balls.forEach(ball => ball.draw(this.ctx));
            } else {
                this.ball.draw(this.ctx);
            }
            
            // Draw bricks
            this.bricks.forEach(brick => brick.draw(this.ctx));
            
            // Draw powerups
            this.powerupSystem.render();
            
            // Draw pause overlay if paused
            if (this.state === GAME_STATES.PAUSED) {
                this.drawPauseOverlay();
            }
        };
    }
    
    updatePowerupUI() {
        // Clear existing UI
        this.powerupUI.innerHTML = '';
        
        // Add active powerups to UI
        this.activePowerups.forEach(powerup => {
            if (powerup.duration === 0) return; // Skip instant powerups
            
            // Create powerup element
            const powerupElement = document.createElement('div');
            powerupElement.className = 'active-powerup';
            powerupElement.style.display = 'flex';
            powerupElement.style.alignItems = 'center';
            powerupElement.style.marginBottom = '5px';
            powerupElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            powerupElement.style.borderRadius = '5px';
            powerupElement.style.padding = '5px';
            powerupElement.style.border = `1px solid ${powerup.color}`;
            
            // Icon
            const iconElement = document.createElement('div');
            iconElement.className = 'powerup-icon';
            iconElement.style.width = '20px';
            iconElement.style.height = '20px';
            iconElement.style.borderRadius = '50%';
            iconElement.style.backgroundColor = powerup.color;
            iconElement.style.display = 'flex';
            iconElement.style.justifyContent = 'center';
            iconElement.style.alignItems = 'center';
            iconElement.style.marginRight = '5px';
            iconElement.style.fontSize = '12px';
            iconElement.textContent = powerup.icon;
            
            // Name
            const nameElement = document.createElement('div');
            nameElement.className = 'powerup-name';
            nameElement.style.color = '#ffffff';
            nameElement.style.marginRight = '5px';
            nameElement.style.fontSize = '12px';
            nameElement.textContent = POWERUP_TYPES[powerup.type].name;
            
            // Stacks (if applicable)
            if (powerup.stacks > 1) {
                nameElement.textContent += ` x${powerup.stacks}`;
            }
            
            // Timer bar
            const timerContainer = document.createElement('div');
            timerContainer.className = 'powerup-timer-container';
            timerContainer.style.flex = '1';
            timerContainer.style.height = '5px';
            timerContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            timerContainer.style.borderRadius = '2px';
            timerContainer.style.overflow = 'hidden';
            
            const timerBar = document.createElement('div');
            timerBar.className = 'powerup-timer-bar';
            timerBar.style.height = '100%';
            timerBar.style.width = `${powerup.getRemainingPercentage() * 100}%`;
            timerBar.style.backgroundColor = powerup.color;
            timerBar.style.transition = 'width 1s linear';
            
            // Assemble elements
            timerContainer.appendChild(timerBar);
            powerupElement.appendChild(iconElement);
            powerupElement.appendChild(nameElement);
            powerupElement.appendChild(timerContainer);
            
            // Add to UI
            this.powerupUI.appendChild(powerupElement);
            
            // Start timer animation
            setTimeout(() => {
                timerBar.style.width = '0%';
                timerBar.style.transitionDuration = `${powerup.getRemainingTime() / 1000}s`;
            }, 50);
        });
    }
    
    showPowerupExpiration(powerup) {
        // Create floating text
        const text = document.createElement('div');
        text.className = 'powerup-expiration';
        text.textContent = `${POWERUP_TYPES[powerup.type].name} expired!`;
        text.style.position = 'absolute';
        text.style.left = '50%';
        text.style.top = '30%';
        text.style.transform = 'translate(-50%, -50%)';
        text.style.color = powerup.color;
        text.style.fontSize = '20px';
        text.style.fontWeight = 'bold';
        text.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
        text.style.opacity = '1';
        text.style.transition = 'all 1s ease-out';
        text.style.pointerEvents = 'none';
        text.style.zIndex = '1000';
        
        // Add to game container
        document.getElementById('gameContainer').appendChild(text);
        
        // Animate and remove
        setTimeout(() => {
            text.style.opacity = '0';
            text.style.top = '20%';
            setTimeout(() => {
                text.remove();
            }, 1000);
        }, 100);
    }
    
    // Laser system methods
    updateLasers(deltaTime) {
        // Update laser cooldown
        if (this.laserCooldown > 0) {
            this.laserCooldown -= deltaTime;
        }
        
        // Fire lasers if laser paddle is active
        if (this.game.laserPaddle && this.game.state === GAME_STATES.PLAYING) {
            // Fire on spacebar or automatically every second
            if ((this.game.keys[' '] || this.laserCooldown <= 0) && this.game.state === GAME_STATES.PLAYING) {
                this.fireLaser();
                this.game.keys[' '] = false;
                this.laserCooldown = 0.5; // 0.5 second cooldown
            }
        }
        
        // Update existing lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            
            // Move laser up
            laser.y -= laser.speed * deltaTime * 60;
            
            // Check for collisions with bricks
            this.checkLaserBrickCollisions(laser, i);
            
            // Remove lasers that go off screen
            if (laser.y + laser.height < 0) {
                this.lasers.splice(i, 1);
            }
        }
    }
    
    fireLaser() {
        // Create two lasers at the edges of the paddle
        const laserWidth = 5;
        const laserHeight = 15;
        
        // Left laser
        this.lasers.push({
            x: this.game.paddle.x + 10,
            y: this.game.paddle.y - laserHeight,
            width: laserWidth,
            height: laserHeight,
            speed: 10,
            color: '#ff66cc'
        });
        
        // Right laser
        this.lasers.push({
            x: this.game.paddle.x + this.game.paddle.width - 10 - laserWidth,
            y: this.game.paddle.y - laserHeight,
            width: laserWidth,
            height: laserHeight,
            speed: 10,
            color: '#ff66cc'
        });
        
        // Play sound
        this.game.playSound('laser');
    }
    
    checkLaserBrickCollisions(laser, laserIndex) {
        for (let i = this.game.bricks.length - 1; i >= 0; i--) {
            const brick = this.game.bricks[i];
            
            // Check for collision
            if (
                laser.x < brick.x + brick.width &&
                laser.x + laser.width > brick.x &&
                laser.y < brick.y + brick.height &&
                laser.y + laser.height > brick.y
            ) {
                // Damage brick
                brick.health--;
                
                // If brick is destroyed
                if (brick.health <= 0) {
                    // Add score
                    this.game.score += brick.points * (this.game.scoreMultiplier || 1);
                    
                    // Chance to spawn powerup
                    this.spawnPowerup(brick);
                    
                    // Remove brick
                    this.game.bricks.splice(i, 1);
                    
                    // Play sound
                    this.game.playSound('brickDestroy');
                } else {
                    // Play sound for hit but not destroyed
                    this.game.playSound('brickHit');
                }
                
                // Remove laser
                this.lasers.splice(laserIndex, 1);
                
                // Update UI
                this.game.updateUI();
                
                // Break out of loop since laser is removed
                break;
            }
        }
    }
    
    renderLasers() {
        const ctx = this.game.ctx;
        
        // Draw each laser
        this.lasers.forEach(laser => {
            // Create gradient
            const gradient = ctx.createLinearGradient(
                laser.x,
                laser.y,
                laser.x + laser.width,
                laser.y + laser.height
            );
            gradient.addColorStop(0, '#ff66cc');
            gradient.addColorStop(1, '#ff99ee');
            
            // Draw laser beam
            ctx.fillStyle = gradient;
            ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
            
            // Draw glow effect
            ctx.save();
            ctx.shadowColor = '#ff66cc';
            ctx.shadowBlur = 10;
            ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
            ctx.restore();
        });
    }
}

// Initialize powerup system
function initPowerupSystem(game) {
    // Create powerup system
    game.powerupSystem = new PowerupSystem(game);
    
    // Add default properties
    game.scoreMultiplier = 1;
    game.stickyPaddle = false;
    game.laserPaddle = false;
    
    // Enhance Ball class to support special modes
    const originalBallDraw = game.ball.draw;
    game.ball.draw = function(ctx) {
        // Call original draw method
        originalBallDraw.call(this, ctx);
        
        // Add visual effects for special modes
        if (this.ghostMode) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(170, 170, 255, 0.3)';
            ctx.fill();
            ctx.restore();
        }
        
        if (this.fireMode) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            
            // Draw flame effect
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const distance = this.radius + 3;
                const x = this.x + Math.cos(angle) * distance;
                const y = this.y + Math.sin(angle) * distance;
                
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(x, y);
                ctx.strokeStyle = '#ff6600';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            ctx.restore();
        }
    };
}
