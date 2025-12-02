/* ============================================
   AI SYSTEM
   Enemy AI with three difficulty levels
   ============================================ */

class AIPlayer {
    constructor(gameState, difficulty = 'medium') {
        this.game = gameState;
        this.difficulty = difficulty;
        this.thinkingTime = this.getThinkingTime();
    }
    
    /**
     * Get AI thinking delay based on difficulty
     */
    getThinkingTime() {
        return {
            easy: { min: 800, max: 1500 },
            medium: { min: 600, max: 1200 },
            hard: { min: 400, max: 800 }
        }[this.difficulty] || { min: 600, max: 1200 };
    }
    
    /**
     * Main AI turn execution
     */
    async executeTurn() {
        this.game.addBattleLog('Enemy is thinking...');
        
        // Wait a bit for realism
        await this.delay(this.randomThinkTime());
        
        // AI decision making loop
        let actionsThisTurn = 0;
        const maxActions = 20; // Prevent infinite loops
        
        while (actionsThisTurn < maxActions) {
            const action = this.chooseAction();
            
            if (!action) {
                break; // No more valid actions
            }
            
            await this.executeAction(action);
            await this.delay(this.randomThinkTime());
            
            actionsThisTurn++;
            
            // Check if game ended
            if (this.game.phase === 'ended') {
                return;
            }
        }
        
        // End turn
        this.game.endEnemyTurn();
    }
    
    /**
     * Choose best action based on difficulty
     */
    chooseAction() {
        const possibleActions = this.getAllPossibleActions();
        
        if (possibleActions.length === 0) {
            return null;
        }
        
        // Different decision making based on difficulty
        if (this.difficulty === 'easy') {
            return this.chooseActionEasy(possibleActions);
        } else if (this.difficulty === 'medium') {
            return this.chooseActionMedium(possibleActions);
        } else {
            return this.chooseActionHard(possibleActions);
        }
    }
    
    /**
     * Get all possible actions AI can take
     */
    getAllPossibleActions() {
        const actions = [];
        
        // 1. Play cards from hand
        this.game.enemyHand.forEach((card, index) => {
            if (card.cost <= this.game.enemyCurrentMana) {
                if (card.type === 'minion') {
                    const emptySlot = this.game.enemyBoard.findIndex(s => s === null);
                    if (emptySlot !== -1) {
                        actions.push({
                            type: 'play_minion',
                            card: card,
                            handIndex: index,
                            priority: this.evaluateCardPlay(card)
                        });
                    }
                } else if (card.type === 'spell') {
                    const targets = this.getValidSpellTargets(card);
                    if (targets.length > 0 || !card.effect) {
                        actions.push({
                            type: 'play_spell',
                            card: card,
                            handIndex: index,
                            targets: targets,
                            priority: this.evaluateSpellPlay(card, targets)
                        });
                    }
                } else if (card.type === 'weapon') {
                    actions.push({
                        type: 'play_weapon',
                        card: card,
                        handIndex: index,
                        priority: this.evaluateWeaponPlay(card)
                    });
                }
            }
        });
        
        // 2. Attack with minions
        this.game.enemyBoard.forEach((minion, index) => {
            if (minion && minion.canAttack && !minion.frozen) {
                const maxAttacks = minion.abilities?.includes('windfury') ? 2 : 1;
                if (minion.attacksThisTurn < maxAttacks) {
                    const targets = this.getValidAttackTargets(minion);
                    targets.forEach(target => {
                        actions.push({
                            type: 'minion_attack',
                            minion: minion,
                            minionIndex: index,
                            target: target,
                            priority: this.evaluateAttack(minion, target)
                        });
                    });
                }
            }
        });
        
        // 3. Use hero power
        const heroPower = this.game.enemyHero.heroPower;
        if (heroPower && heroPower.timesUsedThisTurn < heroPower.usesPerTurn &&
            heroPower.cost <= this.game.enemyCurrentMana) {
            const targets = this.getValidHeroPowerTargets();
            actions.push({
                type: 'hero_power',
                targets: targets,
                priority: this.evaluateHeroPowerUse()
            });
        }
        
        // 4. Attack with weapon (if equipped)
        if (this.game.enemyWeapon && this.game.enemyWeapon.currentDurability > 0) {
            // Check if hero can attack (similar to minion logic)
            const targets = this.getValidWeaponTargets();
            targets.forEach(target => {
                actions.push({
                    type: 'weapon_attack',
                    target: target,
                    priority: this.evaluateWeaponAttack(target)
                });
            });
        }
        
        return actions;
    }
    
    /**
     * Easy AI - Random decisions with slight preference for good plays
     */
    chooseActionEasy(actions) {
        // 30% chance of random action, 70% chance of considering priority
        if (Math.random() < 0.3) {
            return actions[Math.floor(Math.random() * actions.length)];
        }
        
        // Sort by priority but add randomness
        const sorted = actions.sort((a, b) => {
            const randomA = a.priority + Math.random() * 20;
            const randomB = b.priority + Math.random() * 20;
            return randomB - randomA;
        });
        
        return sorted[0];
    }
    
    /**
     * Medium AI - Good decision making with occasional mistakes
     */
    chooseActionMedium(actions) {
        // Sort by priority
        const sorted = actions.sort((a, b) => b.priority - a.priority);
        
        // 80% pick best, 20% pick from top 3
        if (Math.random() < 0.8) {
            return sorted[0];
        } else {
            const topActions = sorted.slice(0, Math.min(3, sorted.length));
            return topActions[Math.floor(Math.random() * topActions.length)];
        }
    }
    
    /**
     * Hard AI - Optimal decision making
     */
    chooseActionHard(actions) {
        // Always pick the highest priority action
        const sorted = actions.sort((a, b) => b.priority - a.priority);
        return sorted[0];
    }
    
    /**
     * Execute chosen action
     */
    async executeAction(action) {
        switch (action.type) {
            case 'play_minion':
                this.aiPlayMinion(action.card, action.handIndex);
                break;
                
            case 'play_spell':
                this.aiPlaySpell(action.card, action.handIndex, action.targets);
                break;
                
            case 'play_weapon':
                this.aiPlayWeapon(action.card, action.handIndex);
                break;
                
            case 'minion_attack':
                await this.aiMinionAttack(action.minion, action.minionIndex, action.target);
                break;
                
            case 'hero_power':
                this.aiUseHeroPower(action.targets);
                break;
                
            case 'weapon_attack':
                await this.aiWeaponAttack(action.target);
                break;
        }
    }
    
    // ============================================
    // AI ACTIONS
    // ============================================
    
    /**
     * AI plays a minion
     */
    aiPlayMinion(card, handIndex) {
        const emptySlot = this.game.enemyBoard.findIndex(s => s === null);
        if (emptySlot === -1) return;
        
        // Pay mana
        this.game.enemyCurrentMana -= card.cost;
        
        // Remove from hand
        this.game.enemyHand.splice(handIndex, 1);
        this.game.enemyHandSize--;
        
        // Place on board
        const minion = {
            ...card,
            currentHealth: card.health,
            maxHealth: card.health,
            canAttack: card.abilities?.includes('charge') || false,
            attacksThisTurn: 0,
            frozen: false,
            divineShield: card.abilities?.includes('divine_shield') || false
        };
        
        this.game.enemyBoard[emptySlot] = minion;
        this.game.addBattleLog(`Enemy played ${minion.name}!`);
        
        // Trigger battlecry with AI target selection
        if (card.battlecry) {
            const target = this.chooseBattlecryTarget(card);
            setTimeout(() => {
                card.battlecry(this.game, target);
                this.game.updateUI();
            }, 300);
        }
        
        this.game.updateUI();
    }
    
    /**
     * AI plays a spell
     */
    aiPlaySpell(card, handIndex, targets) {
        // Pay mana
        this.game.enemyCurrentMana -= card.cost;
        
        // Remove from hand
        this.game.enemyHand.splice(handIndex, 1);
        this.game.enemyHandSize--;
        
        this.game.addBattleLog(`Enemy cast ${card.name}!`);
        
        // Choose best target
        const target = this.chooseSpellTarget(card, targets);
        
        // Execute spell
        if (card.effect) {
            setTimeout(() => {
                card.effect(this.game, target);
                this.game.updateUI();
                this.game.checkGameEnd();
            }, 300);
        }
        
        this.game.updateUI();
    }
    
    /**
     * AI plays a weapon
     */
    aiPlayWeapon(card, handIndex) {
        // Pay mana
        this.game.enemyCurrentMana -= card.cost;
        
        // Remove from hand
        this.game.enemyHand.splice(handIndex, 1);
        this.game.enemyHandSize--;
        
        // Equip weapon
        this.game.enemyWeapon = {
            ...card,
            currentDurability: card.durability
        };
        
        this.game.addBattleLog(`Enemy equipped ${card.name}!`);
        this.game.updateUI();
    }
    
    /**
     * AI minion attacks
     */
    async aiMinionAttack(minion, minionIndex, target) {
        const maxAttacks = minion.abilities?.includes('windfury') ? 2 : 1;
        minion.attacksThisTurn++;
        
        if (minion.attacksThisTurn >= maxAttacks) {
            minion.canAttack = false;
        }
        
        if (target.type === 'minion') {
            this.game.addBattleLog(`Enemy ${minion.name} attacks ${target.name}!`);
            
            // Deal damage
            this.game.dealDamage(target, minion.attack, 'combat', minion);
            this.game.dealDamage(minion, target.attack, 'combat', target);
        } else {
            // Attack player hero
            this.game.addBattleLog(`Enemy ${minion.name} attacks you!`);
            
            const damage = minion.attack;
            if (this.game.playerHero.armor > 0) {
                const armorDamage = Math.min(this.game.playerHero.armor, damage);
                this.game.playerHero.armor -= armorDamage;
                const remainingDamage = damage - armorDamage;
                
                if (remainingDamage > 0) {
                    this.game.playerHero.currentHealth -= remainingDamage;
                }
            } else {
                this.game.playerHero.currentHealth -= damage;
            }
            
            AnimationManager.animateHeroDamage('playerHero', damage);
        }
        
        this.game.updateUI();
        this.game.checkGameEnd();
    }
    
    /**
     * AI uses hero power
     */
    aiUseHeroPower(targets) {
        const heroPower = this.game.enemyHero.heroPower;
        
        // Pay mana
        this.game.enemyCurrentMana -= heroPower.cost;
        heroPower.timesUsedThisTurn++;
        
        // Choose target
        const target = targets.length > 0 ? this.chooseHeroPowerTarget(targets) : null;
        
        // Execute
        heroPower.effect(this.game, target);
        
        this.game.addBattleLog(`Enemy used ${heroPower.name}!`);
        this.game.updateUI();
        this.game.checkGameEnd();
    }
    
    /**
     * AI attacks with weapon
     */
    async aiWeaponAttack(target) {
        const weapon = this.game.enemyWeapon;
        
        if (target.id === 'playerHero') {
            this.game.addBattleLog('Enemy attacks you with weapon!');
            
            const damage = weapon.attack;
            if (this.game.playerHero.armor > 0) {
                const armorDamage = Math.min(this.game.playerHero.armor, damage);
                this.game.playerHero.armor -= armorDamage;
                const remainingDamage = damage - armorDamage;
                
                if (remainingDamage > 0) {
                    this.game.playerHero.currentHealth -= remainingDamage;
                }
            } else {
                this.game.playerHero.currentHealth -= damage;
            }
            
            AnimationManager.animateHeroDamage('playerHero', damage);
        } else {
            this.game.addBattleLog(`Enemy attacks ${target.name} with weapon!`);
            this.game.dealDamage(target, weapon.attack, 'combat');
        }
        
        // Reduce durability
        weapon.currentDurability--;
        if (weapon.currentDurability <= 0) {
            this.game.enemyWeapon = null;
            this.game.addBattleLog('Enemy weapon broke!');
        }
        
        this.game.updateUI();
        this.game.checkGameEnd();
    }
    
    // ============================================
    // EVALUATION FUNCTIONS
    // ============================================
    
    /**
     * Evaluate playing a card
     */
    evaluateCardPlay(card) {
        let priority = 0;
        
        // Base priority on mana efficiency
        priority += (card.attack || 0) + (card.health || 0);
        priority += card.cost * 2; // Prefer playing higher cost cards when possible
        
        // Bonus for special abilities
        if (card.abilities) {
            if (card.abilities.includes('taunt')) priority += 8;
            if (card.abilities.includes('divine_shield')) priority += 6;
            if (card.abilities.includes('charge')) priority += 10;
            if (card.abilities.includes('lifesteal')) priority += 7;
            if (card.abilities.includes('windfury')) priority += 8;
            if (card.abilities.includes('poisonous')) priority += 5;
        }
        
        // Bonus for battlecry
        if (card.battlecry) priority += 5;
        
        // Consider board state
        const enemyMinions = this.game.enemyBoard.filter(m => m).length;
        const playerMinions = this.game.playerBoard.filter(m => m).length;
        
        if (playerMinions > enemyMinions + 1) {
            // Behind on board, prioritize taunt/healing
            if (card.abilities?.includes('taunt')) priority += 15;
        }
        
        // Health consideration
        if (this.game.enemyHero.currentHealth < 15) {
            if (card.abilities?.includes('taunt')) priority += 10;
            if (card.abilities?.includes('lifesteal')) priority += 10;
        }
        
        return priority;
    }
    
    /**
     * Evaluate playing a spell
     */
    evaluateSpellPlay(card, targets) {
        let priority = 0;
        
        // Check spell type based on description
        const desc = card.description.toLowerCase();
        
        if (desc.includes('damage')) {
            // Damage spell
            priority += 20;
            
            // Prioritize if can kill something
            if (targets.length > 0) {
                const canKill = targets.some(t => {
                    if (t.type === 'minion') {
                        const damage = this.estimateSpellDamage(card);
                        return t.currentHealth <= damage;
                    }
                    return false;
                });
                
                if (canKill) priority += 30;
            }
            
            // Prioritize if enemy hero is low
            if (this.game.playerHero.currentHealth <= 10) {
                priority += 40;
            }
        }
        
        if (desc.includes('draw')) {
            priority += 15;
            if (this.game.enemyHand.length < 3) priority += 10;
        }
        
        if (desc.includes('heal')) {
            if (this.game.enemyHero.currentHealth < 20) {
                priority += 25;
            }
        }
        
        if (desc.includes('destroy')) {
            priority += 35;
        }
        
        if (desc.includes('transform')) {
            priority += 30;
        }
        
        return priority;
    }
    
    /**
     * Evaluate playing a weapon
     */
    evaluateWeaponPlay(card) {
        let priority = card.attack * 3 + card.durability * 2;
        
        // Consider if already has weapon
        if (this.game.enemyWeapon) {
            priority -= 10;
        }
        
        return priority;
    }
    
    /**
     * Evaluate an attack
     */
    evaluateAttack(attacker, target) {
        let priority = 0;
        
        if (target.id === 'playerHero') {
            // Direct face damage
            priority = 50;
            
            // Higher priority if can win
            if (this.game.playerHero.currentHealth <= attacker.attack) {
                priority = 1000; // LETHAL!
            }
            
            // Lower priority if there are taunts
            const hasTaunts = this.game.playerBoard.some(m => m && m.abilities?.includes('taunt'));
            if (hasTaunts) {
                priority = 0; // Can't attack face with taunts
            }
        } else {
            // Trading with minion
            const willDie = attacker.currentHealth <= target.attack;
            const willKill = target.currentHealth <= attacker.attack;
            
            if (willKill && !willDie) {
                priority = 80; // Favorable trade
            } else if (willKill && willDie) {
                priority = 50; // Even trade
            } else if (!willKill && !willDie) {
                priority = 30; // Chip damage
            } else {
                priority = 10; // Bad trade (we die but don't kill)
            }
            
            // Prioritize killing high value targets
            if (target.abilities?.includes('taunt')) priority += 20;
            if (target.attack >= 4) priority += 15;
            if (target.abilities?.includes('divine_shield')) priority += 10;
        }
        
        return priority;
    }
    
    /**
     * Evaluate hero power use
     */
    evaluateHeroPowerUse() {
        let priority = 10;
        
        // Use hero power more when have excess mana
        if (this.game.enemyCurrentMana >= 4) {
            priority += 15;
        }
        
        return priority;
    }
    
    /**
     * Evaluate weapon attack
     */
    evaluateWeaponAttack(target) {
        let priority = 0;
        
        if (target.id === 'playerHero') {
            priority = 40;
            
            // Check for lethal
            if (this.game.playerHero.currentHealth <= this.game.enemyWeapon.attack) {
                priority = 1000;
            }
        } else {
            // Consider if worth weapon durability
            const willKill = target.currentHealth <= this.game.enemyWeapon.attack;
            if (willKill) {
                priority = 60;
            } else {
                priority = 30;
            }
        }
        
        return priority;
    }
    
    // ============================================
    // TARGET SELECTION
    // ============================================
    
    /**
     * Get valid attack targets for a minion
     */
    getValidAttackTargets(minion) {
        const targets = [];
        
        // Check for taunts
        const taunts = this.game.playerBoard.filter(m => m && m.abilities?.includes('taunt'));
        
        if (taunts.length > 0) {
            return taunts;
        }
        
        // All player minions
        this.game.playerBoard.forEach(m => {
            if (m) targets.push(m);
        });
        
        // Player hero
        targets.push(this.game.playerHero);
        
        return targets;
    }
    
    /**
     * Get valid spell targets
     */
    getValidSpellTargets(card) {
        const targets = [];
        
        // All minions
        this.game.playerBoard.forEach(m => {
            if (m) targets.push(m);
        });
        
        this.game.enemyBoard.forEach(m => {
            if (m) targets.push(m);
        });
        
        // Heroes
        targets.push(this.game.playerHero);
        targets.push(this.game.enemyHero);
        
        return targets;
    }
    
    /**
     * Get valid hero power targets
     */
    getValidHeroPowerTargets() {
        // Similar to spell targets
        return this.getValidSpellTargets(null);
    }
    
    /**
     * Get valid weapon targets
     */
    getValidWeaponTargets() {
        const targets = [];
        
        // Check for taunts
        const taunts = this.game.playerBoard.filter(m => m && m.abilities?.includes('taunt'));
        
        if (taunts.length > 0) {
            return taunts;
        }
        
        // All player minions
        this.game.playerBoard.forEach(m => {
            if (m) targets.push(m);
        });
        
        // Player hero
        targets.push(this.game.playerHero);
        
        return targets;
    }
    
    /**
     * Choose best spell target
     */
    chooseSpellTarget(card, targets) {
        if (targets.length === 0) return null;
        
        const desc = card.description.toLowerCase();
        
        if (desc.includes('damage')) {
            // Prioritize killing minions or hitting face for lethal
            const damage = this.estimateSpellDamage(card);
            
            // Check for lethal on hero
            if (this.game.playerHero.currentHealth <= damage) {
                return this.game.playerHero.id;
            }
            
            // Find best minion to kill
            const killableMinions = targets.filter(t => 
                t.type === 'minion' && t.currentHealth <= damage &&
                this.game.playerBoard.includes(t)
            );
            
            if (killableMinions.length > 0) {
                // Kill highest value minion
                return killableMinions.sort((a, b) => 
                    (b.attack + b.health) - (a.attack + a.health)
                )[0].id;
            }
            
            // Default to face
            return this.game.playerHero.id;
        }
        
        if (desc.includes('heal') || desc.includes('restore')) {
            // Heal friendly targets
            if (this.game.enemyHero.currentHealth < this.game.enemyHero.maxHealth) {
                return this.game.enemyHero.id;
            }
            
            const damagedMinions = this.game.enemyBoard.filter(m => 
                m && m.currentHealth < m.maxHealth
            );
            
            if (damagedMinions.length > 0) {
                return damagedMinions[0].id;
            }
        }
        
        // Default: random target
        return targets[Math.floor(Math.random() * targets.length)].id;
    }
    
    /**
     * Choose battlecry target
     */
    chooseBattlecryTarget(card) {
        // Similar logic to spell targets
        const targets = this.getValidSpellTargets(card);
        return this.chooseSpellTarget(card, targets);
    }
    
    /**
     * Choose hero power target
     */
    chooseHeroPowerTarget(targets) {
        // Context-specific based on hero power type
        const heroPower = this.game.enemyHero.heroPower;
        
        if (heroPower.description.includes('damage')) {
            // Damage power - target player hero or weak minions
            const weakMinions = this.game.playerBoard.filter(m => 
                m && m.currentHealth <= 2
            );
            
            if (weakMinions.length > 0) {
                return weakMinions[0].id;
            }
            
            return this.game.playerHero.id;
        }
        
        if (heroPower.description.includes('heal')) {
            return this.game.enemyHero.id;
        }
        
        // Default
        return targets[0]?.id || null;
    }
    
    /**
     * Estimate spell damage
     */
    estimateSpellDamage(card) {
        const desc = card.description.toLowerCase();
        const match = desc.match(/(\d+)\s*damage/);
        return match ? parseInt(match[1]) : 0;
    }
    
    // ============================================
    // UTILITY
    // ============================================
    
    /**
     * Random thinking time
     */
    randomThinkTime() {
        const { min, max } = this.thinkingTime;
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPlayer;
}
