/* ============================================
   ANIMATION & VFX MANAGER
   "The Director" - Handles visual feedback, sounds, and particles.
   ============================================ */

const AnimationManager = {
    
    // ============================================
    // AUDIO SYSTEM
    // ============================================
    
    playSound(soundId) {
        const audio = document.getElementById(soundId);
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.4; // Keep sfx subtle
            audio.play().catch(e => {
                // Ignore autoplay errors (user hasn't interacted yet)
            });
        }
    },

    playTheme(type = 'menu') {
        const menuBGM = document.getElementById('bgm-menu');
        const battleBGM = document.getElementById('bgm-battle');

        if (type === 'menu') {
            if(battleBGM) {
                this.fadeOutAudio(battleBGM);
            }
            if(menuBGM) {
                menuBGM.volume = 0;
                menuBGM.play().catch(() => {});
                this.fadeInAudio(menuBGM, 0.3);
            }
        } else {
            if(menuBGM) {
                this.fadeOutAudio(menuBGM);
            }
            if(battleBGM) {
                battleBGM.volume = 0;
                battleBGM.play().catch(() => {});
                this.fadeInAudio(battleBGM, 0.2);
            }
        }
    },

    fadeOutAudio(audio) {
        const fade = setInterval(() => {
            if (audio.volume > 0.05) {
                audio.volume -= 0.05;
            } else {
                audio.pause();
                audio.currentTime = 0;
                clearInterval(fade);
            }
        }, 100);
    },

    fadeInAudio(audio, targetVolume) {
        const fade = setInterval(() => {
            if (audio.volume < targetVolume - 0.05) {
                audio.volume += 0.05;
            } else {
                audio.volume = targetVolume;
                clearInterval(fade);
            }
        }, 100);
    },
    
    // ============================================
    // DAMAGE & HEALING (FLOATING NUMBERS)
    // ============================================
    
    /**
     * Show floating numbers on the FX layer
     */
    showDamageText(elementId, amount, type = 'damage') {
        const element = document.getElementById(elementId) || document.querySelector(`[data-minion-id="${elementId}"]`);
        if (!element) return;
        
        const fxLayer = document.getElementById('fx-layer');
        const rect = element.getBoundingClientRect();
        
        const textEl = document.createElement('div');
        textEl.className = 'damage-number'; // defined in styles.css
        textEl.textContent = type === 'damage' ? `-${amount}` : `+${amount}`;
        
        // Color override for healing
        if (type === 'heal') {
            textEl.style.color = '#4ade80'; // Green
            textEl.style.textShadow = '2px 2px 0 #064e3b';
        }

        // Position exactly where the unit is
        textEl.style.left = `${rect.left + rect.width / 2}px`;
        textEl.style.top = `${rect.top + rect.height / 2}px`;

        fxLayer.appendChild(textEl);
        
        // Remove after animation (1.5s matches CSS animation)
        setTimeout(() => textEl.remove(), 1500);
    },
    
    /**
     * Shake effect for taking damage
     */
    shakeElement(elementId) {
        const element = document.getElementById(elementId) || document.querySelector(`[data-minion-id="${elementId}"]`);
        if (!element) return;
        
        // Remove class if it exists to restart animation
        element.classList.remove('animate-shake');
        void element.offsetWidth; // Trigger reflow
        element.classList.add('animate-shake');
        
        // Play sound
        // this.playSound('sfx-hit'); 
    },
    
    animateHeroDamage(heroId, damage) {
        this.showDamageText(heroId, damage, 'damage');
        this.shakeElement(heroId);
        this.createParticles(heroId, 'blood');
    },
    
    animateHeal(elementId, amount) {
        this.showDamageText(elementId, amount, 'heal');
        this.createParticles(elementId, 'heal');
    },
    
    // ============================================
    // CARD INTERACTIONS
    // ============================================
    
    /**
     * Visually move a card from Deck to Hand
     */
    animateCardDraw(cardElement) {
        if (!cardElement) return;
        this.playSound('sfx-draw');
        
        // CSS animation 'fadeIn' is handled by the class addition in UI Manager,
        // but we can add a specific "slide form deck" logic here if needed.
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateY(50px) scale(0.5)';
        
        requestAnimationFrame(() => {
            cardElement.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'translateY(0) scale(1)';
        });
    },
    
    /**
     * Visually move a card from Hand to Board
     */
    animateCardPlay(cardElement, targetRect = null) {
        if (!cardElement) return Promise.resolve();
        this.playSound('sfx-play');

        return new Promise((resolve) => {
            // Clone the card to the FX layer so it can move freely outside the hand container
            const rect = cardElement.getBoundingClientRect();
            const clone = cardElement.cloneNode(true);
            const fxLayer = document.getElementById('fx-layer');
            
            clone.style.position = 'absolute';
            clone.style.left = `${rect.left}px`;
            clone.style.top = `${rect.top}px`;
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;
            clone.style.margin = '0';
            clone.style.zIndex = '1000';
            clone.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            clone.classList.remove('card-in-hand'); // Remove hover effects
            
            fxLayer.appendChild(clone);
            
            // Hide original
            cardElement.style.opacity = '0';

            // Calculate destination
            requestAnimationFrame(() => {
                if (targetRect) {
                    // Move to specific board slot
                    const centerX = targetRect.left + targetRect.width / 2 - rect.width / 2;
                    const centerY = targetRect.top + targetRect.height / 2 - rect.height / 2;
                    clone.style.left = `${centerX}px`;
                    clone.style.top = `${centerY}px`;
                    clone.style.transform = 'scale(0.8)'; // Minions on board are smaller than cards
                    clone.style.opacity = '0'; // Fade out as it transforms into the minion token
                } else {
                    // Just fly up and vanish (spells)
                    clone.style.top = `${rect.top - 200}px`;
                    clone.style.opacity = '0';
                    clone.style.transform = 'scale(1.5)';
                }
            });

            setTimeout(() => {
                clone.remove();
                resolve();
            }, 500);
        });
    },

    // ============================================
    // COMBAT ANIMATIONS
    // ============================================
    
    /**
     * Physical attack animation (Lunge)
     */
    animateAttack(attackerId, targetId) {
        const attacker = document.getElementById(attackerId) || document.querySelector(`[data-minion-id="${attackerId}"]`);
        const target = document.getElementById(targetId) || document.querySelector(`[data-minion-id="${targetId}"]`);
        
        if (!attacker || !target) return Promise.resolve();

        return new Promise((resolve) => {
            // Determine direction based on positions
            const attackerRect = attacker.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const isAttackingUp = attackerRect.top > targetRect.top;

            // Add animation class
            const animClass = isAttackingUp ? 'attack-lunge-up' : 'attack-lunge-down';
            
            // We use JS to apply the keyframe animation defined in CSS
            attacker.style.animation = `${animClass} 0.4s cubic-bezier(0.25, 1, 0.5, 1)`;
            attacker.style.zIndex = '100'; // Bring to front during attack

            // Impact moment (halfway through animation)
            setTimeout(() => {
                this.shakeElement(targetId);
                this.createParticles(targetId, 'impact');
                this.playSound('sfx-click'); // Placeholder for hit sound
            }, 200);

            // Cleanup
            setTimeout(() => {
                attacker.style.animation = '';
                attacker.style.zIndex = '';
                resolve();
            }, 400);
        });
    },
    
    createAttackLine(fromElement, toElement) {
        // Not used in this version, replaced by physical lunge animations
        // but kept for reference if laser beams are needed later
    },

    // ============================================
    // VFX / PARTICLES
    // ============================================
    
    /**
     * Spawn particles on the FX layer
     */
    createParticles(elementId, type = 'impact') {
        const element = document.getElementById(elementId) || document.querySelector(`[data-minion-id="${elementId}"]`);
        if (!element) return;
        
        const fxLayer = document.getElementById('fx-layer');
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const colors = {
            impact: ['#fbbf24', '#ffffff', '#cbd5e1'],
            blood: ['#ef4444', '#b91c1c', '#7f1d1d'],
            heal: ['#4ade80', '#22c55e', '#ffffff'],
            spell: ['#8b5cf6', '#c084fc', '#ffffff'],
            summon: ['#fbbf24', '#f59e0b', '#ffffff']
        };
        
        const config = colors[type] || colors.impact;
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.left = `${centerX}px`;
            p.style.top = `${centerY}px`;
            p.style.width = `${Math.random() * 6 + 4}px`;
            p.style.height = p.style.width;
            p.style.backgroundColor = config[Math.floor(Math.random() * config.length)];
            p.style.borderRadius = '50%';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '1000';
            
            // Random velocity
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 60 + 20;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            p.style.transition = 'all 0.6s ease-out';
            
            fxLayer.appendChild(p);
            
            // Animate
            requestAnimationFrame(() => {
                p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
                p.style.opacity = '0';
            });
            
            setTimeout(() => p.remove(), 600);
        }
    },
    
    animateBuffEffect(elementId) {
        this.createParticles(elementId, 'summon');
        const element = document.getElementById(elementId) || document.querySelector(`[data-minion-id="${elementId}"]`);
        if(element) {
            element.style.filter = 'brightness(1.5) sepia(1) hue-rotate(90deg)';
            setTimeout(() => element.style.filter = '', 500);
        }
    },

    animateShield(elementId) {
        // Divine shield break effect
        this.createParticles(elementId, 'impact');
    },

    // ============================================
    // UI TRANSITIONS
    // ============================================
    
    /**
     * Animate the big "YOUR TURN" overlay
     */
    animateTurnChange(isPlayerTurn) {
        const indicator = document.getElementById('turnIndicator');
        if (!indicator) return;
        
        if (isPlayerTurn) {
            this.playSound('sfx-draw'); // Sound cue
            indicator.style.opacity = '1';
            indicator.style.transform = 'translate(-50%, -50%) scale(1.2)';
            indicator.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            setTimeout(() => {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 1500);
        }
    },
    
    fadeTransition(fromEl, toEl) {
        if (fromEl) {
            fromEl.style.opacity = '0';
            setTimeout(() => fromEl.classList.add('hidden'), 300);
        }
        
        if (toEl) {
            toEl.classList.remove('hidden');
            // Force reflow
            void toEl.offsetWidth;
            toEl.style.opacity = '1';
        }
    },
    
    showLoading(show) {
        const el = document.getElementById('loadingOverlay');
        if(!el) return;
        if (show) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    },
    
    showNotification(msg, type, duration = 2000) {
        const fxLayer = document.getElementById('fx-layer');
        const note = document.createElement('div');
        
        // Tailwind classes for notification
        let bgClass = 'bg-slate-800';
        if (type === 'error') bgClass = 'bg-red-900/90 border-red-500';
        else if (type === 'success') bgClass = 'bg-green-900/90 border-green-500';
        else bgClass = 'bg-blue-900/90 border-blue-500';
        
        note.className = `fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg border text-white font-cinzel font-bold shadow-2xl z-50 transition-all duration-300 transform scale-90 opacity-0 ${bgClass}`;
        note.innerHTML = msg;
        
        fxLayer.appendChild(note);
        
        requestAnimationFrame(() => {
            note.classList.remove('scale-90', 'opacity-0');
            note.classList.add('scale-100', 'opacity-100');
        });
        
        setTimeout(() => {
            note.classList.add('opacity-0', 'translate-y-[-20px]');
            setTimeout(() => note.remove(), 300);
        }, duration);
    }
};

// Expose globally
window.AnimationManager = AnimationManager;