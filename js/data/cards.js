/* ============================================
   CARDS DATA REPOSITORY
   Contains definitions, logic, and assets for all collectible cards.
   ============================================ */

/**
 * Helper to generate consistent card art based on ID
 * In a production game, these would be local asset paths (e.g., 'assets/cards/wisp.png')
 */
const getCardArt = (id, type) => {
    // Using a seeded image service to ensure the same card always gets the same image
    // Adding specific keywords to try and match the theme roughly
    const seed = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return `https://picsum.photos/seed/${id}/300/400`;
};

const CARDS = [
    // ============================================
    // MINIONS (Low Cost 0-3)
    // ============================================
    {
        id: 'wisp',
        name: 'Ethereal Wisp',
        type: 'minion',
        cost: 0,
        attack: 1,
        health: 1,
        rarity: 'common',
        description: 'A tiny spirit of pure energy.',
        flavor: 'Infinite value!',
        abilities: [],
        image: getCardArt('wisp')
    },
    {
        id: 'squire',
        name: 'Young Squire',
        type: 'minion',
        cost: 1,
        attack: 1,
        health: 2,
        rarity: 'common',
        description: 'Eager to prove his worth.',
        flavor: 'He has been polishing that shield for three days.',
        abilities: [],
        image: getCardArt('squire')
    },
    {
        id: 'scout',
        name: 'Swift Scout',
        type: 'minion',
        cost: 1,
        attack: 2,
        health: 1,
        rarity: 'common',
        description: 'Fast but fragile.',
        flavor: 'He runs ahead so you don\'t have to.',
        abilities: [],
        image: getCardArt('scout')
    },
    {
        id: 'spider',
        name: 'Venomous Spider',
        type: 'minion',
        cost: 1,
        attack: 1,
        health: 1,
        rarity: 'common',
        description: 'Poisonous',
        flavor: 'Small bite, big problem.',
        abilities: ['poisonous'],
        image: getCardArt('spider')
    },
    {
        id: 'imp',
        name: 'Flame Imp',
        type: 'minion',
        cost: 1,
        attack: 3,
        health: 2,
        rarity: 'rare',
        description: 'Battlecry: Deal 3 damage to your hero.',
        flavor: 'Is it hot in here, or is it just him?',
        abilities: ['battlecry'],
        image: getCardArt('imp'),
        battlecry: (game) => {
            game.playerHero.currentHealth -= 3;
            game.addBattleLog('Flame Imp burns you for 3 damage!');
            game.animateDamage(game.playerHero.id, 3);
        }
    },
    {
        id: 'archer',
        name: 'Elven Archer',
        type: 'minion',
        cost: 2,
        attack: 2,
        health: 1,
        rarity: 'common',
        description: 'Battlecry: Deal 1 damage.',
        flavor: 'One shot, one... mild annoyance.',
        abilities: ['battlecry'],
        image: getCardArt('archer'),
        battlecry: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    game.dealDamage(target, 1, 'battlecry');
                    game.addBattleLog('Elven Archer deals 1 damage!');
                }
            }
        }
    },
    {
        id: 'defender',
        name: 'Shield Defender',
        type: 'minion',
        cost: 2,
        attack: 0,
        health: 4,
        rarity: 'common',
        description: 'Taunt',
        flavor: 'None shall pass. Unless they ask nicely.',
        abilities: ['taunt'],
        image: getCardArt('defender')
    },
    {
        id: 'berserker',
        name: 'Raging Berserker',
        type: 'minion',
        cost: 2,
        attack: 2,
        health: 3,
        rarity: 'rare',
        description: 'Enrage: +2 Attack while damaged.',
        flavor: 'He\'s actually quite pleasant until he stubs his toe.',
        abilities: ['enrage'],
        enrageBonus: { attack: 2, health: 0 },
        image: getCardArt('berserker')
    },
    {
        id: 'healer',
        name: 'Novice Healer',
        type: 'minion',
        cost: 2,
        attack: 1,
        health: 3,
        rarity: 'common',
        description: 'Battlecry: Restore 3 health.',
        flavor: 'Bandages fixed everything in medical school.',
        abilities: ['battlecry'],
        image: getCardArt('healer'),
        battlecry: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    const healAmount = Math.min(3, target.maxHealth - target.currentHealth);
                    target.currentHealth += healAmount;
                    game.addBattleLog(`Novice Healer restores ${healAmount} health!`);
                    game.animateHeal(targetId, healAmount);
                }
            }
        }
    },
    {
        id: 'bandit',
        name: 'Sneaky Bandit',
        type: 'minion',
        cost: 2,
        attack: 3,
        health: 2,
        rarity: 'rare',
        description: 'Stealth',
        flavor: 'Now you see him, now you don\'t.',
        abilities: ['stealth'],
        image: getCardArt('bandit')
    },
    {
        id: 'knight',
        name: 'Silver Knight',
        type: 'minion',
        cost: 3,
        attack: 3,
        health: 3,
        rarity: 'common',
        description: 'A balanced warrior.',
        flavor: 'Shiny armor, standard training.',
        abilities: [],
        image: getCardArt('knight')
    },
    {
        id: 'wolf',
        name: 'Dire Wolf',
        type: 'minion',
        cost: 3,
        attack: 3,
        health: 2,
        rarity: 'common',
        description: 'Adjacent minions have +1 Attack.',
        flavor: 'He\'s a good leader of the pack.',
        abilities: ['aura'],
        aura: { adjacentAttack: 1 },
        image: getCardArt('wolf')
    },
    {
        id: 'mage',
        name: 'Frost Mage',
        type: 'minion',
        cost: 3,
        attack: 2,
        health: 3,
        rarity: 'rare',
        description: 'Battlecry: Freeze a minion.',
        flavor: 'Stop. Hammer time.',
        abilities: ['battlecry'],
        image: getCardArt('mage'),
        battlecry: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target && target.type === 'minion') {
                    target.frozen = true;
                    game.addBattleLog(`${target.name} is frozen!`);
                }
            }
        }
    },
    {
        id: 'assassin',
        name: 'Shadow Assassin',
        type: 'minion',
        cost: 3,
        attack: 4,
        health: 2,
        rarity: 'rare',
        description: 'Stealth. Can attack heroes even with taunt minions.',
        flavor: 'Nothing personal, kid.',
        abilities: ['stealth', 'bypass_taunt'],
        image: getCardArt('assassin')
    },

    // ============================================
    // MINIONS (Mid Cost 4-6)
    // ============================================
    {
        id: 'guardian',
        name: 'Stone Guardian',
        type: 'minion',
        cost: 4,
        attack: 3,
        health: 6,
        rarity: 'common',
        description: 'Taunt',
        flavor: 'Rock solid defense.',
        abilities: ['taunt'],
        image: getCardArt('guardian')
    },
    {
        id: 'dragon_whelp',
        name: 'Dragon Whelp',
        type: 'minion',
        cost: 4,
        attack: 3,
        health: 4,
        rarity: 'rare',
        description: 'Battlecry: Deal 2 damage to all enemy minions.',
        flavor: 'Small puff of flame, big headache.',
        abilities: ['battlecry'],
        image: getCardArt('dragon_whelp'),
        battlecry: (game) => {
            game.enemyBoard.forEach(minion => {
                if (minion) {
                    game.dealDamage(minion, 2, 'battlecry');
                }
            });
            game.addBattleLog('Dragon Whelp breathes fire!');
        }
    },
    {
        id: 'necromancer',
        name: 'Dark Necromancer',
        type: 'minion',
        cost: 4,
        attack: 3,
        health: 3,
        rarity: 'epic',
        description: 'Deathrattle: Summon a 2/2 Skeleton.',
        flavor: 'Reduce, reuse, reanimate.',
        abilities: ['deathrattle'],
        image: getCardArt('necromancer'),
        deathrattle: (game, boardIndex) => {
            const skeleton = {
                id: Date.now() + Math.random(),
                name: 'Skeleton',
                type: 'minion',
                attack: 2,
                health: 2,
                maxHealth: 2,
                currentHealth: 2,
                canAttack: false,
                abilities: [],
                image: getCardArt('skeleton')
            };
            
            if (boardIndex !== -1 && boardIndex < 7) {
                // Determine which board to summon on based on who owned the necromancer
                // This logic needs to be handled by the game state calling this, 
                // but we assume GameState handles the slot assignment.
                // For safety in this data file, we just define the logic.
                // The GameState.destroyMinion function handles the actual summoning logic 
                // by checking this function return or executing it contextually.
                
                // Simplified: The GameState will execute this
                if(game.playerBoard[boardIndex] === null) game.playerBoard[boardIndex] = skeleton;
                // Note: AI logic handles enemy board separately in GameState
            }
        }
    },
    {
        id: 'paladin',
        name: 'Holy Paladin',
        type: 'minion',
        cost: 4,
        attack: 4,
        health: 4,
        rarity: 'rare',
        description: 'Divine Shield',
        flavor: 'The light protects him. Mostly.',
        abilities: ['divine_shield'],
        image: getCardArt('paladin')
    },
    {
        id: 'phoenix',
        name: 'Blazing Phoenix',
        type: 'minion',
        cost: 5,
        attack: 4,
        health: 3,
        rarity: 'epic',
        description: 'Deathrattle: Deal 3 damage to all enemies.',
        flavor: 'From the ashes, boom.',
        abilities: ['deathrattle'],
        image: getCardArt('phoenix'),
        deathrattle: (game) => {
            // Logic assumes player context for now, GameState handles owner check
            game.enemyBoard.forEach(minion => {
                if (minion) game.dealDamage(minion, 3, 'deathrattle');
            });
            game.enemyHero.currentHealth -= 3;
            game.addBattleLog('Phoenix explodes in flames!');
            game.animateDamage(game.enemyHero.id, 3);
        }
    },
    {
        id: 'windwalker',
        name: 'Storm Windwalker',
        type: 'minion',
        cost: 5,
        attack: 5,
        health: 4,
        rarity: 'rare',
        description: 'Windfury',
        flavor: 'Strikes twice as fast, hits half as hard. Wait, no, full strength.',
        abilities: ['windfury'],
        image: getCardArt('windwalker')
    },
    {
        id: 'archmage',
        name: 'Archmage Pyros',
        type: 'minion',
        cost: 6,
        attack: 5,
        health: 5,
        rarity: 'epic',
        description: 'Spell Damage +2',
        flavor: 'He loves the smell of burnt mana in the morning.',
        abilities: ['spell_damage'],
        spellDamage: 2,
        image: getCardArt('archmage')
    },
    {
        id: 'valkyrie',
        name: 'Divine Valkyrie',
        type: 'minion',
        cost: 6,
        attack: 6,
        health: 4,
        rarity: 'epic',
        description: 'Divine Shield, Lifesteal',
        flavor: 'To Valhalla and back.',
        abilities: ['divine_shield', 'lifesteal'],
        image: getCardArt('valkyrie')
    },

    // ============================================
    // MINIONS (High Cost 7+)
    // ============================================
    {
        id: 'giant',
        name: 'Mountain Giant',
        type: 'minion',
        cost: 7,
        attack: 8,
        health: 8,
        rarity: 'epic',
        description: 'A colossal force of nature.',
        flavor: 'He has a rocky personality.',
        abilities: [],
        image: getCardArt('giant')
    },
    {
        id: 'lich',
        name: 'Frost Lich',
        type: 'minion',
        cost: 7,
        attack: 5,
        health: 7,
        rarity: 'legendary',
        description: 'Battlecry: Freeze all enemy minions.',
        flavor: 'Chill out.',
        abilities: ['battlecry'],
        image: getCardArt('lich'),
        battlecry: (game) => {
            game.enemyBoard.forEach(minion => {
                if (minion) {
                    minion.frozen = true;
                }
            });
            game.addBattleLog('Frost Lich freezes all enemies!');
        }
    },
    {
        id: 'colossus',
        name: 'Titan Colossus',
        type: 'minion',
        cost: 7,
        attack: 6,
        health: 10,
        rarity: 'epic',
        description: 'Taunt, Divine Shield',
        flavor: 'The wall that walks.',
        abilities: ['taunt', 'divine_shield'],
        image: getCardArt('colossus')
    },
    {
        id: 'dragon',
        name: 'Ancient Dragon',
        type: 'minion',
        cost: 8,
        attack: 8,
        health: 8,
        rarity: 'legendary',
        description: 'Battlecry: Deal 8 damage randomly split among enemies.',
        flavor: 'He remembers when the mountains were young.',
        abilities: ['battlecry'],
        image: getCardArt('dragon'),
        battlecry: (game) => {
            for (let i = 0; i < 8; i++) {
                const allEnemies = [...game.enemyBoard.filter(m => m), game.enemyHero];
                if (allEnemies.length > 0) {
                    const target = allEnemies[Math.floor(Math.random() * allEnemies.length)];
                    if (target.type === 'minion') {
                        game.dealDamage(target, 1, 'battlecry');
                    } else {
                        target.currentHealth -= 1;
                        game.animateDamage(target.id, 1);
                    }
                }
            }
            game.addBattleLog('Ancient Dragon rains fire!');
        }
    },
    {
        id: 'avatar',
        name: 'Elemental Avatar',
        type: 'minion',
        cost: 10,
        attack: 12,
        health: 12,
        rarity: 'legendary',
        description: 'Costs (1) less for each spell you cast this game.',
        flavor: 'Pure magic given form.',
        abilities: ['cost_reduction'],
        image: getCardArt('avatar'),
        costReduction: (game) => {
            return Math.min(9, game.spellsCast || 0);
        }
    },

    // ============================================
    // SPELLS
    // ============================================
    {
        id: 'fireball',
        name: 'Fireball',
        type: 'spell',
        cost: 4,
        rarity: 'common',
        description: 'Deal 6 damage.',
        flavor: 'A classic. Don\'t fix what isn\'t broken.',
        image: getCardArt('fireball'),
        effect: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    let damage = 6 + (game.spellDamageBonus || 0);
                    game.dealDamage(target, damage, 'spell');
                    game.addBattleLog(`Fireball deals ${damage} damage!`);
                }
            }
        }
    },
    {
        id: 'frostbolt',
        name: 'Frostbolt',
        type: 'spell',
        cost: 2,
        rarity: 'common',
        description: 'Deal 3 damage and freeze.',
        flavor: 'It\'s getting cold in here.',
        image: getCardArt('frostbolt'),
        effect: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    let damage = 3 + (game.spellDamageBonus || 0);
                    game.dealDamage(target, damage, 'spell');
                    if (target.type === 'minion') target.frozen = true;
                    game.addBattleLog(`Frostbolt deals ${damage} damage and freezes!`);
                }
            }
        }
    },
    {
        id: 'polymorph',
        name: 'Polymorph',
        type: 'spell',
        cost: 4,
        rarity: 'rare',
        description: 'Transform a minion into a 1/1 Sheep.',
        flavor: 'Baaaa.',
        image: getCardArt('polymorph'),
        effect: (game, targetId) => {
            if (targetId) {
                const isEnemy = game.enemyBoard.find(m => m && m.id === targetId);
                const isPlayer = game.playerBoard.find(m => m && m.id === targetId);
                
                const sheep = {
                    id: Date.now() + Math.random(),
                    name: 'Sheep',
                    type: 'minion',
                    attack: 1,
                    health: 1,
                    maxHealth: 1,
                    currentHealth: 1,
                    canAttack: false,
                    abilities: [],
                    image: getCardArt('sheep')
                };

                if (isEnemy) {
                    const index = game.enemyBoard.findIndex(m => m && m.id === targetId);
                    game.enemyBoard[index] = sheep;
                } else if (isPlayer) {
                    const index = game.playerBoard.findIndex(m => m && m.id === targetId);
                    game.playerBoard[index] = sheep;
                }
                game.addBattleLog('Target transformed into a Sheep!');
            }
        }
    },
    {
        id: 'flamestrike',
        name: 'Flamestrike',
        type: 'spell',
        cost: 7,
        rarity: 'rare',
        description: 'Deal 4 damage to all enemy minions.',
        flavor: 'When in doubt, set everything on fire.',
        image: getCardArt('flamestrike'),
        effect: (game) => {
            let damage = 4 + (game.spellDamageBonus || 0);
            game.enemyBoard.forEach(minion => {
                if (minion) game.dealDamage(minion, damage, 'spell');
            });
            game.addBattleLog(`Flamestrike deals ${damage} damage to all enemy minions!`);
        }
    },
    {
        id: 'twisting_nether',
        name: 'Twisting Nether',
        type: 'spell',
        cost: 8,
        rarity: 'epic',
        description: 'Destroy all minions.',
        flavor: 'The vacuum of space cleans up nicely.',
        image: getCardArt('twisting_nether'),
        effect: (game) => {
            // Logic to clear boards
            const toDestroy = [];
            game.playerBoard.forEach((minion, i) => { if(minion) toDestroy.push({m: minion, i, owner: 'player'}); });
            game.enemyBoard.forEach((minion, i) => { if(minion) toDestroy.push({m: minion, i, owner: 'enemy'}); });
            
            toDestroy.forEach(item => {
                game.destroyMinion(item.m, item.i, item.owner);
            });
            game.addBattleLog('The Twisting Nether consumes all!');
        }
    },

    // ============================================
    // WEAPONS
    // ============================================
    {
        id: 'fiery_axe',
        name: 'Fiery War Axe',
        type: 'weapon',
        cost: 3,
        attack: 3,
        durability: 2,
        rarity: 'common',
        description: 'A reliable warrior weapon.',
        flavor: 'Old faithful.',
        image: getCardArt('fiery_axe'),
        effect: null
    },
    {
        id: 'truesilver',
        name: 'Truesilver Champion',
        type: 'weapon',
        cost: 4,
        attack: 4,
        durability: 2,
        rarity: 'common',
        description: 'Lifesteal',
        flavor: 'It hums with holy energy.',
        abilities: ['lifesteal'],
        image: getCardArt('truesilver'),
        effect: null
    },
    {
        id: 'doomhammer',
        name: 'Doomhammer',
        type: 'weapon',
        cost: 5,
        attack: 2,
        durability: 8,
        rarity: 'epic',
        description: 'Windfury',
        flavor: 'For Doomhammer!',
        abilities: ['windfury'],
        image: getCardArt('doomhammer'),
        effect: null
    },
    {
        id: 'gorehowl',
        name: 'Gorehowl',
        type: 'weapon',
        cost: 7,
        attack: 7,
        durability: 1,
        rarity: 'epic',
        description: 'Attacking a minion costs 1 Attack instead of 1 Durability.',
        flavor: 'The axe of Grommash.',
        abilities: ['special_durability'],
        image: getCardArt('gorehowl'),
        effect: null
    }
];

// Helper function to get card by ID
function getCardById(id) {
    return CARDS.find(card => card.id === id);
}

// Helper function to create a card instance
function createCardInstance(cardId) {
    const cardData = getCardById(cardId);
    if (!cardData) return null;
    
    const instance = {
        ...cardData,
        id: Date.now() + Math.random().toString(), // Unique instance ID
        instanceOf: cardId
    };
    
    // For minions, add game state properties
    if (cardData.type === 'minion') {
        instance.currentHealth = cardData.health;
        instance.maxHealth = cardData.health;
        instance.canAttack = false;
        instance.attacksThisTurn = 0;
        instance.frozen = false;
        instance.divineShield = cardData.abilities?.includes('divine_shield') || false;
    }
    
    return instance;
}

// Helper to get random cards for deck building
function getRandomCards(count, filterFn = null) {
    let pool = filterFn ? CARDS.filter(filterFn) : [...CARDS];
    const result = [];
    
    for (let i = 0; i < count && pool.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        result.push(pool[randomIndex].id);
    }
    
    return result;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CARDS, getCardById, createCardInstance, getRandomCards, getCardArt };
}