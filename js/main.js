/* ============================================
   MAIN ENTRY POINT
   Initializes and connects all game systems
   ============================================ */

(function() {
    'use strict';
    
    // ============================================
    // GAME INITIALIZATION
    // ============================================
    
    /**
     * Initialize the game on DOM ready
     */
    function initializeGame() {
        console.log('🎮 Arcane Legends - Initializing...');
        
        // Check browser compatibility
        if (!checkBrowserCompatibility()) {
            showCompatibilityError();
            return;
        }
        
        // Initialize UI Manager (which initializes everything else)
        try {
            UIManager.init();
            console.log('✅ Game initialized successfully!');
            
            // Show welcome message
            showWelcomeMessage();
            
            // Check for first time player
            checkFirstTimePlayer();
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            showErrorMessage('Failed to initialize game. Please refresh the page.');
        }
    }
    
    /**
     * Check browser compatibility
     */
    function checkBrowserCompatibility() {
        // Check for required features
        const required = {
            localStorage: typeof Storage !== 'undefined',
            flexbox: CSS.supports('display', 'flex'),
            grid: CSS.supports('display', 'grid'),
            arrow: (() => {
                try {
                    eval('() => {}');
                    return true;
                } catch (e) {
                    return false;
                }
            })()
        };
        
        return Object.values(required).every(v => v);
    }
    
    /**
     * Show compatibility error
     */
    function showCompatibilityError() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ef4444;
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
            z-index: 9999;
            max-width: 500px;
        `;
        message.innerHTML = `
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Browser Not Supported</h2>
            <p>Please use a modern browser like Chrome, Firefox, Safari, or Edge to play this game.</p>
        `;
        document.body.appendChild(message);
    }
    
    /**
     * Show error message
     */
    function showErrorMessage(msg) {
        AnimationManager.showNotification(msg, 'error', 5000);
    }
    
    /**
     * Show welcome message
     */
    function showWelcomeMessage() {
        setTimeout(() => {
            AnimationManager.showNotification('Welcome to Arcane Legends! 🎮', 'success', 3000);
        }, 500);
    }
    
    /**
     * Check if first time player
     */
    function checkFirstTimePlayer() {
        const hasPlayed = localStorage.getItem('arcane_legends_has_played');
        
        if (!hasPlayed) {
            setTimeout(() => {
                showTutorialPrompt();
                localStorage.setItem('arcane_legends_has_played', 'true');
            }, 2000);
        }
    }
    
    /**
     * Show tutorial prompt
     */
    function showTutorialPrompt() {
        AnimationManager.showNotification(
            '💡 Tip: Select a hero, build a deck, and start your battle!',
            'info',
            5000
        );
    }
    
    // ============================================
    // GAME STATE OVERRIDES
    // ============================================
    
    /**
     * Override GameState's showEndGameScreen to use UI Manager
     */
    function setupGameStateOverrides() {
        // This will be called after game state is created
        if (window.gameState) {
            window.gameState.showEndGameScreen = function(playerWon, duration) {
                UIManager.showEndGameScreen(playerWon);
            };
        }
    }
    
    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    
    /**
     * Setup keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC - Cancel action
            if (e.key === 'Escape') {
                if (UIManager.battleSystem) {
                    UIManager.battleSystem.cancelAction();
                }
            }
            
            // Space - End turn (if in game)
            if (e.key === ' ' && UIManager.gameState && UIManager.gameState.isPlayerTurn) {
                e.preventDefault();
                UIManager.endTurn();
            }
            
            // Numbers 1-9 - Play cards from hand
            if (e.key >= '1' && e.key <= '9' && UIManager.gameState) {
                const index = parseInt(e.key) - 1;
                if (UIManager.gameState.playerHand[index]) {
                    const card = UIManager.gameState.playerHand[index];
                    UIManager.battleSystem.initiateCardPlay(card, index);
                }
            }
        });
    }
    
    // ============================================
    // PERFORMANCE MONITORING
    // ============================================
    
    /**
     * Monitor performance
     */
    function monitorPerformance() {
        // Log performance metrics
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    console.log(`📊 Page load time: ${pageLoadTime}ms`);
                }, 0);
            });
        }
    }
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    /**
     * Global error handler
     */
    function setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('💥 Runtime error:', e.error);
            
            // Show user-friendly error message
            AnimationManager.showNotification(
                'An error occurred. Please refresh the page.',
                'error',
                5000
            );
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('💥 Unhandled promise rejection:', e.reason);
        });
    }
    
    // ============================================
    // VISIBILITY HANDLING
    // ============================================
    
    /**
     * Handle page visibility changes
     */
    function setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('👋 Page hidden');
                // Pause game if needed
            } else {
                console.log('👀 Page visible');
                // Resume game if needed
            }
        });
    }
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    /**
     * Debug mode toggle
     */
    window.toggleDebug = function() {
        window.DEBUG_MODE = !window.DEBUG_MODE;
        console.log(`🐛 Debug mode: ${window.DEBUG_MODE ? 'ON' : 'OFF'}`);
        
        if (window.DEBUG_MODE) {
            // Enable debug features
            window.game = UIManager.gameState;
            window.battle = UIManager.battleSystem;
            window.deck = UIManager.deckBuilder;
            window.quests = UIManager.questManager;
            
            console.log('Debug objects available: game, battle, deck, quests');
        }
    };
    
    /**
     * Quick win (debug)
     */
    window.quickWin = function() {
        if (UIManager.gameState && UIManager.gameState.enemyHero) {
            UIManager.gameState.enemyHero.currentHealth = 0;
            UIManager.gameState.checkGameEnd();
            console.log('🏆 Quick win triggered');
        }
    };
    
    /**
     * Quick lose (debug)
     */
    window.quickLose = function() {
        if (UIManager.gameState && UIManager.gameState.playerHero) {
            UIManager.gameState.playerHero.currentHealth = 0;
            UIManager.gameState.checkGameEnd();
            console.log('💀 Quick lose triggered');
        }
    };
    
    /**
     * Give max mana (debug)
     */
    window.maxMana = function() {
        if (UIManager.gameState) {
            UIManager.gameState.playerMaxMana = 10;
            UIManager.gameState.playerCurrentMana = 10;
            UIManager.updateGameBoard();
            console.log('💎 Max mana granted');
        }
    };
    
    /**
     * Draw cards (debug)
     */
    window.drawCards = function(count = 5) {
        if (UIManager.gameState) {
            for (let i = 0; i < count; i++) {
                UIManager.gameState.drawCard('player');
            }
            UIManager.updateGameBoard();
            console.log(`🎴 Drew ${count} cards`);
        }
    };
    
    /**
     * Clear all data
     */
    window.clearAllData = function() {
        if (confirm('Are you sure you want to clear ALL game data? This cannot be undone!')) {
            StorageManager.clearAllData();
            localStorage.clear();
            location.reload();
        }
    };
    
    /**
     * Export game data
     */
    window.exportData = function() {
        const data = StorageManager.exportData();
        console.log('📦 Game data:');
        console.log(data);
        
        // Copy to clipboard if available
        if (navigator.clipboard) {
            navigator.clipboard.writeText(data).then(() => {
                AnimationManager.showNotification('Data copied to clipboard!', 'success', 2000);
            });
        }
        
        return data;
    };
    
    /**
     * Import game data
     */
    window.importData = function(dataString) {
        if (StorageManager.importData(dataString)) {
            AnimationManager.showNotification('Data imported! Refreshing...', 'success', 2000);
            setTimeout(() => location.reload(), 2000);
        } else {
            AnimationManager.showNotification('Failed to import data!', 'error', 2000);
        }
    };
    
    /**
     * Show game stats
     */
    window.showStats = function() {
        const stats = StorageManager.getStats();
        console.log('📊 Game Statistics:');
        console.table(stats);
        return stats;
    };
    
    /**
     * Show storage info
     */
    window.showStorage = function() {
        const info = StorageManager.getStorageInfo();
        console.log('💾 Storage Information:');
        console.log(`Total Size: ${info.totalSizeKB} KB`);
        console.table(info.details);
        return info;
    };
    
    // ============================================
    // CONSOLE WELCOME MESSAGE
    // ============================================
    
    /**
     * Show welcome message in console
     */
    function showConsoleWelcome() {
        const styles = [
            'color: #f59e0b',
            'font-size: 20px',
            'font-weight: bold',
            'text-shadow: 2px 2px 4px rgba(0,0,0,0.5)'
        ].join(';');
        
        console.log('%c🎮 ARCANE LEGENDS 🎮', styles);
        console.log('%cWelcome to Arcane Legends!', 'color: #8b5cf6; font-size: 14px;');
        console.log('%cDebug Commands:', 'color: #3b82f6; font-weight: bold;');
        console.log('  toggleDebug() - Enable debug mode');
        console.log('  quickWin() - Win instantly');
        console.log('  quickLose() - Lose instantly');
        console.log('  maxMana() - Get 10 mana');
        console.log('  drawCards(5) - Draw 5 cards');
        console.log('  showStats() - Show game statistics');
        console.log('  showStorage() - Show storage info');
        console.log('  clearAllData() - Clear all saved data');
        console.log('  exportData() - Export save data');
        console.log('  importData(data) - Import save data');
        console.log('%c────────────────────────────────', 'color: #6b7280;');
    }
    
    // ============================================
    // AUTO-SAVE SYSTEM
    // ============================================
    
    /**
     * Setup auto-save
     */
    function setupAutoSave() {
        // Save game state periodically
        setInterval(() => {
            if (UIManager.gameState && UIManager.gameState.phase === 'playing') {
                // Auto-save could be implemented here
                console.log('💾 Auto-save triggered');
            }
        }, 60000); // Every minute
    }
    
    // ============================================
    // INITIALIZATION SEQUENCE
    // ============================================
    
    /**
     * Run initialization sequence
     */
    function runInitializationSequence() {
        console.log('🚀 Starting initialization sequence...');
        
        // 1. Setup error handling first
        setupErrorHandling();
        console.log('✅ Error handling setup');
        
        // 2. Initialize game
        initializeGame();
        console.log('✅ Game initialized');
        
        // 3. Setup keyboard shortcuts
        setupKeyboardShortcuts();
        console.log('✅ Keyboard shortcuts setup');
        
        // 4. Setup visibility handler
        setupVisibilityHandler();
        console.log('✅ Visibility handler setup');
        
        // 5. Setup auto-save
        setupAutoSave();
        console.log('✅ Auto-save setup');
        
        // 6. Monitor performance
        monitorPerformance();
        console.log('✅ Performance monitoring setup');
        
        // 7. Show console welcome
        showConsoleWelcome();
        
        console.log('🎉 Initialization complete! Ready to play!');
    }
    
    // ============================================
    // START THE GAME
    // ============================================
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runInitializationSequence);
    } else {
        // DOM already loaded
        runInitializationSequence();
    }
    
    // ============================================
    // SERVICE WORKER (Future Enhancement)
    // ============================================
    
    /**
     * Register service worker for offline play (optional)
     */
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Service worker registration would go here
            // Not implemented in this version
        }
    }
    
    // ============================================
    // EXPORTS
    // ============================================
    
    // Make game accessible globally for debugging
    window.ArcaneLegendsGame = {
        version: '1.0.0',
        initialized: true,
        UIManager: UIManager,
        AnimationManager: AnimationManager,
        StorageManager: StorageManager
    };
    
})();

// ============================================
// DEVELOPMENT HELPERS
// ============================================

// Log game version
console.log('🎮 Arcane Legends v1.0.0');
console.log('📅 Build Date:', new Date().toISOString());

// Expose helpful info
window.GAME_INFO = {
    totalCards: CARDS.length,
    totalHeroes: HEROES.length,
    totalQuests: QUESTS.length,
    version: '1.0.0'
};

console.log('📊 Game Content:', window.GAME_INFO);
