/* ============================================
   BATTLE SYSTEM
   Handles combat logic, card playing mechanics, and targeting.
   ============================================ */

class BattleSystem {
    constructor(gameState) {
        this.game = gameState;
        this.targetingMode = false;
        this.currentAction = null; // { type: 'playMinion'|'spell'|'attack', source: obj, handIndex: int }
        this.validTargets = [];
    }
    
    // ============================================
    // CARD PLAYING
    // ============================================
    
    initiateCardPlay(card, handIndex) {
        // 1. Validation
        if (!this.game.isPlayerTurn) {
            AnimationManager.showNotification("Not your turn!", "error");
            return;
        }
        if (card.cost > this.game.playerCurrentMana) {
            AnimationManager.showNotification("Not enough Mana!", "error");
            return;
        }
        
        // 2. Determine Action Type
        if (card.type === 'minion') {
            // Minions with targeted battlecries need targeting
            if (this.needsTarget(card)) {
                this.startTargeting('playMinion', card, handIndex);
            } else {
                // Immediate play
                this.playMinion(card, handIndex);
            }
        } else if (card.type === 'spell') {
            if (this.needsTarget(card)) {
                this.startTargeting('playSpell', card, handIndex);
            } else {
                this.playSpell(card, handIndex);
            }
        } else if (card.type === 'weapon') {
            this.playWeapon(card, handIndex);
        }
    }
    
    // --- Minion Logic ---
    
    playMinion(card, handIndex, targetId = null) {
        // Board space check
        const emptySlotIdx = this.game.playerBoard.findIndex(s => s === null);
        if (emptySlotIdx === -1) {
            AnimationManager.showNotification("Board is full!", "error");
            return;
        }
        
        // Mana
        this.game.playerCurrentMana -= card.cost;
        
        // Move from Hand
        this.game.playerHand.splice(handIndex, 1);
        
        // Add to Board
        const minion = { ...card, currentHealth: card.health, maxHealth: card.health, attacksThisTurn: 0, canAttack: false };
        // Charge check
        if (minion.abilities?.includes('charge')) minion.canAttack = true;
        
        this.game.playerBoard[emptySlotIdx] = minion;
        
        // Visuals
        AnimationManager.showNotification(`Summoned ${card.name}`, "info");
        
        // Triggers
        if (card.battlecry) {
            // If it had a target, pass it
            // Simple battlecry execution for now
            if (targetId) {
                // Execute logic (simplified for MVP)
                this.resolveBattlecry(card, targetId);
            } else if (card.battlecry && !this.needsTarget(card)) {
                card.battlecry(this.game);
            }
        }
        
        // Update Quests
        if(this.game.questManager) {
            this.game.questManager.updateProgress('summon_minions', 1);
            if(card.cost >= 5) this.game.questManager.updateProgress('play_cost', 1, {cost: card.cost});
        }
        
        this.game.updateUI();
    }
    
    // --- Spell Logic ---
    
    playSpell(card, handIndex, targetId = null) {
        this.game.playerCurrentMana -= card.cost;
        this.game.playerHand.splice(handIndex, 1);
        
        // Effect
        if (card.effect) {
            card.effect(this.game, targetId);
        }
        
        // Stats
        this.game.spellsCast++;
        this.game.updateUI();
        
        // Quests
        if(this.game.questManager) {
            this.game.questManager.updateProgress('cast_spells', 1);
        }
    }
    
    // --- Weapon Logic ---
    
    playWeapon(card, handIndex) {
        this.game.playerCurrentMana -= card.cost;
        this.game.playerHand.splice(handIndex, 1);
        
        this.game.playerHero.weapon = { ...card, currentDurability: card.durability };
        
        AnimationManager.showNotification("Weapon Equipped", "info");
        this.game.updateUI();
    }
    
    // ============================================
    // COMBAT (ATTACKING)
    // ============================================
    
    initiateMinionAttack(minion, boardIndex) {
        if (!this.game.isPlayerTurn) return;
        if (!minion.canAttack || minion.frozen) {
            AnimationManager.showNotification("Cannot attack yet!", "error");
            return;
        }
        if (minion.attacksThisTurn >= (minion.abilities?.includes('windfury') ? 2 : 1)) {
            AnimationManager.showNotification("Already attacked!", "error");
            return;
        }
        
        this.startTargeting('attack', minion, boardIndex);
    }
    
    initiateHeroPower() {
        // Similar validation...
        const hero = this.game.playerHero;
        // Assume logic handled in initiateCardPlay style if needed, 
        // usually hero power effect is direct or targeted.
        // For MVP, we'll assume direct effect or simple target.
        if(hero.heroPower.needsTarget) {
            this.startTargeting('heroPower', hero.heroPower, null);
        } else {
            // Direct
            if(this.game.playerCurrentMana >= hero.heroPower.cost) {
                this.game.playerCurrentMana -= hero.heroPower.cost;
                hero.heroPower.effect(this.game);
                this.game.questManager?.updateProgress('use_hero_power', 1);
                this.game.updateUI();
            }
        }
    }
    
    // ============================================
    // TARGETING SYSTEM
    // ============================================
    
    startTargeting(actionType, source, index) {
        this.targetingMode = true;
        this.currentAction = { type: actionType, source, index };
        this.validTargets = this.getValidTargets(actionType);
        
        AnimationManager.showNotification("Select Target", "info");
        this.game.updateUI(); // Highlights targets via CSS classes in uiManager
    }
    
    getValidTargets(actionType) {
        const targets = [];
        
        // ATTACK LOGIC
        if (actionType === 'attack') {
            // Check Taunt
            const taunts = this.game.enemyBoard.filter(m => m && m.abilities?.includes('taunt'));
            
            if (taunts.length > 0) {
                // Must attack taunt
                return taunts.map(m => m.id);
            } else {
                // Can attack anything
                this.game.enemyBoard.forEach(m => { if(m) targets.push(m.id); });
                targets.push('enemyHero');
            }
        } 
        
        // SPELL / BATTLECRY LOGIC
        else if (actionType === 'playSpell' || actionType === 'playMinion' || actionType === 'heroPower') {
            // General targeting (can be refined based on card specific needs later)
            // For now, allow targeting any unit
            this.game.enemyBoard.forEach(m => { if(m) targets.push(m.id); });
            this.game.playerBoard.forEach(m => { if(m) targets.push(m.id); });
            targets.push('enemyHero');
            targets.push('playerHero');
        }
        
        return targets;
    }
    
    selectTarget(targetId) {
        if (!this.validTargets.includes(targetId)) {
            AnimationManager.showNotification("Invalid Target", "error");
            this.cancelAction();
            return;
        }
        
        const action = this.currentAction;
        
        // Execute Action
        if (action.type === 'attack') {
            this.executeAttack(action.source, targetId);
        } else if (action.type === 'playSpell') {
            this.playSpell(action.source, action.index, targetId);
        } else if (action.type === 'playMinion') {
            this.playMinion(action.source, action.index, targetId);
        } else if (action.type === 'heroPower') {
            // Pay cost & execute
            this.game.playerCurrentMana -= action.source.cost;
            action.source.effect(this.game, targetId);
            this.game.questManager?.updateProgress('use_hero_power', 1);
            this.game.updateUI();
        }
        
        this.cancelAction();
    }
    
    cancelAction() {
        this.targetingMode = false;
        this.currentAction = null;
        this.validTargets = [];
        this.game.updateUI();
    }
    
    // ============================================
    // RESOLUTION
    // ============================================
    
    executeAttack(attacker, targetId) {
        const target = this.game.findTarget(targetId);
        if (!target) return;
        
        // Visuals
        AnimationManager.animateAttack(attacker.id, targetId);
        
        // Damage Logic (Simultaneous)
        setTimeout(() => {
            // Deal Damage to Target
            this.applyDamage(target, attacker.attack);
            
            // Deal Damage to Attacker (if target can fight back)
            if (target.attack > 0) {
                this.applyDamage(attacker, target.attack);
            }
            
            // Update State
            attacker.attacksThisTurn++;
            if(attacker.attacksThisTurn >= (attacker.abilities?.includes('windfury') ? 2 : 1)) {
                attacker.canAttack = false;
            }
            
            // Death Processing
            this.processDeaths();
            this.game.updateUI();
            this.game.checkGameEnd();
            
            // Quests
            if(this.game.questManager) this.game.questManager.updateProgress('deal_damage', attacker.attack);
            
        }, 300); // Wait for visual impact
    }
    
    applyDamage(unit, amount) {
        // Divine Shield check
        if(unit.divineShield && amount > 0) {
            unit.divineShield = false;
            AnimationManager.animateShield(unit.id); // Shield break FX
            return;
        }
        
        // Armor check (Heroes)
        if(unit.armor !== undefined) {
            if(unit.armor >= amount) {
                unit.armor -= amount;
                amount = 0;
            } else {
                amount -= unit.armor;
                unit.armor = 0;
            }
        }
        
        unit.currentHealth -= amount;
        AnimationManager.animateHeroDamage(unit.id, amount); // Generic damage FX works for both
    }
    
    processDeaths() {
        // Player Board
        this.game.playerBoard.forEach((m, i) => {
            if(m && m.currentHealth <= 0) {
                this.game.playerBoard[i] = null;
                // Death rattle logic here
            }
        });
        
        // Enemy Board
        this.game.enemyBoard.forEach((m, i) => {
            if(m && m.currentHealth <= 0) {
                this.game.enemyBoard[i] = null;
                this.game.questManager?.updateProgress('destroy_minions', 1);
            }
        });
    }
    
    // --- Helpers ---
    
    needsTarget(card) {
        // Simple check based on description for now, or specific flag
        // Ideally cards.js defines `needsTarget: true`
        if(card.description.includes("Deal") && !card.description.includes("all")) return true;
        if(card.description.includes("Destroy") && !card.description.includes("all")) return true;
        if(card.description.includes("Give") || card.description.includes("Restore")) return true;
        return false;
    }
    
    resolveBattlecry(card, targetId) {
        if(card.battlecry) card.battlecry(this.game, targetId);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleSystem;
}