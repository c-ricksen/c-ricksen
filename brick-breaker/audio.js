/**
 * Advanced Brick Breaker - Audio System
 * audio.js - Handles all game audio, sound effects, and music
 */

// Audio constants
const AUDIO_SETTINGS = {
    MASTER_VOLUME: 0.7,
    MUSIC_VOLUME: 0.5,
    SFX_VOLUME: 0.8,
    FADE_DURATION: 1000, // ms
};

// Sound file paths - would be replaced with actual file paths in production
const SOUND_FILES = {
    // Background music
    music: {
        menu: 'sounds/music/menu.mp3',
        gameplay: 'sounds/music/gameplay.mp3',
        boss: 'sounds/music/boss.mp3',
        victory: 'sounds/music/victory.mp3',
        gameOver: 'sounds/music/game_over.mp3',
    },
    // Sound effects
    sfx: {
        // UI sounds
        buttonClick: 'sounds/sfx/button_click.mp3',
        menuSelect: 'sounds/sfx/menu_select.mp3',
        pause: 'sounds/sfx/pause.mp3',
        
        // Gameplay sounds
        paddleHit: 'sounds/sfx/paddle_hit.mp3',
        wallHit: 'sounds/sfx/wall_hit.mp3',
        brickHit: 'sounds/sfx/brick_hit.mp3',
        brickDestroy: 'sounds/sfx/brick_destroy.mp3',
        loseLife: 'sounds/sfx/lose_life.mp3',
        gameStart: 'sounds/sfx/game_start.mp3',
        levelComplete: 'sounds/sfx/level_complete.mp3',
        
        // Powerup sounds
        powerup: 'sounds/sfx/powerup.mp3',
        extraLife: 'sounds/sfx/extra_life.mp3',
        expandPaddle: 'sounds/sfx/expand_paddle.mp3',
        shrinkPaddle: 'sounds/sfx/shrink_paddle.mp3',
        speedBall: 'sounds/sfx/speed_ball.mp3',
        slowBall: 'sounds/sfx/slow_ball.mp3',
        multiBall: 'sounds/sfx/multi_ball.mp3',
        stickyPaddle: 'sounds/sfx/sticky_paddle.mp3',
        laserPaddle: 'sounds/sfx/laser_paddle.mp3',
        ghostBall: 'sounds/sfx/ghost_ball.mp3',
        fireBall: 'sounds/sfx/fire_ball.mp3',
        scoreMultiplier: 'sounds/sfx/score_multiplier.mp3',
        laser: 'sounds/sfx/laser.mp3',
    }
};

// AudioSystem class - manages all game audio
class AudioSystem {
    constructor(game) {
        this.game = game;
        
        // Audio context
        this.context = null;
        
        // Audio settings
        this.masterVolume = AUDIO_SETTINGS.MASTER_VOLUME;
        this.musicVolume = AUDIO_SETTINGS.MUSIC_VOLUME;
        this.sfxVolume = AUDIO_SETTINGS.SFX_VOLUME;
        this.muted = false;
        
        // Audio elements
        this.music = {};
        this.sfx = {};
        this.currentMusic = null;
        
        // Volume nodes
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        // Initialize audio system
        this.init();
        
        // Create UI for audio controls
        this.createAudioUI();
    }
    
    init() {
        // Check if Web Audio API is supported
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            // Create gain nodes
            this.masterGain = this.context.createGain();
            this.musicGain = this.context.createGain();
            this.sfxGain = this.context.createGain();
            
            // Connect nodes
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);
            
            // Set initial volumes
            this.masterGain.gain.value = this.masterVolume;
            this.musicGain.gain.value = this.musicVolume;
            this.sfxGain.gain.value = this.sfxVolume;
            
            // Load audio files
            this.preloadAudio();
            
            // Replace game's playSound method
            this.game.playSound = this.playSound.bind(this);
            
            console.log('Audio system initialized');
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
            
            // Fallback to basic Audio elements without the Web Audio API
            this.useFallbackAudio();
        }
    }
    
    useFallbackAudio() {
        // Simple fallback for browsers without Web Audio API
        console.log('Using fallback audio system');
        
        // Replace game's playSound method with a simpler version
        this.game.playSound = (soundId) => {
            if (this.muted) return;
            
            // Find the corresponding sound file
            let soundPath = null;
            for (const category in SOUND_FILES) {
                if (SOUND_FILES[category][soundId]) {
                    soundPath = SOUND_FILES[category][soundId];
                    break;
                }
            }
            
            if (!soundPath) return;
            
            // Play using basic Audio element
            const audio = new Audio(soundPath);
            audio.volume = this.masterVolume * (category === 'music' ? this.musicVolume : this.sfxVolume);
            audio.play().catch(e => console.error('Error playing sound:', e));
        };
    }
    
    preloadAudio() {
        // Preload music
        for (const [key, path] of Object.entries(SOUND_FILES.music)) {
            this.loadAudio(path, 'music', key);
        }
        
        // Preload sound effects
        for (const [key, path] of Object.entries(SOUND_FILES.sfx)) {
            this.loadAudio(path, 'sfx', key);
        }
    }
    
    loadAudio(url, type, id) {
        // Create a placeholder for this sound
        if (type === 'music') {
            this.music[id] = { buffer: null, source: null, loaded: false };
        } else {
            this.sfx[id] = { buffer: null, loaded: false };
        }
        
        // In development mode, we'll just create dummy buffers
        // In production, we would load actual files with fetch or XMLHttpRequest
        if (url.startsWith('sounds/')) {
            console.log(`Development mode: Creating dummy buffer for ${id}`);
            
            // Create a dummy oscillator buffer
            const sampleRate = this.context.sampleRate;
            const buffer = this.context.createBuffer(2, sampleRate * 2, sampleRate);
            
            // Fill buffer with simple sine wave
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                const data = buffer.getChannelData(channel);
                const frequency = 440 * (1 + channel * 0.5); // A4 for channel 0, higher for channel 1
                
                for (let i = 0; i < buffer.length; i++) {
                    // Simple sine wave with fade out
                    const t = i / sampleRate;
                    const fadeOut = 1 - (i / buffer.length);
                    data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.5 * fadeOut;
                }
            }
            
            // Store the buffer
            if (type === 'music') {
                this.music[id].buffer = buffer;
                this.music[id].loaded = true;
            } else {
                this.sfx[id].buffer = buffer;
                this.sfx[id].loaded = true;
            }
            
            return;
        }
        
        // In production, we would load actual audio files
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                if (type === 'music') {
                    this.music[id].buffer = audioBuffer;
                    this.music[id].loaded = true;
                } else {
                    this.sfx[id].buffer = audioBuffer;
                    this.sfx[id].loaded = true;
                }
                console.log(`Loaded audio: ${id}`);
            })
            .catch(error => {
                console.error(`Error loading audio ${id}:`, error);
            });
    }
    
    playSound(soundId, options = {}) {
        // Skip if audio is muted or context is not available
        if (this.muted || !this.context) return;
        
        // Resume audio context if it's suspended (needed for Chrome's autoplay policy)
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        
        // Check if we have a specific powerup sound, otherwise use generic powerup sound
        if (soundId.startsWith('powerup_')) {
            const powerupType = soundId.split('_')[1];
            soundId = this.sfx[powerupType] ? powerupType : 'powerup';
        }
        
        // Find the sound in our collections
        if (this.sfx[soundId] && this.sfx[soundId].loaded) {
            // Create audio source
            const source = this.context.createBufferSource();
            source.buffer = this.sfx[soundId].buffer;
            
            // Create gain node for this specific sound
            const gainNode = this.context.createGain();
            gainNode.gain.value = options.volume !== undefined ? options.volume : 1;
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            // Play sound
            source.start(0);
            
            return source;
        } else {
            console.warn(`Sound not found or not loaded: ${soundId}`);
        }
    }
    
    playMusic(musicId, options = {}) {
        // Skip if audio is muted or context is not available
        if (this.muted || !this.context) return;
        
        // Resume audio context if it's suspended
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        
        // Stop current music if any
        if (this.currentMusic) {
            this.stopMusic(options.fadeOut !== false);
        }
        
        // Find the music in our collection
        if (this.music[musicId] && this.music[musicId].loaded) {
            // Create audio source
            const source = this.context.createBufferSource();
            source.buffer = this.music[musicId].buffer;
            
            // Set loop if requested
            source.loop = options.loop !== false;
            
            // Create gain node for this specific music
            const gainNode = this.context.createGain();
            
            // Fade in if requested
            if (options.fadeIn !== false) {
                gainNode.gain.setValueAtTime(0, this.context.currentTime);
                gainNode.gain.linearRampToValueAtTime(
                    options.volume !== undefined ? options.volume : 1,
                    this.context.currentTime + (options.fadeDuration || AUDIO_SETTINGS.FADE_DURATION) / 1000
                );
            } else {
                gainNode.gain.value = options.volume !== undefined ? options.volume : 1;
            }
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(this.musicGain);
            
            // Store current music
            this.currentMusic = {
                source: source,
                gain: gainNode,
                id: musicId
            };
            
            // Play music
            source.start(0);
            
            return source;
        } else {
            console.warn(`Music not found or not loaded: ${musicId}`);
        }
    }
    
    stopMusic(fadeOut = true) {
        if (!this.currentMusic || !this.context) return;
        
        if (fadeOut) {
            // Fade out
            this.currentMusic.gain.gain.linearRampToValueAtTime(
                0,
                this.context.currentTime + AUDIO_SETTINGS.FADE_DURATION / 1000
            );
            
            // Stop after fade out
            setTimeout(() => {
                if (this.currentMusic && this.currentMusic.source) {
                    this.currentMusic.source.stop();
                }
                this.currentMusic = null;
            }, AUDIO_SETTINGS.FADE_DURATION);
        } else {
            // Stop immediately
            this.currentMusic.source.stop();
            this.currentMusic = null;
        }
    }
    
    pauseMusic() {
        if (!this.currentMusic || !this.context) return;
        
        // Store current time
        this.currentMusic.pauseTime = this.context.currentTime;
        
        // Stop source
        this.currentMusic.source.stop();
    }
    
    resumeMusic() {
        if (!this.currentMusic || !this.context || !this.currentMusic.pauseTime) return;
        
        // Create new source
        const source = this.context.createBufferSource();
        source.buffer = this.music[this.currentMusic.id].buffer;
        source.loop = this.currentMusic.source.loop;
        
        // Connect to same gain node
        source.connect(this.currentMusic.gain);
        
        // Calculate offset
        const offset = this.currentMusic.pauseTime % source.buffer.duration;
        
        // Start at offset
        source.start(0, offset);
        
        // Update source
        this.currentMusic.source = source;
        delete this.currentMusic.pauseTime;
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
        
        // Save to localStorage
        this.saveAudioSettings();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
        
        // Save to localStorage
        this.saveAudioSettings();
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
        
        // Save to localStorage
        this.saveAudioSettings();
    }
    
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
        }
        
        // Update UI
        this.updateMuteButton();
        
        // Save to localStorage
        this.saveAudioSettings();
        
        return this.muted;
    }
    
    loadAudioSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('brickBreakerAudioSettings'));
            if (settings) {
                this.masterVolume = settings.masterVolume !== undefined ? settings.masterVolume : AUDIO_SETTINGS.MASTER_VOLUME;
                this.musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : AUDIO_SETTINGS.MUSIC_VOLUME;
                this.sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume : AUDIO_SETTINGS.SFX_VOLUME;
                this.muted = settings.muted !== undefined ? settings.muted : false;
                
                // Apply settings
                if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
                if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
                if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
                
                // Update UI
                this.updateVolumeSliders();
                this.updateMuteButton();
            }
        } catch (e) {
            console.error('Error loading audio settings:', e);
        }
    }
    
    saveAudioSettings() {
        try {
            const settings = {
                masterVolume: this.masterVolume,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume,
                muted: this.muted
            };
            localStorage.setItem('brickBreakerAudioSettings', JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving audio settings:', e);
        }
    }
    
    createAudioUI() {
        // Create audio controls container
        const audioControls = document.createElement('div');
        audioControls.id = 'audioControls';
        audioControls.style.position = 'absolute';
        audioControls.style.bottom = '10px';
        audioControls.style.right = '10px';
        audioControls.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        audioControls.style.padding = '10px';
        audioControls.style.borderRadius = '5px';
        audioControls.style.display = 'flex';
        audioControls.style.flexDirection = 'column';
        audioControls.style.gap = '5px';
        audioControls.style.zIndex = '100';
        
        // Create mute button
        const muteButton = document.createElement('button');
        muteButton.id = 'muteButton';
        muteButton.textContent = this.muted ? '🔇' : '🔊';
        muteButton.style.width = '40px';
        muteButton.style.height = '40px';
        muteButton.style.borderRadius = '50%';
        muteButton.style.border = 'none';
        muteButton.style.backgroundColor = '#ff9900';
        muteButton.style.color = '#000';
        muteButton.style.fontSize = '20px';
        muteButton.style.cursor = 'pointer';
        muteButton.style.display = 'flex';
        muteButton.style.justifyContent = 'center';
        muteButton.style.alignItems = 'center';
        muteButton.style.alignSelf = 'center';
        muteButton.style.marginBottom = '10px';
        
        // Add mute button event listener
        muteButton.addEventListener('click', () => {
            this.toggleMute();
            // Play click sound if unmuting
            if (!this.muted) {
                this.playSound('buttonClick');
            }
        });
        
        // Create volume controls
        const volumeControls = document.createElement('div');
        volumeControls.style.display = 'flex';
        volumeControls.style.flexDirection = 'column';
        volumeControls.style.gap = '5px';
        
        // Create master volume slider
        const masterVolumeContainer = this.createVolumeSlider('masterVolume', 'Master', this.masterVolume);
        
        // Create music volume slider
        const musicVolumeContainer = this.createVolumeSlider('musicVolume', 'Music', this.musicVolume);
        
        // Create SFX volume slider
        const sfxVolumeContainer = this.createVolumeSlider('sfxVolume', 'SFX', this.sfxVolume);
        
        // Add volume controls to container
        volumeControls.appendChild(masterVolumeContainer);
        volumeControls.appendChild(musicVolumeContainer);
        volumeControls.appendChild(sfxVolumeContainer);
        
        // Add controls to container
        audioControls.appendChild(muteButton);
        audioControls.appendChild(volumeControls);
        
        // Add to game container
        document.getElementById('gameContainer').appendChild(audioControls);
        
        // Load audio settings
        this.loadAudioSettings();
    }
    
    createVolumeSlider(id, label, value) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '5px';
        
        // Label
        const labelElement = document.createElement('label');
        labelElement.htmlFor = id;
        labelElement.textContent = label;
        labelElement.style.color = '#fff';
        labelElement.style.fontSize = '12px';
        labelElement.style.width = '40px';
        
        // Slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = id;
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.01';
        slider.value = value;
        slider.style.flex = '1';
        
        // Value display
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = Math.round(value * 100) + '%';
        valueDisplay.style.color = '#fff';
        valueDisplay.style.fontSize = '12px';
        valueDisplay.style.width = '35px';
        valueDisplay.style.textAlign = 'right';
        
        // Add event listener
        slider.addEventListener('input', () => {
            const newValue = parseFloat(slider.value);
            valueDisplay.textContent = Math.round(newValue * 100) + '%';
            
            // Update volume based on slider ID
            switch (id) {
                case 'masterVolume':
                    this.setMasterVolume(newValue);
                    break;
                case 'musicVolume':
                    this.setMusicVolume(newValue);
                    break;
                case 'sfxVolume':
                    this.setSfxVolume(newValue);
                    break;
            }
            
            // Play test sound for SFX volume
            if (id === 'sfxVolume' && !this.muted) {
                this.playSound('buttonClick', { volume: 0.3 });
            }
        });
        
        // Add elements to container
        container.appendChild(labelElement);
        container.appendChild(slider);
        container.appendChild(valueDisplay);
        
        return container;
    }
    
    updateVolumeSliders() {
        // Update slider values
        const masterSlider = document.getElementById('masterVolume');
        const musicSlider = document.getElementById('musicVolume');
        const sfxSlider = document.getElementById('sfxVolume');
        
        if (masterSlider) {
            masterSlider.value = this.masterVolume;
            masterSlider.nextElementSibling.textContent = Math.round(this.masterVolume * 100) + '%';
        }
        
        if (musicSlider) {
            musicSlider.value = this.musicVolume;
            musicSlider.nextElementSibling.textContent = Math.round(this.musicVolume * 100) + '%';
        }
        
        if (sfxSlider) {
            sfxSlider.value = this.sfxVolume;
            sfxSlider.nextElementSibling.textContent = Math.round(this.sfxVolume * 100) + '%';
        }
    }
    
    updateMuteButton() {
        const muteButton = document.getElementById('muteButton');
        if (muteButton) {
            muteButton.textContent = this.muted ? '🔇' : '🔊';
        }
    }
    
    // Game state specific methods
    playGameMusic() {
        this.playMusic('gameplay', { loop: true });
    }
    
    playMenuMusic() {
        this.playMusic('menu', { loop: true });
    }
    
    playVictoryMusic() {
        this.playMusic('victory', { loop: false });
    }
    
    playGameOverMusic() {
        this.playMusic('gameOver', { loop: false });
    }
    
    playBossMusic() {
        this.playMusic('boss', { loop: true });
    }
    
    // Method to handle game state changes
    handleGameStateChange(newState) {
        switch (newState) {
            case GAME_STATES.MENU:
                this.playMenuMusic();
                break;
            case GAME_STATES.PLAYING:
                // Play boss music for final level
                if (this.game.level === this.game.maxLevel) {
                    this.playBossMusic();
                } else {
                    this.playGameMusic();
                }
                break;
            case GAME_STATES.PAUSED:
                // Pause music
                this.pauseMusic();
                this.playSound('pause');
                break;
            case GAME_STATES.GAME_OVER:
                this.playGameOverMusic();
                break;
            case GAME_STATES.VICTORY:
                this.playVictoryMusic();
                break;
            case GAME_STATES.LEVEL_TRANSITION:
                this.playSound('levelComplete');
                break;
        }
    }
    
    // Create positional audio for 3D sound effects
    createPositionalSound(soundId, x, y, options = {}) {
        if (this.muted || !this.context || !this.sfx[soundId] || !this.sfx[soundId].loaded) return;
        
        // Create audio source
        const source = this.context.createBufferSource();
        source.buffer = this.sfx[soundId].buffer;
        
        // Create panner node for positional audio
        const panner = this.context.createPanner();
        panner.panningModel = 'equalpower';
        
        // Calculate pan value based on x position (-1 to 1)
        const panValue = (x / this.game.width) * 2 - 1;
        
        // Set position (simplified 2D panning)
        panner.setPosition(panValue, 0, 0);
        
        // Create gain node for this specific sound
        const gainNode = this.context.createGain();
        gainNode.gain.value = options.volume !== undefined ? options.volume : 1;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.sfxGain);
        
        // Play sound
        source.start(0);
        
        return source;
    }
}

// Initialize audio system
function initAudioSystem(game) {
    // Create audio system
    game.audioSystem = new AudioSystem(game);
    
    // Store original game state setter
    const originalSetGameState = game.setState;
    
    // Override game state setter to handle audio changes
    game.setState = function(newState) {
        // Call original method
        originalSetGameState.call(this, newState);
        
        // Handle audio for new state
        this.audioSystem.handleGameStateChange(newState);
    };
    
    // Play menu music initially
    game.audioSystem.playMenuMusic();
    
    // Enhance game's playSound method to support positional audio
    const originalPlaySound = game.playSound;
    game.playSound = function(soundId, options = {}) {
        // Use positional audio if position is provided
        if (options.x !== undefined && options.y !== undefined) {
            return game.audioSystem.createPositionalSound(soundId, options.x, options.y, options);
        }
        
        // Otherwise use normal sound
        return originalPlaySound.call(game.audioSystem, soundId, options);
    };
    
    // Add sound effects to specific game events
    enhanceGameWithSoundEffects(game);
}

// Add sound effects to game events
function enhanceGameWithSoundEffects(game) {
    // Store original methods to enhance
    const originalCheckBallBrickCollision = game.checkBallBrickCollision;
    const originalCheckPaddleCollision = game.checkPaddleCollision;
    const originalCheckWallCollisions = game.checkWallCollisions;
    const originalLoseLife = game.loseLife;
    const originalNextLevel = game.nextLevel;
    const originalStartGame = game.startGame;
    const originalGameOver = game.gameOver;
    const originalVictory = game.victory;
    
    // Enhance brick collision to play positional audio
    game.checkBallBrickCollision = function(brick) {
        const collision = originalCheckBallBrickCollision.call(this, brick);
        
        if (collision) {
            // Play sound at brick position
            if (brick.health <= 0) {
                this.playSound('brickDestroy', { 
                    x: brick.x + brick.width / 2,
                    y: brick.y + brick.height / 2
                });
            } else {
                this.playSound('brickHit', { 
                    x: brick.x + brick.width / 2,
                    y: brick.y + brick.height / 2
                });
            }
        }
        
        return collision;
    };
    
    // Enhance paddle collision to play positional audio
    game.checkPaddleCollision = function() {
        const originalBallY = this.ball.y;
        originalCheckPaddleCollision.call(this);
        
        // Check if collision occurred (ball direction changed)
        if (originalBallY > this.ball.y) {
            this.playSound('paddleHit', { 
                x: this.ball.x,
                y: this.paddle.y
            });
        }
    };
    
    // Enhance wall collisions to play positional audio
    game.checkWallCollisions = function() {
        const originalBallDx = this.ball.dx;
        const originalBallDy = this.ball.dy;
        
        originalCheckWallCollisions.call(this);
        
        // Check if x direction changed (side wall hit)
        if (originalBallDx * this.ball.dx < 0) {
            this.playSound('wallHit', { 
                x: this.ball.x,
                y: this.ball.y
            });
        }
        
        // Check if y direction changed (top wall hit)
        if (originalBallDy * this.ball.dy < 0 && this.ball.y < this.height / 2) {
            this.playSound('wallHit', { 
                x: this.ball.x,
                y: this.ball.y
            });
        }
    };
    
    // Enhance lose life to play sound
    game.loseLife = function() {
        originalLoseLife.call(this);
        this.playSound('loseLife');
    };
    
    // Enhance next level to play sound
    game.nextLevel = function() {
        originalNextLevel.call(this);
        this.playSound('levelComplete');
    };
    
    // Enhance start game to play sound
    game.startGame = function() {
        originalStartGame.call(this);
        this.playSound('gameStart');
        this.audioSystem.playGameMusic();
    };
    
    // Enhance game over to play sound
    game.gameOver = function() {
        originalGameOver.call(this);
        this.audioSystem.playGameOverMusic();
    };
    
    // Enhance victory to play sound
    game.victory = function() {
        originalVictory.call(this);
        this.audioSystem.playVictoryMusic();
    };
}
