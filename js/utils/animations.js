/* ============================================
   ANIMATIONS & VISUAL EFFECTS
   Handles all visual feedback and animations
   ============================================ */

const AnimationManager = {
    
    // ============================================
    // DAMAGE ANIMATIONS
    // ============================================
    
    /**
     * Show floating damage text
     */
    showDamageText(elementId, damage, type = 'damage') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const damageText = document.createElement('div');
        
        // Set style based on type
        if (type === 'damage') {
            damageText.className = 'damage-text';
            damageText.textContent = `-${damage}`;
            damageText.style.color = '#ef4444';
        } else if (type === 'heal') {
            damageText.className = 'heal-text';
            damageText.textContent = `+${damage}`;
            damageText.style.color = '#22c55e';
        }
        
        // Position at center of element
        damageText.style.position = 'fixed';
        damageText.style.left = `${rect.left + rect.width / 2}px`;
        damageText.style.top = `${rect.top + rect.height / 2}px`;
        damageText.style.transform = 'translate(-50%, -50%)';
        damageText.style.zIndex = '1000';
        damageText.style.pointerEvents = 'none';
        damageText.style.fontSize = '32px';
        damageText.style.fontWeight = 'bold';
        damageText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
        
        document.body.appendChild(damageText);
        
        // Animate and remove
        setTimeout(() => {
            damageText.style.animation = 'damage-float 1s ease-out forwards';
        }, 10);
        
        setTimeout(() => {
            damageText.remove();
        }, 1000);
    },
    
    /**
     * Shake element when taking damage
     */
    shakeElement(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.add('taking-damage');
        
        setTimeout(() => {
            element.classList.remove('taking-damage');
        }, 400);
    },
    
    /**
     * Hero damage animation
     */
    animateHeroDamage(heroId, damage) {
        this.showDamageText(heroId, damage, 'damage');
        this.shakeElement(heroId);
        this.createParticles(heroId, 'damage');
    },
    
    // ============================================
    // HEALING ANIMATIONS
    // ============================================
    
    /**
     * Healing animation with particles
     */
    animateHeal(elementId, amount) {
        this.showDamageText(elementId, amount, 'heal');
        this.pulseElement(elementId, '#22c55e');
        this.createParticles(elementId, 'heal');
    },
    
    /**
     * Pulse element with color
     */
    pulseElement(elementId, color) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const originalFilter = element.style.filter || '';
        element.style.filter = 'brightness(1.5)';
        element.style.transition = 'filter 0.3s';
        
        setTimeout(() => {
            element.style.filter = originalFilter;
        }, 300);
    },
    
    // ============================================
    // CARD ANIMATIONS
    // ============================================
    
    /**
     * Animate card being drawn from deck
     */
    animateCardDraw(cardElement) {
        if (!cardElement) return;
        
        cardElement.style.animation = 'card-draw 0.5s ease-out';
        cardElement.style.opacity = '0';
        
        setTimeout(() => {
            cardElement.style.opacity = '1';
        }, 10);
    },
    
    /**
     * Animate card being played
     */
    animateCardPlay(cardElement, targetElement = null) {
        if (!cardElement) return;
        
        return new Promise((resolve) => {
            const startRect = cardElement.getBoundingClientRect();
            const clone = cardElement.cloneNode(true);
            
            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.zIndex = '1000';
            clone.style.pointerEvents = 'none';
            clone.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            
            document.body.appendChild(clone);
            
            // Hide original
            cardElement.style.opacity = '0';
            
            setTimeout(() => {
                if (targetElement) {
                    const targetRect = targetElement.getBoundingClientRect();
                    clone.style.left = `${targetRect.left + targetRect.width / 2}px`;
                    clone.style.top = `${targetRect.top + targetRect.height / 2}px`;
                    clone.style.transform = 'translate(-50%, -50%) scale(0.5) rotate(360deg)';
                    clone.style.opacity = '0';
                } else {
                    clone.style.top = '-200px';
                    clone.style.transform = 'scale(1.2) rotate(20deg)';
                    clone.style.opacity = '0';
                }
            }, 50);
            
            setTimeout(() => {
                clone.remove();
                resolve();
            }, 650);
        });
    },
    
    /**
     * Animate minion being summoned
     */
    animateMinionSummon(minionElement) {
        if (!minionElement) return;
        
        minionElement.classList.add('animate-summon');
        this.createParticles(minionElement.id, 'summon');
        
        setTimeout(() => {
            minionElement.classList.remove('animate-summon');
        }, 600);
    },
    
    /**
     * Animate minion death
     */
    animateMinionDeath(minionElement) {
        if (!minionElement) return;
        
        return new Promise((resolve) => {
            minionElement.classList.add('animate-death');
            this.createParticles(minionElement.id || 'temp', 'death');
            
            setTimeout(() => {
                resolve();
            }, 800);
        });
    },
    
    // ============================================
    // ATTACK ANIMATIONS
    // ============================================
    
    /**
     * Animate minion attacking
     */
    animateAttack(attackerElement, targetElement) {
        if (!attackerElement || !targetElement) return;
        
        return new Promise((resolve) => {
            const attackerRect = attackerElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            
            // Calculate direction
            const deltaX = targetRect.left - attackerRect.left;
            const deltaY = targetRect.top - attackerRect.top;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Create attack effect line
            this.createAttackLine(attackerElement, targetElement);
            
            // Move attacker towards target
            const originalTransform = attackerElement.style.transform;
            attackerElement.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            attackerElement.style.transform = `translate(${deltaX * 0.3}px, ${deltaY * 0.3}px) scale(1.1)`;
            
            // Impact effect
            setTimeout(() => {
                this.shakeElement(targetElement.id);
                this.createParticles(targetElement.id, 'impact');
                
                // Return attacker
                setTimeout(() => {
                    attackerElement.style.transform = originalTransform;
                    
                    setTimeout(() => {
                        attackerElement.style.transition = '';
                        resolve();
                    }, 300);
                }, 100);
            }, 300);
        });
    },
    
    /**
     * Create attack line effect
     */
    createAttackLine(fromElement, toElement) {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        const fromX = fromRect.left + fromRect.width / 2;
        const fromY = fromRect.top + fromRect.height / 2;
        const toX = toRect.left + toRect.width / 2;
        const toY = toRect.top + toRect.height / 2;
        
        const line = document.createElement('div');
        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
        
        line.style.position = 'fixed';
        line.style.left = `${fromX}px`;
        line.style.top = `${fromY}px`;
        line.style.width = `${length}px`;
        line.style.height = '4px';
        line.style.background = 'linear-gradient(90deg, #ef4444, transparent)';
        line.style.transformOrigin = '0 50%';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.zIndex = '999';
        line.style.pointerEvents = 'none';
        line.style.opacity = '0.8';
        
        document.body.appendChild(line);
        
        setTimeout(() => {
            line.style.transition = 'opacity 0.3s';
            line.style.opacity = '0';
            setTimeout(() => line.remove(), 300);
        }, 200);
    },
    
    // ============================================
    // SPELL ANIMATIONS
    // ============================================
    
    /**
     * Animate spell being cast
     */
    animateSpellCast(cardElement, targetElement = null) {
        return new Promise((resolve) => {
            if (!cardElement) {
                resolve();
                return;
            }
            
            const startRect = cardElement.getBoundingClientRect();
            const clone = cardElement.cloneNode(true);
            
            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.zIndex = '1000';
            clone.style.pointerEvents = 'none';
            
            document.body.appendChild(clone);
            cardElement.style.opacity = '0';
            
            setTimeout(() => {
                clone.classList.add('animate-spell');
                
                if (targetElement) {
                    this.createParticles(targetElement.id || 'temp', 'spell');
                }
            }, 50);
            
            setTimeout(() => {
                clone.remove();
                resolve();
            }, 800);
        });
    },
    
    /**
     * Area of effect spell animation
     */
    animateAOESpell(centerElement, radius = 300) {
        if (!centerElement) return;
        
        const rect = centerElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const wave = document.createElement('div');
        wave.style.position = 'fixed';
        wave.style.left = `${centerX}px`;
        wave.style.top = `${centerY}px`;
        wave.style.width = '20px';
        wave.style.height = '20px';
        wave.style.borderRadius = '50%';
        wave.style.border = '3px solid #8b5cf6';
        wave.style.transform = 'translate(-50%, -50%)';
        wave.style.zIndex = '999';
        wave.style.pointerEvents = 'none';
        wave.style.transition = 'all 0.6s ease-out';
        wave.style.opacity = '0.8';
        
        document.body.appendChild(wave);
        
        setTimeout(() => {
            wave.style.width = `${radius * 2}px`;
            wave.style.height = `${radius * 2}px`;
            wave.style.opacity = '0';
        }, 50);
        
        setTimeout(() => {
            wave.remove();
        }, 650);
    },
    
    // ============================================
    // PARTICLE EFFECTS
    // ============================================
    
    /**
     * Create particle effects
     */
    createParticles(elementId, type = 'damage') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const particleCount = type === 'summon' ? 20 : 10;
        const colors = this.getParticleColors(type);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 8 + 4;
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = Math.random() * 100 + 50;
            const endX = centerX + Math.cos(angle) * velocity;
            const endY = centerY + Math.sin(angle) * velocity;
            
            particle.style.position = 'fixed';
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.borderRadius = '50%';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.zIndex = '1000';
            particle.style.pointerEvents = 'none';
            particle.style.transition = `all ${Math.random() * 0.5 + 0.5}s ease-out`;
            particle.style.opacity = '1';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.style.left = `${endX}px`;
                particle.style.top = `${endY}px`;
                particle.style.opacity = '0';
                particle.style.transform = `scale(${Math.random() * 0.5})`;
            }, 10);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    },
    
    /**
     * Get particle colors based on type
     */
    getParticleColors(type) {
        const colorSets = {
            damage: ['#ef4444', '#dc2626', '#f87171', '#fca5a5'],
            heal: ['#22c55e', '#16a34a', '#4ade80', '#86efac'],
            spell: ['#8b5cf6', '#a78bfa', '#6366f1', '#818cf8'],
            summon: ['#fbbf24', '#f59e0b', '#fb923c', '#fdba74'],
            death: ['#1e293b', '#334155', '#475569', '#64748b'],
            impact: ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8']
        };
        
        return colorSets[type] || colorSets.damage;
    },
    
    // ============================================
    // BUFF/DEBUFF ANIMATIONS
    // ============================================
    
    /**
     * Show buff effect
     */
    animateBuff(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.add('animate-buff');
        this.createParticles(elementId, 'heal');
        
        setTimeout(() => {
            element.classList.remove('animate-buff');
        }, 1500);
    },
    
    /**
     * Show debuff effect
     */
    animateDebuff(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.add('animate-debuff');
        this.createParticles(elementId, 'damage');
        
        setTimeout(() => {
            element.classList.remove('animate-debuff');
        }, 1500);
    },
    
    /**
     * Show shield effect
     */
    animateShield(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const shield = document.createElement('div');
        
        shield.style.position = 'fixed';
        shield.style.left = `${rect.left}px`;
        shield.style.top = `${rect.top}px`;
        shield.style.width = `${rect.width}px`;
        shield.style.height = `${rect.height}px`;
        shield.style.border = '3px solid #3b82f6';
        shield.style.borderRadius = '12px';
        shield.style.zIndex = '999';
        shield.style.pointerEvents = 'none';
        shield.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(59, 130, 246, 0.3)';
        shield.style.animation = 'shield-glow 0.6s ease-out';
        
        document.body.appendChild(shield);
        
        setTimeout(() => {
            shield.remove();
        }, 600);
    },
    
    // ============================================
    // UI ANIMATIONS
    // ============================================
    
    /**
     * Highlight element
     */
    highlightElement(elementId, color = '#8b5cf6') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.style.transition = 'box-shadow 0.3s';
        element.style.boxShadow = `0 0 30px ${color}`;
        
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 300);
    },
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        
        const colors = {
            info: 'bg-blue-600',
            success: 'bg-green-600',
            warning: 'bg-yellow-600',
            error: 'bg-red-600'
        };
        
        notification.className = `fixed top-20 left-1/2 transform -translate-x-1/2 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-[1000] font-bold text-lg`;
        notification.textContent = message;
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    },
    
    /**
     * Animate turn indicator
     */
    animateTurnChange(isPlayerTurn) {
        const indicator = document.getElementById('turnIndicator');
        if (!indicator) return;
        
        indicator.textContent = isPlayerTurn ? 'YOUR TURN' : 'ENEMY TURN';
        indicator.style.transform = 'scale(1.2)';
        indicator.style.color = isPlayerTurn ? '#22c55e' : '#ef4444';
        
        setTimeout(() => {
            indicator.style.transform = 'scale(1)';
        }, 300);
    },
    
    /**
     * Show loading overlay
     */
    showLoading(show = true) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    },
    
    /**
     * Fade transition between screens
     */
    fadeTransition(fromScreen, toScreen, duration = 300) {
        return new Promise((resolve) => {
            if (fromScreen) {
                fromScreen.style.transition = `opacity ${duration}ms`;
                fromScreen.style.opacity = '0';
            }
            
            setTimeout(() => {
                if (fromScreen) {
                    fromScreen.classList.add('hidden');
                    fromScreen.style.opacity = '1';
                }
                
                if (toScreen) {
                    toScreen.classList.remove('hidden');
                    toScreen.style.opacity = '0';
                    toScreen.style.transition = `opacity ${duration}ms`;
                    
                    setTimeout(() => {
                        toScreen.style.opacity = '1';
                        resolve();
                    }, 10);
                } else {
                    resolve();
                }
            }, duration);
        });
    },
    
    // ============================================
    // MANA CRYSTAL ANIMATIONS
    // ============================================
    
    /**
     * Animate mana crystal filling
     */
    animateManaCrystal(crystalElement) {
        if (!crystalElement) return;
        
        crystalElement.style.transform = 'scale(1.2)';
        crystalElement.style.transition = 'transform 0.3s';
        
        setTimeout(() => {
            crystalElement.style.transform = 'scale(1)';
        }, 300);
    },
    
    /**
     * Glow effect for available mana
     */
    glowManaCrystals() {
        const manaDisplay = document.getElementById('manaDisplay');
        if (!manaDisplay) return;
        
        manaDisplay.style.textShadow = '0 0 20px rgba(59, 130, 246, 0.8)';
        
        setTimeout(() => {
            manaDisplay.style.textShadow = '';
        }, 500);
    },
    
    // ============================================
    // CARD HOVER EFFECTS
    // ============================================
    
    /**
     * Show card preview on hover
     */
    showCardPreview(cardElement, cardData) {
        // Implementation will be in UI manager
        // This is a placeholder for the animation hook
    },
    
    /**
     * Hide card preview
     */
    hideCardPreview() {
        // Implementation will be in UI manager
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}
