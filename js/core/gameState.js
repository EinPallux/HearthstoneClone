/* ============================================
   GAME STATE ENGINE
   Manages the flow of the game, resources, and rule enforcement.
   ============================================ */

class GameState {
    constructor() {
        this.phase = 'init'; // init, playing, ended
        this.turnNumber = 0;
        this.isPlayerTurn = false;
        
        // Players
        this.playerHero = null;
        this.enemyHero = null;
        
        // Resources
        this.playerMaxMana = 0;
        this.playerCurrentMana = 0;
        this.enemyMaxMana = 0;
        this.enemyCurrentMana = 0;
        
        // Zones
        this.playerDeck = [];
        this.playerHand = [];
        this.playerBoard = Array(7).fill(null);
        
        this.enemyDeck = [];
        this.enemyHand = []; // Just Card IDs or Placeholders
        this.enemyHandSize = 0;
        this.enemyBoard = Array(7).fill(null);
        
        // Global Modifiers
        this.spellDamageBonus = 0;
        this.spellsCast = 0;
        
        // Logs
        this.battleLog = [];
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    initializeGame(playerHeroId, difficulty) {
        console.log(`⚔️ Initializing Game: Hero=${playerHeroId}, Diff=${difficulty}`);
        
        // 1. Setup Heroes
        this.playerHero = createHeroInstance(playerHeroId);
        this.enemyHero = this.createEnemyHero();
        
        // 2. Setup Decks
        this.playerDeck = this.loadPlayerDeck();
        this.enemyDeck = this.createEnemyDeck(difficulty);
        
        // 3. Shuffle
        this.shuffle(this.playerDeck);
        this.shuffle(this.enemyDeck);
        
        // 4. Draw Starting Hands
        this.drawStartingHands();
        
        this.phase = 'playing';
        this.addBattleLog('Game Started!');
    }
    
    createEnemyHero() {
        // Random enemy for now
        const pool = HEROES.filter(h => h.id !== this.playerHero.id);
        const random = pool[Math.floor(Math.random() * pool.length)];
        return createHeroInstance(random.id);
    }
    
    loadPlayerDeck() {
        const saved = StorageManager.getCurrentDeck();
        if(saved && saved.cards.length > 0) {
            return saved.cards.map(id => createCardInstance(id)).filter(c => c);
        }
        // Fallback
        return getRandomCards(25).map(id => createCardInstance(id));
    }
    
    createEnemyDeck(difficulty) {
        // Simple random deck based on difficulty could be added here
        return getRandomCards(25).map(id => createCardInstance(id));
    }
    
    drawStartingHands() {
        // Player draws 3
        for(let i=0; i<3; i++) this.drawCard('player');
        
        // Enemy draws 4 (simulated)
        for(let i=0; i<4; i++) this.drawCard('enemy');
    }
    
    // ============================================
    // TURN MANAGEMENT
    // ============================================
    
    startPlayerTurn() {
        this.isPlayerTurn = true;
        this.turnNumber++;
        
        // Mana
        if(this.playerMaxMana < 10) this.playerMaxMana++;
        this.playerCurrentMana = this.playerMaxMana;
        
        // Reset Attacks
        this.playerBoard.forEach(m => {
            if(m) {
                m.attacksThisTurn = 0;
                m.canAttack = true; // Unless frozen (handled in reset)
                if(m.frozen) {
                    m.frozen = false;
                    m.canAttack = false;
                }
            }
        });
        
        // Hero Power Reset
        this.playerHero.heroPower.timesUsedThisTurn = 0;
        
        // Draw
        this.drawCard('player');
        
        // Triggers
        this.triggerPhase('startTurn', 'player');
        
        // UI Updates
        AnimationManager.animateTurnChange(true);
        AnimationManager.showNotification("Your Turn", "info", 1000);
        this.updateUI();
    }
    
    endPlayerTurn() {
        this.isPlayerTurn = false;
        this.triggerPhase('endTurn', 'player');
        
        // Start Enemy Turn Logic (AI)
        setTimeout(() => this.startEnemyTurn(), 1000);
    }
    
    startEnemyTurn() {
        // Mana
        if(this.enemyMaxMana < 10) this.enemyMaxMana++;
        this.enemyCurrentMana = this.enemyMaxMana;
        
        // Reset Attacks
        this.enemyBoard.forEach(m => {
            if(m) {
                m.attacksThisTurn = 0;
                m.canAttack = true;
                if(m.frozen) {
                    m.frozen = false;
                    m.canAttack = false;
                }
            }
        });
        
        this.enemyHero.heroPower.timesUsedThisTurn = 0;
        this.drawCard('enemy');
        
        this.triggerPhase('startTurn', 'enemy');
        this.updateUI();
        
        // Trigger AI Logic
        if(this.executeAITurn) this.executeAITurn();
    }
    
    endEnemyTurn() {
        this.triggerPhase('endTurn', 'enemy');
        this.startPlayerTurn();
    }
    
    // ============================================
    // ACTIONS
    // ============================================
    
    drawCard(owner) {
        if(owner === 'player') {
            if(this.playerDeck.length === 0) {
                this.takeFatigueDamage('player');
                return;
            }
            if(this.playerHand.length >= 10) {
                const burnt = this.playerDeck.shift();
                this.addBattleLog(`Hand full! Burnt ${burnt.name}.`);
                return; // Burn card
            }
            
            const card = this.playerDeck.shift();
            this.playerHand.push(card);
            
            // Visuals are handled by UI Manager observing state changes
            // but we can trigger sound here
            AnimationManager.playSound('sfx-draw');
        } else {
            if(this.enemyDeck.length === 0) {
                this.takeFatigueDamage('enemy');
                return;
            }
            const card = this.enemyDeck.shift();
            // For enemy, we just track hand size mostly, but keep object for logic
            this.enemyHand.push(card); 
            this.enemyHandSize++;
        }
    }
    
    takeFatigueDamage(owner) {
        const hero = owner === 'player' ? this.playerHero : this.enemyHero;
        // Simple fatigue: 1 dmg (could escalate in future)
        const dmg = 1;
        hero.currentHealth -= dmg;
        this.addBattleLog(`${owner === 'player' ? 'You' : 'Enemy'} takes fatigue damage!`);
        AnimationManager.animateHeroDamage(hero.id, dmg);
        this.checkGameEnd();
    }
    
    // ============================================
    // COMBAT HELPERS
    // ============================================
    
    findTarget(id) {
        if(id === 'playerHero') return this.playerHero;
        if(id === 'enemyHero') return this.enemyHero;
        
        const pMinion = this.playerBoard.find(m => m && m.id === id);
        if(pMinion) return pMinion;
        
        const eMinion = this.enemyBoard.find(m => m && m.id === id);
        if(eMinion) return eMinion;
        
        return null;
    }
    
    // ============================================
    // GAME END
    // ============================================
    
    checkGameEnd() {
        if(this.playerHero.currentHealth <= 0) {
            this.endGame(false);
        } else if(this.enemyHero.currentHealth <= 0) {
            this.endGame(true);
        }
    }
    
    endGame(playerWon) {
        this.phase = 'ended';
        AnimationManager.showNotification(playerWon ? "VICTORY!" : "DEFEAT", playerWon ? "success" : "error");
        
        // Notify UI to show screen
        if(window.UIManager) {
            setTimeout(() => {
                const screen = document.getElementById('endGameScreen');
                const title = document.getElementById('endGameTitle');
                if(title) {
                    title.textContent = playerWon ? "VICTORY" : "DEFEAT";
                    title.className = playerWon ? "text-8xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-yellow-600 mb-8" : "text-8xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-300 to-gray-600 mb-8";
                }
                
                // Show stats
                const stats = document.getElementById('endGameStats');
                if(stats) {
                    stats.innerHTML = `
                        <div class="text-xl text-white">Turns: ${this.turnNumber}</div>
                        <div class="text-xl text-white">Spells Cast: ${this.spellsCast}</div>
                    `;
                }
                
                // Update Quests
                if(playerWon && this.questManager) {
                    this.questManager.updateProgress('win_games', 1);
                    if(this.playerHero.currentHealth === this.playerHero.maxHealth) {
                        this.questManager.updateProgress('survive_damage', 1, { health: 30 }); // Max health trigger
                    }
                }

                window.UIManager.showScreen('endGameScreen');
            }, 1500);
        }
    }
    
    // ============================================
    // UTILS
    // ============================================
    
    addBattleLog(msg) {
        this.battleLog.push({ message: msg, turn: this.turnNumber });
        if(window.UIManager) window.UIManager.updateBattleLog();
    }
    
    updateUI() {
        if(window.UIManager) window.UIManager.updateGameBoard();
    }
    
    triggerPhase(phase, player) {
        // Hooks for passive effects (e.g., "At start of turn, heal 2")
        // Not fully implemented in this MVP but placeholder is here
    }
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Global Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}