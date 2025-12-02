/* ============================================
   UI MANAGER
   The "Brain" - Connects Logic to the Visual Interface
   ============================================ */

const UIManager = {
    
    // State References
    gameState: null,
    battleSystem: null,
    deckBuilder: null,
    questManager: null,
    aiPlayer: null,
    
    // UI State
    activeScreen: 'mainMenu',
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    init() {
        console.log('🔮 UI Manager Initializing...');
        
        // Initialize Core Systems
        this.deckBuilder = new DeckBuilder();
        this.questManager = new QuestManager();
        
        // Bind Global Events
        this.setupEventListeners();
        
        // Load Initial Data
        this.loadSavedData();
        
        // Start Music (Muted by default until interaction)
        document.body.addEventListener('click', () => {
            AnimationManager.playTheme('menu');
        }, { once: true });

        console.log('✅ UI Ready');
    },
    
    loadSavedData() {
        StorageManager.initializePreBuiltDecks();
        StorageManager.getCollection();
        
        // If we have a selected hero, highlight it? (Logic handled in render)
    },

    // ============================================
    // SCREEN NAVIGATION
    // ============================================
    
    showScreen(screenId) {
        const screens = ['mainMenu', 'heroSelection', 'deckBuilder', 'questsScreen', 'difficultySelection', 'gameBoard', 'endGameScreen'];
        
        // Hide all screens
        screens.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.classList.add('hidden');
                el.style.opacity = '0';
            }
        });
        
        // Show target screen
        const target = document.getElementById(screenId);
        if(target) {
            target.classList.remove('hidden');
            // Force reflow for transition
            void target.offsetWidth; 
            target.style.opacity = '1';
            this.activeScreen = screenId;
        }
    },

    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    setupEventListeners() {
        // --- Main Menu ---
        document.getElementById('btnStartGame').onclick = () => this.showScreen('difficultySelection');
        document.getElementById('btnSelectHero').onclick = () => {
            this.renderHeroSelection();
            this.showScreen('heroSelection');
        };
        document.getElementById('btnDeckBuilder').onclick = () => {
            this.renderDeckBuilder();
            this.showScreen('deckBuilder');
        };
        document.getElementById('btnQuests').onclick = () => {
            this.renderQuests();
            this.showScreen('questsScreen');
        };

        // --- Hero Selection ---
        document.getElementById('btnBackFromHero').onclick = () => this.showScreen('mainMenu');

        // --- Deck Builder ---
        document.getElementById('btnBackFromDeck').onclick = () => this.showScreen('mainMenu');
        document.getElementById('btnSaveDeck').onclick = () => this.saveDeck();
        document.getElementById('btnSuggestDeck').onclick = () => {
            this.deckBuilder.suggestDeck();
            this.updateDeckBuilderUI();
        };
        document.getElementById('btnPreBuiltDecks').onclick = () => {
             // Simple toggle for now, could be a modal
             this.deckBuilder.suggestDeck('control'); 
             this.updateDeckBuilderUI();
        };
        
        // Filters
        document.getElementById('filterCost').onchange = (e) => {
            this.deckBuilder.setFilter('cost', e.target.value);
            this.renderCollection();
        };
        document.getElementById('filterType').onchange = (e) => {
            this.deckBuilder.setFilter('type', e.target.value);
            this.renderCollection();
        };
        document.getElementById('deckName').oninput = (e) => {
            this.deckBuilder.currentDeck.name = e.target.value;
        };

        // --- Quests ---
        document.getElementById('btnBackFromQuests').onclick = () => this.showScreen('mainMenu');

        // --- Difficulty Select ---
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.onclick = () => this.startGame(btn.dataset.difficulty);
        });
        document.getElementById('btnBackFromDifficulty').onclick = () => this.showScreen('mainMenu');

        // --- Game Board ---
        document.getElementById('btnEndTurn').onclick = () => this.handleEndTurn();
        document.getElementById('btnSurrender').onclick = () => this.handleSurrender();

        // --- End Game ---
        document.getElementById('btnPlayAgain').onclick = () => this.showScreen('difficultySelection');
        document.getElementById('btnMainMenu').onclick = () => this.showScreen('mainMenu');
    },

    // ============================================
    // GAME LOGIC BRIDGES
    // ============================================

    startGame(difficulty) {
        AnimationManager.showLoading(true);
        AnimationManager.playTheme('battle');

        // Allow UI to update before heavy processing
        requestAnimationFrame(() => {
            const selectedHeroId = StorageManager.getSelectedHero() || 'pyra'; // Default
            
            // Init Game Core
            this.gameState = new GameState();
            this.gameState.questManager = this.questManager;
            this.gameState.initializeGame(selectedHeroId, difficulty);
            
            // Init Systems
            this.battleSystem = new BattleSystem(this.gameState);
            this.aiPlayer = new AIPlayer(this.gameState, difficulty);
            
            // Override AI hook
            this.gameState.executeAITurn = () => this.aiPlayer.executeTurn();

            // Initial Render
            this.updateGameBoard();
            
            // Transition
            setTimeout(() => {
                AnimationManager.showLoading(false);
                this.showScreen('gameBoard');
                
                // Entrance Animations
                this.gameState.startPlayerTurn(); // Start turn 1 logic
            }, 1000);
        });
    },

    handleEndTurn() {
        if(this.gameState && this.gameState.isPlayerTurn) {
            AnimationManager.playSound('sfx-click');
            this.battleSystem.cancelAction(); // Clear any pending targeting
            this.gameState.endPlayerTurn();
            this.updateGameBoard();
        } else {
            AnimationManager.showNotification("Not your turn!", "error");
        }
    },

    handleSurrender() {
        if(confirm("Forfeit the match?")) {
            this.gameState.endGame(false);
        }
    },

    // ============================================
    // RENDERERS: HERO SELECTION
    // ============================================

    renderHeroSelection() {
        const grid = document.getElementById('heroGrid');
        grid.innerHTML = '';
        const selectedId = StorageManager.getSelectedHero();

        HEROES.forEach(hero => {
            const el = document.createElement('div');
            el.className = `relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 ${selectedId === hero.id ? 'border-amber-400 scale-105 shadow-2xl' : 'border-slate-700 hover:border-blue-400'}`;
            
            el.innerHTML = `
                <div class="h-40 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('${hero.image}')">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>
                <div class="p-4 bg-slate-800 relative z-10">
                    <h3 class="font-cinzel font-bold text-white text-lg">${hero.name}</h3>
                    <p class="text-xs text-amber-400 mb-2">${hero.title}</p>
                    <p class="text-xs text-slate-300 line-clamp-2">${hero.description}</p>
                    
                    <div class="mt-3 flex items-center gap-2">
                        <img src="${hero.heroPower.image}" class="w-8 h-8 rounded-full border border-slate-500">
                        <div class="text-xs text-slate-400">
                            <span class="text-white font-bold">Power:</span> ${hero.heroPower.name}
                        </div>
                    </div>
                </div>
                ${selectedId === hero.id ? '<div class="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded">SELECTED</div>' : ''}
            `;

            el.onclick = () => {
                StorageManager.saveSelectedHero(hero.id);
                AnimationManager.playSound('sfx-click');
                this.renderHeroSelection(); // Re-render to update selection state
            };
            
            grid.appendChild(el);
        });
    },

    // ============================================
    // RENDERERS: DECK BUILDER
    // ============================================

    renderDeckBuilder() {
        // Load deck
        const savedDeck = StorageManager.getCurrentDeck();
        if(savedDeck) {
            this.deckBuilder.currentDeck = savedDeck;
            document.getElementById('deckName').value = savedDeck.name;
        } else {
            this.deckBuilder.currentDeck = { name: "New Deck", cards: [], hero: null };
            document.getElementById('deckName').value = "New Deck";
        }
        
        this.updateDeckBuilderUI();
    },

    updateDeckBuilderUI() {
        this.renderCollection();
        this.renderCurrentDeck();
    },

    renderCollection() {
        const container = document.getElementById('cardCollection');
        container.innerHTML = '';
        const cards = this.deckBuilder.getFilteredCards();

        cards.forEach(card => {
            // Re-use the main card renderer but scaling it down slightly if needed
            const cardEl = this.createCardElement(card, 'collection');
            cardEl.style.transform = 'scale(0.9)'; // Fit more in grid
            
            // Click to add
            cardEl.onclick = () => {
                if(this.deckBuilder.addCard(card.id)) {
                    AnimationManager.playSound('sfx-click');
                    this.updateDeckBuilderUI();
                }
            };

            container.appendChild(cardEl);
        });
    },

    renderCurrentDeck() {
        const container = document.getElementById('currentDeck');
        const countEl = document.getElementById('deckCount');
        container.innerHTML = '';
        
        const deckMap = {};
        this.deckBuilder.currentDeck.cards.forEach(id => {
            deckMap[id] = (deckMap[id] || 0) + 1;
        });

        Object.keys(deckMap).forEach(id => {
            const card = getCardById(id);
            const count = deckMap[id];
            
            const el = document.createElement('div');
            el.className = 'flex items-center justify-between bg-slate-800 p-2 rounded border-l-4 border-slate-600 hover:bg-slate-700 cursor-pointer group transition-all';
            // Rarity color border
            const rarityColors = { common: 'border-slate-400', rare: 'border-blue-400', epic: 'border-purple-400', legendary: 'border-amber-400' };
            el.classList.replace('border-slate-600', rarityColors[card.rarity] || 'border-slate-600');

            el.innerHTML = `
                <div class="flex items-center gap-2 overflow-hidden">
                    <div class="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-500">${card.cost}</div>
                    <span class="text-sm font-bold text-slate-200 truncate group-hover:text-white">${card.name}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-amber-400 font-bold text-xs">x${count}</span>
                    <i class="fa-solid fa-xmark text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
            `;

            el.onclick = () => {
                this.deckBuilder.removeCard(id);
                this.updateDeckBuilderUI();
            };

            container.appendChild(el);
        });

        const count = this.deckBuilder.currentDeck.cards.length;
        countEl.textContent = `${count}/25`;
        countEl.className = count === 25 ? "font-mono font-bold text-green-400" : "font-mono font-bold text-amber-400";
    },

    saveDeck() {
        if(this.deckBuilder.saveDeck()) {
            AnimationManager.showNotification("Deck Saved!", "success");
        }
    },

    // ============================================
    // RENDERERS: GAME BOARD (THE CORE)
    // ============================================

    updateGameBoard() {
        if(!this.gameState) return;

        // 1. Hands
        this.renderPlayerHand();
        this.renderEnemyHand();

        // 2. Boards
        this.renderBoard('playerBoard', this.gameState.playerBoard, true);
        this.renderBoard('enemyBoard', this.gameState.enemyBoard, false);

        // 3. Heroes
        this.renderHero('playerHero', this.gameState.playerHero, true);
        this.renderHero('enemyHero', this.gameState.enemyHero, false);

        // 4. Resources
        this.updateMana();
        document.getElementById('remainingCards').textContent = this.gameState.playerDeck.length;

        // 5. Hero Power
        this.renderHeroPower();

        // 6. Logs
        this.updateBattleLog();
        
        // 7. Check targeting state
        if(this.battleSystem.targetingMode) {
            document.body.style.cursor = 'crosshair';
        } else {
            document.body.style.cursor = 'default';
        }
    },

    // --- Hand Rendering ---

    renderPlayerHand() {
        const container = document.getElementById('playerHand');
        container.innerHTML = '';
        
        const handSize = this.gameState.playerHand.length;
        // Calculate spread
        const angleStep = 4; // degrees
        const startAngle = -((handSize - 1) * angleStep) / 2;

        this.gameState.playerHand.forEach((card, index) => {
            const el = this.createCardElement(card, 'hand', index);
            
            // Fan effect
            const rotation = startAngle + (index * angleStep);
            const yOffset = Math.abs(rotation) * 3; // curve down on sides
            
            el.style.transform = `rotate(${rotation}deg) translateY(${yOffset}px)`;
            
            // Interaction: 3D Tilt
            el.addEventListener('mousemove', (e) => this.handleCardTilt(e, el));
            el.addEventListener('mouseleave', () => {
                el.style.transform = `rotate(${rotation}deg) translateY(${yOffset}px)`; // Reset
                el.querySelector('.card-face').style.transform = '';
            });

            // Click to Play
            el.onclick = (e) => {
                e.stopPropagation(); // Prevent document click (music start)
                if(this.gameState.isPlayerTurn) {
                    this.battleSystem.initiateCardPlay(card, index);
                }
            };
            
            // Hover (Zoom up)
            el.addEventListener('mouseenter', () => {
                el.style.zIndex = '100';
                el.style.transform = `rotate(0deg) translateY(-80px) scale(1.3)`;
                AnimationManager.playSound('sfx-hover');
            });

            container.appendChild(el);
        });
    },

    renderEnemyHand() {
        const container = document.getElementById('enemyHand');
        container.innerHTML = '';
        // Just show card backs
        for(let i=0; i<this.gameState.enemyHandSize; i++) {
            const cardBack = document.createElement('div');
            cardBack.className = 'w-16 h-24 bg-slate-800 rounded border border-slate-600 bg-[url("assets/card_back.png")] bg-cover shadow-lg transform -ml-8';
            container.appendChild(cardBack);
        }
    },

    // --- Board Rendering ---

    renderBoard(containerId, minions, isPlayer) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        minions.forEach((minion, index) => {
            if(!minion) return; // Skip null slots
            
            const el = document.createElement('div');
            el.className = `minion-card relative group transition-all duration-200`;
            el.dataset.minionId = minion.id;
            el.id = minion.id; // Essential for animations to find it

            // States
            if(minion.canAttack && !minion.frozen && isPlayer) el.classList.add('can-attack');
            if(minion.frozen) el.classList.add('frozen');
            if(minion.abilities?.includes('taunt')) el.classList.add('taunt');
            if(minion.divineShield) el.classList.add('divine-shield');

            // Targeting Highlighting
            if(this.battleSystem.targetingMode && this.battleSystem.validTargets.includes(minion.id)) {
                el.classList.add(isPlayer ? 'target-valid-friendly' : 'target-valid-enemy');
            }

            el.innerHTML = `
                <div class="absolute inset-0 rounded-full overflow-hidden border-2 border-slate-600 bg-slate-900">
                    <img src="${minion.image}" class="w-full h-full object-cover">
                </div>
                <div class="stat-badge stat-attack">${minion.attack}</div>
                <div class="stat-badge stat-health">${minion.currentHealth}</div>
                ${minion.deathrattle ? '<div class="absolute bottom-[-10px] left-1/2 -translate-x-1/2 text-xs text-purple-400 bg-black/80 px-1 rounded">☠️</div>' : ''}
            `;

            // Events
            el.onclick = (e) => {
                e.stopPropagation();
                if(this.battleSystem.targetingMode) {
                    this.battleSystem.selectTarget(minion.id);
                } else if(isPlayer) {
                    this.battleSystem.initiateMinionAttack(minion, index);
                }
            };

            // Hover tooltip for minion details
            el.onmouseenter = () => this.showTooltip(minion, el);
            el.onmouseleave = () => this.hideTooltip();

            container.appendChild(el);
        });
    },

    // --- Hero Rendering ---

    renderHero(containerId, hero, isPlayer) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        // Targeting check
        let targetClass = '';
        if(this.battleSystem.targetingMode && this.battleSystem.validTargets.includes(hero.id)) {
            targetClass = isPlayer ? 'target-valid-friendly' : 'target-valid-enemy';
        }

        container.innerHTML = `
            <div class="hero-portrait-frame ${targetClass}" id="${hero.id}">
                <img src="${hero.image}" class="hero-portrait-image">
                ${hero.armor > 0 ? `<div class="absolute top-0 right-0 bg-slate-400 text-black font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white z-20">${hero.armor}</div>` : ''}
                <div class="absolute bottom-[-10px] right-[-5px] w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
                    <span class="font-cinzel font-bold text-white text-lg drop-shadow-md">${hero.currentHealth}</span>
                </div>
                ${hero.attack > 0 ? `<div class="absolute bottom-[-10px] left-[-5px] w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20 font-bold text-white">${hero.attack}</div>` : ''}
            </div>
        `;

        // Click handler for hero
        const frame = container.querySelector('.hero-portrait-frame');
        frame.onclick = () => {
             if(this.battleSystem.targetingMode) {
                 this.battleSystem.selectTarget(hero.id);
             }
        };
    },

    // --- Helpers ---

    createCardElement(card, context, index) {
        const el = document.createElement('div');
        el.className = `card rarity-${card.rarity}`;
        if(context === 'hand') el.dataset.handIndex = index;

        // Flavor text is added as a data attribute for tooltips
        el.innerHTML = `
            <div class="card-face">
                <div class="h-[55%] relative overflow-hidden bg-slate-900">
                    <img src="${card.image}" class="w-full h-full object-cover">
                    <div class="absolute top-1 left-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border border-blue-400 shadow-md font-cinzel text-sm">${card.cost}</div>
                </div>
                <div class="h-[45%] p-2 flex flex-col items-center bg-slate-800 border-t border-slate-600 relative">
                    <div class="text-center">
                        <div class="font-cinzel font-bold text-white text-[10px] uppercase tracking-wider mb-1 text-outline truncate w-28">${card.name}</div>
                        <div class="text-[9px] text-slate-300 leading-tight h-8 overflow-hidden text-center font-montserrat">${card.description}</div>
                    </div>
                    
                    ${card.type === 'minion' ? `
                        <div class="absolute bottom-1 left-1 w-7 h-7 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold border border-yellow-400 shadow-md font-cinzel text-sm">${card.attack}</div>
                        <div class="absolute bottom-1 right-1 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold border border-red-400 shadow-md font-cinzel text-sm">${card.health}</div>
                    ` : ''}
                     ${card.type === 'weapon' ? `
                        <div class="absolute bottom-1 left-1 w-7 h-7 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold border border-yellow-400 shadow-md font-cinzel text-sm">⚔️${card.attack}</div>
                        <div class="absolute bottom-1 right-1 w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold border border-slate-400 shadow-md font-cinzel text-sm">🛡️${card.durability}</div>
                    ` : ''}
                </div>
            </div>
        `;
        
        return el;
    },

    handleCardTilt(e, el) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Invert axis
        const rotateY = ((x - centerX) / centerX) * 10;
        
        el.querySelector('.card-face').style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    },

    updateMana() {
        const current = this.gameState.playerCurrentMana;
        const max = this.gameState.playerMaxMana;
        
        document.getElementById('currentMana').textContent = current;
        document.getElementById('maxMana').textContent = max;
        
        const crystals = document.getElementById('manaCrystals');
        crystals.innerHTML = '';
        for(let i=0; i<max; i++) {
            const div = document.createElement('div');
            div.className = `mana-crystal ${i < current ? '' : 'empty'}`;
            crystals.appendChild(div);
        }
    },

    renderHeroPower() {
        const container = document.getElementById('heroPowerBtn');
        const hero = this.gameState.playerHero;
        const power = hero.heroPower;
        
        const isUsable = this.gameState.isPlayerTurn && power.timesUsedThisTurn < power.usesPerTurn && this.gameState.playerCurrentMana >= power.cost;
        
        container.innerHTML = `
            <div class="w-20 h-20 rounded-full bg-slate-800 border-4 ${isUsable ? 'border-green-500 cursor-pointer hover:scale-105 shadow-[0_0_15px_#22c55e]' : 'border-slate-600 grayscale'} overflow-hidden relative transition-all">
                <img src="${power.image}" class="w-full h-full object-cover">
                <div class="absolute bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">${power.cost}</div>
            </div>
        `;
        
        if(isUsable) {
            container.onclick = () => this.battleSystem.initiateHeroPower();
        } else {
            container.onclick = null;
        }
    },

    updateBattleLog() {
        const container = document.getElementById('battleLog');
        // Only append new logs in a real implementation to save DOM ops, but full redraw is safer for MVP
        container.innerHTML = '';
        this.gameState.battleLog.slice(-8).forEach(log => {
            const div = document.createElement('div');
            div.className = 'mb-1 opacity-80 hover:opacity-100 transition-opacity';
            div.textContent = `> ${log.message}`;
            container.appendChild(div);
        });
        container.scrollTop = container.scrollHeight;
    },

    // --- Tooltip System ---
    
    showTooltip(data, targetEl) {
        // Create tooltip on body
        const tooltip = document.createElement('div');
        tooltip.id = 'active-tooltip';
        tooltip.className = 'fixed z-[1000] bg-slate-900 border border-slate-600 p-4 rounded-xl shadow-2xl w-64 pointer-events-none animate-fade-in-down';
        
        tooltip.innerHTML = `
            <h4 class="font-cinzel font-bold text-white text-lg mb-1 text-amber-400">${data.name}</h4>
            <p class="text-xs text-slate-300 mb-2 italic">"${data.flavor || ''}"</p>
            <p class="text-sm text-white">${data.description}</p>
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = targetEl.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 20}px`;
        tooltip.style.top = `${rect.top}px`;
        
        // Boundary check (right edge)
        if(rect.right + 300 > window.innerWidth) {
            tooltip.style.left = `${rect.left - 280}px`;
        }
    },

    hideTooltip() {
        const t = document.getElementById('active-tooltip');
        if(t) t.remove();
    },

    // ============================================
    // QUESTS UI
    // ============================================

    renderQuests() {
        const list = document.getElementById('questList');
        list.innerHTML = '';
        const quests = this.questManager.getActiveQuestsWithProgress();
        
        quests.forEach(q => {
            const el = document.createElement('div');
            el.className = 'bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center justify-between';
            el.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="text-3xl">${q.icon}</div>
                    <div>
                        <h4 class="font-bold text-white">${q.name}</h4>
                        <p class="text-slate-400 text-sm">${q.description}</p>
                        <div class="w-48 h-2 bg-slate-900 rounded-full mt-2 overflow-hidden">
                            <div class="h-full bg-amber-500 transition-all duration-500" style="width: ${q.percentage}%"></div>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-amber-400 font-bold text-xl">${q.reward.amount} 💰</div>
                    <div class="text-sm text-slate-500">${q.progress}/${q.target}</div>
                </div>
            `;
            list.appendChild(el);
        });
    }
};

// Global Exposure
window.UIManager = UIManager;

// Auto-init
document.addEventListener('DOMContentLoaded', () => UIManager.init());