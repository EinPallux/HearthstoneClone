/* ============================================
   QUESTS DATA
   Quest system for player progression and rewards
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
    PLAY_COST: 'play_cost',
    SURVIVE_DAMAGE: 'survive_damage'
};

const QUESTS = [
    {
        id: 'quest_1',
        name: 'Card Master',
        description: 'Play 20 cards in total',
        type: QUEST_TYPES.PLAY_CARDS,
        target: 20,
        reward: {
            type: 'gold',
            amount: 50
        },
        icon: '🎴',
        rarity: 'common'
    },
    {
        id: 'quest_2',
        name: 'Victor\'s Path',
        description: 'Win 3 games',
        type: QUEST_TYPES.WIN_GAMES,
        target: 3,
        reward: {
            type: 'gold',
            amount: 100
        },
        icon: '🏆',
        rarity: 'rare'
    },
    {
        id: 'quest_3',
        name: 'Destruction',
        description: 'Deal 100 damage to enemy heroes',
        type: QUEST_TYPES.DEAL_DAMAGE,
        target: 100,
        reward: {
            type: 'gold',
            amount: 75
        },
        icon: '⚔️',
        rarity: 'common'
    },
    {
        id: 'quest_4',
        name: 'Army Builder',
        description: 'Summon 30 minions',
        type: QUEST_TYPES.SUMMON_MINIONS,
        target: 30,
        reward: {
            type: 'gold',
            amount: 60
        },
        icon: '👥',
        rarity: 'common'
    },
    {
        id: 'quest_5',
        name: 'Spell Weaver',
        description: 'Cast 15 spells',
        type: QUEST_TYPES.CAST_SPELLS,
        target: 15,
        reward: {
            type: 'gold',
            amount: 60
        },
        icon: '✨',
        rarity: 'common'
    },
    {
        id: 'quest_6',
        name: 'Minion Slayer',
        description: 'Destroy 25 enemy minions',
        type: QUEST_TYPES.DESTROY_MINIONS,
        target: 25,
        reward: {
            type: 'gold',
            amount: 70
        },
        icon: '💀',
        rarity: 'rare'
    },
    {
        id: 'quest_7',
        name: 'Healer\'s Touch',
        description: 'Heal 50 health in total',
        type: QUEST_TYPES.HEAL,
        target: 50,
        reward: {
            type: 'gold',
            amount: 55
        },
        icon: '💚',
        rarity: 'common'
    },
    {
        id: 'quest_8',
        name: 'Power User',
        description: 'Use your Hero Power 10 times',
        type: QUEST_TYPES.USE_HERO_POWER,
        target: 10,
        reward: {
            type: 'gold',
            amount: 40
        },
        icon: '🔮',
        rarity: 'common'
    },
    {
        id: 'quest_9',
        name: 'Big Spender',
        description: 'Play cards costing 5 or more mana 10 times',
        type: QUEST_TYPES.PLAY_COST,
        target: 10,
        targetCost: 5,
        reward: {
            type: 'gold',
            amount: 65
        },
        icon: '💎',
        rarity: 'rare'
    },
    {
        id: 'quest_10',
        name: 'Survivor',
        description: 'Win a game while having 10 or less health',
        type: QUEST_TYPES.SURVIVE_DAMAGE,
        target: 1,
        reward: {
            type: 'gold',
            amount: 100
        },
        icon: '🛡️',
        rarity: 'epic'
    },
    {
        id: 'quest_11',
        name: 'Domination',
        description: 'Win 5 games',
        type: QUEST_TYPES.WIN_GAMES,
        target: 5,
        reward: {
            type: 'gold',
            amount: 150
        },
        icon: '👑',
        rarity: 'epic'
    },
    {
        id: 'quest_12',
        name: 'Card Collector',
        description: 'Play 50 cards in total',
        type: QUEST_TYPES.PLAY_CARDS,
        target: 50,
        reward: {
            type: 'gold',
            amount: 100
        },
        icon: '📚',
        rarity: 'rare'
    },
    {
        id: 'quest_13',
        name: 'Massacre',
        description: 'Destroy 50 enemy minions',
        type: QUEST_TYPES.DESTROY_MINIONS,
        target: 50,
        reward: {
            type: 'gold',
            amount: 120
        },
        icon: '☠️',
        rarity: 'epic'
    },
    {
        id: 'quest_14',
        name: 'Summoner Supreme',
        description: 'Summon 75 minions',
        type: QUEST_TYPES.SUMMON_MINIONS,
        target: 75,
        reward: {
            type: 'gold',
            amount: 130
        },
        icon: '🌟',
        rarity: 'epic'
    },
    {
        id: 'quest_15',
        name: 'Arcane Master',
        description: 'Cast 40 spells',
        type: QUEST_TYPES.CAST_SPELLS,
        target: 40,
        reward: {
            type: 'gold',
            amount: 140
        },
        icon: '🔥',
        rarity: 'epic'
    }
];

// Quest manager class
class QuestManager {
    constructor() {
        this.activeQuests = [];
        this.completedQuests = [];
        this.questProgress = {};
        this.totalGoldEarned = 0;
        
        this.loadProgress();
        this.initializeQuests();
    }
    
    // Initialize random daily quests
    initializeQuests() {
        if (this.activeQuests.length === 0) {
            // Give player 3 random quests to start
            const availableQuests = QUESTS.filter(q => 
                !this.completedQuests.includes(q.id) && 
                !this.activeQuests.find(aq => aq.id === q.id)
            );
            
            for (let i = 0; i < 3 && availableQuests.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableQuests.length);
                const quest = availableQuests[randomIndex];
                this.activeQuests.push({...quest});
                availableQuests.splice(randomIndex, 1);
                
                if (!this.questProgress[quest.id]) {
                    this.questProgress[quest.id] = 0;
                }
            }
            
            this.saveProgress();
        }
    }
    
    // Update quest progress
    updateProgress(type, amount = 1, extraData = {}) {
        let updated = false;
        
        this.activeQuests.forEach(quest => {
            if (quest.type === type) {
                // Check special conditions
                let shouldUpdate = true;
                
                if (type === QUEST_TYPES.PLAY_COST && extraData.cost < quest.targetCost) {
                    shouldUpdate = false;
                }
                
                if (type === QUEST_TYPES.SURVIVE_DAMAGE && extraData.health > 10) {
                    shouldUpdate = false;
                }
                
                if (shouldUpdate) {
                    this.questProgress[quest.id] = (this.questProgress[quest.id] || 0) + amount;
                    
                    if (this.questProgress[quest.id] >= quest.target) {
                        this.questProgress[quest.id] = quest.target;
                        this.completeQuest(quest);
                    }
                    
                    updated = true;
                }
            }
        });
        
        if (updated) {
            this.saveProgress();
        }
        
        return updated;
    }
    
    // Complete a quest
    completeQuest(quest) {
        if (!this.completedQuests.includes(quest.id)) {
            this.completedQuests.push(quest.id);
            this.totalGoldEarned += quest.reward.amount;
            
            // Remove from active quests
            this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
            
            // Add a new quest
            this.addNewQuest();
            
            this.saveProgress();
            
            // Show completion notification
            this.showQuestComplete(quest);
        }
    }
    
    // Add a new random quest
    addNewQuest() {
        const availableQuests = QUESTS.filter(q => 
            !this.completedQuests.includes(q.id) && 
            !this.activeQuests.find(aq => aq.id === q.id)
        );
        
        if (availableQuests.length > 0 && this.activeQuests.length < 3) {
            const randomIndex = Math.floor(Math.random() * availableQuests.length);
            const quest = availableQuests[randomIndex];
            this.activeQuests.push({...quest});
            
            if (!this.questProgress[quest.id]) {
                this.questProgress[quest.id] = 0;
            }
            
            this.saveProgress();
        }
    }
    
    // Get progress for a specific quest
    getQuestProgress(questId) {
        return this.questProgress[questId] || 0;
    }
    
    // Get all active quests with progress
    getActiveQuestsWithProgress() {
        return this.activeQuests.map(quest => ({
            ...quest,
            progress: this.getQuestProgress(quest.id),
            percentage: Math.min(100, (this.getQuestProgress(quest.id) / quest.target) * 100)
        }));
    }
    
    // Reroll a quest (remove current and add new one)
    rerollQuest(questId) {
        const questIndex = this.activeQuests.findIndex(q => q.id === questId);
        if (questIndex !== -1) {
            this.activeQuests.splice(questIndex, 1);
            delete this.questProgress[questId];
            this.addNewQuest();
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    // Save progress to localStorage
    saveProgress() {
        const data = {
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            questProgress: this.questProgress,
            totalGoldEarned: this.totalGoldEarned
        };
        localStorage.setItem('arcane_legends_quests', JSON.stringify(data));
    }
    
    // Load progress from localStorage
    loadProgress() {
        const saved = localStorage.getItem('arcane_legends_quests');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.activeQuests = data.activeQuests || [];
                this.completedQuests = data.completedQuests || [];
                this.questProgress = data.questProgress || {};
                this.totalGoldEarned = data.totalGoldEarned || 0;
            } catch (e) {
                console.error('Error loading quest progress:', e);
            }
        }
    }
    
    // Reset all quests (for testing or new game)
    resetAllQuests() {
        this.activeQuests = [];
        this.completedQuests = [];
        this.questProgress = {};
        this.totalGoldEarned = 0;
        this.saveProgress();
        this.initializeQuests();
    }
    
    // Show quest completion notification
    showQuestComplete(quest) {
        // This will be implemented in UI manager
        console.log(`Quest Complete: ${quest.name} - Earned ${quest.reward.amount} gold!`);
    }
}

// Helper function to get quest description with progress
function getQuestDescription(quest, progress) {
    const progressText = `${progress}/${quest.target}`;
    return `${quest.description} (${progressText})`;
}

// Helper function to get rarity color class
function getQuestRarityClass(rarity) {
    const rarityClasses = {
        'common': 'border-slate-500',
        'rare': 'border-blue-500',
        'epic': 'border-purple-500',
        'legendary': 'border-amber-500'
    };
    return rarityClasses[rarity] || rarityClasses['common'];
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        QUESTS, 
        QUEST_TYPES, 
        QuestManager, 
        getQuestDescription,
        getQuestRarityClass 
    };
}
