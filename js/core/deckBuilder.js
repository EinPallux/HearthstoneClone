/* ============================================
   DECK BUILDER CORE
   Handles deck creation, validation, and AI suggestions
   ============================================ */

class DeckBuilder {
    constructor() {
        this.currentDeck = {
            name: 'New Deck',
            cards: [], // Array of card IDs
            hero: null
        };
        
        this.maxDeckSize = 25;
        this.maxCopiesPerCard = 2;
        
        this.filters = {
            cost: 'all',
            type: 'all',
            search: ''
        };
    }
    
    // ============================================
    // DECK MANAGEMENT
    // ============================================
    
    addCard(cardId) {
        // Validation: Deck Size
        if (this.currentDeck.cards.length >= this.maxDeckSize) {
            AnimationManager.showNotification(`Deck full! Max ${this.maxDeckSize} cards.`, 'error');
            return false;
        }
        
        // Validation: Max Copies
        const copies = this.currentDeck.cards.filter(id => id === cardId).length;
        if (copies >= this.maxCopiesPerCard) {
            AnimationManager.showNotification('Max 2 copies per card!', 'error');
            return false;
        }
        
        this.currentDeck.cards.push(cardId);
        // Sort deck by cost for better organization
        this.sortDeck();
        return true;
    }
    
    removeCard(cardId) {
        const index = this.currentDeck.cards.indexOf(cardId);
        if (index !== -1) {
            this.currentDeck.cards.splice(index, 1);
            return true;
        }
        return false;
    }
    
    sortDeck() {
        this.currentDeck.cards.sort((a, b) => {
            const cardA = getCardById(a);
            const cardB = getCardById(b);
            if (!cardA || !cardB) return 0;
            return cardA.cost - cardB.cost || cardA.name.localeCompare(cardB.name);
        });
    }
    
    clearDeck() {
        this.currentDeck.cards = [];
    }
    
    saveDeck() {
        if (this.currentDeck.cards.length !== this.maxDeckSize) {
            AnimationManager.showNotification(`Deck must have ${this.maxDeckSize} cards.`, 'error');
            return false;
        }
        
        if (!this.currentDeck.name.trim()) {
            this.currentDeck.name = "Untitled Deck";
        }
        
        const success = StorageManager.saveDeck({
            name: this.currentDeck.name,
            cards: this.currentDeck.cards,
            hero: this.currentDeck.hero,
            lastModified: Date.now()
        });
        
        if (success) {
            StorageManager.setCurrentDeck(this.currentDeck.name);
            return true;
        }
        return false;
    }
    
    // ============================================
    // FILTERING
    // ============================================
    
    setFilter(type, value) {
        this.filters[type] = value;
    }
    
    getFilteredCards() {
        return CARDS.filter(card => {
            // Cost Filter
            if (this.filters.cost !== 'all') {
                if (this.filters.cost === '7+') {
                    if (card.cost < 7) return false;
                } else if (this.filters.cost.includes('-')) {
                    const [min, max] = this.filters.cost.split('-').map(Number);
                    if (card.cost < min || card.cost > max) return false;
                }
            }
            
            // Type Filter
            if (this.filters.type !== 'all') {
                if (card.type !== this.filters.type) return false;
            }
            
            // Search (Name or Description)
            if (this.filters.search) {
                const term = this.filters.search.toLowerCase();
                const match = card.name.toLowerCase().includes(term) || 
                              card.description.toLowerCase().includes(term);
                if (!match) return false;
            }
            
            return true;
        });
    }
    
    // ============================================
    // AI DECK GENERATION (The Smart Part)
    // ============================================
    
    /**
     * Fills the rest of the deck intelligently
     */
    suggestDeck(archetype = 'balanced') {
        const currentCount = this.currentDeck.cards.length;
        const slotsNeeded = this.maxDeckSize - currentCount;
        
        if (slotsNeeded <= 0) {
            // If full, completely rebuild based on archetype
            this.clearDeck();
            this.currentDeck.name = `AI ${archetype.charAt(0).toUpperCase() + archetype.slice(1)}`;
        } else {
            // If partially full, adapt to what's there
            AnimationManager.showNotification(`Auto-filling ${slotsNeeded} cards...`, 'info');
        }

        // 1. Analyze curve needed
        const curve = this.getTargetCurve(archetype);
        
        // 2. Fill slots
        while (this.currentDeck.cards.length < this.maxDeckSize) {
            const card = this.pickBestCard(curve, archetype);
            if (card) {
                this.currentDeck.cards.push(card.id);
            } else {
                // Fallback if strict criteria fail
                const random = CARDS[Math.floor(Math.random() * CARDS.length)];
                this.currentDeck.cards.push(random.id);
            }
        }
        
        this.sortDeck();
        AnimationManager.showNotification("Deck Optimized!", "success");
    }
    
    getTargetCurve(archetype) {
        // Ideal distribution for 25 cards
        switch (archetype) {
            case 'aggro': return { 0:2, 1:6, 2:6, 3:5, 4:3, 5:2, 6:1, 7:0 };
            case 'control': return { 0:2, 1:3, 2:4, 3:4, 4:5, 5:4, 6:2, 7:1 };
            case 'spell': return { 0:2, 1:4, 2:5, 3:6, 4:4, 5:2, 6:1, 7:1 };
            default: return { 0:1, 1:4, 2:5, 3:5, 4:4, 5:3, 6:2, 7:1 }; // Balanced
        }
    }
    
    pickBestCard(targetCurve, archetype) {
        // 1. Determine which cost slot is most empty compared to target
        const currentCurve = {};
        this.currentDeck.cards.forEach(id => {
            const c = getCardById(id);
            if(c) currentCurve[c.cost] = (currentCurve[c.cost] || 0) + 1;
        });
        
        let bestCost = 2;
        let maxDeficit = -100;
        
        // Find the mana cost we are missing the most
        for(let cost=0; cost<=7; cost++) {
            const target = targetCurve[cost] || 0;
            const current = currentCurve[cost] || 0;
            const deficit = target - current;
            if(deficit > maxDeficit) {
                maxDeficit = deficit;
                bestCost = cost;
            }
        }
        
        // 2. Filter available cards by this cost
        let candidates = CARDS.filter(c => {
            // Strict cost match (or >=7 for high cost)
            const costMatch = bestCost >= 7 ? c.cost >= 7 : c.cost === bestCost;
            // Check copies
            const copies = this.currentDeck.cards.filter(id => id === c.id).length;
            return costMatch && copies < this.maxCopiesPerCard;
        });
        
        // 3. Filter by Archetype Synergy
        if (candidates.length > 0) {
            if (archetype === 'spell') {
                const spells = candidates.filter(c => c.type === 'spell' || c.spellDamage);
                if (spells.length > 0) candidates = spells;
            } else if (archetype === 'aggro') {
                const aggro = candidates.filter(c => c.type === 'minion' && c.attack > c.health);
                if (aggro.length > 0) candidates = aggro;
            } else if (archetype === 'control') {
                const control = candidates.filter(c => c.abilities?.includes('taunt') || c.type === 'spell');
                if (control.length > 0) candidates = control;
            }
        }
        
        // If we ran out of valid candidates for that specific cost (rare), relax cost constraint
        if (candidates.length === 0) {
            candidates = CARDS.filter(c => this.currentDeck.cards.filter(id => id === c.id).length < this.maxCopiesPerCard);
        }
        
        // 4. Pick random from candidates
        return candidates[Math.floor(Math.random() * candidates.length)];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeckBuilder;
}