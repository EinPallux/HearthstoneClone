/* ============================================
   GAME STATE MANAGER
   Core game logic and state management
   ============================================ */

class GameState {
    constructor() {
        // Game phase
        this.phase = 'menu'; // 'menu', 'playing', 'ended'
        this.isPlayerTurn = true;
        this.turnNumber = 1;
        this.gameStartTime = null;
        
        // Players
        this.playerHero = null;
        this.enemyHero = null;
        this.difficulty = 'medium';
        
        // Boards (7 slots each)
        this.playerBoard = Array(7).fill(null);
        this.enemyBoard = Array(7).fill(null);
        
        // Hands
        this.playerHand = [];
        this.enemyHand = []; // AI hand (hidden)
        this.enemyHandSize = 0;
        
        // Decks
        this.playerDeck = [];
        this.enemyDeck = [];
        
        // Mana
        this.playerMaxMana = 1;
        this.playerCurrentMana = 1;
        this.enemyMaxMana = 1;
        this.enemyCurrentMana = 1;
        
        // Weapons
        this.playerWeapon = null;
        this.enemyWeapon = null;
        
        // Game state tracking
        this.spellDamageBonus = 0;
        this.spellsCast = 0;
        this.minionsPlayedThisTurn = 0;
        this.cardsPlayedThisTurn = 0;
        
        // Battle log
        this.battleLog = [];
        
        // Quest manager reference
        this.questManager = null;
        
        // Statistics for this game
        this.gameStats = {
            damageDealt: 0,
            minionsPlayed: 0,
            spellsCast: 0,
            cardsPlayed: 0,
            heroPowersUsed: 0,
            minionsDestroyed: 0,
            healingDone: 0
        };
    }
    
    // ============================================
    // GAME INITIALIZATION
    // ============================================
    
    /**
     * Initialize a new game
     */
    initializeGame(playerHeroId, difficulty = 'medium') {
        this.phase = 'playing';
        this.difficulty = difficulty;
        this.gameStartTime = Date.now();
        this.turnNumber = 1;
        this.isPlayerTurn = true;
        
        // Initialize heroes
        this.playerHero = createHeroInstance(playerHeroId);
        this.playerHero.id = 'playerHero';
        
        // Enemy uses random hero
        const randomEnemyHero = HEROES[Math.floor(Math.random() * HEROES.length)];
        this.enemyHero = createHeroInstance(randomEnemyHero.id);
        this.enemyHero.id = 'enemyHero';
        
        // Initialize decks
        const playerDeckData = StorageManager.getCurrentDeck();
        if (playerDeckData && playerDeckData.cards) {
            this.playerDeck = this.shuffleDeck(playerDeckData.cards.map(cardId => createCardInstance(cardId)));
        } else {
            // Create a random deck if none exists
            this.playerDeck = this.createRandomDeck();
        }
        
        // Enemy gets a random deck
        this.enemyDeck = this.createAIDeck(difficulty);
        
        // Reset boards and hands
        this.playerBoard = Array(7).fill(null);
        this.enemyBoard = Array(7).fill(null);
        this.playerHand = [];
        this.enemyHand = [];
        this.enemyHandSize = 0;
        
        // Reset mana
        this.playerMaxMana = 1;
        this.playerCurrentMana = 1;
        this.enemyMaxMana = 1;
        this.enemyCurrentMana = 1;
        
        // Reset weapons
        this.playerWeapon = null;
        this.enemyWeapon = null;
        
        // Reset tracking
        this.spellDamageBonus = 0;
        this.spellsCast = 0;
        this.battleLog = [];
        
        // Draw starting hands (3 cards + coin for second player)
        for (let i = 0; i < 3; i++) {
            this.drawCard('player');
            this.drawCard('enemy');
        }
        
        // Player goes first, so enemy gets coin (not implemented yet, but reserved)
        
        this.addBattleLog('=== GAME START ===');
        this.addBattleLog(`${this.playerHero.name} vs ${this.enemyHero.name}`);
        this.addBattleLog('Good luck!');
        
        return true;
    }
    
    /**
     * Create a random deck for AI
     */
    createAIDeck(difficulty) {
        const deckSize = 25;
        const deck = [];
        
        // Difficulty affects card quality
        let rarityWeights = {
            common: 0.6,
            rare: 0.25,
            epic: 0.1,
            legendary: 0.05
        };
        
        if (difficulty === 'easy') {
            rarityWeights = { common: 0.8, rare: 0.15, epic: 0.05, legendary: 0 };
        } else if (difficulty === 'hard') {
            rarityWeights = { common: 0.4, rare: 0.3, epic: 0.2, legendary: 0.1 };
        }
        
        // Build deck with good mana curve
        const manaCurve = {
            0: 2, 1: 3, 2: 4, 3: 4, 4: 4, 5: 3, 6: 2, 7: 2, 8: 1
        };
        
        for (let cost in manaCurve) {
            const count = manaCurve[cost];
            const costNum = parseInt(cost);
            
            for (let i = 0; i < count; i++) {
                // Get cards of this cost
                const availableCards = CARDS.filter(card => card.cost === costNum);
                
                if (availableCards.length > 0) {
                    // Weight by rarity
                    const weightedCards = availableCards.filter(card => {
                        const rand = Math.random();
                        let threshold = 0;
                        for (let rarity in rarityWeights) {
                            threshold += rarityWeights[rarity];
                            if (rand <= threshold && card.rarity === rarity) {
                                return true;
                            }
                        }
                        return false;
                    });
                    
                    const cardPool = weightedCards.length > 0 ? weightedCards : availableCards;
                    const randomCard = cardPool[Math.floor(Math.random() * cardPool.length)];
                    deck.push(createCardInstance(randomCard.id));
                }
            }
        }
        
        // Fill remaining slots randomly
        while (deck.length < deckSize) {
            const randomCard = CARDS[Math.floor(Math.random() * CARDS.length)];
            deck.push(createCardInstance(randomCard.id));
        }
        
        return this.shuffleDeck(deck);
    }
    
    /**
     * Create a random player deck
     */
    createRandomDeck() {
        const deck = [];
        for (let i = 0; i < 25; i++) {
            const randomCard = CARDS[Math.floor(Math.random() * CARDS.length)];
            deck.push(createCardInstance(randomCard.id));
        }
        return this.shuffleDeck(deck);
    }
    
    /**
     * Shuffle a deck
     */
    shuffleDeck(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // ============================================
    // TURN MANAGEMENT
    // ============================================
    
    /**
     * Start player turn
     */
    startPlayerTurn() {
        this.isPlayerTurn = true;
        this.turnNumber++;
        this.cardsPlayedThisTurn = 0;
        this.minionsPlayedThisTurn = 0;
        
        // Increase max mana (up to 10)
        if (this.playerMaxMana < 10) {
            this.playerMaxMana++;
        }
        this.playerCurrentMana = this.playerMaxMana;
        
        // Reset hero power
        if (this.playerHero.heroPower) {
            this.playerHero.heroPower.timesUsedThisTurn = 0;
        }
        
        // Unfreeze and enable attacks for minions
        this.playerBoard.forEach(minion => {
            if (minion) {
                minion.frozen = false;
                if (!minion.abilities?.includes('charge')) {
                    minion.canAttack = true;
                }
                minion.attacksThisTurn = 0;
                
                // Remove temporary attack bonuses
                if (minion.temporaryAttack) {
                    minion.attack -= minion.temporaryAttack;
                    minion.temporaryAttack = 0;
                }
            }
        });
        
        // Draw a card
        this.drawCard('player');
        
        // Trigger start of turn effects
        this.triggerStartOfTurnEffects('player');
        
        // Update spell damage bonus
        this.updateSpellDamageBonus();
        
        this.addBattleLog(`=== TURN ${this.turnNumber} - YOUR TURN ===`);
        
        AnimationManager.animateTurnChange(true);
        AnimationManager.glowManaCrystals();
    }
    
    /**
     * End player turn
     */
    endPlayerTurn() {
        // Trigger end of turn effects
        this.triggerEndOfTurnEffects('player');
        
        // Destroy minions marked for end of turn destruction
        this.playerBoard.forEach((minion, i) => {
            if (minion && minion.destroyAtEndOfTurn) {
                this.destroyMinion(minion, i, 'player');
            }
        });
        
        this.isPlayerTurn = false;
        
        // Start enemy turn after a delay
        setTimeout(() => {
            this.startEnemyTurn();
        }, 1000);
    }
    
    /**
     * Start enemy turn
     */
    startEnemyTurn() {
        this.cardsPlayedThisTurn = 0;
        
        // Increase max mana
        if (this.enemyMaxMana < 10) {
            this.enemyMaxMana++;
        }
        this.enemyCurrentMana = this.enemyMaxMana;
        
        // Reset hero power
        if (this.enemyHero.heroPower) {
            this.enemyHero.heroPower.timesUsedThisTurn = 0;
        }
        
        // Unfreeze and enable attacks
        this.enemyBoard.forEach(minion => {
            if (minion) {
                minion.frozen = false;
                if (!minion.abilities?.includes('charge')) {
                    minion.canAttack = true;
                }
                minion.attacksThisTurn = 0;
            }
        });
        
        // Draw a card
        this.drawCard('enemy');
        
        // Trigger start of turn effects
        this.triggerStartOfTurnEffects('enemy');
        
        this.addBattleLog('=== ENEMY TURN ===');
        AnimationManager.animateTurnChange(false);
        
        // AI takes actions
        setTimeout(() => {
            this.executeAITurn();
        }, 1500);
    }
    
    /**
     * Execute AI turn (basic implementation, AI.js will handle complex logic)
     */
    executeAITurn() {
        // This will be overridden by AI system
        // For now, just end turn
        setTimeout(() => {
            this.endEnemyTurn();
        }, 2000);
    }
    
    /**
     * End enemy turn
     */
    endEnemyTurn() {
        // Trigger end of turn effects
        this.triggerEndOfTurnEffects('enemy');
        
        // Destroy minions marked for end of turn destruction
        this.enemyBoard.forEach((minion, i) => {
            if (minion && minion.destroyMinion) {
                this.destroyMinion(minion, i, 'enemy');
            }
        });
        
        // Start player turn
        setTimeout(() => {
            this.startPlayerTurn();
        }, 1000);
    }
    
    // ============================================
    // CARD ACTIONS
    // ============================================
    
    /**
     * Draw a card
     */
    drawCard(player = 'player') {
        if (player === 'player') {
            if (this.playerDeck.length === 0) {
                // Fatigue damage
                const fatigueDamage = 11 - this.playerDeck.length;
                this.playerHero.currentHealth -= fatigueDamage;
                this.addBattleLog(`Fatigue! You take ${fatigueDamage} damage!`);
                AnimationManager.animateDamage('playerHero', fatigueDamage);
                
                this.checkGameEnd();
                return null;
            }
            
            if (this.playerHand.length >= 10) {
                const card = this.playerDeck.shift();
                this.addBattleLog(`Your hand is full! ${card.name} was burned!`);
                return null;
            }
            
            const card = this.playerDeck.shift();
            this.playerHand.push(card);
            this.addBattleLog(`You drew ${card.name}`);
            return card;
        } else {
            if (this.enemyDeck.length === 0) {
                const fatigueDamage = 11 - this.enemyDeck.length;
                this.enemyHero.currentHealth -= fatigueDamage;
                this.addBattleLog(`Enemy takes ${fatigueDamage} fatigue damage!`);
                AnimationManager.animateDamage('enemyHero', fatigueDamage);
                
                this.checkGameEnd();
                return null;
            }
            
            const card = this.enemyDeck.shift();
            this.enemyHand.push(card);
            this.enemyHandSize++;
            return card;
        }
    }
    
    /**
     * Play a card from hand
     */
    playCard(card, handIndex, targetId = null, boardPosition = null) {
        // Check if it's player's turn
        if (!this.isPlayerTurn) {
            this.addBattleLog("It's not your turn!");
            return false;
        }
        
        // Check mana cost
        if (card.cost > this.playerCurrentMana) {
            this.addBattleLog('Not enough mana!');
            AnimationManager.showNotification('Not enough mana!', 'error', 2000);
            return false;
        }
        
        // Handle different card types
        if (card.type === 'minion') {
            return this.playMinion(card, handIndex, boardPosition);
        } else if (card.type === 'spell') {
            return this.playSpell(card, handIndex, targetId);
        } else if (card.type === 'weapon') {
            return this.playWeapon(card, handIndex);
        }
        
        return false;
    }
    
    /**
     * Play a minion card
     */
    playMinion(card, handIndex, boardPosition = null) {
        // Find empty slot
        let slotIndex = boardPosition;
        if (slotIndex === null) {
            slotIndex = this.playerBoard.findIndex(slot => slot === null);
        }
        
        if (slotIndex === -1) {
            this.addBattleLog('Board is full!');
            AnimationManager.showNotification('Board is full!', 'error', 2000);
            return false;
        }
        
        // Pay mana cost
        this.playerCurrentMana -= card.cost;
        
        // Remove from hand
        this.playerHand.splice(handIndex, 1);
        
        // Create minion instance on board
        const minion = {
            ...card,
            currentHealth: card.health,
            maxHealth: card.health,
            canAttack: card.abilities?.includes('charge') || false,
            attacksThisTurn: 0,
            frozen: false,
            divineShield: card.abilities?.includes('divine_shield') || false
        };
        
        this.playerBoard[slotIndex] = minion;
        
        this.addBattleLog(`You played ${minion.name}!`);
        this.cardsPlayedThisTurn++;
        this.minionsPlayedThisTurn++;
        this.gameStats.cardsPlayed++;
        this.gameStats.minionsPlayed++;
        
        // Update quest progress
        if (this.questManager) {
            this.questManager.updateProgress(QUEST_TYPES.PLAY_CARDS, 1);
            this.questManager.updateProgress(QUEST_TYPES.SUMMON_MINIONS, 1);
            if (card.cost >= 5) {
                this.questManager.updateProgress(QUEST_TYPES.PLAY_COST, 1, { cost: card.cost });
            }
        }
        
        // Trigger battlecry
        if (card.battlecry) {
            setTimeout(() => {
                card.battlecry(this, null);
                this.updateUI();
            }, 500);
        }
        
        // Trigger hero passive on summon
        if (this.playerHero.passive && this.playerHero.passive.trigger === 'onMinionSummon') {
            this.playerHero.passive.effect(this, minion);
        }
        
        // Trigger weapon effect on summon
        if (this.playerWeapon && this.playerWeapon.abilities?.includes('onSummonEffect')) {
            this.playerWeapon.effect(this, minion);
        }
        
        this.updateSpellDamageBonus();
        
        return true;
    }
    
    /**
     * Play a spell card
     */
    playSpell(card, handIndex, targetId = null) {
        // Pay mana cost
        this.playerCurrentMana -= card.cost;
        
        // Remove from hand
        this.playerHand.splice(handIndex, 1);
        
        this.addBattleLog(`You cast ${card.name}!`);
        this.cardsPlayedThisTurn++;
        this.spellsCast++;
        this.gameStats.cardsPlayed++;
        this.gameStats.spellsCast++;
        
        // Update quest progress
        if (this.questManager) {
            this.questManager.updateProgress(QUEST_TYPES.PLAY_CARDS, 1);
            this.questManager.updateProgress(QUEST_TYPES.CAST_SPELLS, 1);
            if (card.cost >= 5) {
                this.questManager.updateProgress(QUEST_TYPES.PLAY_COST, 1, { cost: card.cost });
            }
        }
        
        // Trigger hero passive on spell cast
        if (this.playerHero.passive && this.playerHero.passive.trigger === 'onSpellCast') {
            this.playerHero.passive.effect(this);
        }
        
        // Execute spell effect
        if (card.effect) {
            setTimeout(() => {
                card.effect(this, targetId);
                this.updateUI();
                this.checkGameEnd();
            }, 500);
        }
        
        return true;
    }
    
    /**
     * Play a weapon card
     */
    playWeapon(card, handIndex) {
        // Pay mana cost
        this.playerCurrentMana -= card.cost;
        
        // Remove from hand
        this.playerHand.splice(handIndex, 1);
        
        // Equip weapon (destroy old one if exists)
        this.playerWeapon = {
            ...card,
            currentDurability: card.durability
        };
        
        this.addBattleLog(`You equipped ${card.name}!`);
        this.cardsPlayedThisTurn++;
        this.gameStats.cardsPlayed++;
        
        // Update quest progress
        if (this.questManager) {
            this.questManager.updateProgress(QUEST_TYPES.PLAY_CARDS, 1);
            if (card.cost >= 5) {
                this.questManager.updateProgress(QUEST_TYPES.PLAY_COST, 1, { cost: card.cost });
            }
        }
        
        // Trigger battlecry if weapon has one
        if (card.battlecry) {
            setTimeout(() => {
                card.battlecry(this, null);
                this.updateUI();
            }, 500);
        }
        
        return true;
    }
    
    // ============================================
    // COMBAT SYSTEM
    // ============================================
    
    /**
     * Minion attacks another minion or hero
     */
    minionAttack(attackerMinion, attackerIndex, targetId) {
        // Find target
        const target = this.findTarget(targetId);
        if (!target) return false;
        
        // Check if attacker can attack
        if (!attackerMinion.canAttack || attackerMinion.frozen) {
            this.addBattleLog(`${attackerMinion.name} cannot attack!`);
            return false;
        }
        
        // Check windfury
        const maxAttacks = attackerMinion.abilities?.includes('windfury') ? 2 : 1;
        if (attackerMinion.attacksThisTurn >= maxAttacks) {
            this.addBattleLog(`${attackerMinion.name} has already attacked!`);
            return false;
        }
        
        // Check taunt
        if (target.type !== 'minion') {
            const hasTauntMinions = this.enemyBoard.some(m => m && m.abilities?.includes('taunt'));
            if (hasTauntMinions && !attackerMinion.abilities?.includes('bypass_taunt')) {
                this.addBattleLog('Must attack taunt minions first!');
                AnimationManager.showNotification('Must attack taunt minions!', 'error', 2000);
                return false;
            }
        }
        
        // Execute attack
        attackerMinion.attacksThisTurn++;
        if (attackerMinion.attacksThisTurn >= maxAttacks) {
            attackerMinion.canAttack = false;
        }
        
        if (target.type === 'minion') {
            this.minionVsMinion(attackerMinion, attackerIndex, target);
        } else {
            this.minionVsHero(attackerMinion, target);
        }
        
        return true;
    }
    
    /**
     * Minion attacks minion
     */
    minionVsMinion(attacker, attackerIndex, defender) {
        this.addBattleLog(`${attacker.name} attacks ${defender.name}!`);
        
        // Deal damage to both
        this.dealDamage(defender, attacker.attack, 'combat', attacker);
        this.dealDamage(attacker, defender.attack, 'combat', defender);
        
        this.updateUI();
        this.checkGameEnd();
    }
    
    /**
     * Minion attacks hero
     */
    minionVsHero(attacker, hero) {
        this.addBattleLog(`${attacker.name} attacks ${hero.name}!`);
        
        const damage = attacker.attack;
        
        // Apply damage to hero
        if (hero.armor > 0) {
            const armorDamage = Math.min(hero.armor, damage);
            hero.armor -= armorDamage;
            const remainingDamage = damage - armorDamage;
            
            if (remainingDamage > 0) {
                hero.currentHealth -= remainingDamage;
            }
            
            this.addBattleLog(`${hero.name} loses ${armorDamage} armor and takes ${remainingDamage} damage!`);
        } else {
            hero.currentHealth -= damage;
            this.addBattleLog(`${hero.name} takes ${damage} damage!`);
        }
        
        AnimationManager.animateHeroDamage(hero.id, damage);
        
        // Lifesteal
        if (attacker.abilities?.includes('lifesteal')) {
            const healAmount = Math.min(damage, this.playerHero.maxHealth - this.playerHero.currentHealth);
            this.playerHero.currentHealth += healAmount;
            this.addBattleLog(`${attacker.name} heals you for ${healAmount}!`);
            AnimationManager.animateHeal('playerHero', healAmount);
        }
        
        this.gameStats.damageDealt += damage;
        
        // Update quest
        if (this.questManager) {
            this.questManager.updateProgress(QUEST_TYPES.DEAL_DAMAGE, damage);
        }
        
        this.updateUI();
        this.checkGameEnd();
    }
    
    /**
     * Deal damage to a target
     */
    dealDamage(target, amount, source = 'normal', attacker = null) {
        if (amount <= 0) return;
        
        if (target.type === 'minion') {
            // Check divine shield
            if (target.divineShield) {
                target.divineShield = false;
                this.addBattleLog(`${target.name}'s Divine Shield absorbed the damage!`);
                AnimationManager.animateShield(target.id);
                return;
            }
            
            target.currentHealth -= amount;
            AnimationManager.showDamageText(target.id, amount, 'damage');
            
            // Poisonous check
            if (attacker && attacker.abilities?.includes('poisonous')) {
                target.currentHealth = 0;
                this.addBattleLog(`${target.name} was poisoned!`);
            }
            
            // Check if minion died
            if (target.currentHealth <= 0) {
                const board = this.playerBoard.includes(target) ? 'player' : 'enemy';
                const index = board === 'player' ? 
                    this.playerBoard.indexOf(target) : 
                    this.enemyBoard.indexOf(target);
                
                this.destroyMinion(target, index, board);
            }
        } else {
            // Hero damage
            if (target.armor > 0) {
                const armorDamage = Math.min(target.armor, amount);
                target.armor -= armorDamage;
                const remainingDamage = amount - armorDamage;
                
                if (remainingDamage > 0) {
                    target.currentHealth -= remainingDamage;
                }
            } else {
                target.currentHealth -= amount;
            }
            
            AnimationManager.animateHeroDamage(target.id, amount);
        }
    }
    
    /**
     * Destroy a minion
     */
    destroyMinion(minion, boardIndex, board) {
        this.addBattleLog(`${minion.name} was destroyed!`);
        
        // Trigger deathrattle
        if (minion.deathrattle) {
            minion.deathrattle(this, boardIndex);
        }
        
        // Trigger hero passive
        if (board === 'player' && this.playerHero.passive && 
            this.playerHero.passive.trigger === 'onFriendlyMinionDeath') {
            this.playerHero.passive.effect(this, minion);
        }
        
        // Remove from board
        if (board === 'player') {
            this.playerBoard[boardIndex] = null;
        } else {
            this.enemyBoard[boardIndex] = null;
            this.gameStats.minionsDestroyed++;
            
            // Update quest
            if (this.questManager) {
                this.questManager.updateProgress(QUEST_TYPES.DESTROY_MINIONS, 1);
            }
        }
        
        this.updateSpellDamageBonus();
    }
    
    // ============================================
    // HERO POWER
    // ============================================
    
    /**
     * Use hero power
     */
    useHeroPower(targetId = null) {
        if (!this.isPlayerTurn) return false;
        
        const heroPower = this.playerHero.heroPower;
        
        // Check if already used
        if (heroPower.timesUsedThisTurn >= heroPower.usesPerTurn) {
            this.addBattleLog('Hero power already used this turn!');
            return false;
        }
        
        // Check mana cost
        if (heroPower.cost > this.playerCurrentMana) {
            this.addBattleLog('Not enough mana!');
            AnimationManager.showNotification('Not enough mana!', 'error', 2000);
            return false;
        }
        
        // Pay mana
        this.playerCurrentMana -= heroPower.cost;
        heroPower.timesUsedThisTurn++;
        
        // Execute effect
        heroPower.effect(this, targetId);
        
        this.addBattleLog(`Used ${heroPower.name}!`);
        this.gameStats.heroPowersUsed++;
        
        // Update quest
        if (this.questManager) {
            this.questManager.updateProgress(QUEST_TYPES.USE_HERO_POWER, 1);
        }
        
        this.updateUI();
        this.checkGameEnd();
        
        return true;
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    /**
     * Find a target by ID
     */
    findTarget(targetId) {
        if (targetId === 'playerHero') return this.playerHero;
        if (targetId === 'enemyHero') return this.enemyHero;
        
        let target = this.playerBoard.find(m => m && m.id === targetId);
        if (target) return target;
        
        target = this.enemyBoard.find(m => m && m.id === targetId);
        if (target) return target;
        
        return null;
    }
    
    /**
     * Update spell damage bonus from board
     */
    updateSpellDamageBonus() {
        this.spellDamageBonus = 0;
        this.playerBoard.forEach(minion => {
            if (minion && minion.spellDamage) {
                this.spellDamageBonus += minion.spellDamage;
            }
        });
    }
    
    /**
     * Trigger start of turn effects
     */
    triggerStartOfTurnEffects(player) {
        const hero = player === 'player' ? this.playerHero : this.enemyHero;
        
        if (hero.passive && hero.passive.trigger === 'startTurn') {
            hero.passive.effect(this);
        }
    }
    
    /**
     * Trigger end of turn effects
     */
    triggerEndOfTurnEffects(player) {
        const board = player === 'player' ? this.playerBoard : this.enemyBoard;
        const hero = player === 'player' ? this.playerHero : this.enemyHero;
        
        // Minion end of turn effects
        board.forEach(minion => {
            if (minion && minion.endTurnEffect) {
                minion.endTurnEffect(this);
            }
        });
        
        // Hero passive end of turn effects
        if (hero.passive && hero.passive.trigger === 'endTurn') {
            hero.passive.effect(this);
        }
    }
    
    /**
     * Add message to battle log
     */
    addBattleLog(message) {
        this.battleLog.push({
            message: message,
            timestamp: Date.now()
        });
        
        // Keep only last 50 messages
        if (this.battleLog.length > 50) {
            this.battleLog.shift();
        }
    }
    
    /**
     * Check if game has ended
     */
    checkGameEnd() {
        if (this.playerHero.currentHealth <= 0) {
            this.endGame(false);
            return true;
        }
        
        if (this.enemyHero.currentHealth <= 0) {
            this.endGame(true);
            return true;
        }
        
        return false;
    }
    
    /**
     * End the game
     */
    endGame(playerWon) {
        this.phase = 'ended';
        const duration = Date.now() - this.gameStartTime;
        
        // Record statistics
        StorageManager.recordGameResult(playerWon, duration, this.gameStats);
        
        // Update quest for winning
        if (playerWon && this.questManager) {
            this.questManager.updateProgress(QUEST_TYPES.WIN_GAMES, 1);
            
            // Check survivor quest
            if (this.playerHero.currentHealth <= 10) {
                this.questManager.updateProgress(QUEST_TYPES.SURVIVE_DAMAGE, 1, { health: this.playerHero.currentHealth });
            }
        }
        
        // Show end game screen
        this.showEndGameScreen(playerWon, duration);
    }
    
    /**
     * Show end game screen
     */
    showEndGameScreen(playerWon, duration) {
        // This will be handled by UI manager
        console.log(`Game ended. Player won: ${playerWon}. Duration: ${duration}ms`);
    }
    
    /**
     * Update UI (called from UI manager)
     */
    updateUI() {
        // This is a hook for the UI manager to update the display
        if (window.UIManager && window.UIManager.updateGameBoard) {
            window.UIManager.updateGameBoard();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
