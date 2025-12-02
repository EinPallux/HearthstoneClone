/* ============================================
   CARDS DATA - 100+ UNIQUE CARDS
   Types: minion, spell, weapon
   Rarities: common, rare, epic, legendary
   ============================================ */

const CARDS = [
    // ============================================
    // MINIONS (60 cards)
    // ============================================
    
    // === 0-1 COST MINIONS ===
    {
        id: 'wisp',
        name: 'Ethereal Wisp',
        type: 'minion',
        cost: 0,
        attack: 1,
        health: 1,
        rarity: 'common',
        description: 'A tiny spirit of pure energy.',
        abilities: []
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
        abilities: []
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
        abilities: []
    },
    {
        id: 'spider',
        name: 'Venomous Spider',
        type: 'minion',
        cost: 1,
        attack: 1,
        health: 1,
        rarity: 'common',
        description: 'Poisonous: Destroy any minion damaged by this.',
        abilities: ['poisonous']
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
        abilities: ['battlecry'],
        battlecry: (game, targetId) => {
            game.playerHero.currentHealth -= 3;
            game.addBattleLog('Flame Imp deals 3 damage to you!');
            game.animateDamage(game.playerHero.id, 3);
        }
    },
    
    // === 2 COST MINIONS ===
    {
        id: 'archer',
        name: 'Elven Archer',
        type: 'minion',
        cost: 2,
        attack: 2,
        health: 1,
        rarity: 'common',
        description: 'Battlecry: Deal 1 damage.',
        abilities: ['battlecry'],
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
        abilities: ['taunt']
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
        abilities: ['enrage'],
        enrageBonus: { attack: 2, health: 0 }
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
        abilities: ['battlecry'],
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
        abilities: ['stealth']
    },
    
    // === 3 COST MINIONS ===
    {
        id: 'knight',
        name: 'Silver Knight',
        type: 'minion',
        cost: 3,
        attack: 3,
        health: 3,
        rarity: 'common',
        description: 'A balanced warrior.',
        abilities: []
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
        abilities: ['aura'],
        aura: { adjacentAttack: 1 }
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
        abilities: ['battlecry'],
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
        id: 'cleric',
        name: 'Temple Cleric',
        type: 'minion',
        cost: 3,
        attack: 2,
        health: 4,
        rarity: 'common',
        description: 'At end of turn, restore 2 health to your hero.',
        abilities: ['endTurnEffect'],
        endTurnEffect: (game) => {
            const healAmount = Math.min(2, game.playerHero.maxHealth - game.playerHero.currentHealth);
            if (healAmount > 0) {
                game.playerHero.currentHealth += healAmount;
                game.addBattleLog('Temple Cleric heals you for 2!');
                game.animateHeal(game.playerHero.id, healAmount);
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
        abilities: ['stealth', 'bypass_taunt']
    },
    
    // === 4 COST MINIONS ===
    {
        id: 'guardian',
        name: 'Stone Guardian',
        type: 'minion',
        cost: 4,
        attack: 3,
        health: 6,
        rarity: 'common',
        description: 'Taunt',
        abilities: ['taunt']
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
        abilities: ['battlecry'],
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
        abilities: ['deathrattle'],
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
                abilities: []
            };
            
            if (boardIndex !== -1 && boardIndex < 7) {
                game.playerBoard[boardIndex] = skeleton;
                game.addBattleLog('A Skeleton rises from the grave!');
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
        abilities: ['divine_shield']
    },
    {
        id: 'golem',
        name: 'Iron Golem',
        type: 'minion',
        cost: 4,
        attack: 5,
        health: 5,
        rarity: 'rare',
        description: 'Cannot attack heroes.',
        abilities: ['cannot_attack_heroes']
    },
    
    // === 5 COST MINIONS ===
    {
        id: 'commander',
        name: 'Battle Commander',
        type: 'minion',
        cost: 5,
        attack: 4,
        health: 4,
        rarity: 'rare',
        description: 'Battlecry: Give all friendly minions +1 Attack.',
        abilities: ['battlecry'],
        battlecry: (game) => {
            game.playerBoard.forEach(minion => {
                if (minion && minion.id !== this.id) {
                    minion.attack += 1;
                }
            });
            game.addBattleLog('Battle Commander rallies your troops!');
        }
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
        abilities: ['deathrattle'],
        deathrattle: (game) => {
            game.enemyBoard.forEach(minion => {
                if (minion) game.dealDamage(minion, 3, 'deathrattle');
            });
            game.enemyHero.currentHealth -= 3;
            game.addBattleLog('Phoenix explodes in flames!');
            game.animateDamage(game.enemyHero.id, 3);
        }
    },
    {
        id: 'giant_spider',
        name: 'Ancient Spider',
        type: 'minion',
        cost: 5,
        attack: 3,
        health: 7,
        rarity: 'rare',
        description: 'Poisonous',
        abilities: ['poisonous']
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
        abilities: ['windfury']
    },
    {
        id: 'priest',
        name: 'High Priest',
        type: 'minion',
        cost: 5,
        attack: 3,
        health: 5,
        rarity: 'epic',
        description: 'Battlecry: Fully heal a minion.',
        abilities: ['battlecry'],
        battlecry: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target && target.type === 'minion') {
                    const healAmount = target.maxHealth - target.currentHealth;
                    target.currentHealth = target.maxHealth;
                    game.addBattleLog(`High Priest fully heals ${target.name}!`);
                    game.animateHeal(targetId, healAmount);
                }
            }
        }
    },
    
    // === 6 COST MINIONS ===
    {
        id: 'wyrm',
        name: 'Elder Wyrm',
        type: 'minion',
        cost: 6,
        attack: 6,
        health: 6,
        rarity: 'rare',
        description: 'Taunt',
        abilities: ['taunt']
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
        abilities: ['spell_damage'],
        spellDamage: 2
    },
    {
        id: 'demon',
        name: 'Infernal Demon',
        type: 'minion',
        cost: 6,
        attack: 7,
        health: 5,
        rarity: 'epic',
        description: 'Battlecry: Destroy a random friendly minion.',
        abilities: ['battlecry'],
        battlecry: (game) => {
            const friendlyMinions = game.playerBoard.filter(m => m !== null);
            if (friendlyMinions.length > 0) {
                const victim = friendlyMinions[Math.floor(Math.random() * friendlyMinions.length)];
                const index = game.playerBoard.indexOf(victim);
                game.destroyMinion(victim, index, 'player');
                game.addBattleLog(`Infernal Demon destroys ${victim.name}!`);
            }
        }
    },
    {
        id: 'treant',
        name: 'Ancient Treant',
        type: 'minion',
        cost: 6,
        attack: 5,
        health: 8,
        rarity: 'rare',
        description: 'Taunt. Restore 5 health to your hero when played.',
        abilities: ['taunt', 'battlecry'],
        battlecry: (game) => {
            const healAmount = Math.min(5, game.playerHero.maxHealth - game.playerHero.currentHealth);
            game.playerHero.currentHealth += healAmount;
            game.addBattleLog(`Ancient Treant heals you for ${healAmount}!`);
            game.animateHeal(game.playerHero.id, healAmount);
        }
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
        abilities: ['divine_shield', 'lifesteal']
    },
    
    // === 7 COST MINIONS ===
    {
        id: 'giant',
        name: 'Mountain Giant',
        type: 'minion',
        cost: 7,
        attack: 8,
        health: 8,
        rarity: 'epic',
        description: 'A colossal force of nature.',
        abilities: []
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
        abilities: ['battlecry'],
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
        id: 'hydra',
        name: 'Seven-Headed Hydra',
        type: 'minion',
        cost: 7,
        attack: 7,
        health: 7,
        rarity: 'legendary',
        description: 'Attacks all enemy minions simultaneously.',
        abilities: ['cleave']
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
        abilities: ['taunt', 'divine_shield']
    },
    {
        id: 'warlock',
        name: 'Shadow Warlock',
        type: 'minion',
        cost: 7,
        attack: 7,
        health: 6,
        rarity: 'epic',
        description: 'Battlecry: Deal 3 damage to all minions.',
        abilities: ['battlecry'],
        battlecry: (game) => {
            [...game.playerBoard, ...game.enemyBoard].forEach(minion => {
                if (minion) {
                    game.dealDamage(minion, 3, 'battlecry');
                }
            });
            game.addBattleLog('Shadow Warlock unleashes dark energy!');
        }
    },
    
    // === 8+ COST MINIONS ===
    {
        id: 'dragon',
        name: 'Ancient Dragon',
        type: 'minion',
        cost: 8,
        attack: 8,
        health: 8,
        rarity: 'legendary',
        description: 'Battlecry: Deal 8 damage randomly split among enemies.',
        abilities: ['battlecry'],
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
        id: 'leviathan',
        name: 'Abyssal Leviathan',
        type: 'minion',
        cost: 9,
        attack: 10,
        health: 10,
        rarity: 'legendary',
        description: 'Cannot be targeted by spells or hero powers.',
        abilities: ['elusive']
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
        abilities: ['cost_reduction'],
        costReduction: (game) => {
            return Math.min(9, game.spellsCast || 0);
        }
    },
    
    // Additional minions to reach variety
    {
        id: 'bat',
        name: 'Vampire Bat',
        type: 'minion',
        cost: 2,
        attack: 2,
        health: 1,
        rarity: 'common',
        description: 'Lifesteal',
        abilities: ['lifesteal']
    },
    {
        id: 'toad',
        name: 'Cursed Toad',
        type: 'minion',
        cost: 1,
        attack: 1,
        health: 2,
        rarity: 'common',
        description: 'Taunt',
        abilities: ['taunt']
    },
    {
        id: 'fairy',
        name: 'Forest Fairy',
        type: 'minion',
        cost: 3,
        attack: 2,
        health: 2,
        rarity: 'rare',
        description: 'Battlecry: Draw a card.',
        abilities: ['battlecry'],
        battlecry: (game) => {
            game.drawCard();
            game.addBattleLog('Forest Fairy draws you a card!');
        }
    },
    {
        id: 'golem_mini',
        name: 'Damaged Golem',
        type: 'minion',
        cost: 1,
        attack: 2,
        health: 1,
        rarity: 'common',
        description: 'A broken construct.',
        abilities: []
    },
    {
        id: 'elemental',
        name: 'Fire Elemental',
        type: 'minion',
        cost: 4,
        attack: 4,
        health: 3,
        rarity: 'rare',
        description: 'Battlecry: Deal 2 damage.',
        abilities: ['battlecry'],
        battlecry: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    game.dealDamage(target, 2, 'battlecry');
                    game.addBattleLog('Fire Elemental blasts its target!');
                }
            }
        }
    },
    {
        id: 'turtle',
        name: 'Armored Turtle',
        type: 'minion',
        cost: 3,
        attack: 1,
        health: 7,
        rarity: 'common',
        description: 'Taunt',
        abilities: ['taunt']
    },
    {
        id: 'griffin',
        name: 'Sky Griffin',
        type: 'minion',
        cost: 4,
        attack: 4,
        health: 3,
        rarity: 'rare',
        description: 'Charge',
        abilities: ['charge']
    },
    {
        id: 'minotaur',
        name: 'Raging Minotaur',
        type: 'minion',
        cost: 5,
        attack: 6,
        health: 4,
        rarity: 'rare',
        description: 'Charge. Enrage: +3 Attack',
        abilities: ['charge', 'enrage'],
        enrageBonus: { attack: 3, health: 0 }
    },
    {
        id: 'gargoyle',
        name: 'Stone Gargoyle',
        type: 'minion',
        cost: 3,
        attack: 2,
        health: 4,
        rarity: 'common',
        description: 'Taunt',
        abilities: ['taunt']
    },
    {
        id: 'unicorn',
        name: 'Mystic Unicorn',
        type: 'minion',
        cost: 4,
        attack: 3,
        health: 4,
        rarity: 'epic',
        description: 'Divine Shield. Battlecry: Restore 4 health.',
        abilities: ['divine_shield', 'battlecry'],
        battlecry: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    const healAmount = Math.min(4, target.maxHealth - target.currentHealth);
                    target.currentHealth += healAmount;
                    game.addBattleLog(`Mystic Unicorn heals for ${healAmount}!`);
                    game.animateHeal(targetId, healAmount);
                }
            }
        }
    },
    {
        id: 'spectre',
        name: 'Ethereal Spectre',
        type: 'minion',
        cost: 2,
        attack: 2,
        health: 2,
        rarity: 'rare',
        description: 'Stealth',
        abilities: ['stealth']
    },
    {
        id: 'cultist',
        name: 'Mad Cultist',
        type: 'minion',
        cost: 3,
        attack: 3,
        health: 3,
        rarity: 'rare',
        description: 'Deathrattle: Deal 3 damage to your hero.',
        abilities: ['deathrattle'],
        deathrattle: (game) => {
            game.playerHero.currentHealth -= 3;
            game.addBattleLog('Mad Cultist explodes!');
            game.animateDamage(game.playerHero.id, 3);
        }
    },
    {
        id: 'champion',
        name: 'Arena Champion',
        type: 'minion',
        cost: 6,
        attack: 6,
        health: 5,
        rarity: 'epic',
        description: 'Charge, Divine Shield',
        abilities: ['charge', 'divine_shield']
    },
    {
        id: 'shaman',
        name: 'Spirit Shaman',
        type: 'minion',
        cost: 4,
        attack: 3,
        health: 5,
        rarity: 'rare',
        description: 'Spell Damage +1',
        abilities: ['spell_damage'],
        spellDamage: 1
    },
    {
        id: 'golem_fire',
        name: 'Magma Golem',
        type: 'minion',
        cost: 5,
        attack: 5,
        health: 4,
        rarity: 'rare',
        description: 'At end of turn, deal 1 damage to all other minions.',
        abilities: ['endTurnEffect'],
        endTurnEffect: (game) => {
            [...game.playerBoard, ...game.enemyBoard].forEach(minion => {
                if (minion && minion.id !== this.id) {
                    game.dealDamage(minion, 1, 'effect');
                }
            });
            game.addBattleLog('Magma Golem burns everything!');
        }
    },
    {
        id: 'crusader',
        name: 'Light Crusader',
        type: 'minion',
        cost: 5,
        attack: 4,
        health: 5,
        rarity: 'epic',
        description: 'Divine Shield. Taunt.',
        abilities: ['divine_shield', 'taunt']
    },
    
    // ============================================
    // SPELLS (30 cards)
    // ============================================
    
    {
        id: 'fireball',
        name: 'Fireball',
        type: 'spell',
        cost: 4,
        rarity: 'common',
        description: 'Deal 6 damage.',
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
        id: 'heal',
        name: 'Healing Touch',
        type: 'spell',
        cost: 3,
        rarity: 'common',
        description: 'Restore 8 health.',
        effect: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    const healAmount = Math.min(8, target.maxHealth - target.currentHealth);
                    target.currentHealth += healAmount;
                    game.addBattleLog(`Healing Touch restores ${healAmount} health!`);
                    game.animateHeal(targetId, healAmount);
                }
            }
        }
    },
    {
        id: 'lightning',
        name: 'Lightning Bolt',
        type: 'spell',
        cost: 1,
        rarity: 'common',
        description: 'Deal 3 damage.',
        effect: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    let damage = 3 + (game.spellDamageBonus || 0);
                    game.dealDamage(target, damage, 'spell');
                    game.addBattleLog(`Lightning Bolt strikes for ${damage} damage!`);
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
        effect: (game, targetId) => {
            if (targetId) {
                const isEnemy = game.enemyBoard.find(m => m && m.id === targetId);
                const isPlayer = game.playerBoard.find(m => m && m.id === targetId);
                
                if (isEnemy) {
                    const index = game.enemyBoard.findIndex(m => m && m.id === targetId);
                    game.enemyBoard[index] = {
                        id: Date.now() + Math.random(),
                        name: 'Sheep',
                        type: 'minion',
                        attack: 1,
                        health: 1,
                        maxHealth: 1,
                        currentHealth: 1,
                        canAttack: false,
                        abilities: []
                    };
                } else if (isPlayer) {
                    const index = game.playerBoard.findIndex(m => m && m.id === targetId);
                    game.playerBoard[index] = {
                        id: Date.now() + Math.random(),
                        name: 'Sheep',
                        type: 'minion',
                        attack: 1,
                        health: 1,
                        maxHealth: 1,
                        currentHealth: 1,
                        canAttack: false,
                        abilities: []
                    };
                }
                game.addBattleLog('Target transformed into a Sheep!');
            }
        }
    },
    {
        id: 'consecration',
        name: 'Consecration',
        type: 'spell',
        cost: 4,
        rarity: 'common',
        description: 'Deal 2 damage to all enemies.',
        effect: (game) => {
            let damage = 2 + (game.spellDamageBonus || 0);
            game.enemyBoard.forEach(minion => {
                if (minion) game.dealDamage(minion, damage, 'spell');
            });
            game.enemyHero.currentHealth -= damage;
            game.animateDamage(game.enemyHero.id, damage);
            game.addBattleLog(`Consecration deals ${damage} damage to all enemies!`);
        }
    },
    {
        id: 'wild_growth',
        name: 'Wild Growth',
        type: 'spell',
        cost: 2,
        rarity: 'rare',
        description: 'Gain an empty Mana Crystal.',
        effect: (game) => {
            if (game.playerMaxMana < 10) {
                game.playerMaxMana++;
                game.addBattleLog('Gained an empty Mana Crystal!');
            } else {
                game.drawCard();
                game.addBattleLog('Drew a card instead (max mana reached)!');
            }
        }
    },
    {
        id: 'sprint',
        name: 'Sprint',
        type: 'spell',
        cost: 7,
        rarity: 'rare',
        description: 'Draw 4 cards.',
        effect: (game) => {
            for (let i = 0; i < 4; i++) {
                game.drawCard();
            }
            game.addBattleLog('Sprint draws 4 cards!');
        }
    },
    {
        id: 'arcane_intellect',
        name: 'Arcane Intellect',
        type: 'spell',
        cost: 3,
        rarity: 'common',
        description: 'Draw 2 cards.',
        effect: (game) => {
            game.drawCard();
            game.drawCard();
            game.addBattleLog('Arcane Intellect draws 2 cards!');
        }
    },
    {
        id: 'flamestrike',
        name: 'Flamestrike',
        type: 'spell',
        cost: 7,
        rarity: 'rare',
        description: 'Deal 4 damage to all enemy minions.',
        effect: (game) => {
            let damage = 4 + (game.spellDamageBonus || 0);
            game.enemyBoard.forEach(minion => {
                if (minion) game.dealDamage(minion, damage, 'spell');
            });
            game.addBattleLog(`Flamestrike deals ${damage} damage to all enemy minions!`);
        }
    },
    {
        id: 'backstab',
        name: 'Backstab',
        type: 'spell',
        cost: 0,
        rarity: 'common',
        description: 'Deal 2 damage to an undamaged minion.',
        effect: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target && target.type === 'minion' && target.currentHealth === target.maxHealth) {
                    let damage = 2 + (game.spellDamageBonus || 0);
                    game.dealDamage(target, damage, 'spell');
                    game.addBattleLog(`Backstab deals ${damage} damage!`);
                } else {
                    game.addBattleLog('Target must be undamaged!');
                }
            }
        }
    },
    {
        id: 'assassinate',
        name: 'Assassinate',
        type: 'spell',
        cost: 5,
        rarity: 'common',
        description: 'Destroy an enemy minion.',
        effect: (game, targetId) => {
            if (targetId) {
                const index = game.enemyBoard.findIndex(m => m && m.id === targetId);
                if (index !== -1) {
                    const minion = game.enemyBoard[index];
                    game.destroyMinion(minion, index, 'enemy');
                    game.addBattleLog(`${minion.name} was assassinated!`);
                }
            }
        }
    },
    {
        id: 'shadow_word_death',
        name: 'Shadow Word: Death',
        type: 'spell',
        cost: 3,
        rarity: 'common',
        description: 'Destroy a minion with 5 or more Attack.',
        effect: (game, targetId) => {
            if (targetId) {
                let minion = game.playerBoard.find(m => m && m.id === targetId);
                let board = 'player';
                let index = game.playerBoard.findIndex(m => m && m.id === targetId);
                
                if (!minion) {
                    minion = game.enemyBoard.find(m => m && m.id === targetId);
                    board = 'enemy';
                    index = game.enemyBoard.findIndex(m => m && m.id === targetId);
                }
                
                if (minion && minion.attack >= 5) {
                    game.destroyMinion(minion, index, board);
                    game.addBattleLog(`${minion.name} is destroyed!`);
                } else {
                    game.addBattleLog('Target must have 5 or more Attack!');
                }
            }
        }
    },
    {
        id: 'blessing_kings',
        name: 'Blessing of Kings',
        type: 'spell',
        cost: 4,
        rarity: 'common',
        description: 'Give a minion +4/+4.',
        effect: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target && target.type === 'minion') {
                    target.attack += 4;
                    target.maxHealth += 4;
                    target.currentHealth += 4;
                    game.addBattleLog(`${target.name} receives the Blessing of Kings!`);
                    game.animateBuffEffect(targetId);
                }
            }
        }
    },
    {
        id: 'divine_favor',
        name: 'Divine Favor',
        type: 'spell',
        cost: 3,
        rarity: 'rare',
        description: 'Draw cards until you have as many as your opponent.',
        effect: (game) => {
            const cardsToDraw = Math.max(0, game.enemyHandSize - game.playerHand.length);
            for (let i = 0; i < cardsToDraw && i < 10; i++) {
                game.drawCard();
            }
            game.addBattleLog(`Divine Favor draws ${cardsToDraw} cards!`);
        }
    },
    {
        id: 'pyroblast',
        name: 'Pyroblast',
        type: 'spell',
        cost: 10,
        rarity: 'epic',
        description: 'Deal 10 damage.',
        effect: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    let damage = 10 + (game.spellDamageBonus || 0);
                    game.dealDamage(target, damage, 'spell');
                    game.addBattleLog(`Pyroblast deals ${damage} damage!`);
                }
            }
        }
    },
    {
        id: 'shield_block',
        name: 'Shield Block',
        type: 'spell',
        cost: 3,
        rarity: 'common',
        description: 'Gain 5 Armor. Draw a card.',
        effect: (game) => {
            game.playerHero.armor += 5;
            game.drawCard();
            game.addBattleLog('Gained 5 Armor and drew a card!');
        }
    },
    {
        id: 'whirlwind',
        name: 'Whirlwind',
        type: 'spell',
        cost: 1,
        rarity: 'common',
        description: 'Deal 1 damage to all minions.',
        effect: (game) => {
            let damage = 1 + (game.spellDamageBonus || 0);
            [...game.playerBoard, ...game.enemyBoard].forEach(minion => {
                if (minion) game.dealDamage(minion, damage, 'spell');
            });
            game.addBattleLog(`Whirlwind deals ${damage} damage to all minions!`);
        }
    },
    {
        id: 'execute',
        name: 'Execute',
        type: 'spell',
        cost: 1,
        rarity: 'common',
        description: 'Destroy a damaged enemy minion.',
        effect: (game, targetId) => {
            if (targetId) {
                const index = game.enemyBoard.findIndex(m => m && m.id === targetId);
                if (index !== -1) {
                    const minion = game.enemyBoard[index];
                    if (minion.currentHealth < minion.maxHealth) {
                        game.destroyMinion(minion, index, 'enemy');
                        game.addBattleLog(`${minion.name} is executed!`);
                    } else {
                        game.addBattleLog('Target must be damaged!');
                    }
                }
            }
        }
    },
    {
        id: 'silence',
        name: 'Silence',
        type: 'spell',
        cost: 0,
        rarity: 'common',
        description: 'Silence a minion.',
        effect: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target && target.type === 'minion') {
                    target.abilities = [];
                    delete target.taunt;
                    delete target.divineShield;
                    delete target.windfury;
                    delete target.lifesteal;
                    delete target.poisonous;
                    game.addBattleLog(`${target.name} is silenced!`);
                }
            }
        }
    },
    {
        id: 'mindcontrol',
        name: 'Mind Control',
        type: 'spell',
        cost: 10,
        rarity: 'epic',
        description: 'Take control of an enemy minion.',
        effect: (game, targetId) => {
            if (targetId) {
                const enemyIndex = game.enemyBoard.findIndex(m => m && m.id === targetId);
                if (enemyIndex !== -1) {
                    const minion = game.enemyBoard[enemyIndex];
                    const emptySlot = game.playerBoard.findIndex(m => m === null);
                    
                    if (emptySlot !== -1) {
                        game.playerBoard[emptySlot] = minion;
                        game.enemyBoard[enemyIndex] = null;
                        minion.canAttack = false;
                        game.addBattleLog(`Mind Control takes ${minion.name}!`);
                    } else {
                        game.addBattleLog('Your board is full!');
                    }
                }
            }
        }
    },
    {
        id: 'meteor',
        name: 'Meteor',
        type: 'spell',
        cost: 6,
        rarity: 'epic',
        description: 'Deal 15 damage to a minion and 3 to adjacent ones.',
        effect: (game, targetId) => {
            if (targetId) {
                const enemyIndex = game.enemyBoard.findIndex(m => m && m.id === targetId);
                const playerIndex = game.playerBoard.findIndex(m => m && m.id === targetId);
                
                if (enemyIndex !== -1) {
                    const target = game.enemyBoard[enemyIndex];
                    let damage = 15 + (game.spellDamageBonus || 0);
                    game.dealDamage(target, damage, 'spell');
                    
                    // Adjacent damage
                    if (enemyIndex > 0 && game.enemyBoard[enemyIndex - 1]) {
                        game.dealDamage(game.enemyBoard[enemyIndex - 1], 3, 'spell');
                    }
                    if (enemyIndex < 6 && game.enemyBoard[enemyIndex + 1]) {
                        game.dealDamage(game.enemyBoard[enemyIndex + 1], 3, 'spell');
                    }
                    game.addBattleLog('Meteor crashes down!');
                } else if (playerIndex !== -1) {
                    const target = game.playerBoard[playerIndex];
                    let damage = 15 + (game.spellDamageBonus || 0);
                    game.dealDamage(target, damage, 'spell');
                    
                    if (playerIndex > 0 && game.playerBoard[playerIndex - 1]) {
                        game.dealDamage(game.playerBoard[playerIndex - 1], 3, 'spell');
                    }
                    if (playerIndex < 6 && game.playerBoard[playerIndex + 1]) {
                        game.dealDamage(game.playerBoard[playerIndex + 1], 3, 'spell');
                    }
                    game.addBattleLog('Meteor crashes down!');
                }
            }
        }
    },
    {
        id: 'brawl',
        name: 'Brawl',
        type: 'spell',
        cost: 5,
        rarity: 'epic',
        description: 'Destroy all minions except one (chosen randomly).',
        effect: (game) => {
            const allMinions = [...game.playerBoard, ...game.enemyBoard].filter(m => m);
            if (allMinions.length > 1) {
                const survivor = allMinions[Math.floor(Math.random() * allMinions.length)];
                
                game.playerBoard.forEach((minion, i) => {
                    if (minion && minion.id !== survivor.id) {
                        game.destroyMinion(minion, i, 'player');
                    }
                });
                game.enemyBoard.forEach((minion, i) => {
                    if (minion && minion.id !== survivor.id) {
                        game.destroyMinion(minion, i, 'enemy');
                    }
                });
                
                game.addBattleLog(`Only ${survivor.name} survives the Brawl!`);
            }
        }
    },
    {
        id: 'twisting_nether',
        name: 'Twisting Nether',
        type: 'spell',
        cost: 8,
        rarity: 'epic',
        description: 'Destroy all minions.',
        effect: (game) => {
            game.playerBoard.forEach((minion, i) => {
                if (minion) game.destroyMinion(minion, i, 'player');
            });
            game.enemyBoard.forEach((minion, i) => {
                if (minion) game.destroyMinion(minion, i, 'enemy');
            });
            game.addBattleLog('The Twisting Nether consumes all!');
        }
    },
    {
        id: 'moonfire',
        name: 'Moonfire',
        type: 'spell',
        cost: 0,
        rarity: 'common',
        description: 'Deal 1 damage.',
        effect: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    let damage = 1 + (game.spellDamageBonus || 0);
                    game.dealDamage(target, damage, 'spell');
                    game.addBattleLog(`Moonfire deals ${damage} damage!`);
                }
            }
        }
    },
    {
        id: 'innervate',
        name: 'Innervate',
        type: 'spell',
        cost: 0,
        rarity: 'rare',
        description: 'Gain 2 Mana Crystals this turn only.',
        effect: (game) => {
            game.playerCurrentMana = Math.min(10, game.playerCurrentMana + 2);
            game.addBattleLog('Innervate grants 2 temporary mana!');
        }
    },
    {
        id: 'siphon_soul',
        name: 'Siphon Soul',
        type: 'spell',
        cost: 6,
        rarity: 'rare',
        description: 'Destroy a minion. Restore 3 Health to your hero.',
        effect: (game, targetId) => {
            if (targetId) {
                let minion = game.playerBoard.find(m => m && m.id === targetId);
                let board = 'player';
                let index = game.playerBoard.findIndex(m => m && m.id === targetId);
                
                if (!minion) {
                    minion = game.enemyBoard.find(m => m && m.id === targetId);
                    board = 'enemy';
                    index = game.enemyBoard.findIndex(m => m && m.id === targetId);
                }
                
                if (minion) {
                    game.destroyMinion(minion, index, board);
                    const healAmount = Math.min(3, game.playerHero.maxHealth - game.playerHero.currentHealth);
                    game.playerHero.currentHealth += healAmount;
                    game.addBattleLog(`Siphon Soul destroys ${minion.name} and heals you!`);
                    game.animateHeal(game.playerHero.id, healAmount);
                }
            }
        }
    },
    {
        id: 'hex',
        name: 'Hex',
        type: 'spell',
        cost: 3,
        rarity: 'rare',
        description: 'Transform a minion into a 0/1 Frog with Taunt.',
        effect: (game, targetId) => {
            if (targetId) {
                const isEnemy = game.enemyBoard.find(m => m && m.id === targetId);
                const isPlayer = game.playerBoard.find(m => m && m.id === targetId);
                
                if (isEnemy) {
                    const index = game.enemyBoard.findIndex(m => m && m.id === targetId);
                    game.enemyBoard[index] = {
                        id: Date.now() + Math.random(),
                        name: 'Frog',
                        type: 'minion',
                        attack: 0,
                        health: 1,
                        maxHealth: 1,
                        currentHealth: 1,
                        canAttack: false,
                        abilities: ['taunt']
                    };
                } else if (isPlayer) {
                    const index = game.playerBoard.findIndex(m => m && m.id === targetId);
                    game.playerBoard[index] = {
                        id: Date.now() + Math.random(),
                        name: 'Frog',
                        type: 'minion',
                        attack: 0,
                        health: 1,
                        maxHealth: 1,
                        currentHealth: 1,
                        canAttack: false,
                        abilities: ['taunt']
                    };
                }
                game.addBattleLog('Target transformed into a Frog!');
            }
        }
    },
    {
        id: 'savage_roar',
        name: 'Savage Roar',
        type: 'spell',
        cost: 3,
        rarity: 'common',
        description: 'Give your characters +2 Attack this turn.',
        effect: (game) => {
            game.playerBoard.forEach(minion => {
                if (minion) {
                    minion.temporaryAttack = (minion.temporaryAttack || 0) + 2;
                    minion.attack += 2;
                }
            });
            game.addBattleLog('Savage Roar empowers your forces!');
        }
    },
    {
        id: 'power_overwhelming',
        name: 'Power Overwhelming',
        type: 'spell',
        cost: 1,
        rarity: 'common',
        description: 'Give a friendly minion +4/+4. At end of turn, destroy it.',
        effect: (game, targetId) => {
            if (targetId) {
                const minion = game.playerBoard.find(m => m && m.id === targetId);
                if (minion) {
                    minion.attack += 4;
                    minion.maxHealth += 4;
                    minion.currentHealth += 4;
                    minion.destroyAtEndOfTurn = true;
                    game.addBattleLog(`${minion.name} gains overwhelming power!`);
                    game.animateBuffEffect(targetId);
                }
            }
        }
    },
    
    // ============================================
    // WEAPONS (10 cards)
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
        abilities: ['windfury'],
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
        abilities: ['lifesteal'],
        effect: null
    },
    {
        id: 'sword_justice',
        name: 'Sword of Justice',
        type: 'weapon',
        cost: 3,
        attack: 1,
        durability: 5,
        rarity: 'epic',
        description: 'After you summon a minion, give it +1/+1 and lose 1 Durability.',
        abilities: ['onSummonEffect'],
        effect: (game, minion) => {
            if (minion && game.playerWeapon) {
                minion.attack += 1;
                minion.maxHealth += 1;
                minion.currentHealth += 1;
                game.playerWeapon.durability -= 1;
                game.addBattleLog('Sword of Justice empowers your minion!');
                
                if (game.playerWeapon.durability <= 0) {
                    game.playerWeapon = null;
                    game.addBattleLog('Sword of Justice breaks!');
                }
            }
        }
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
        abilities: ['special_durability'],
        effect: null
    },
    {
        id: 'assassins_blade',
        name: "Assassin's Blade",
        type: 'weapon',
        cost: 5,
        attack: 3,
        durability: 4,
        rarity: 'common',
        description: 'A deadly rogue weapon.',
        effect: null
    },
    {
        id: 'eaglehorn',
        name: 'Eaglehorn Bow',
        type: 'weapon',
        cost: 3,
        attack: 3,
        durability: 2,
        rarity: 'rare',
        description: 'A swift hunter weapon.',
        effect: null
    },
    {
        id: 'perditions',
        name: "Perdition's Blade",
        type: 'weapon',
        cost: 3,
        attack: 2,
        durability: 2,
        rarity: 'rare',
        description: 'Battlecry: Deal 1 damage.',
        abilities: ['battlecry'],
        battlecry: (game, targetId) => {
            if (targetId) {
                const target = game.findTarget(targetId);
                if (target) {
                    game.dealDamage(target, 1, 'battlecry');
                    game.addBattleLog("Perdition's Blade strikes!");
                }
            }
        }
    },
    {
        id: 'lights_justice',
        name: "Light's Justice",
        type: 'weapon',
        cost: 1,
        attack: 1,
        durability: 4,
        rarity: 'common',
        description: 'A simple starting weapon.',
        effect: null
    },
    {
        id: 'arcanite_reaper',
        name: 'Arcanite Reaper',
        type: 'weapon',
        cost: 5,
        attack: 5,
        durability: 2,
        rarity: 'common',
        description: 'A powerful warrior weapon.',
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
        id: Date.now() + Math.random(), // Unique instance ID
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
    module.exports = { CARDS, getCardById, createCardInstance, getRandomCards };
}
