/* ============================================
   BATTLE SYSTEM
   Manages combat mechanics and game flow
   ============================================ */

class BattleSystem {
    constructor(gameState) {
        this.game = gameState;
        this.currentAction = null;
        this.selectedCard = null;
        this.selectedMinion = null;
        this.targetingMode = false;
        this.validTargets = [];
    }
    
    // ============================================
    // CARD PLAYING
    // ============================================
    
    /**
     * Initiate card play from hand
     */
    initiateCardPlay(card, handIndex) {
        if (!this.game.isPlayerTurn) {
            AnimationManager.showNotification("It's not your turn!", 'error', 2000);
            return false;
        }
        
        // Check mana
        if (card.cost > this.game.playerCurrentMana) {
            AnimationManager.showNotification('Not enough mana!', 'error', 2000);
            return false;
        }
        
        this.selectedCard = { card, handIndex };
        
        // Different handling based on card type
        if (card.type === 'minion') {
            // Check if board has space
            const hasSpace = this.game.playerBoard.some(slot => slot === null);
            if (!hasSpace) {
                AnimationManager.showNotification('Board is full!', 'error', 2000);
                this.cancelAction();
                return false;
            }
            
            // Check if minion needs battlecry target
            if (card.battlecry && this.needsTarget(card)) {
                this.enterTargetingMode('battlecry', card);
            } else {
                // Play immediately
                this.playMinionCard(card, handIndex);
            }
        } else if (card.type === 'spell') {
            // Check if spell needs target
            if (this.needsSpellTarget(card)) {
                this.enterTargetingMode('spell', card);
            } else {
                // Cast immediately (AoE or self-target)
                this.playSpellCard(card, handIndex);
            }
        } else if (card.type === 'weapon') {
            // Play immediately
            this.playWeaponCard(card, handIndex);
        }
        
        return true;
    }
    
    /**
     * Play minion card
     */
    playMinionCard(card, handIndex, boardPosition = null, battlecryTarget = null) {
        // Find empty slot
        let slotIndex = boardPosition;
        if (slotIndex === null) {
            slotIndex = this.game.playerBoard.findIndex(slot => slot === null);
        }
        
        if (slotIndex === -1) return false;
        
        // Pay mana
        this.game.playerCurrentMana -= card.cost;
        
        // Remove from hand
        const cardElement = document.querySelector(`#playerHand .card[data-hand-index="${handIndex}"]`);
        this.game.playerHand.splice(handIndex, 1);
        
        // Create minion on board
        const minion = {
            ...card,
            id: Date.now() + Math.random(),
            currentHealth: card.health,
            maxHealth: card.health,
            canAttack: card.abilities?.includes('charge') || false,
            attacksThisTurn: 0,
            frozen: false,
            divineShield: card.abilities?.includes('divine_shield') || false
        };
        
        this.game.playerBoard[slotIndex] = minion;
        
        // Animate card play
        if (cardElement) {
            const boardSlot = document.querySelector(`#playerBoard`);
            AnimationManager.animateCardPlay(cardElement, boardSlot).then(() => {
                this.game.addBattleLog(`You played ${minion.name}!`);
                this.game.cardsPlayedThisTurn++;
                this.game.minionsPlayedThisTurn++;
                this.game.gameStats.cardsPlayed++;
                this.game.gameStats.minionsPlayed++;
                
                // Update quest progress
                if (this.game.questManager) {
                    this.game.questManager.updateProgress(QUEST_TYPES.PLAY_CARDS, 1);
                    this.game.questManager.updateProgress(QUEST_TYPES.SUMMON_MINIONS, 1);
                    if (card.cost >= 5) {
                        this.game.questManager.updateProgress(QUEST_TYPES.PLAY_COST, 1, { cost: card.cost });
                    }
                }
                
                // Trigger battlecry
                if (card.battlecry) {
                    setTimeout(() => {
                        card.battlecry(this.game, battlecryTarget);
                        this.game.updateUI();
                    }, 500);
                }
                
                // Trigger hero passive
                if (this.game.playerHero.passive && 
                    this.game.playerHero.passive.trigger === 'onMinionSummon') {
                    this.game.playerHero.passive.effect(this.game, minion);
                }
                
                // Trigger weapon effect
                if (this.game.playerWeapon && 
                    this.game.playerWeapon.abilities?.includes('onSummonEffect')) {
                    this.game.playerWeapon.effect(this.game, minion);
                }
                
                this.game.updateSpellDamageBonus();
                this.game.updateUI();
            });
        }
        
        this.cancelAction();
        return true;
    }
    
    /**
     * Play spell card
     */
    playSpellCard(card, handIndex, targetId = null) {
        // Pay mana
        this.game.playerCurrentMana -= card.cost;
        
        // Remove from hand
        const cardElement = document.querySelector(`#playerHand .card[data-hand-index="${handIndex}"]`);
        this.game.playerHand.splice(handIndex, 1);
        
        // Animate spell
        if (cardElement) {
            AnimationManager.animateSpellCast(cardElement).then(() => {
                this.game.addBattleLog(`You cast ${card.name}!`);
                this.game.cardsPlayedThisTurn++;
                this.game.spellsCast++;
                this.game.gameStats.cardsPlayed++;
                this.game.gameStats.spellsCast++;
                
                // Update quest progress
                if (this.game.questManager) {
                    this.game.questManager.updateProgress(QUEST_TYPES.PLAY_CARDS, 1);
                    this.game.questManager.updateProgress(QUEST_TYPES.CAST_SPELLS, 1);
                    if (card.cost >= 5) {
                        this.game.questManager.updateProgress(QUEST_TYPES.PLAY_COST, 1, { cost: card.cost });
                    }
                }
                
                // Trigger hero passive
                if (this.game.playerHero.passive && 
                    this.game.playerHero.passive.trigger === 'onSpellCast') {
                    this.game.playerHero.passive.effect(this.game);
                }
                
                // Execute spell effect
                if (card.effect) {
                    setTimeout(() => {
                        card.effect(this.game, targetId);
                        this.game.updateUI();
                        this.game.checkGameEnd();
                    }, 300);
                }
            });
        }
        
        this.cancelAction();
        return true;
    }
    
    /**
     * Play weapon card
     */
    playWeaponCard(card, handIndex) {
        // Pay mana
        this.game.playerCurrentMana -= card.cost;
        
        // Remove from hand
        const cardElement = document.querySelector(`#playerHand .card[data-hand-index="${handIndex}"]`);
        this.game.playerHand.splice(handIndex, 1);
        
        // Equip weapon
        this.game.playerWeapon = {
            ...card,
            currentDurability: card.durability
        };
        
        // Animate
        if (cardElement) {
            AnimationManager.animateCardPlay(cardElement).then(() => {
                this.game.addBattleLog(`You equipped ${card.name}!`);
                this.game.cardsPlayedThisTurn++;
                this.game.gameStats.cardsPlayed++;
                
                // Update quest
                if (this.game.questManager) {
                    this.game.questManager.updateProgress(QUEST_TYPES.PLAY_CARDS, 1);
                    if (card.cost >= 5) {
                        this.game.questManager.updateProgress(QUEST_TYPES.PLAY_COST, 1, { cost: card.cost });
                    }
                }
                
                // Trigger battlecry
                if (card.battlecry) {
                    setTimeout(() => {
                        card.battlecry(this.game, null);
                        this.game.updateUI();
                    }, 300);
                }
                
                this.game.updateUI();
            });
        }
        
        this.cancelAction();
        return true;
    }
    
    // ============================================
    // COMBAT
    // ============================================
    
    /**
     * Initiate minion attack
     */
    initiateMinionAttack(minion, minionIndex) {
        if (!this.game.isPlayerTurn) {
            AnimationManager.showNotification("It's not your turn!", 'error', 2000);
            return false;
        }
        
        if (!minion.canAttack || minion.frozen) {
            AnimationManager.showNotification('This minion cannot attack!', 'error', 2000);
            return false;
        }
        
        const maxAttacks = minion.abilities?.includes('windfury') ? 2 : 1;
        if (minion.attacksThisTurn >= maxAttacks) {
            AnimationManager.showNotification('Already attacked!', 'error', 2000);
            return false;
        }
        
        this.selectedMinion = { minion, minionIndex };
        this.enterTargetingMode('attack', minion);
        
        return true;
    }
    
    /**
     * Execute minion attack
     */
    executeMinionAttack(targetId) {
        if (!this.selectedMinion) return false;
        
        const { minion, minionIndex } = this.selectedMinion;
        const target = this.game.findTarget(targetId);
        
        if (!target) {
            this.cancelAction();
            return false;
        }
        
        // Check taunt requirement
        if (target.id === 'enemyHero') {
            const hasTaunt = this.game.enemyBoard.some(m => 
                m && m.abilities?.includes('taunt')
            );
            
            if (hasTaunt && !minion.abilities?.includes('bypass_taunt')) {
                AnimationManager.showNotification('Must attack taunt minions first!', 'error', 2000);
                this.cancelAction();
                return false;
            }
        }
        
        // Execute attack
        minion.attacksThisTurn++;
        const maxAttacks = minion.abilities?.includes('windfury') ? 2 : 1;
        if (minion.attacksThisTurn >= maxAttacks) {
            minion.canAttack = false;
        }
        
        // Get elements for animation
        const attackerElement = document.querySelector(
            `#playerBoard .minion-card[data-minion-id="${minion.id}"]`
        );
        const targetElement = document.getElementById(targetId) || 
                             document.querySelector(`[data-minion-id="${targetId}"]`);
        
        if (attackerElement && targetElement) {
            AnimationManager.animateAttack(attackerElement, targetElement).then(() => {
                if (target.type === 'minion') {
                    this.resolveMinionsVsMinion(minion, minionIndex, target);
                } else {
                    this.resolveMinionVsHero(minion, target);
                }
                
                this.game.updateUI();
                this.game.checkGameEnd();
            });
        } else {
            // Fallback if elements not found
            if (target.type === 'minion') {
                this.resolveMinionsVsMinion(minion, minionIndex, target);
            } else {
                this.resolveMinionVsHero(minion, target);
            }
            
            this.game.updateUI();
            this.game.checkGameEnd();
        }
        
        this.cancelAction();
        return true;
    }
    
    /**
     * Resolve minion vs minion combat
     */
    resolveMinionsVsMinion(attacker, attackerIndex, defender) {
        this.game.addBattleLog(`${attacker.name} attacks ${defender.name}!`);
        
        // Deal damage to both
        this.game.dealDamage(defender, attacker.attack, 'combat', attacker);
        this.game.dealDamage(attacker, defender.attack, 'combat', defender);
        
        // Lifesteal
        if (attacker.abilities?.includes('lifesteal')) {
            const healAmount = Math.min(
                attacker.attack,
                this.game.playerHero.maxHealth - this.game.playerHero.currentHealth
            );
            this.game.playerHero.currentHealth += healAmount;
            this.game.addBattleLog(`${attacker.name} heals you for ${healAmount}!`);
            AnimationManager.animateHeal('playerHero', healAmount);
        }
    }
    
    /**
     * Resolve minion vs hero combat
     */
    resolveMinionVsHero(attacker, hero) {
        this.game.addBattleLog(`${attacker.name} attacks ${hero.name}!`);
        
        const damage = attacker.attack;
        
        // Apply damage
        if (hero.armor > 0) {
            const armorDamage = Math.min(hero.armor, damage);
            hero.armor -= armorDamage;
            const remainingDamage = damage - armorDamage;
            
            if (remainingDamage > 0) {
                hero.currentHealth -= remainingDamage;
            }
            
            this.game.addBattleLog(
                `${hero.name} loses ${armorDamage} armor and takes ${remainingDamage} damage!`
            );
        } else {
            hero.currentHealth -= damage;
            this.game.addBattleLog(`${hero.name} takes ${damage} damage!`);
        }
        
        AnimationManager.animateHeroDamage(hero.id, damage);
        
        // Lifesteal
        if (attacker.abilities?.includes('lifesteal')) {
            const healAmount = Math.min(
                damage,
                this.game.playerHero.maxHealth - this.game.playerHero.currentHealth
            );
            this.game.playerHero.currentHealth += healAmount;
            this.game.addBattleLog(`${attacker.name} heals you for ${healAmount}!`);
            AnimationManager.animateHeal('playerHero', healAmount);
        }
        
        // Track stats
        if (hero.id === 'enemyHero') {
            this.game.gameStats.damageDealt += damage;
            
            if (this.game.questManager) {
                this.game.questManager.updateProgress(QUEST_TYPES.DEAL_DAMAGE, damage);
            }
        }
    }
    
    // ============================================
    // HERO POWER
    // ============================================
    
    /**
     * Initiate hero power use
     */
    initiateHeroPower() {
        if (!this.game.isPlayerTurn) {
            AnimationManager.showNotification("It's not your turn!", 'error', 2000);
            return false;
        }
        
        const heroPower = this.game.playerHero.heroPower;
        
        if (heroPower.timesUsedThisTurn >= heroPower.usesPerTurn) {
            AnimationManager.showNotification('Hero power already used!', 'error', 2000);
            return false;
        }
        
        if (heroPower.cost > this.game.playerCurrentMana) {
            AnimationManager.showNotification('Not enough mana!', 'error', 2000);
            return false;
        }
        
        // Check if needs target
        if (heroPower.needsTarget) {
            this.enterTargetingMode('hero_power', heroPower);
        } else {
            this.executeHeroPower();
        }
        
        return true;
    }
    
    /**
     * Execute hero power
     */
    executeHeroPower(targetId = null) {
        const heroPower = this.game.playerHero.heroPower;
        
        // Pay mana
        this.game.playerCurrentMana -= heroPower.cost;
        heroPower.timesUsedThisTurn++;
        
        // Execute effect
        heroPower.effect(this.game, targetId);
        
        this.game.addBattleLog(`Used ${heroPower.name}!`);
        this.game.gameStats.heroPowersUsed++;
        
        if (this.game.questManager) {
            this.game.questManager.updateProgress(QUEST_TYPES.USE_HERO_POWER, 1);
        }
        
        this.game.updateUI();
        this.game.checkGameEnd();
        
        this.cancelAction();
        return true;
    }
    
    // ============================================
    // TARGETING SYSTEM
    // ============================================
    
    /**
     * Enter targeting mode
     */
    enterTargetingMode(actionType, source) {
        this.targetingMode = true;
        this.currentAction = { type: actionType, source: source };
        this.validTargets = this.getValidTargets(actionType, source);
        
        // Highlight valid targets
        this.highlightValidTargets();
        
        AnimationManager.showNotification('Choose a target...', 'info', 2000);
    }
    
    /**
     * Get valid targets for action
     */
    getValidTargets(actionType, source) {
        const targets = [];
        
        if (actionType === 'attack') {
            // Check for taunt minions
            const taunts = this.game.enemyBoard.filter(m => 
                m && m.abilities?.includes('taunt')
            );
            
            if (taunts.length > 0) {
                return taunts.map(m => m.id);
            }
            
            // All enemy minions
            this.game.enemyBoard.forEach(m => {
                if (m) targets.push(m.id);
            });
            
            // Enemy hero
            targets.push('enemyHero');
            
        } else if (actionType === 'spell' || actionType === 'battlecry') {
            // Depends on spell/battlecry requirements
            // For now, allow all targets
            
            this.game.playerBoard.forEach(m => {
                if (m) targets.push(m.id);
            });
            
            this.game.enemyBoard.forEach(m => {
                if (m) targets.push(m.id);
            });
            
            targets.push('playerHero');
            targets.push('enemyHero');
            
        } else if (actionType === 'hero_power') {
            const heroPower = source;
            
            if (heroPower.validTargets === 'friendly') {
                this.game.playerBoard.forEach(m => {
                    if (m) targets.push(m.id);
                });
                targets.push('playerHero');
            } else if (heroPower.validTargets === 'enemy') {
                this.game.enemyBoard.forEach(m => {
                    if (m) targets.push(m.id);
                });
                targets.push('enemyHero');
            } else if (heroPower.validTargets === 'friendlyMinion') {
                this.game.playerBoard.forEach(m => {
                    if (m) targets.push(m.id);
                });
            } else if (heroPower.validTargets === 'anyMinion') {
                this.game.playerBoard.forEach(m => {
                    if (m) targets.push(m.id);
                });
                this.game.enemyBoard.forEach(m => {
                    if (m) targets.push(m.id);
                });
            } else {
                // Default: all targets
                this.game.playerBoard.forEach(m => {
                    if (m) targets.push(m.id);
                });
                this.game.enemyBoard.forEach(m => {
                    if (m) targets.push(m.id);
                });
                targets.push('playerHero');
                targets.push('enemyHero');
            }
        }
        
        return targets;
    }
    
    /**
     * Highlight valid targets
     */
    highlightValidTargets() {
        // Remove previous highlights
        document.querySelectorAll('.target-indicator').forEach(el => {
            el.classList.remove('target-indicator');
        });
        
        // Add highlights to valid targets
        this.validTargets.forEach(targetId => {
            const element = document.getElementById(targetId) ||
                           document.querySelector(`[data-minion-id="${targetId}"]`);
            
            if (element) {
                element.classList.add('target-indicator');
            }
        });
    }
    
    /**
     * Select target
     */
    selectTarget(targetId) {
        if (!this.targetingMode) return false;
        
        if (!this.validTargets.includes(targetId)) {
            AnimationManager.showNotification('Invalid target!', 'error', 1500);
            return false;
        }
        
        // Execute action based on type
        if (this.currentAction.type === 'attack') {
            this.executeMinionAttack(targetId);
        } else if (this.currentAction.type === 'spell') {
            const { card, handIndex } = this.selectedCard;
            this.playSpellCard(card, handIndex, targetId);
        } else if (this.currentAction.type === 'battlecry') {
            const { card, handIndex } = this.selectedCard;
            this.playMinionCard(card, handIndex, null, targetId);
        } else if (this.currentAction.type === 'hero_power') {
            this.executeHeroPower(targetId);
        }
        
        return true;
    }
    
    /**
     * Cancel current action
     */
    cancelAction() {
        this.targetingMode = false;
        this.currentAction = null;
        this.selectedCard = null;
        this.selectedMinion = null;
        this.validTargets = [];
        
        // Remove highlights
        document.querySelectorAll('.target-indicator').forEach(el => {
            el.classList.remove('target-indicator');
        });
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    /**
     * Check if card needs a target
     */
    needsTarget(card) {
        if (card.type === 'spell') {
            return this.needsSpellTarget(card);
        }
        
        // For minions, check battlecry
        if (card.battlecry) {
            const desc = card.description.toLowerCase();
            return desc.includes('deal') || 
                   desc.includes('restore') ||
                   desc.includes('give') ||
                   desc.includes('damage') ||
                   desc.includes('freeze');
        }
        
        return false;
    }
    
    /**
     * Check if spell needs target
     */
    needsSpellTarget(card) {
        const desc = card.description.toLowerCase();
        
        // AoE spells don't need targets
        if (desc.includes('all')) return false;
        if (desc.includes('random')) return false;
        if (desc.includes('draw')) return false;
        if (desc.includes('gain')) return false;
        if (desc.includes('summon')) return false;
        
        // Targeted effects
        if (desc.includes('deal') && !desc.includes('all')) return true;
        if (desc.includes('destroy') && !desc.includes('all')) return true;
        if (desc.includes('restore')) return true;
        if (desc.includes('give')) return true;
        if (desc.includes('transform')) return true;
        if (desc.includes('freeze') && !desc.includes('all')) return true;
        
        return false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleSystem;
}
