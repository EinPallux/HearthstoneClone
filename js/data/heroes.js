/* ============================================
   HEROES DATA
   Each hero has unique stats, hero power, and starting conditions.
   ============================================ */

/**
 * Helper to generate consistent hero portraits
 */
const getHeroPortrait = (id) => {
    // Using a seeded image service to ensure consistency
    return `https://picsum.photos/seed/hero_${id}/400/400`;
};

/**
 * Helper to generate hero power icons
 */
const getHeroPowerIcon = (id) => {
    return `https://picsum.photos/seed/power_${id}/128/128`;
};

const HEROES = [
    {
        id: 'pyra',
        name: 'Pyra the Flame Warden',
        title: 'Keeper of the Eternal Flame',
        description: 'Master of fire magic, burns enemies with continuous damage.',
        startingHealth: 30,
        startingArmor: 0,
        image: getHeroPortrait('pyra'),
        
        // Hero Power
        heroPower: {
            name: 'Flame Burst',
            cost: 2,
            image: getHeroPowerIcon('pyra'),
            description: 'Deal 2 damage to a random enemy minion. If none, deal 1 to enemy hero.',
            usesPerTurn: 1,
            
            // Effect function
            effect: (game, targetId = null) => {
                const enemyMinions = game.enemyBoard.filter(m => m !== null);
                
                if (enemyMinions.length > 0) {
                    const randomMinion = enemyMinions[Math.floor(Math.random() * enemyMinions.length)];
                    game.dealDamage(randomMinion, 2, 'ability');
                    game.addBattleLog(`Pyra's Flame Burst deals 2 damage to ${randomMinion.name}!`);
                } else {
                    game.enemyHero.currentHealth -= 1;
                    game.addBattleLog(`Pyra's Flame Burst deals 1 damage to enemy hero!`);
                    game.animateDamage(game.enemyHero.id, 1);
                }
            }
        },
        
        // Passive ability
        passive: {
            name: 'Burning Aura',
            description: 'End of turn: Deal 1 damage to all enemy minions.',
            trigger: 'endTurn',
            effect: (game) => {
                let damageDealt = false;
                game.enemyBoard.forEach(minion => {
                    if (minion) {
                        game.dealDamage(minion, 1, 'ability');
                        damageDealt = true;
                    }
                });
                if (damageDealt) {
                    game.addBattleLog('Burning Aura damages all enemy minions!');
                }
            }
        },
        
        // Visuals
        color: 'from-red-600 to-orange-600',
        borderColor: 'border-red-500'
    },
    
    {
        id: 'aquos',
        name: 'Aquos the Tide Caller',
        title: 'Protector of the Deep',
        description: 'Controls water to heal and protect allies.',
        startingHealth: 30,
        startingArmor: 0,
        image: getHeroPortrait('aquos'),
        
        heroPower: {
            name: 'Healing Wave',
            cost: 2,
            image: getHeroPowerIcon('aquos'),
            description: 'Restore 3 health to your hero or a friendly minion.',
            usesPerTurn: 1,
            needsTarget: true,
            validTargets: 'friendly',
            
            effect: (game, targetId) => {
                if (targetId === game.playerHero.id) {
                    const healAmount = Math.min(3, game.playerHero.maxHealth - game.playerHero.currentHealth);
                    game.playerHero.currentHealth += healAmount;
                    game.addBattleLog(`Healing Wave restores ${healAmount} health!`);
                    game.animateHeal(targetId, healAmount);
                } else {
                    const minion = game.playerBoard.find(m => m && m.id === targetId);
                    if (minion) {
                        const healAmount = Math.min(3, minion.maxHealth - minion.currentHealth);
                        minion.currentHealth += healAmount;
                        game.addBattleLog(`Healing Wave restores ${healAmount} health to ${minion.name}!`);
                        game.animateHeal(targetId, healAmount);
                    }
                }
            }
        },
        
        passive: {
            name: 'Tidal Shield',
            description: 'Whenever you cast a spell, gain 1 armor.',
            trigger: 'onSpellCast',
            effect: (game) => {
                game.playerHero.armor += 1;
                game.addBattleLog('Tidal Shield grants 1 armor!');
            }
        },
        
        color: 'from-blue-600 to-cyan-600',
        borderColor: 'border-blue-500'
    },
    
    {
        id: 'terra',
        name: 'Terra Stone Guardian',
        title: 'The Unyielding Wall',
        description: 'Unyielding defender with powerful taunt minions.',
        startingHealth: 35,
        startingArmor: 5,
        image: getHeroPortrait('terra'),
        
        heroPower: {
            name: 'Rock Armor',
            cost: 2,
            image: getHeroPowerIcon('terra'),
            description: 'Gain 3 armor.',
            usesPerTurn: 1,
            
            effect: (game) => {
                game.playerHero.armor += 3;
                game.addBattleLog('Rock Armor grants 3 armor!');
            }
        },
        
        passive: {
            name: 'Stone Skin',
            description: 'Your taunt minions have +1 health.',
            trigger: 'onMinionSummon',
            effect: (game, minion) => {
                if (minion.abilities && minion.abilities.includes('taunt')) {
                    minion.maxHealth += 1;
                    minion.currentHealth += 1;
                    game.addBattleLog(`Stone Skin grants +1 health to ${minion.name}!`);
                }
            }
        },
        
        color: 'from-amber-700 to-yellow-700',
        borderColor: 'border-amber-600'
    },
    
    {
        id: 'zephyr',
        name: 'Zephyr Wind Dancer',
        title: 'The Swift Blade',
        description: 'Swift and agile, controls the battlefield with speed.',
        startingHealth: 25,
        startingArmor: 0,
        image: getHeroPortrait('zephyr'),
        
        heroPower: {
            name: 'Gust',
            cost: 1,
            image: getHeroPowerIcon('zephyr'),
            description: 'Return a friendly minion to your hand.',
            usesPerTurn: 1,
            needsTarget: true,
            validTargets: 'friendlyMinion',
            
            effect: (game, targetId) => {
                const boardIndex = game.playerBoard.findIndex(m => m && m.id === targetId);
                if (boardIndex !== -1) {
                    const minion = game.playerBoard[boardIndex];
                    if (game.playerHand.length < 10) {
                        // Create a new card instance to return to hand
                        // This assumes minion has an 'instanceOf' property pointing to original card ID
                        // If not, we'd need to lookup by ID logic.
                        const cardId = minion.instanceOf || minion.id.split('_')[0] || 'wisp'; // Fallback logic
                        
                        // We need to re-create the card object for the hand
                        // This dependency on createCardInstance implies this file might need access to cards.js logic
                        // OR we assume the game engine handles the 'return to hand' logic.
                        // For data file purity, we'll define the logic abstractly:
                        game.returnMinionToHand(boardIndex, 'player');
                        game.addBattleLog(`Gust returns ${minion.name} to your hand!`);
                    } else {
                        game.addBattleLog('Your hand is full!');
                    }
                }
            }
        },
        
        passive: {
            name: 'Swift Strike',
            description: 'Your minions with 3 or less attack have charge.',
            trigger: 'onMinionSummon',
            effect: (game, minion) => {
                if (minion.attack <= 3) {
                    if (!minion.abilities) minion.abilities = [];
                    if (!minion.abilities.includes('charge')) {
                        minion.abilities.push('charge');
                        minion.canAttack = true;
                        game.addBattleLog(`Swift Strike grants charge to ${minion.name}!`);
                    }
                }
            }
        },
        
        color: 'from-emerald-600 to-teal-600',
        borderColor: 'border-emerald-500'
    },
    
    {
        id: 'umbra',
        name: 'Umbra Shadow Reaper',
        title: 'The Dark Whisper',
        description: 'Manipulates dark energy to drain and control.',
        startingHealth: 30,
        startingArmor: 0,
        image: getHeroPortrait('umbra'),
        
        heroPower: {
            name: 'Soul Drain',
            cost: 2,
            image: getHeroPowerIcon('umbra'),
            description: 'Deal 1 damage to a minion and heal 1 health.',
            usesPerTurn: 1,
            needsTarget: true,
            validTargets: 'anyMinion',
            
            effect: (game, targetId) => {
                let targetMinion = game.playerBoard.find(m => m && m.id === targetId);
                if (!targetMinion) {
                    targetMinion = game.enemyBoard.find(m => m && m.id === targetId);
                }
                
                if (targetMinion) {
                    game.dealDamage(targetMinion, 1, 'ability');
                    const healAmount = Math.min(1, game.playerHero.maxHealth - game.playerHero.currentHealth);
                    game.playerHero.currentHealth += healAmount;
                    game.addBattleLog(`Soul Drain damages ${targetMinion.name} and heals you!`);
                    game.animateHeal(game.playerHero.id, healAmount);
                }
            }
        },
        
        passive: {
            name: 'Dark Pact',
            description: 'Whenever a friendly minion dies, draw a card.',
            trigger: 'onFriendlyMinionDeath',
            effect: (game, minion) => {
                game.drawCard();
                game.addBattleLog('Dark Pact triggers! You draw a card.');
            }
        },
        
        color: 'from-purple-600 to-violet-800',
        borderColor: 'border-purple-500'
    },
    
    {
        id: 'luxor',
        name: 'Luxor Light Bringer',
        title: 'Hand of the Divine',
        description: 'Channels divine light to empower and protect.',
        startingHealth: 30,
        startingArmor: 0,
        image: getHeroPortrait('luxor'),
        
        heroPower: {
            name: 'Divine Blessing',
            cost: 2,
            image: getHeroPowerIcon('luxor'),
            description: 'Give a friendly minion +1/+1.',
            usesPerTurn: 1,
            needsTarget: true,
            validTargets: 'friendlyMinion',
            
            effect: (game, targetId) => {
                const minion = game.playerBoard.find(m => m && m.id === targetId);
                if (minion) {
                    minion.attack += 1;
                    minion.maxHealth += 1;
                    minion.currentHealth += 1;
                    game.addBattleLog(`Divine Blessing empowers ${minion.name}!`);
                    game.animateBuffEffect(targetId);
                }
            }
        },
        
        passive: {
            name: 'Radiant Aura',
            description: 'Start of turn: Restore 2 health to your hero.',
            trigger: 'startTurn',
            effect: (game) => {
                const healAmount = Math.min(2, game.playerHero.maxHealth - game.playerHero.currentHealth);
                if (healAmount > 0) {
                    game.playerHero.currentHealth += healAmount;
                    game.addBattleLog('Radiant Aura restores 2 health!');
                    game.animateHeal(game.playerHero.id, healAmount);
                }
            }
        },
        
        color: 'from-yellow-400 to-amber-400',
        borderColor: 'border-yellow-400'
    },
    
    {
        id: 'vortex',
        name: 'Vortex Void Walker',
        title: 'Consumer of Realities',
        description: 'Bends reality and space to confuse enemies.',
        startingHealth: 28,
        startingArmor: 0,
        image: getHeroPortrait('vortex'),
        
        heroPower: {
            name: 'Reality Shift',
            cost: 2,
            image: getHeroPowerIcon('vortex'),
            description: 'Swap the positions of two minions.',
            usesPerTurn: 1,
            needsTarget: true,
            validTargets: 'anyMinion',
            requiresTwoTargets: true,
            
            effect: (game, targetId1, targetId2) => {
                // Logic handled by game state for complex swapping
                // We assume GameState has a method or we manually swap array indices
                // For safety in this data file, we delegate to game engine logic
                if (game.swapMinions) {
                    game.swapMinions(targetId1, targetId2);
                }
            }
        },
        
        passive: {
            name: 'Void Touch',
            description: 'Enemy minions cost (1) more mana.',
            trigger: 'passive',
            effect: null // Handled by cost calculation logic in GameState
        },
        
        color: 'from-indigo-600 to-purple-700',
        borderColor: 'border-indigo-500'
    }
];

// Helper function to get hero by ID
function getHeroById(id) {
    return HEROES.find(hero => hero.id === id);
}

// Helper function to create a hero instance for the game
function createHeroInstance(heroId) {
    const heroData = getHeroById(heroId);
    if (!heroData) return null;
    
    return {
        id: heroId,
        name: heroData.name,
        image: heroData.image,
        description: heroData.description,
        maxHealth: heroData.startingHealth,
        currentHealth: heroData.startingHealth,
        armor: heroData.startingArmor,
        heroPower: {...heroData.heroPower, timesUsedThisTurn: 0},
        passive: heroData.passive,
        color: heroData.color,
        borderColor: heroData.borderColor
    };
}

// Helper function to format ability names for display
function formatAbilityName(ability) {
    const abilityNames = {
        'taunt': 'Taunt',
        'divine_shield': 'Divine Shield',
        'charge': 'Charge',
        'windfury': 'Windfury',
        'lifesteal': 'Lifesteal',
        'poisonous': 'Poisonous',
        'stealth': 'Stealth',
        'spell_damage': 'Spell Damage',
        'battlecry': 'Battlecry',
        'deathrattle': 'Deathrattle',
        'enrage': 'Enrage',
        'freeze': 'Freeze',
        'silence': 'Silence',
        'elusive': 'Elusive',
        'cleave': 'Cleave'
    };
    
    return abilityNames[ability] || ability;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HEROES, getHeroById, createHeroInstance, formatAbilityName };
}