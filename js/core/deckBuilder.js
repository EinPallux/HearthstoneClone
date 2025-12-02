/* ============================================
   DECK BUILDER
   Deck creation, editing, and AI suggestions
   ============================================ */

class DeckBuilder {
    constructor() {
        this.currentDeck = {
            name: 'New Deck',
            cards: [],
            hero: null
        };
        
        this.maxDeckSize = 25;
        this.maxCopiesPerCard = 2;
        
        this.filters = {
            cost: 'all',
            type: 'all',
            rarity: 'all',
            search: ''
        };
    }
    
    // ============================================
    // DECK MANAGEMENT
    // ============================================
    
    /**
     * Add card to current deck
     */
    addCard(cardId) {
        if (this.currentDeck.cards.length >= this.maxDeckSize) {
            AnimationManager.showNotification('Deck is full! (25 cards max)', 'error', 2000);
            return false;
        }
        
        // Check if already have max copies
        const copies = this.currentDeck.cards.filter(id => id === cardId).length;
        if (copies >= this.maxCopiesPerCard) {
            AnimationManager.showNotification('Maximum 2 copies per card!', 'error', 2000);
            return false;
        }
        
        this.currentDeck.cards.push(cardId);
        AnimationManager.showNotification('Card added to deck!', 'success', 1000);
        return true;
    }
    
    /**
     * Remove card from current deck
     */
    removeCard(cardId, removeAll = false) {
        if (removeAll) {
            this.currentDeck.cards = this.currentDeck.cards.filter(id => id !== cardId);
        } else {
            const index = this.currentDeck.cards.indexOf(cardId);
            if (index !== -1) {
                this.currentDeck.cards.splice(index, 1);
            }
        }
        
        return true;
    }
    
    /**
     * Get card count in current deck
     */
    getCardCount(cardId) {
        return this.currentDeck.cards.filter(id => id === cardId).length;
    }
    
    /**
     * Clear current deck
     */
    clearDeck() {
        this.currentDeck.cards = [];
        AnimationManager.showNotification('Deck cleared!', 'info', 1500);
    }
    
    /**
     * Save current deck
     */
    saveDeck() {
        if (this.currentDeck.cards.length < this.maxDeckSize) {
            AnimationManager.showNotification(
                `Deck must have ${this.maxDeckSize} cards! Currently: ${this.currentDeck.cards.length}`,
                'error',
                3000
            );
            return false;
        }
        
        if (!this.currentDeck.name || this.currentDeck.name.trim() === '') {
            AnimationManager.showNotification('Please enter a deck name!', 'error', 2000);
            return false;
        }
        
        // Save to storage
        const success = StorageManager.saveDeck({
            name: this.currentDeck.name,
            cards: this.currentDeck.cards,
            hero: this.currentDeck.hero
        });
        
        if (success) {
            // Set as current deck
            StorageManager.setCurrentDeck(this.currentDeck.name);
            AnimationManager.showNotification('Deck saved and selected!', 'success', 2000);
            return true;
        } else {
            AnimationManager.showNotification('Failed to save deck!', 'error', 2000);
            return false;
        }
    }
    
    /**
     * Load a saved deck
     */
    loadDeck(deckName) {
        const deck = StorageManager.getDeckByName(deckName);
        
        if (deck) {
            this.currentDeck = {
                name: deck.name,
                cards: [...deck.cards],
                hero: deck.hero
            };
            AnimationManager.showNotification(`Loaded: ${deck.name}`, 'success', 2000);
            return true;
        }
        
        return false;
    }
    
    /**
     * Delete a deck
     */
    deleteDeck(deckName) {
        return StorageManager.deleteDeck(deckName);
    }
    
    // ============================================
    // CARD FILTERING
    // ============================================
    
    /**
     * Get filtered card collection
     */
    getFilteredCards() {
        let cards = [...CARDS];
        
        // Filter by cost
        if (this.filters.cost !== 'all') {
            if (this.filters.cost === '0-2') {
                cards = cards.filter(c => c.cost >= 0 && c.cost <= 2);
            } else if (this.filters.cost === '3-4') {
                cards = cards.filter(c => c.cost >= 3 && c.cost <= 4);
            } else if (this.filters.cost === '5-6') {
                cards = cards.filter(c => c.cost >= 5 && c.cost <= 6);
            } else if (this.filters.cost === '7+') {
                cards = cards.filter(c => c.cost >= 7);
            }
        }
        
        // Filter by type
        if (this.filters.type !== 'all') {
            cards = cards.filter(c => c.type === this.filters.type);
        }
        
        // Filter by rarity
        if (this.filters.rarity !== 'all') {
            cards = cards.filter(c => c.rarity === this.filters.rarity);
        }
        
        // Filter by search
        if (this.filters.search && this.filters.search.trim() !== '') {
            const search = this.filters.search.toLowerCase();
            cards = cards.filter(c => 
                c.name.toLowerCase().includes(search) ||
                c.description.toLowerCase().includes(search)
            );
        }
        
        return cards;
    }
    
    /**
     * Set filter
     */
    setFilter(filterType, value) {
        this.filters[filterType] = value;
    }
    
    /**
     * Reset all filters
     */
    resetFilters() {
        this.filters = {
            cost: 'all',
            type: 'all',
            rarity: 'all',
            search: ''
        };
    }
    
    // ============================================
    // DECK ANALYSIS
    // ============================================
    
    /**
     * Analyze current deck
     */
    analyzeDeck() {
        const analysis = {
            totalCards: this.currentDeck.cards.length,
            manaCurve: {},
            typeDistribution: {},
            averageManaCost: 0,
            rarityDistribution: {},
            hasLegendaries: false,
            missingCards: this.maxDeckSize - this.currentDeck.cards.length
        };
        
        let totalManaCost = 0;
        
        this.currentDeck.cards.forEach(cardId => {
            const card = getCardById(cardId);
            if (!card) return;
            
            // Mana curve
            analysis.manaCurve[card.cost] = (analysis.manaCurve[card.cost] || 0) + 1;
            totalManaCost += card.cost;
            
            // Type distribution
            analysis.typeDistribution[card.type] = (analysis.typeDistribution[card.type] || 0) + 1;
            
            // Rarity distribution
            analysis.rarityDistribution[card.rarity] = (analysis.rarityDistribution[card.rarity] || 0) + 1;
            
            if (card.rarity === 'legendary') {
                analysis.hasLegendaries = true;
            }
        });
        
        if (this.currentDeck.cards.length > 0) {
            analysis.averageManaCost = (totalManaCost / this.currentDeck.cards.length).toFixed(1);
        }
        
        return analysis;
    }
    
    /**
     * Get deck score (quality rating)
     */
    getDeckScore() {
        const analysis = this.analyzeDeck();
        let score = 0;
        
        // Mana curve score (ideal is distributed across costs)
        const idealCurve = { 0: 1, 1: 3, 2: 4, 3: 4, 4: 4, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1, 10: 0 };
        let curveScore = 0;
        
        for (let cost in idealCurve) {
            const actual = analysis.manaCurve[cost] || 0;
            const ideal = idealCurve[cost];
            const diff = Math.abs(actual - ideal);
            curveScore += Math.max(0, 5 - diff);
        }
        
        score += curveScore;
        
        // Type distribution score
        const minions = analysis.typeDistribution['minion'] || 0;
        const spells = analysis.typeDistribution['spell'] || 0;
        
        if (minions >= 15 && minions <= 20) score += 20;
        if (spells >= 5 && spells <= 10) score += 10;
        
        // Average mana cost score (ideal is 3-4)
        const avgCost = parseFloat(analysis.averageManaCost);
        if (avgCost >= 3 && avgCost <= 4) {
            score += 15;
        } else if (avgCost >= 2.5 && avgCost <= 4.5) {
            score += 10;
        }
        
        // Completeness score
        if (analysis.totalCards === this.maxDeckSize) {
            score += 20;
        }
        
        return Math.min(100, score);
    }
    
    // ============================================
    // AI DECK SUGGESTIONS
    // ============================================
    
    /**
     * AI suggests a complete deck based on archetype
     */
    suggestDeck(archetype = 'balanced') {
        this.clearDeck();
        
        const suggestions = {
            'aggro': this.buildAggroDeck(),
            'control': this.buildControlDeck(),
            'midrange': this.buildMidrangeDeck(),
            'spell': this.buildSpellDeck(),
            'balanced': this.buildBalancedDeck()
        };
        
        const suggestedCards = suggestions[archetype] || suggestions['balanced'];
        this.currentDeck.cards = suggestedCards;
        this.currentDeck.name = `AI ${archetype.charAt(0).toUpperCase() + archetype.slice(1)} Deck`;
        
        AnimationManager.showNotification('AI deck generated!', 'success', 2000);
    }
    
    /**
     * Build aggro deck
     */
    buildAggroDeck() {
        const deck = [];
        
        // Lots of low cost minions
        const lowCostMinions = CARDS.filter(c => 
            c.type === 'minion' && c.cost <= 3
        );
        
        // Pick 18 low cost minions
        for (let i = 0; i < 18; i++) {
            const card = lowCostMinions[Math.floor(Math.random() * lowCostMinions.length)];
            deck.push(card.id);
        }
        
        // Add some direct damage spells
        const damageSpells = CARDS.filter(c => 
            c.type === 'spell' && c.description.toLowerCase().includes('damage') && c.cost <= 4
        );
        
        for (let i = 0; i < 7; i++) {
            const card = damageSpells[Math.floor(Math.random() * damageSpells.length)];
            deck.push(card.id);
        }
        
        return deck;
    }
    
    /**
     * Build control deck
     */
    buildControlDeck() {
        const deck = [];
        
        // Big minions
        const bigMinions = CARDS.filter(c => 
            c.type === 'minion' && c.cost >= 5
        );
        
        for (let i = 0; i < 8; i++) {
            const card = bigMinions[Math.floor(Math.random() * bigMinions.length)];
            deck.push(card.id);
        }
        
        // Removal spells
        const removal = CARDS.filter(c => 
            c.type === 'spell' && (
                c.description.toLowerCase().includes('destroy') ||
                c.description.toLowerCase().includes('damage')
            )
        );
        
        for (let i = 0; i < 10; i++) {
            const card = removal[Math.floor(Math.random() * removal.length)];
            deck.push(card.id);
        }
        
        // Some taunts
        const taunts = CARDS.filter(c => 
            c.type === 'minion' && c.abilities?.includes('taunt')
        );
        
        for (let i = 0; i < 7; i++) {
            const card = taunts[Math.floor(Math.random() * taunts.length)];
            deck.push(card.id);
        }
        
        return deck;
    }
    
    /**
     * Build midrange deck
     */
    buildMidrangeDeck() {
        const deck = [];
        
        // Good curve of minions
        const manaCurve = {
            1: 2, 2: 3, 3: 4, 4: 5, 5: 4, 6: 3, 7: 2
        };
        
        for (let cost in manaCurve) {
            const count = manaCurve[cost];
            const minions = CARDS.filter(c => 
                c.type === 'minion' && c.cost === parseInt(cost)
            );
            
            for (let i = 0; i < count; i++) {
                const card = minions[Math.floor(Math.random() * minions.length)];
                if (card) deck.push(card.id);
            }
        }
        
        // Fill rest with spells
        while (deck.length < 25) {
            const spells = CARDS.filter(c => c.type === 'spell');
            const card = spells[Math.floor(Math.random() * spells.length)];
            deck.push(card.id);
        }
        
        return deck;
    }
    
    /**
     * Build spell-heavy deck
     */
    buildSpellDeck() {
        const deck = [];
        
        // Spell damage minions
        const spellDamageMinions = CARDS.filter(c => 
            c.type === 'minion' && c.spellDamage
        );
        
        for (let i = 0; i < 6; i++) {
            const card = spellDamageMinions[Math.floor(Math.random() * spellDamageMinions.length)];
            if (card) deck.push(card.id);
        }
        
        // Lots of spells
        const spells = CARDS.filter(c => c.type === 'spell');
        
        for (let i = 0; i < 19; i++) {
            const card = spells[Math.floor(Math.random() * spells.length)];
            deck.push(card.id);
        }
        
        return deck;
    }
    
    /**
     * Build balanced deck
     */
    buildBalancedDeck() {
        const deck = [];
        
        // Good mana curve
        const idealCurve = { 0: 1, 1: 3, 2: 4, 3: 4, 4: 4, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 };
        
        for (let cost in idealCurve) {
            const count = idealCurve[cost];
            const cards = CARDS.filter(c => c.cost === parseInt(cost));
            
            for (let i = 0; i < count; i++) {
                if (cards.length > 0) {
                    const card = cards[Math.floor(Math.random() * cards.length)];
                    deck.push(card.id);
                }
            }
        }
        
        return deck;
    }
    
    /**
     * Get smart card suggestions based on current deck
     */
    getSmartSuggestions(count = 5) {
        const analysis = this.analyzeDeck();
        const suggestions = [];
        
        // Identify what the deck needs
        const needs = {
            earlyGame: (analysis.manaCurve[1] || 0) + (analysis.manaCurve[2] || 0) < 6,
            lateGame: (analysis.manaCurve[6] || 0) + (analysis.manaCurve[7] || 0) < 3,
            removal: (analysis.typeDistribution['spell'] || 0) < 5,
            minions: (analysis.typeDistribution['minion'] || 0) < 15,
            taunt: false // Would need to analyze abilities
        };
        
        // Get cards that fit the needs
        let candidates = [];
        
        if (needs.earlyGame) {
            candidates = candidates.concat(
                CARDS.filter(c => c.cost <= 2 && !this.currentDeck.cards.includes(c.id))
            );
        }
        
        if (needs.lateGame) {
            candidates = candidates.concat(
                CARDS.filter(c => c.cost >= 6 && !this.currentDeck.cards.includes(c.id))
            );
        }
        
        if (needs.removal) {
            candidates = candidates.concat(
                CARDS.filter(c => 
                    c.type === 'spell' && 
                    (c.description.toLowerCase().includes('damage') ||
                     c.description.toLowerCase().includes('destroy')) &&
                    !this.currentDeck.cards.includes(c.id)
                )
            );
        }
        
        if (needs.minions) {
            candidates = candidates.concat(
                CARDS.filter(c => c.type === 'minion' && !this.currentDeck.cards.includes(c.id))
            );
        }
        
        // If no specific needs, suggest high value cards
        if (candidates.length === 0) {
            candidates = CARDS.filter(c => 
                (c.rarity === 'epic' || c.rarity === 'legendary') &&
                !this.currentDeck.cards.includes(c.id)
            );
        }
        
        // Remove duplicates and pick random subset
        candidates = [...new Set(candidates)];
        
        for (let i = 0; i < Math.min(count, candidates.length); i++) {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            suggestions.push(candidates[randomIndex]);
            candidates.splice(randomIndex, 1);
        }
        
        return suggestions;
    }
    
    /**
     * Auto-fill remaining slots intelligently
     */
    autoFillDeck() {
        const analysis = this.analyzeDeck();
        const remaining = this.maxDeckSize - analysis.totalCards;
        
        if (remaining <= 0) {
            AnimationManager.showNotification('Deck is already full!', 'info', 2000);
            return;
        }
        
        const suggestions = this.getSmartSuggestions(remaining);
        
        suggestions.forEach(card => {
            if (this.currentDeck.cards.length < this.maxDeckSize) {
                this.currentDeck.cards.push(card.id);
            }
        });
        
        AnimationManager.showNotification(
            `Added ${suggestions.length} suggested cards!`,
            'success',
            2000
        );
    }
    
    // ============================================
    // DECK VALIDATION
    // ============================================
    
    /**
     * Validate deck for play
     */
    validateDeck() {
        const errors = [];
        
        if (this.currentDeck.cards.length !== this.maxDeckSize) {
            errors.push(`Deck must have exactly ${this.maxDeckSize} cards`);
        }
        
        // Check for invalid cards
        this.currentDeck.cards.forEach(cardId => {
            const card = getCardById(cardId);
            if (!card) {
                errors.push(`Invalid card ID: ${cardId}`);
            }
        });
        
        // Check for too many copies
        const cardCounts = {};
        this.currentDeck.cards.forEach(cardId => {
            cardCounts[cardId] = (cardCounts[cardId] || 0) + 1;
            if (cardCounts[cardId] > this.maxCopiesPerCard) {
                const card = getCardById(cardId);
                errors.push(`Too many copies of ${card?.name || cardId}`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    // ============================================
    // IMPORT/EXPORT
    // ============================================
    
    /**
     * Export deck as string
     */
    exportDeck() {
        return JSON.stringify(this.currentDeck, null, 2);
    }
    
    /**
     * Import deck from string
     */
    importDeck(deckString) {
        try {
            const deck = JSON.parse(deckString);
            
            if (!deck.cards || !Array.isArray(deck.cards)) {
                throw new Error('Invalid deck format');
            }
            
            this.currentDeck = deck;
            AnimationManager.showNotification('Deck imported successfully!', 'success', 2000);
            return true;
        } catch (e) {
            AnimationManager.showNotification('Failed to import deck!', 'error', 2000);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeckBuilder;
}
