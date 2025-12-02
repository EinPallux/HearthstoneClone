/* ============================================
   STORAGE MANAGER
   Handles local persistence with versioning and validation.
   ============================================ */

const StorageManager = {
    
    KEYS: {
        VERSION: 'al_version',
        HERO: 'al_selected_hero',
        DECKS: 'al_decks',
        CURRENT_DECK: 'al_active_deck',
        COLLECTION: 'al_collection',
        SETTINGS: 'al_settings',
        STATS: 'al_stats'
    },

    CURRENT_VERSION: '1.2',

    init() {
        this.checkVersion();
        this.initializeDefaults();
        console.log('💾 Storage System Initialized');
    },

    // ============================================
    // MIGRATION & DEFAULTS
    // ============================================

    checkVersion() {
        const savedVersion = localStorage.getItem(this.KEYS.VERSION);
        if (savedVersion !== this.CURRENT_VERSION) {
            console.log('🆕 New version detected. validating data...');
            // In a real app, we would write migration logic here.
            // For now, we update the version tag.
            localStorage.setItem(this.KEYS.VERSION, this.CURRENT_VERSION);
        }
    },

    initializeDefaults() {
        if (!localStorage.getItem(this.KEYS.DECKS)) {
            this.initializePreBuiltDecks();
        }
    },

    initializePreBuiltDecks() {
        // Starter decks
        const starters = [
            {
                name: "Starter Aggro",
                hero: "pyra",
                cards: [
                    'wisp', 'wisp', 'squire', 'squire', 'scout', 'scout', 
                    'archer', 'archer', 'leper_gnome', 'leper_gnome', 
                    'wolf', 'wolf', 'bandit', 'bandit', 'lightning', 'lightning',
                    'fireball', 'fireball', 'commander', 'commander',
                    'golem', 'golem', 'arcanite_reaper', 'arcanite_reaper', 'dragon'
                ],
                lastModified: Date.now()
            },
            {
                name: "Starter Control",
                hero: "terra",
                cards: [
                    'defender', 'defender', 'healer', 'healer', 'frostbolt', 'frostbolt',
                    'cleric', 'cleric', 'guardian', 'guardian', 'fireball', 'fireball',
                    'polymorph', 'polymorph', 'consecration', 'consecration',
                    'shield_block', 'shield_block', 'flamestrike', 'flamestrike',
                    'colossus', 'colossus', 'lich', 'lich', 'giant'
                ],
                lastModified: Date.now()
            }
        ];
        
        // Filter out cards that might not exist in our current subset to prevent errors
        starters.forEach(d => {
            d.cards = d.cards.filter(id => typeof getCardById !== 'undefined' ? getCardById(id) : true);
        });

        localStorage.setItem(this.KEYS.DECKS, JSON.stringify(starters));
    },

    // ============================================
    // HEROES
    // ============================================

    saveSelectedHero(heroId) {
        localStorage.setItem(this.KEYS.HERO, heroId);
    },

    getSelectedHero() {
        return localStorage.getItem(this.KEYS.HERO) || 'pyra';
    },

    // ============================================
    // DECKS
    // ============================================

    saveDeck(deck) {
        try {
            const decks = this.getAllDecks();
            const idx = decks.findIndex(d => d.name === deck.name);
            
            if (idx >= 0) {
                decks[idx] = deck;
            } else {
                decks.push(deck);
            }
            
            localStorage.setItem(this.KEYS.DECKS, JSON.stringify(decks));
            return true;
        } catch (e) {
            console.error("Save Deck Failed", e);
            return false;
        }
    },

    getAllDecks() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.DECKS) || '[]');
        } catch {
            return [];
        }
    },

    getDeckByName(name) {
        const decks = this.getAllDecks();
        return decks.find(d => d.name === name);
    },

    setCurrentDeck(name) {
        localStorage.setItem(this.KEYS.CURRENT_DECK, name);
    },

    getCurrentDeck() {
        const name = localStorage.getItem(this.KEYS.CURRENT_DECK);
        if (name) return this.getDeckByName(name);
        // Fallback
        const decks = this.getAllDecks();
        return decks.length > 0 ? decks[0] : null;
    },

    deleteDeck(name) {
        const decks = this.getAllDecks().filter(d => d.name !== name);
        localStorage.setItem(this.KEYS.DECKS, JSON.stringify(decks));
    },

    // ============================================
    // COLLECTION (Unlocked Cards)
    // ============================================

    getCollection() {
        // For this demo, we assume all cards in CARDS are unlocked.
        // In a full game, we would parse localStorage.getItem(this.KEYS.COLLECTION)
        return typeof CARDS !== 'undefined' ? CARDS : [];
    }
};

// Global Export
window.StorageManager = StorageManager;