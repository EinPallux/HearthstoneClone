/* ============================================
   MAIN ENTRY POINT
   Initializes the application and handles global lifecycle events.
   ============================================ */

(function() {
    'use strict';

    console.log('🚀 Arcane Legends: Booting up...');

    // ============================================
    // APP INITIALIZATION
    // ============================================

    function initGame() {
        // 1. Initialize Storage (Load/Validate Data)
        try {
            if (window.StorageManager) {
                StorageManager.init();
            } else {
                throw new Error("StorageManager not found");
            }
        } catch (e) {
            console.error("Storage Init Failed:", e);
        }

        // 2. Initialize UI (The Brain)
        // UIManager will recursively initialize GameState, BattleSystem, etc. when needed.
        if (window.UIManager) {
            UIManager.init();
        } else {
            console.error("❌ UIManager not found! Check script loading order.");
            return;
        }

        // 3. Global Event Handlers (Window level)
        window.addEventListener('resize', handleResize);
        
        // 4. Welcome Message
        setTimeout(() => {
            if(window.AnimationManager) {
                AnimationManager.showNotification("Welcome to Arcane Legends", "info");
            }
        }, 1000);
    }

    // ============================================
    // WINDOW EVENTS
    // ============================================

    function handleResize() {
        // Adjust any canvas or absolute positioning if necessary
        // Most is handled by CSS, but we can add specific JS adjustments here
        // e.g., closing open tooltips or menus on drastic resize
    }

    // ============================================
    // DEBUGGING TOOLS (Console Access)
    // ============================================
    
    window.Debug = {
        giveGold: (amount) => {
            if (window.UIManager?.questManager) {
                window.UIManager.questManager.totalGoldEarned += amount;
                window.UIManager.questManager.saveProgress();
                console.log(`🤑 Added ${amount} gold.`);
                window.UIManager.renderQuests(); // Refresh UI if open
            }
        },
        resetProgress: () => {
            localStorage.clear();
            location.reload();
        },
        winGame: () => {
            if (window.UIManager?.gameState?.enemyHero) {
                window.UIManager.gameState.enemyHero.currentHealth = 0;
                window.UIManager.gameState.checkGameEnd();
            }
        }
    };

    // ============================================
    // STARTUP
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }

})();