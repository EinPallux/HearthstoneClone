/* ============================================
   AI ENEMY LOGIC
   Simple decision tree for enemy behavior.
   ============================================ */

class AIPlayer {
    constructor(gameState, difficulty) {
        this.game = gameState;
        this.difficulty = difficulty;
    }
    
    async executeTurn() {
        console.log("🤖 AI thinking...");
        
        // 1. Play Cards
        await this.playCardsPhase();
        
        // 2. Attack
        await this.attackPhase();
        
        // 3. Hero Power
        if (this.game.enemyCurrentMana >= 2) {
            // Simple logic: use if mana available
            // In a real game, checking if power is useful is better
            // Visual feedback handled by state update
        }
        
        console.log("🤖 AI turn complete.");
        this.game.endEnemyTurn();
    }
    
    // --- Phases ---
    
    async playCardsPhase() {
        // Simple Greedy Algorithm: Play most expensive affordable card
        // Sort hand by cost desc (assuming we have access to card objects, 
        // in gameState we stored placeholder, but let's assume we have data)
        
        // In this implementation, enemyHand holds actual card data objects
        const hand = this.game.enemyHand;
        
        // Try to play cards until mana runs out
        let playedCard = true;
        while(playedCard) {
            playedCard = false;
            
            // Find playable
            const playable = hand.filter(c => c.cost <= this.game.enemyCurrentMana);
            if(playable.length === 0) break;
            
            // Pick one
            const card = playable[0]; // First available
            
            // Determine target if needed
            let targetId = null;
            // Simple targeting AI: Hit player face with damage, hit random with others
            if(this.needsTarget(card)) {
                targetId = 'playerHero'; 
            }
            
            // Execute Play (Manual state update since BattleSystem is player-centric UI)
            // We mimic BattleSystem logic for AI
            this.aiPlayCard(card, targetId);
            playedCard = true;
            
            await this.sleep(1000); // Wait for animation
        }
    }
    
    async attackPhase() {
        // Collect attackers
        const attackers = this.game.enemyBoard.filter(m => m && m.canAttack && !m.frozen);
        
        for (const minion of attackers) {
            // Simple AI: Go Face unless Taunt exists
            let targetId = 'playerHero';
            
            const taunts = this.game.playerBoard.filter(m => m && m.abilities?.includes('taunt'));
            if(taunts.length > 0) {
                targetId = taunts[0].id;
            } else {
                // If can kill a minion for free, do it (Smart AI only)
                if(this.difficulty === 'hard') {
                    const killable = this.game.playerBoard.find(m => m && m.currentHealth <= minion.attack && m.attack < minion.currentHealth);
                    if(killable) targetId = killable.id;
                }
            }
            
            this.aiAttack(minion, targetId);
            await this.sleep(800);
        }
    }
    
    // --- Execution Wrappers ---
    
    aiPlayCard(card, targetId) {
        // Remove from hand
        const idx = this.game.enemyHand.indexOf(card);
        if(idx > -1) this.game.enemyHand.splice(idx, 1);
        this.game.enemyHandSize--;
        
        this.game.enemyCurrentMana -= card.cost;
        
        if(card.type === 'minion') {
            const slot = this.game.enemyBoard.findIndex(s => s === null);
            if(slot > -1) {
                const minion = { ...card, currentHealth: card.health, maxHealth: card.health, attacksThisTurn: 0, canAttack: false };
                this.game.enemyBoard[slot] = minion;
                
                // Trigger Visual
                AnimationManager.showNotification(`Enemy played ${card.name}`, "info");
                // Note: We don't have a specific "Enemy Play Animation" in AnimationManager yet,
                // but the UI update will show it appearing.
            }
        } else if(card.type === 'spell') {
             AnimationManager.showNotification(`Enemy cast ${card.name}`, "info");
             if(card.effect) card.effect(this.game, targetId);
        }
        
        this.game.updateUI();
    }
    
    aiAttack(attacker, targetId) {
        // Logic similar to BattleSystem.executeAttack but for AI
        const target = this.game.findTarget(targetId);
        if(!target) return;
        
        AnimationManager.animateAttack(attacker.id, targetId);
        
        setTimeout(() => {
            this.applyDamage(target, attacker.attack);
            if(target.attack > 0) this.applyDamage(attacker, target.attack);
            
            // Check deaths manually for AI turn
            // (Shared logic could be moved to GameState to avoid duplication)
            this.game.playerBoard.forEach((m, i) => { if(m && m.currentHealth <= 0) this.game.playerBoard[i] = null; });
            this.game.enemyBoard.forEach((m, i) => { if(m && m.currentHealth <= 0) this.game.enemyBoard[i] = null; });
            
            this.game.updateUI();
            this.game.checkGameEnd();
        }, 300);
    }
    
    applyDamage(unit, amount) {
        // Duplicated from BattleSystem for safety in this standalone AI class
        if(unit.divineShield && amount > 0) {
            unit.divineShield = false;
            return;
        }
        if(unit.armor !== undefined) {
            if(unit.armor >= amount) { unit.armor -= amount; amount = 0; }
            else { amount -= unit.armor; unit.armor = 0; }
        }
        unit.currentHealth -= amount;
        AnimationManager.animateHeroDamage(unit.id, amount);
    }
    
    // --- Helpers ---
    
    needsTarget(card) {
        if(card.description.includes("Deal")) return true;
        return false;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPlayer;
}