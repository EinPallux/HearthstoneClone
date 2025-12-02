/* ============================================
   QUESTS SYSTEM
   Progression, Daily Tasks, and Rewards
   ============================================ */

const QUEST_TYPES = {
    PLAY_CARDS: 'play_cards',
    WIN_GAMES: 'win_games',
    DEAL_DAMAGE: 'deal_damage',
    SUMMON_MINIONS: 'summon_minions',
    CAST_SPELLS: 'cast_spells',
    DESTROY_MINIONS: 'destroy_minions',
    HEAL: 'heal',
    USE_HERO_POWER: 'use_hero_power',
    PLAY_COST: 'play_cost', // e.g. "Play cards costing 5+"
    SURVIVE_DAMAGE: 'survive_damage'
};

const QUESTS = [
    // --- COMMON QUESTS ---
    {
        id: 'q_recruit',
        name: 'Recruitment Drive',
        description: 'Summon 20 minions.',
        type: QUEST_TYPES.SUMMON_MINIONS,
        target: 20,
        reward: { type: 'gold', amount: 50 },
        icon: '⚔️',
        rarity: 'common'
    },
    {
        id: 'q_spellcaster',
        name: 'Arcane Initiate',
        description: 'Cast 15 spells.',
        type: QUEST_TYPES.CAST_SPELLS,
        target: 15,
        reward: { type: 'gold', amount: 50 },
        icon: '✨',
        rarity: 'common'
    },
    {
        id: 'q_tactician',
        name: 'Battle Tactics',
        description: 'Deal 30 damage to enemy heroes.',
        type: QUEST_TYPES.DEAL_DAMAGE,
        target: 30,
        reward: { type: 'gold', amount: 60 },
        icon: '🎯',
        rarity: 'common'
    },
    
    // --- RARE QUESTS ---
    {
        id: 'q_slayer',
        name: 'Monster Slayer',
        description: 'Destroy 15 enemy minions.',
        type: QUEST_TYPES.DESTROY_MINIONS,
        target: 15,
        reward: { type: 'gold', amount: 80 },
        icon: '💀',
        rarity: 'rare'
    },
    {
        id: 'q_heroic',
        name: 'Heroic Power',
        description: 'Use your Hero Power 10 times.',
        type: QUEST_TYPES.USE_HERO_POWER,
        target: 10,
        reward: { type: 'gold', amount: 80 },
        icon: '🔮',
        rarity: 'rare'
    },
    {
        id: 'q_gladiator',
        name: 'Arena Champion',
        description: 'Win 3 games.',
        type: QUEST_TYPES.WIN_GAMES,
        target: 3,
        reward: { type: 'gold', amount: 100 },
        icon: '🏆',
        rarity: 'rare'
    },

    // --- EPIC / LEGENDARY QUESTS ---
    {
        id: 'q_archmage',
        name: 'Archmage\'s Wisdom',
        description: 'Play 30 cards costing 5 or more Mana.',
        type: QUEST_TYPES.PLAY_COST,
        targetCost: 5,
        target: 30,
        reward: { type: 'gold', amount: 150 },
        icon: '📜',
        rarity: 'epic'
    },
    {
        id: 'q_immortal',
        name: 'The Immortal',
        description: 'Win a game with full health.',
        type: QUEST_TYPES.SURVIVE_DAMAGE,
        target: 1,
        reward: { type: 'gold', amount: 300 },
        icon: '👑',
        rarity: 'legendary'
    }
];

class QuestManager {
    constructor() {
        this.activeQuests = [];
        this.completedQuests = []; // History
        this.questProgress = {}; // Map: questId -> number
        this.totalGoldEarned = 0;
        
        this.storageKey = 'arcane_legends_quests_v2';
        
        this.loadProgress();
        this.refreshDailyQuests();
    }
    
    // --- Core Logic ---

    refreshDailyQuests() {
        // Ensure player always has 3 active quests
        if (this.activeQuests.length < 3) {
            const needed = 3 - this.activeQuests.length;
            const pool = QUESTS.filter(q => !this.isQuestActive(q.id));
            
            for (let i = 0; i < needed; i++) {
                if (pool.length === 0) break;
                const randomIdx = Math.floor(Math.random() * pool.length);
                const quest = pool[randomIdx];
                
                this.activeQuests.push(quest);
                this.questProgress[quest.id] = 0;
                
                // Remove from pool so we don't pick it twice
                pool.splice(randomIdx, 1);
            }
            this.saveProgress();
        }
    }
    
    updateProgress(type, amount = 1, context = {}) {
        let saveNeeded = false;

        this.activeQuests.forEach(quest => {
            if (quest.type !== type) return;

            // Check specific conditions
            if (type === QUEST_TYPES.PLAY_COST && (context.cost || 0) < quest.targetCost) return;
            if (type === QUEST_TYPES.SURVIVE_DAMAGE && (context.health || 0) < 30) return;

            // Update
            const current = this.questProgress[quest.id] || 0;
            if (current < quest.target) {
                const newVal = Math.min(current + amount, quest.target);
                this.questProgress[quest.id] = newVal;
                saveNeeded = true;

                // Check Completion
                if (newVal >= quest.target) {
                    this.completeQuest(quest);
                }
            }
        });

        if (saveNeeded) this.saveProgress();
    }

    completeQuest(quest) {
        // Reward
        this.totalGoldEarned += quest.reward.amount;
        
        // Notification
        if (window.AnimationManager) {
            AnimationManager.showNotification(`Quest Complete: ${quest.name}! (+${quest.reward.amount} Gold)`, 'success', 4000);
            AnimationManager.playSound('sfx-hover'); // Positive sound
        }

        // Move to history
        this.completedQuests.push(quest.id);
        this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
        
        // Clean up progress
        delete this.questProgress[quest.id];
        
        // Immediately replace with a new one? Or wait for next "login"?
        // For this web version, let's just refresh immediately so the UI isn't empty
        this.refreshDailyQuests(); 
        
        this.saveProgress();
    }

    // --- Helpers ---

    isQuestActive(id) {
        return this.activeQuests.some(q => q.id === id);
    }

    getActiveQuestsWithProgress() {
        return this.activeQuests.map(quest => ({
            ...quest,
            progress: this.questProgress[quest.id] || 0,
            percentage: Math.floor(((this.questProgress[quest.id] || 0) / quest.target) * 100)
        }));
    }

    // --- Storage ---

    saveProgress() {
        const data = {
            activeIds: this.activeQuests.map(q => q.id),
            progress: this.questProgress,
            totalGold: this.totalGoldEarned,
            history: this.completedQuests
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    loadProgress() {
        const json = localStorage.getItem(this.storageKey);
        if (!json) return;

        try {
            const data = JSON.parse(json);
            
            // Rehydrate active quests from IDs
            this.activeQuests = data.activeIds
                .map(id => QUESTS.find(q => q.id === id))
                .filter(q => q); // filter out nulls if quest definitions changed
                
            this.questProgress = data.progress || {};
            this.totalGoldEarned = data.totalGold || 0;
            this.completedQuests = data.history || [];
        } catch (e) {
            console.error("Failed to load quests", e);
            localStorage.removeItem(this.storageKey);
        }
    }
}

// Global Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QUESTS, QuestManager };
}