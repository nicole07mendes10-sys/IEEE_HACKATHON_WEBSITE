/**
 * OVERCLOCK 2027 — TVA TEMPORAL INSPECTION TERMINAL
 * Interactive Mini-Game Engine for Miss Minutes
 * FCRIT × IEEE Student Branch Hardware Hackathon
 * 
 * Flow & Missions:
 * - Entry: Miss Minutes interactive mascot click/tap/enter
 * - State machine:
 *     CLOSED <-> INTRO -> MISSION_1 -> MISSION_2 -> MISSION_3 -> COMPLETE
 * - Mission 1: Spot the Timeline Anomaly (SVG branch comparison)
 * - Mission 2: Crack the TVA Access Code (Alternating symbol sequence)
 * - Mission 3: Stabilise the Timeline (Simon-style node pattern replicate)
 * - Complete screen with 100% integrity report & Miss Minutes quote
 * - Instant cancellation from ANY screen via Close (X), Backdrop, or Escape
 * - Preserves scroll position & background sequence untouched
 * - Accessible: ARIA modal dialog, focus trap, live region announcements
 */

(function () {
  'use strict';

  class TVAInspectionGame {
    constructor() {
      this.modal = document.getElementById('tva-inspection-modal');
      this.closeBtn = document.getElementById('tva-modal-close-btn');
      this.trigger = document.getElementById('miss-minutes-overlay');
      this.liveAnnouncer = document.getElementById('tva-live-announcer');

      // Progress elements
      this.progressText = document.getElementById('tva-progress-text');
      this.pips = [
        document.getElementById('tva-pip-1'),
        document.getElementById('tva-pip-2'),
        document.getElementById('tva-pip-3')
      ];

      // View mapping
      this.views = {
        INTRO: document.getElementById('tva-view-intro'),
        MISSION_1: document.getElementById('tva-view-mission1'),
        MISSION_2: document.getElementById('tva-view-mission2'),
        MISSION_3: document.getElementById('tva-view-mission3'),
        COMPLETE: document.getElementById('tva-view-complete')
      };

      // State
      this.currentState = 'CLOSED';
      this.isOpen = false;
      this.savedScrollY = 0;
      this.activeTimers = new Set();
      this.isTransitioning = false;

      // Mission 3: Sequence state
      this.targetSequence = [2, 4, 1]; // Node 2 -> Node 4 -> Node 1
      this.userSequence = [];
      this.isShowingSequence = false;
      this.canInputNode = false;

      this.init();
    }

    init() {
      if (!this.modal) return;

      // Trigger Miss Minutes
      if (this.trigger) {
        const handleTrigger = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.open();
        };

        this.trigger.addEventListener('click', handleTrigger);
        this.trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleTrigger(e);
          }
        });
      }

      // Close button (X)
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        });
      }

      // Backdrop click
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });

      // Escape key and Focus trapping
      window.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
          return;
        }

        if (e.key === 'Tab') {
          this.handleFocusTrap(e);
        }
      });

      // Start Inspection Button
      const startBtn = document.getElementById('tva-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.playRelaySound(950);
          this.transitionTo('MISSION_1');
        });
      }

      // Mission 1: Timeline Card Buttons
      const branchCards = document.querySelectorAll('.tva-timeline-card');
      branchCards.forEach((card) => {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.isTransitioning || this.currentState !== 'MISSION_1') return;
          const branch = card.getAttribute('data-branch');
          this.handleMission1Answer(branch, card);
        });
      });

      // Mission 2: Symbol Pattern Buttons
      const symBtns = document.querySelectorAll('.tva-symbol-btn');
      symBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.isTransitioning || this.currentState !== 'MISSION_2') return;
          const symbol = btn.getAttribute('data-symbol');
          this.handleMission2Answer(symbol, btn);
        });
      });

      // Mission 3: Circuit Nodes
      const nodeBtns = document.querySelectorAll('.tva-circuit-node');
      nodeBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (!this.canInputNode || this.isShowingSequence || this.currentState !== 'MISSION_3') return;
          const nodeNum = parseInt(btn.getAttribute('data-node'), 10);
          this.handleNodeClick(nodeNum, btn);
        });
      });

      // Mission 3: Replay demonstration button
      const replayBtn = document.getElementById('tva-m3-replay-pattern-btn');
      if (replayBtn) {
        replayBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.isShowingSequence) return;
          this.playDemonstrationSequence();
        });
      }

      // Complete Screen: Replay Inspection button
      const replayAllBtn = document.getElementById('tva-replay-inspection-btn');
      if (replayAllBtn) {
        replayAllBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.playRelaySound(850);
          this.resetAllMissions();
          this.transitionTo('INTRO');
        });
      }

      // Complete Screen: Return Home button
      const returnBtn = document.getElementById('tva-return-home-btn');
      if (returnBtn) {
        returnBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.playRelaySound(700);
          this.close();
        });
      }
    }

    /**
     * Managed scheduler that auto-cancels if modal is closed
     */
    scheduleTimer(callback, delayMs) {
      if (!this.isOpen) return null;
      const timerId = setTimeout(() => {
        this.activeTimers.delete(timerId);
        if (this.isOpen) {
          callback();
        }
      }, delayMs);
      this.activeTimers.add(timerId);
      return timerId;
    }

    clearAllTimers() {
      this.activeTimers.forEach((id) => clearTimeout(id));
      this.activeTimers.clear();
    }

    announce(message) {
      if (this.liveAnnouncer) {
        this.liveAnnouncer.textContent = '';
        setTimeout(() => {
          this.liveAnnouncer.textContent = message;
        }, 50);
      }
    }

    open() {
      if (this.isOpen) return;

      // 1. Save scroll position
      this.savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      // 2. Lock scroll on background page without jumping
      document.body.style.overflow = 'hidden';

      // 3. Mark modal as open
      this.isOpen = true;
      this.modal.classList.add('open');
      this.modal.setAttribute('aria-hidden', 'false');

      // Hide speech bubble while modal is open
      const speech = document.getElementById('miss-minutes-speech');
      if (speech) speech.style.display = 'none';

      // 4. Default to INTRO state
      if (this.currentState === 'CLOSED' || !this.currentState) {
        this.resetAllMissions();
        this.transitionTo('INTRO');
      }

      // 5. Shift focus into modal (close button or first interactive element)
      this.scheduleTimer(() => {
        if (this.closeBtn) {
          this.closeBtn.focus();
        }
      }, 100);

      this.announce('TVA Temporal Inspection Terminal opened. Mission 1 awaiting.');
      this.playRelaySound(1200);
    }

    close() {
      if (!this.isOpen) return;

      // 1. Immediately wipe any active timers & pending transitions
      this.clearAllTimers();
      this.isTransitioning = false;
      this.isShowingSequence = false;
      this.canInputNode = false;

      // 2. Hide modal & backdrop
      this.modal.classList.remove('open');
      this.modal.setAttribute('aria-hidden', 'true');
      this.isOpen = false;
      this.currentState = 'CLOSED';

      // 3. Restore background scrolling & scroll position
      document.body.style.overflow = '';
      window.scrollTo(0, this.savedScrollY);

      // Restore speech bubble display
      const speech = document.getElementById('miss-minutes-speech');
      if (speech) speech.style.display = '';

      // 4. Return keyboard focus to Miss Minutes trigger
      if (this.trigger) {
        this.trigger.focus();
      }

      this.announce('TVA Temporal Inspection Terminal closed.');
    }

    transitionTo(newState) {
      this.currentState = newState;
      this.isTransitioning = false;

      // Toggle views
      Object.keys(this.views).forEach((key) => {
        const viewEl = this.views[key];
        if (viewEl) {
          if (key === newState) {
            viewEl.style.display = 'block';
            viewEl.classList.add('active');
          } else {
            viewEl.style.display = 'none';
            viewEl.classList.remove('active');
          }
        }
      });

      // Update progress pips and text
      this.updateProgressUI(newState);

      // View-specific initialization
      if (newState === 'INTRO') {
        const startBtn = document.getElementById('tva-start-btn');
        if (startBtn) {
          this.scheduleTimer(() => startBtn.focus(), 150);
        }
      } else if (newState === 'MISSION_1') {
        this.announce('Mission 1: Spot the Anomaly. Three timelines displayed. Identify the unstable branch.');
        const firstCard = document.getElementById('tva-branch-a');
        if (firstCard) {
          this.scheduleTimer(() => firstCard.focus(), 150);
        }
      } else if (newState === 'MISSION_2') {
        this.announce('Mission 2: Crack TVA Access Code. Decode the alternating symbol sequence.');
        const firstSym = document.getElementById('tva-sym-circle');
        if (firstSym) {
          this.scheduleTimer(() => firstSym.focus(), 150);
        }
      } else if (newState === 'MISSION_3') {
        this.announce('Mission 3: Stabilise the Timeline. Observe the sequence.');
        this.setupMission3();
      } else if (newState === 'COMPLETE') {
        this.announce('Inspection Complete. 100% Temporal Integrity restored.');
        this.playHarmonicChime();
        const replayAllBtn = document.getElementById('tva-replay-inspection-btn');
        if (replayAllBtn) {
          this.scheduleTimer(() => replayAllBtn.focus(), 150);
        }
      }
    }

    updateProgressUI(state) {
      if (!this.progressText || !this.pips) return;

      let stageLabel = '00 / 03';
      let activeIndex = -1;

      switch (state) {
        case 'INTRO':
          stageLabel = '00 / 03';
          activeIndex = -1;
          break;
        case 'MISSION_1':
          stageLabel = '01 / 03';
          activeIndex = 0;
          break;
        case 'MISSION_2':
          stageLabel = '02 / 03';
          activeIndex = 1;
          break;
        case 'MISSION_3':
          stageLabel = '03 / 03';
          activeIndex = 2;
          break;
        case 'COMPLETE':
          stageLabel = '03 / 03';
          activeIndex = 3;
          break;
      }

      this.progressText.textContent = stageLabel;

      this.pips.forEach((pip, idx) => {
        if (!pip) return;
        pip.classList.remove('active', 'completed');
        if (idx < activeIndex) {
          pip.classList.add('completed');
        } else if (idx === activeIndex) {
          pip.classList.add('active');
        }
      });
    }

    // ================= MISSION 1: SPOT THE ANOMALY =================
    handleMission1Answer(branch, cardEl) {
      const feedbackBanner = document.getElementById('tva-m1-feedback');
      const feedbackText = feedbackBanner ? feedbackBanner.querySelector('.tva-feedback-text') : null;

      if (branch === 'B') {
        // CORRECT: Timeline B contains the rogue branching fork
        this.isTransitioning = true;
        cardEl.classList.add('correct');

        if (feedbackBanner) {
          feedbackBanner.className = 'tva-feedback-banner status-success';
          if (feedbackText) feedbackText.textContent = 'ANOMALY IDENTIFIED // ADVANCING...';
        }
        this.announce('Anomaly identified! Timeline B branch fork detected. Advancing to Mission 2.');
        this.playRelaySound(1400);

        this.scheduleTimer(() => {
          this.transitionTo('MISSION_2');
        }, 900);
      } else {
        // INCORRECT: Timeline A or C (linear timelines)
        cardEl.classList.add('incorrect');

        if (feedbackBanner) {
          feedbackBanner.className = 'tva-feedback-banner status-error';
          if (feedbackText) {
            feedbackText.textContent = `TIMELINE ${branch} IS LINEAR // LOOK FOR A ROGUE FORK`;
          }
        }
        this.announce(`Timeline ${branch} is linear. Look for the timeline with an unexpected branching fork.`);
        this.playRelaySound(320);

        this.scheduleTimer(() => {
          cardEl.classList.remove('incorrect');
        }, 700);
      }
    }

    // ================= MISSION 2: CRACK ACCESS CODE =================
    handleMission2Answer(symbol, btnEl) {
      const feedbackBanner = document.getElementById('tva-m2-feedback');
      const feedbackText = feedbackBanner ? feedbackBanner.querySelector('.tva-feedback-text') : null;
      const lockIcon = document.getElementById('tva-m2-lock-icon');
      const lockStatus = document.getElementById('tva-m2-lock-status');
      const lockCard = document.getElementById('tva-m2-lock');

      if (symbol === 'CIRCLE') {
        // CORRECT: Circle, Triangle, Circle, Triangle -> Circle!
        this.isTransitioning = true;
        btnEl.classList.add('correct');

        if (lockIcon) {
          lockIcon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';
        }
        if (lockStatus) lockStatus.textContent = 'ACCESS GRANTED // CLASSIFIED FILE UNLOCKED';
        if (lockCard) lockCard.classList.add('unlocked');

        if (feedbackBanner) {
          feedbackBanner.className = 'tva-feedback-banner status-success';
          if (feedbackText) feedbackText.textContent = 'ACCESS GRANTED // SYNCHRONIZING...';
        }
        this.announce('Access code granted! File unlocked. Advancing to Mission 3.');
        this.playRelaySound(1500);

        this.scheduleTimer(() => {
          this.transitionTo('MISSION_3');
        }, 950);
      } else {
        // INCORRECT
        btnEl.classList.add('incorrect');

        if (feedbackBanner) {
          feedbackBanner.className = 'tva-feedback-banner status-error';
          if (feedbackText) {
            feedbackText.textContent = 'ACCESS CODE INVALID // ALTERNATES: CIRCLE → TRIANGLE';
          }
        }
        this.announce('Access code invalid. The pattern alternates strictly between Circle and Triangle.');
        this.playRelaySound(320);

        this.scheduleTimer(() => {
          btnEl.classList.remove('incorrect');
        }, 700);
      }
    }

    // ================= MISSION 3: STABILISE TIMELINE =================
    setupMission3() {
      this.userSequence = [];
      this.canInputNode = false;
      this.resetNodeVisuals();

      this.scheduleTimer(() => {
        this.playDemonstrationSequence();
      }, 450);
    }

    playDemonstrationSequence() {
      if (!this.isOpen || this.currentState !== 'MISSION_3') return;
      this.isShowingSequence = true;
      this.canInputNode = false;
      this.userSequence = [];
      this.resetNodeVisuals();

      const bannerText = document.getElementById('tva-m3-status-text');
      const feedbackBanner = document.getElementById('tva-m3-feedback');
      const feedbackText = feedbackBanner ? feedbackBanner.querySelector('.tva-feedback-text') : null;

      if (bannerText) bannerText.textContent = 'OBSERVE THE SEQUENCE';
      if (feedbackBanner) {
        feedbackBanner.className = 'tva-feedback-banner status-warning';
        if (feedbackText) feedbackText.textContent = 'TRANSMITTING TEMPORAL PULSE...';
      }
      this.announce('Observe the sequence. Nodes will illuminate in order.');

      // Predetermined sequence: [2, 4, 1]
      const seq = this.targetSequence;
      let stepIndex = 0;

      const playNext = () => {
        if (!this.isOpen || this.currentState !== 'MISSION_3') return;

        if (stepIndex >= seq.length) {
          // Demonstration complete -> Allow user input
          this.isShowingSequence = false;
          this.canInputNode = true;

          if (bannerText) bannerText.textContent = 'REPRODUCE THE SEQUENCE';
          if (feedbackBanner) {
            feedbackBanner.className = 'tva-feedback-banner status-active';
            if (feedbackText) feedbackText.textContent = 'INPUT: 0/3 NODES SYNCHRONIZED';
          }
          this.announce('Reproduce the sequence. Activate the nodes in the order shown.');
          return;
        }

        const nodeNum = seq[stepIndex];
        const nodeEl = document.getElementById(`tva-node-${nodeNum}`);
        if (nodeEl) {
          nodeEl.classList.add('pulse-active');
          this.playRelaySound(800 + nodeNum * 140);

          this.scheduleTimer(() => {
            if (nodeEl) nodeEl.classList.remove('pulse-active');
            stepIndex++;
            this.scheduleTimer(playNext, 250);
          }, 550);
        } else {
          stepIndex++;
          this.scheduleTimer(playNext, 250);
        }
      };

      this.scheduleTimer(playNext, 400);
    }

    handleNodeClick(nodeNum, nodeEl) {
      const feedbackBanner = document.getElementById('tva-m3-feedback');
      const feedbackText = feedbackBanner ? feedbackBanner.querySelector('.tva-feedback-text') : null;
      const bannerText = document.getElementById('tva-m3-status-text');

      const expectedNode = this.targetSequence[this.userSequence.length];

      if (nodeNum === expectedNode) {
        // Correct step!
        this.userSequence.push(nodeNum);
        nodeEl.classList.add('user-active');
        this.playRelaySound(950 + nodeNum * 130);

        const currentCount = this.userSequence.length;
        if (feedbackBanner) {
          feedbackBanner.className = 'tva-feedback-banner status-active';
          if (feedbackText) feedbackText.textContent = `INPUT: ${currentCount}/3 NODES SYNCHRONIZED`;
        }
        this.announce(`Node ${nodeNum} activated. ${currentCount} of 3 synchronized.`);

        // Check if all 3 entered
        if (this.userSequence.length === this.targetSequence.length) {
          this.canInputNode = false;
          this.isTransitioning = true;

          if (bannerText) bannerText.textContent = 'TEMPORAL STABILITY RESTORED';
          if (feedbackBanner) {
            feedbackBanner.className = 'tva-feedback-banner status-success';
            if (feedbackText) feedbackText.textContent = 'TEMPORAL STABILITY RESTORED // SUCCESS';
          }
          this.announce('Temporal stability restored! All nodes synchronized.');
          this.playHarmonicChime();

          // Illuminate all active nodes together
          this.targetSequence.forEach((n) => {
            const el = document.getElementById(`tva-node-${n}`);
            if (el) el.classList.add('harmonic-success');
          });

          this.scheduleTimer(() => {
            this.transitionTo('COMPLETE');
          }, 1100);
        }
      } else {
        // Wrong node!
        this.canInputNode = false;
        nodeEl.classList.add('user-error');
        this.playRelaySound(280);

        if (bannerText) bannerText.textContent = 'SEQUENCE MISMATCH // RETRYING';
        if (feedbackBanner) {
          feedbackBanner.className = 'tva-feedback-banner status-error';
          if (feedbackText) feedbackText.textContent = 'SEQUENCE MISMATCH // ATTEMPT RESET';
        }
        this.announce('Sequence mismatch. Resetting attempt. Try again or click Replay.');

        this.scheduleTimer(() => {
          this.resetNodeVisuals();
          this.userSequence = [];
          this.canInputNode = true;
          if (bannerText) bannerText.textContent = 'REPRODUCE THE SEQUENCE';
          if (feedbackBanner) {
            feedbackBanner.className = 'tva-feedback-banner status-active';
            if (feedbackText) feedbackText.textContent = 'INPUT: 0/3 NODES SYNCHRONIZED';
          }
        }, 750);
      }
    }

    resetNodeVisuals() {
      const nodeEls = document.querySelectorAll('.tva-circuit-node');
      nodeEls.forEach((el) => {
        el.classList.remove('pulse-active', 'user-active', 'user-error', 'harmonic-success');
      });
    }

    resetAllMissions() {
      this.clearAllTimers();
      this.isTransitioning = false;
      this.userSequence = [];
      this.canInputNode = false;
      this.isShowingSequence = false;

      // Mission 1 reset
      const m1Cards = document.querySelectorAll('.tva-timeline-card');
      m1Cards.forEach((c) => c.classList.remove('correct', 'incorrect'));
      const m1Feedback = document.getElementById('tva-m1-feedback');
      if (m1Feedback) {
        m1Feedback.className = 'tva-feedback-banner';
        const txt = m1Feedback.querySelector('.tva-feedback-text');
        if (txt) txt.textContent = 'INSPECT THE BRANCHES CAREFULLY';
      }

      // Mission 2 reset
      const m2Btns = document.querySelectorAll('.tva-symbol-btn');
      m2Btns.forEach((b) => b.classList.remove('correct', 'incorrect'));
      const lockIcon = document.getElementById('tva-m2-lock-icon');
      const lockStatus = document.getElementById('tva-m2-lock-status');
      const lockCard = document.getElementById('tva-m2-lock');
      if (lockIcon) {
        lockIcon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
      }
      if (lockStatus) lockStatus.textContent = 'FILE LOCKED // ACCESS RESTRICTED';
      if (lockCard) lockCard.classList.remove('unlocked');
      const m2Feedback = document.getElementById('tva-m2-feedback');
      if (m2Feedback) {
        m2Feedback.className = 'tva-feedback-banner';
        const txt = m2Feedback.querySelector('.tva-feedback-text');
        if (txt) txt.textContent = 'DECODE THE PATTERN ABOVE';
      }

      // Mission 3 reset
      this.resetNodeVisuals();
      const m3Banner = document.getElementById('tva-m3-status-text');
      if (m3Banner) m3Banner.textContent = 'INITIALIZING NODES...';
      const m3Feedback = document.getElementById('tva-m3-feedback');
      if (m3Feedback) {
        m3Feedback.className = 'tva-feedback-banner';
        const txt = m3Feedback.querySelector('.tva-feedback-text');
        if (txt) txt.textContent = 'AWAITING PATTERN DEMONSTRATION';
      }

      this.updateProgressUI('INTRO');
    }

    handleFocusTrap(e) {
      const focusable = this.modal.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }

    playRelaySound(freq = 900) {
      try {
        if (window.overclockApp && typeof window.overclockApp.playRelayClick === 'function') {
          window.overclockApp.playRelayClick(freq);
        }
      } catch (_) {}
    }

    playHarmonicChime() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = (window.overclockApp && window.overclockApp.audioCtx) || new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();

        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.65);
        });
      } catch (_) {}
    }
  }

  // Instantiate when DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    window.tvaInspectionGame = new TVAInspectionGame();
  });
})();
