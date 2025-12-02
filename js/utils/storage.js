/* ============================================
   STORAGE MANAGER
   Handles all localStorage operations for game data
   ============================================ */

const StorageManager = {
    
    // Storage keys
    KEYS: {
        SELECTED_HERO: 'arcane_legends_selected_hero',
        DECKS: 'arcane_legends_decks',
        CURRENT_DECK: 'arcane_legends_current_deck',
        GAME_STATS: 'arcane_legends_stats',
        SETTINGS: 'arcane_legends_settings',
        COLLECTION: 'arcane_legends_collection',
        TUTORIAL_COMPLETE: 'arcane_legends_tutorial'
    },
    
    // ============================================
    // HERO MANAGEMENT
    // ============================================
    
    /**
     * Save selected hero
     */
    saveSelectedHero(heroId) {
        try {
            localStorage.setItem(this.KEYS.SELECTED_HERO, heroId);
            return true;
        } catch (e) {
            console.error('Error saving hero:', e);
            return false;
        }
    },
    
    /**
     * Get selected hero
     */
    getSelectedHero() {
        try {
            return localStorage.getItem(this.KEYS.SELECTED_HERO) || null;
        } catch (e) {
            console.error('Error loading hero:', e);
            return null;
        }
    },
    
    // ============================================
    // DECK MANAGEMENT
    // ============================================
    
    /**
     * Save a deck
     */
    saveDeck(deck) {
        try {
            const decks = this.getAllDecks();
            
            // Check if deck with same name exists
            const existingIndex = decks.findIndex(d => d.name === deck.name);
            
            if (existingIndex !== -1) {
                // Update existing deck
                decks[existingIndex] = {
                    ...deck,
                    lastModified: Date.now()
                };
            } else {
                // Add new deck
                decks.push({
                    ...deck,
                    id: Date.now(),
                    created: Date.now(),
                    lastModified: Date.now()
                });
            }
            
            localStorage.setItem(this.KEYS.DECKS, JSON.stringify(decks));
            return true;
        } catch (e) {
            console.error('Error saving deck:', e);
            return false;
        }
    },
    
    /**
     * Get all saved decks
     */
    getAllDecks() {
        try {
            const decks = localStorage.getItem(this.KEYS.DECKS);
            return decks ? JSON.parse(decks) : [];
        } catch (e) {
            console.error('Error loading decks:', e);
            return [];
        }
    },
    
    /**
     * Get deck by name
     */
    getDeckByName(name) {
        const decks = this.getAllDecks();
        return decks.find(d => d.name === name) || null;
    },
    
    /**
     * Delete a deck
     */
    deleteDeck(deckName) {
        try {
            const decks = this.getAllDecks();
            const filteredDecks = decks.filter(d => d.name !== deckName);
            localStorage.setItem(this.KEYS.DECKS, JSON.stringify(filteredDecks));
            return true;
        } catch (e) {
            console.error('Error deleting deck:', e);
            return false;
        }
    },
    
    /**
     * Set current active deck
     */
    setCurrentDeck(deckName) {
        try {
            localStorage.setItem(this.KEYS.CURRENT_DECK, deckName);
            return true;
        } catch (e) {
            console.error('Error setting current deck:', e);
            return false;
        }
    },
    
    /**
     * Get current active deck
     */
    getCurrentDeck() {
        try {
            const deckName = localStorage.getItem(this.KEYS.CURRENT_DECK);
            if (deckName) {
                return this.getDeckByName(deckName);
            }
            
            // If no current deck, return first available or null
            const decks = this.getAllDecks();
            return decks.length > 0 ? decks[0] : null;
        } catch (e) {
            console.error('Error loading current deck:', e);
            return null;
        }
    },
    
    /**
     * Create initial pre-built decks if none exist
     */
    initializePreBuiltDecks() {
        const existingDecks = this.getAllDecks();
        
        if (existingDecks.length === 0) {
            const preBuiltDecks = this.getPreBuiltDecks();
            preBuiltDecks.forEach(deck => this.saveDeck(deck));
        }
    },
    
    /**
     * Get pre-built deck templates
     */
    getPreBuiltDecks() {
        return [
            {
                name: 'Aggro Rush',
                description: 'Fast and aggressive deck focused on early game',
                cards: [
                    'wisp', 'wisp',
                    'squire', 'squire',
                    'scout', 'scout',
                    'spider', 'spider',
                    'imp',
                    'archer', 'archer',
                    'berserker', 'berserker',
                    'bandit', 'bandit',
                    'knight', 'knight',
                    'wolf',
                    'assassin',
                    'griffin', 'griffin',
                    'lightning', 'lightning',
                    'backstab', 'backstab',
                    'moonfire'
                ],
                hero: null
            },
            {
                name: 'Control Guardian',
                description: 'Defensive deck with healing and big minions',
                cards: [
                    'defender', 'defender',
                    'healer', 'healer',
                    'turtle',
                    'cleric', 'cleric',
                    'guardian', 'guardian',
                    'paladin',
                    'treant',
                    'wyrm',
                    'colossus',
                    'crusader',
                    'heal', 'heal',
                    'blessing_kings',
                    'consecration', 'consecration',
                    'shield_block', 'shield_block',
                    'unicorn',
                    'gargoyle', 'gargoyle',
                    'shaman',
                    'champion',
                    'priest'
                ],
                hero: null
            },
            {
                name: 'Spell Master',
                description: 'Magic-focused deck with powerful spells',
                cards: [
                    'mage',
                    'archmage',
                    'shaman', 'shaman',
                    'fairy', 'fairy',
                    'fireball', 'fireball',
                    'frostbolt', 'frostbolt',
                    'lightning', 'lightning',
                    'flamestrike',
                    'pyroblast',
                    'polymorph', 'polymorph',
                    'arcane_intellect', 'arcane_intellect',
                    'consecration',
                    'meteor',
                    'moonfire', 'moonfire',
                    'wild_growth',
                    'innervate', 'innervate'
                ],
                hero: null
            },
            {
                name: 'Midrange Balance',
                description: 'Balanced deck with good minions and spells',
                cards: [
                    'squire', 'squire',
                    'healer',
                    'berserker',
                    'knight', 'knight',
                    'wolf',
                    'elemental', 'elemental',
                    'griffin',
                    'commander',
                    'phoenix',
                    'windwalker',
                    'priest',
                    'champion',
                    'frostbolt', 'frostbolt',
                    'fireball',
                    'blessing_kings',
                    'arcane_intellect',
                    'consecration',
                    'heal',
                    'lightning',
                    'execute', 'execute'
                ],
                hero: null
            },
            {
                name: 'Beast Summoner',
                description: 'Creature-heavy deck with strong minions',
                cards: [
                    'spider', 'spider',
                    'bat', 'bat',
                    'wolf', 'wolf',
                    'turtle',
                    'gargoyle', 'gargoyle',
                    'griffin', 'griffin',
                    'minotaur',
                    'giant_spider',
                    'dragon_whelp',
                    'necromancer',
                    'golem',
                    'phoenix',
                    'wyrm',
                    'dragon',
                    'savage_roar',
                    'blessing_kings',
                    'wild_growth',
                    'arcane_intellect'
                ],
                hero: null
            }
        ];
    },
    
    // ============================================
    // GAME STATISTICS
    // ============================================
    
    /**
     * Get game statistics
     */
    getStats() {
        try {
            const stats = localStorage.getItem(this.KEYS.GAME_STATS);
            return stats ? JSON.parse(stats) : this.getDefaultStats();
        } catch (e) {
            console.error('Error loading stats:', e);
            return this.getDefaultStats();
        }
    },
    
    /**
     * Default statistics object
     */
    getDefaultStats() {
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalDamageDealt: 0,
            totalMinionsPlayed: 0,
            totalSpellsCast: 0,
            totalCardsPlayed: 0,
            heroPowersUsed: 0,
            minionsDestroyed: 0,
            totalHealing: 0,
            fastestWin: null,
            longestGame: null,
            highestDamageInTurn: 0,
            winStreak: 0,
            bestWinStreak: 0
        };
    },
    
    /**
     * Update statistics
     */
    updateStats(updates) {
        try {
            const stats = this.getStats();
            const newStats = { ...stats, ...updates };
            localStorage.setItem(this.KEYS.GAME_STATS, JSON.stringify(newStats));
            return true;
        } catch (e) {
            console.error('Error updating stats:', e);
            return false;
        }
    },
    
    /**
     * Record game result
     */
    recordGameResult(won, duration, stats = {}) {
        const currentStats = this.getStats();
        
        const updates = {
            gamesPlayed: currentStats.gamesPlayed + 1,
            gamesWon: won ? currentStats.gamesWon + 1 : currentStats.gamesWon,
            gamesLost: won ? currentStats.gamesLost : currentStats.gamesLost + 1,
            winStreak: won ? currentStats.winStreak + 1 : 0,
            bestWinStreak: won ? Math.max(currentStats.bestWinStreak, currentStats.winStreak + 1) : currentStats.bestWinStreak,
            ...stats
        };
        
        // Update fastest win
        if (won) {
            if (!currentStats.fastestWin || duration < currentStats.fastestWin) {
                updates.fastestWin = duration;
            }
        }
        
        // Update longest game
        if (!currentStats.longestGame || duration > currentStats.longestGame) {
            updates.longestGame = duration;
        }
        
        return this.updateStats(updates);
    },
    
    /**
     * Reset all statistics
     */
    resetStats() {
        try {
            localStorage.setItem(this.KEYS.GAME_STATS, JSON.stringify(this.getDefaultStats()));
            return true;
        } catch (e) {
            console.error('Error resetting stats:', e);
            return false;
        }
    },
    
    // ============================================
    // SETTINGS
    // ============================================
    
    /**
     * Get settings
     */
    getSettings() {
        try {
            const settings = localStorage.getItem(this.KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (e) {
            console.error('Error loading settings:', e);
            return this.getDefaultSettings();
        }
    },
    
    /**
     * Default settings
     */
    getDefaultSettings() {
        return {
            soundEnabled: true,
            musicEnabled: true,
            animationSpeed: 'normal', // 'fast', 'normal', 'slow'
            showTutorial: true,
            difficulty: 'medium', // 'easy', 'medium', 'hard'
            autoEndTurn: false,
            confirmActions: true
        };
    },
    
    /**
     * Update settings
     */
    updateSettings(updates) {
        try {
            const settings = this.getSettings();
            const newSettings = { ...settings, ...updates };
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(newSettings));
            return true;
        } catch (e) {
            console.error('Error updating settings:', e);
            return false;
        }
    },
    
    // ============================================
    // CARD COLLECTION
    // ============================================
    
    /**
     * Get card collection (all unlocked cards)
     */
    getCollection() {
        try {
            const collection = localStorage.getItem(this.KEYS.COLLECTION);
            if (collection) {
                return JSON.parse(collection);
            }
            
            // Initialize with all cards unlocked
            return this.initializeCollection();
        } catch (e) {
            console.error('Error loading collection:', e);
            return this.initializeCollection();
        }
    },
    
    /**
     * Initialize collection with all cards
     */
    initializeCollection() {
        // For this game, all cards are unlocked from the start
        const collection = CARDS.map(card => ({
            id: card.id,
            unlocked: true,
            count: 2, // Can have 2 of each card in collection
            timesPlayed: 0,
            favorite: false
        }));
        
        try {
            localStorage.setItem(this.KEYS.COLLECTION, JSON.stringify(collection));
        } catch (e) {
            console.error('Error initializing collection:', e);
        }
        
        return collection;
    },
    
    /**
     * Update card stats in collection
     */
    updateCardStats(cardId, updates) {
        try {
            const collection = this.getCollection();
            const cardIndex = collection.findIndex(c => c.id === cardId);
            
            if (cardIndex !== -1) {
                collection[cardIndex] = { ...collection[cardIndex], ...updates };
                localStorage.setItem(this.KEYS.COLLECTION, JSON.stringify(collection));
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error updating card stats:', e);
            return false;
        }
    },
    
    /**
     * Toggle card favorite status
     */
    toggleFavorite(cardId) {
        const collection = this.getCollection();
        const card = collection.find(c => c.id === cardId);
        
        if (card) {
            return this.updateCardStats(cardId, { favorite: !card.favorite });
        }
        return false;
    },
    
    // ============================================
    // TUTORIAL
    // ============================================
    
    /**
     * Check if tutorial is complete
     */
    isTutorialComplete() {
        try {
            return localStorage.getItem(this.KEYS.TUTORIAL_COMPLETE) === 'true';
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Mark tutorial as complete
     */
    completeTutorial() {
        try {
            localStorage.setItem(this.KEYS.TUTORIAL_COMPLETE, 'true');
            return true;
        } catch (e) {
            console.error('Error completing tutorial:', e);
            return false;
        }
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    /**
     * Clear all game data
     */
    clearAllData() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            console.error('Error clearing data:', e);
            return false;
        }
    },
    
    /**
     * Export all game data
     */
    exportData() {
        try {
            const data = {};
            Object.entries(this.KEYS).forEach(([name, key]) => {
                const value = localStorage.getItem(key);
                if (value) {
                    data[name] = value;
                }
            });
            return JSON.stringify(data, null, 2);
        } catch (e) {
            console.error('Error exporting data:', e);
            return null;
        }
    },
    
    /**
     * Import game data
     */
    importData(dataString) {
        try {
            const data = JSON.parse(dataString);
            Object.entries(data).forEach(([name, value]) => {
                const key = this.KEYS[name];
                if (key) {
                    localStorage.setItem(key, value);
                }
            });
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    },
    
    /**
     * Get storage usage info
     */
    getStorageInfo() {
        try {
            let totalSize = 0;
            const details = {};
            
            Object.entries(this.KEYS).forEach(([name, key]) => {
                const value = localStorage.getItem(key);
                if (value) {
                    const size = new Blob([value]).size;
                    totalSize += size;
                    details[name] = {
                        size: size,
                        sizeKB: (size / 1024).toFixed(2)
                    };
                }
            });
            
            return {
                totalSize: totalSize,
                totalSizeKB: (totalSize / 1024).toFixed(2),
                details: details
            };
        } catch (e) {
            console.error('Error getting storage info:', e);
            return null;
        }
    }
};

// Initialize storage on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize pre-built decks if needed
    StorageManager.initializePreBuiltDecks();
    
    // Initialize collection
    StorageManager.getCollection();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
