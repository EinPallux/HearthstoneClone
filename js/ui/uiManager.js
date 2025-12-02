/* ============================================
   UI MANAGER
   Handles all UI updates and user interactions
   ============================================ */

const UIManager = {
    
    // References
    gameState: null,
    battleSystem: null,
    deckBuilder: null,
    questManager: null,
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    /**
     * Initialize UI Manager
     */
    init() {
        this.deckBuilder = new DeckBuilder();
        this.questManager = new QuestManager();
        
        this.setupEventListeners();
        this.loadSavedData();
        
        // Make UI Manager globally accessible
        window.UIManager = this;
        
        console.log('UI Manager initialized');
    },
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('btnSelectHero')?.addEventListener('click', () => {
            this.showHeroSelection();
        });
        
        document.getElementById('btnDeckBuilder')?.addEventListener('click', () => {
            this.showDeckBuilder();
        });
        
        document.getElementById('btnQuests')?.addEventListener('click', () => {
            this.showQuests();
        });
        
        document.getElementById('btnStartGame')?.addEventListener('click', () => {
            this.showDifficultySelection();
        });
        
        // Hero selection
        document.getElementById('btnBackFromHero')?.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Deck builder
        document.getElementById('btnBackFromDeck')?.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('btnSaveDeck')?.addEventListener('click', () => {
            this.saveDeck();
        });
        
        document.getElementById('btnSuggestDeck')?.addEventListener('click', () => {
            this.suggestDeck();
        });
        
        document.getElementById('btnPreBuiltDecks')?.addEventListener('click', () => {
            this.showPreBuiltDecks();
        });
        
        // Filters
        document.getElementById('filterCost')?.addEventListener('change', (e) => {
            this.deckBuilder.setFilter('cost', e.target.value);
            this.updateCardCollection();
        });
        
        document.getElementById('filterType')?.addEventListener('change', (e) => {
            this.deckBuilder.setFilter('type', e.target.value);
            this.updateCardCollection();
        });
        
        // Quests
        document.getElementById('btnBackFromQuests')?.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Difficulty selection
        document.getElementById('btnBackFromDifficulty')?.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                this.startGame(difficulty);
            });
        });
        
        // Game board
        document.getElementById('btnEndTurn')?.addEventListener('click', () => {
            this.endTurn();
        });
        
        document.getElementById('btnSurrender')?.addEventListener('click', () => {
            this.surrender();
        });
        
        // End game screen
        document.getElementById('btnPlayAgain')?.addEventListener('click', () => {
            this.showDifficultySelection();
        });
        
        document.getElementById('btnMainMenu')?.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Deck name input
        document.getElementById('deckName')?.addEventListener('input', (e) => {
            this.deckBuilder.currentDeck.name = e.target.value;
        });
    },
    
    /**
     * Load saved data
     */
    loadSavedData() {
        // Initialize storage
        StorageManager.initializePreBuiltDecks();
        StorageManager.getCollection();
    },
    
    // ============================================
    // SCREEN MANAGEMENT
    // ============================================
    
    /**
     * Show main menu
     */
    showMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        const heroSelection = document.getElementById('heroSelection');
        const deckBuilder = document.getElementById('deckBuilder');
        const questsScreen = document.getElementById('questsScreen');
        const gameBoard = document.getElementById('gameBoard');
        const difficultySelection = document.getElementById('difficultySelection');
        const endGameScreen = document.getElementById('endGameScreen');
        
        [heroSelection, deckBuilder, questsScreen, gameBoard, difficultySelection, endGameScreen].forEach(screen => {
            if (screen) screen.classList.add('hidden');
        });
        
        if (mainMenu) mainMenu.classList.remove('hidden');
    },
    
    /**
     * Show hero selection
     */
    showHeroSelection() {
        AnimationManager.fadeTransition(
            document.getElementById('mainMenu'),
            document.getElementById('heroSelection')
        );
        
        this.renderHeroSelection();
    },
    
    /**
     * Show deck builder
     */
    showDeckBuilder() {
        AnimationManager.fadeTransition(
            document.getElementById('mainMenu'),
            document.getElementById('deckBuilder')
        );
        
        // Load current deck or create new
        const currentDeck = StorageManager.getCurrentDeck();
        if (currentDeck) {
            this.deckBuilder.loadDeck(currentDeck.name);
        }
        
        this.updateDeckBuilder();
    },
    
    /**
     * Show quests
     */
    showQuests() {
        AnimationManager.fadeTransition(
            document.getElementById('mainMenu'),
            document.getElementById('questsScreen')
        );
        
        this.renderQuests();
    },
    
    /**
     * Show difficulty selection
     */
    showDifficultySelection() {
        // Check if hero selected
        const selectedHero = StorageManager.getSelectedHero();
        if (!selectedHero) {
            AnimationManager.showNotification('Please select a hero first!', 'error', 2000);
            this.showHeroSelection();
            return;
        }
        
        // Check if deck exists
        const currentDeck = StorageManager.getCurrentDeck();
        if (!currentDeck || currentDeck.cards.length !== 25) {
            AnimationManager.showNotification('Please build a 25-card deck first!', 'error', 2000);
            this.showDeckBuilder();
            return;
        }
        
        AnimationManager.fadeTransition(
            document.getElementById('mainMenu'),
            document.getElementById('difficultySelection')
        );
    },
    
    /**
     * Start game
     */
    startGame(difficulty) {
        AnimationManager.showLoading(true);
        
        setTimeout(() => {
            const selectedHero = StorageManager.getSelectedHero();
            
            // Initialize game state
            this.gameState = new GameState();
            this.gameState.questManager = this.questManager;
            this.gameState.initializeGame(selectedHero, difficulty);
            
            // Initialize battle system
            this.battleSystem = new BattleSystem(this.gameState);
            
            // Initialize AI
            this.aiPlayer = new AIPlayer(this.gameState, difficulty);
            
            // Override AI turn execution
            this.gameState.executeAITurn = () => {
                this.aiPlayer.executeTurn();
            };
            
            AnimationManager.fadeTransition(
                document.getElementById('difficultySelection'),
                document.getElementById('gameBoard')
            );
            
            AnimationManager.showLoading(false);
            
            this.updateGameBoard();
        }, 500);
    },
    
    // ============================================
    // HERO SELECTION
    // ============================================
    
    /**
     * Render hero selection
     */
    renderHeroSelection() {
        const heroGrid = document.getElementById('heroGrid');
        if (!heroGrid) return;
        
        heroGrid.innerHTML = '';
        
        const selectedHero = StorageManager.getSelectedHero();
        
        HEROES.forEach(hero => {
            const heroCard = document.createElement('div');
            heroCard.className = `relative bg-gradient-to-b ${hero.color} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${selectedHero === hero.id ? 'ring-4 ring-amber-400' : ''}`;
            
            heroCard.innerHTML = `
                <div class="text-center">
                    <div class="text-7xl mb-4">${hero.icon}</div>
                    <h3 class="text-2xl font-bold text-white mb-2">${hero.name}</h3>
                    <p class="text-sm text-white/80 mb-4">${hero.description}</p>
                    
                    <div class="bg-black/30 rounded-lg p-3 mb-3">
                        <div class="text-xs text-amber-400 font-bold mb-1">HERO POWER</div>
                        <div class="flex items-center justify-center gap-2 mb-1">
                            <span class="text-2xl">${hero.heroPower.icon}</span>
                            <span class="text-white font-bold">${hero.heroPower.name}</span>
                        </div>
                        <p class="text-xs text-white/90">${hero.heroPower.description}</p>
                    </div>
                    
                    <div class="bg-black/30 rounded-lg p-3">
                        <div class="text-xs text-purple-400 font-bold mb-1">PASSIVE</div>
                        <div class="text-white font-bold text-sm mb-1">${hero.passive.name}</div>
                        <p class="text-xs text-white/90">${hero.passive.description}</p>
                    </div>
                    
                    <div class="mt-4 flex justify-around text-sm">
                        <div>
                            <div class="text-green-400 font-bold">${hero.startingHealth}</div>
                            <div class="text-white/70 text-xs">Health</div>
                        </div>
                        <div>
                            <div class="text-blue-400 font-bold">${hero.startingArmor}</div>
                            <div class="text-white/70 text-xs">Armor</div>
                        </div>
                    </div>
                    
                    ${selectedHero === hero.id ? '<div class="mt-3 text-amber-400 font-bold">✓ SELECTED</div>' : ''}
                </div>
            `;
            
            heroCard.addEventListener('click', () => {
                StorageManager.saveSelectedHero(hero.id);
                AnimationManager.showNotification(`${hero.name} selected!`, 'success', 2000);
                this.renderHeroSelection();
            });
            
            heroGrid.appendChild(heroCard);
        });
    },
    
    // ============================================
    // DECK BUILDER
    // ============================================
    
    /**
     * Update deck builder UI
     */
    updateDeckBuilder() {
        this.updateCardCollection();
        this.updateCurrentDeck();
        
        // Update deck name
        const deckNameInput = document.getElementById('deckName');
        if (deckNameInput) {
            deckNameInput.value = this.deckBuilder.currentDeck.name;
        }
    },
    
    /**
     * Update card collection display
     */
    updateCardCollection() {
        const container = document.getElementById('cardCollection');
        if (!container) return;
        
        container.innerHTML = '';
        
        const cards = this.deckBuilder.getFilteredCards();
        
        cards.forEach(card => {
            const cardElement = this.createCardElement(card, 'collection');
            
            cardElement.addEventListener('click', () => {
                this.addCardToDeck(card.id);
            });
            
            container.appendChild(cardElement);
        });
    },
    
    /**
     * Update current deck display
     */
    updateCurrentDeck() {
        const container = document.getElementById('currentDeck');
        const countDisplay = document.getElementById('deckCount');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        // Group cards by ID
        const cardCounts = {};
        this.deckBuilder.currentDeck.cards.forEach(cardId => {
            cardCounts[cardId] = (cardCounts[cardId] || 0) + 1;
        });
        
        // Create card entries
        Object.entries(cardCounts).forEach(([cardId, count]) => {
            const card = getCardById(cardId);
            if (!card) return;
            
            const entry = document.createElement('div');
            entry.className = 'deck-card-mini';
            
            entry.innerHTML = `
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-blue-400 font-bold">${card.cost}</span>
                        <span class="text-white font-semibold">${card.name}</span>
                        <span class="text-amber-400 text-sm">x${count}</span>
                    </div>
                    <div class="text-xs text-gray-400">${card.type}</div>
                </div>
                <button class="text-red-400 hover:text-red-300 font-bold">×</button>
            `;
            
            entry.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeCardFromDeck(cardId);
            });
            
            container.appendChild(entry);
        });
        
        // Update count
        if (countDisplay) {
            countDisplay.textContent = `${this.deckBuilder.currentDeck.cards.length}/25`;
            
            if (this.deckBuilder.currentDeck.cards.length === 25) {
                countDisplay.classList.add('text-green-400');
                countDisplay.classList.remove('text-amber-400');
            } else {
                countDisplay.classList.add('text-amber-400');
                countDisplay.classList.remove('text-green-400');
            }
        }
    },
    
    /**
     * Add card to deck
     */
    addCardToDeck(cardId) {
        if (this.deckBuilder.addCard(cardId)) {
            this.updateCurrentDeck();
        }
    },
    
    /**
     * Remove card from deck
     */
    removeCardFromDeck(cardId) {
        this.deckBuilder.removeCard(cardId);
        this.updateCurrentDeck();
    },
    
    /**
     * Save deck
     */
    saveDeck() {
        if (this.deckBuilder.saveDeck()) {
            StorageManager.setCurrentDeck(this.deckBuilder.currentDeck.name);
        }
    },
    
    /**
     * Suggest deck
     */
    suggestDeck() {
        const archetypes = ['aggro', 'control', 'midrange', 'spell', 'balanced'];
        const randomArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
        
        this.deckBuilder.suggestDeck(randomArchetype);
        this.updateDeckBuilder();
    },
    
    /**
     * Show pre-built decks
     */
    showPreBuiltDecks() {
        const decks = StorageManager.getPreBuiltDecks();
        
        // Create modal or dropdown to select pre-built deck
        AnimationManager.showNotification('Loading pre-built deck...', 'info', 1500);
        
        const randomDeck = decks[Math.floor(Math.random() * decks.length)];
        this.deckBuilder.currentDeck = {
            name: randomDeck.name,
            cards: [...randomDeck.cards],
            hero: randomDeck.hero
        };
        
        this.updateDeckBuilder();
    },
    
    // ============================================
    // QUESTS
    // ============================================
    
    /**
     * Render quests
     */
    renderQuests() {
        const container = document.getElementById('questList');
        if (!container) return;
        
        container.innerHTML = '';
        
        const quests = this.questManager.getActiveQuestsWithProgress();
        
        quests.forEach(quest => {
            const questCard = document.createElement('div');
            questCard.className = `quest-card ${getQuestRarityClass(quest.rarity)} p-6 rounded-xl`;
            
            const isComplete = quest.progress >= quest.target;
            
            questCard.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="text-5xl">${quest.icon}</div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-2xl font-bold text-white">${quest.name}</h3>
                            <span class="text-amber-400 font-bold text-xl">${quest.reward.amount} 💰</span>
                        </div>
                        <p class="text-white/80 mb-3">${quest.description}</p>
                        
                        <div class="quest-progress-bar mb-2">
                            <div class="quest-progress-fill" style="width: ${quest.percentage}%"></div>
                        </div>
                        
                        <div class="flex justify-between items-center">
                            <span class="text-white font-semibold">${quest.progress} / ${quest.target}</span>
                            ${isComplete ? '<span class="text-green-400 font-bold">✓ COMPLETE</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(questCard);
        });
        
        // Show total gold earned
        const totalGold = document.createElement('div');
        totalGold.className = 'text-center mt-8 text-2xl font-bold text-amber-400';
        totalGold.textContent = `Total Gold Earned: ${this.questManager.totalGoldEarned} 💰`;
        container.appendChild(totalGold);
    },
    
    // ============================================
    // GAME BOARD
    // ============================================
    
    /**
     * Update game board
     */
    updateGameBoard() {
        this.updateHeroes();
        this.updateBoards();
        this.updateHands();
        this.updateMana();
        this.updateBattleLog();
        this.updateHeroPower();
    },
    
    /**
     * Update hero displays
     */
    updateHeroes() {
        this.updateHeroDisplay('playerHero', this.gameState.playerHero);
        this.updateHeroDisplay('enemyHero', this.gameState.enemyHero);
    },
    
    /**
     * Update single hero display
     */
    updateHeroDisplay(heroId, hero) {
        const container = document.getElementById(heroId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="hero-avatar">
                ${hero.icon}
            </div>
            <div class="hero-info">
                <div class="text-xl font-bold text-white">${hero.name}</div>
                <div class="flex items-center gap-2">
                    <div class="stat-badge health-badge">${hero.currentHealth}</div>
                    ${hero.armor > 0 ? `<div class="stat-badge armor-badge">${hero.armor}</div>` : ''}
                </div>
            </div>
        `;
        
        // Add click handler for hero attacks (not implemented in basic version)
        if (heroId === 'enemyHero') {
            container.style.cursor = 'pointer';
            container.onclick = () => {
                if (this.battleSystem.targetingMode && 
                    this.battleSystem.validTargets.includes('enemyHero')) {
                    this.battleSystem.selectTarget('enemyHero');
                }
            };
        }
    },
    
    /**
     * Update board displays
     */
    updateBoards() {
        this.updateBoard('playerBoard', this.gameState.playerBoard, true);
        this.updateBoard('enemyBoard', this.gameState.enemyBoard, false);
    },
    
    /**
     * Update single board
     */
    updateBoard(boardId, board, isPlayer) {
        const container = document.getElementById(boardId);
        if (!container) return;
        
        container.innerHTML = '';
        
        board.forEach((minion, index) => {
            if (minion) {
                const minionCard = this.createMinionCard(minion, isPlayer);
                
                if (isPlayer) {
                    minionCard.addEventListener('click', () => {
                        if (this.battleSystem.targetingMode) {
                            this.battleSystem.selectTarget(minion.id);
                        } else {
                            this.battleSystem.initiateMinionAttack(minion, index);
                        }
                    });
                } else {
                    minionCard.addEventListener('click', () => {
                        if (this.battleSystem.targetingMode && 
                            this.battleSystem.validTargets.includes(minion.id)) {
                            this.battleSystem.selectTarget(minion.id);
                        }
                    });
                }
                
                container.appendChild(minionCard);
            }
        });
    },
    
    /**
     * Create minion card element
     */
    createMinionCard(minion, isPlayer) {
        const div = document.createElement('div');
        div.className = 'minion-card';
        div.dataset.minionId = minion.id;
        div.id = minion.id;
        
        if (isPlayer && minion.canAttack && !minion.frozen) {
            div.classList.add('can-attack');
        }
        
        if (minion.frozen) {
            div.classList.add('frozen');
        }
        
        div.innerHTML = `
            <div class="relative h-full flex flex-col justify-between p-3 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg">
                <div class="flex justify-between items-start">
                    <div class="stat-badge attack-badge">${minion.attack}</div>
                    <div class="text-xs text-center">
                        <div class="text-amber-400 font-bold">${minion.name}</div>
                        ${minion.abilities && minion.abilities.length > 0 ? 
                            `<div class="text-purple-300 text-xs mt-1">${minion.abilities.join(', ')}</div>` : ''}
                    </div>
                    <div class="stat-badge health-badge">${minion.currentHealth}</div>
                </div>
                
                ${minion.divineShield ? '<div class="absolute inset-0 animate-shield pointer-events-none"></div>' : ''}
                ${minion.frozen ? '<div class="absolute inset-0 bg-blue-500/30 pointer-events-none"></div>' : ''}
            </div>
        `;
        
        return div;
    },
    
    /**
     * Update hand displays
     */
    updateHands() {
        const container = document.getElementById('playerHand');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.gameState.playerHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, 'hand', index);
            
            cardElement.addEventListener('click', () => {
                this.battleSystem.initiateCardPlay(card, index);
            });
            
            container.appendChild(cardElement);
        });
        
        // Update deck count
        const deckCountElement = document.getElementById('remainingCards');
        if (deckCountElement) {
            deckCountElement.textContent = this.gameState.playerDeck.length;
        }
    },
    
    /**
     * Create card element
     */
    createCardElement(card, context = 'collection', handIndex = null) {
        const div = document.createElement('div');
        div.className = `card card-${card.rarity} ${context === 'hand' ? 'card-in-hand' : ''}`;
        
        if (handIndex !== null) {
            div.dataset.handIndex = handIndex;
        }
        
        const rarityColors = {
            common: 'from-slate-600 to-slate-700',
            rare: 'from-blue-600 to-blue-700',
            epic: 'from-purple-600 to-purple-700',
            legendary: 'from-amber-600 to-amber-700'
        };
        
        div.innerHTML = `
            <div class="relative h-full flex flex-col bg-gradient-to-b ${rarityColors[card.rarity]} rounded-xl p-3">
                <div class="absolute top-2 left-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    ${card.cost}
                </div>
                
                <div class="flex-1 flex items-center justify-center my-4">
                    <div class="text-5xl">
                        ${card.type === 'minion' ? '👤' : card.type === 'spell' ? '✨' : '⚔️'}
                    </div>
                </div>
                
                <div class="text-center">
                    <div class="font-bold text-white text-sm mb-1">${card.name}</div>
                    <div class="type-badge type-${card.type} mx-auto mb-2">${card.type}</div>
                    <div class="text-xs text-white/90 mb-2 h-12 overflow-hidden">${card.description}</div>
                    
                    ${card.type === 'minion' ? `
                        <div class="flex justify-around">
                            <div class="stat-badge attack-badge">${card.attack}</div>
                            <div class="stat-badge health-badge">${card.health}</div>
                        </div>
                    ` : ''}
                    
                    ${card.type === 'weapon' ? `
                        <div class="flex justify-around">
                            <div class="stat-badge attack-badge">${card.attack}</div>
                            <div class="text-xs text-white">Dur: ${card.durability}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        return div;
    },
    
    /**
     * Update mana display
     */
    updateMana() {
        const currentManaEl = document.getElementById('currentMana');
        const maxManaEl = document.getElementById('maxMana');
        
        if (currentManaEl) currentManaEl.textContent = this.gameState.playerCurrentMana;
        if (maxManaEl) maxManaEl.textContent = this.gameState.playerMaxMana;
    },
    
    /**
     * Update battle log
     */
    updateBattleLog() {
        const container = document.getElementById('battleLog');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Show last 10 messages
        const recentLogs = this.gameState.battleLog.slice(-10);
        
        recentLogs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'text-xs text-amber-300';
            logEntry.textContent = log.message;
            container.appendChild(logEntry);
        });
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },
    
    /**
     * Update hero power button
     */
    updateHeroPower() {
        const container = document.getElementById('heroPowerBtn');
        if (!container) return;
        
        const heroPower = this.gameState.playerHero.heroPower;
        const canUse = heroPower.timesUsedThisTurn < heroPower.usesPerTurn &&
                       heroPower.cost <= this.gameState.playerCurrentMana &&
                       this.gameState.isPlayerTurn;
        
        container.innerHTML = `
            <div class="hero-power ${canUse ? 'available' : 'disabled'}">
                <div class="text-2xl">${heroPower.icon}</div>
                <div class="absolute bottom-0 right-0 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">
                    ${heroPower.cost}
                </div>
            </div>
        `;
        
        if (canUse) {
            container.style.cursor = 'pointer';
            container.onclick = () => {
                this.battleSystem.initiateHeroPower();
            };
        } else {
            container.style.cursor = 'not-allowed';
            container.onclick = null;
        }
    },
    
    /**
     * End turn
     */
    endTurn() {
        if (!this.gameState.isPlayerTurn) {
            AnimationManager.showNotification("It's not your turn!", 'error', 2000);
            return;
        }
        
        this.battleSystem.cancelAction();
        this.gameState.endPlayerTurn();
        this.updateGameBoard();
    },
    
    /**
     * Surrender
     */
    surrender() {
        if (confirm('Are you sure you want to surrender?')) {
            this.gameState.playerHero.currentHealth = 0;
            this.gameState.checkGameEnd();
        }
    },
    
    /**
     * Show end game screen
     */
    showEndGameScreen(playerWon) {
        const endGameScreen = document.getElementById('endGameScreen');
        const endGameTitle = document.getElementById('endGameTitle');
        const endGameStats = document.getElementById('endGameStats');
        
        if (!endGameScreen) return;
        
        // Set title and color
        if (playerWon) {
            endGameTitle.textContent = 'VICTORY!';
            endGameTitle.className = 'text-7xl font-bold mb-8 text-green-400';
        } else {
            endGameTitle.textContent = 'DEFEAT';
            endGameTitle.className = 'text-7xl font-bold mb-8 text-red-400';
        }
        
        // Show stats
        if (endGameStats) {
            const duration = Math.floor((Date.now() - this.gameState.gameStartTime) / 1000);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            
            endGameStats.innerHTML = `
                <div>Game Duration: ${minutes}:${seconds.toString().padStart(2, '0')}</div>
                <div>Cards Played: ${this.gameState.gameStats.cardsPlayed}</div>
                <div>Damage Dealt: ${this.gameState.gameStats.damageDealt}</div>
                <div>Minions Summoned: ${this.gameState.gameStats.minionsPlayed}</div>
                <div>Minions Destroyed: ${this.gameState.gameStats.minionsDestroyed}</div>
            `;
        }
        
        AnimationManager.fadeTransition(
            document.getElementById('gameBoard'),
            endGameScreen
        );
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
