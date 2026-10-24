/**
 * OVERCLOCK 2027 — MISS MINUTES REGISTRATION MODAL
 * Dedicated Registration-Focused Modal Controller
 * EESA · ISLE · IEEE Student Branch, FCRIT
 * 
 * Features:
 * - Full-viewport darkened & blurred backdrop (backdrop-filter: blur(12px))
 * - Centred Miss Minutes mascot character preserving original aspect ratio & animation
 * - Primary "REGISTER NOW" CTA positioned directly underneath Miss Minutes
 * - Centralized destination: routes to window.OVERCLOCK_CONFIG.UNSTOP_EVENT_URL
 * - Reliable disabled state when event registration URL is pending
 * - Scroll-lock preserving exact scroll position without layout shift
 * - Closes on: Close button (✕), Escape key, or outside backdrop click
 * - Accessible: ARIA modal semantics, focus management, keyboard control
 */

(function () {
  'use strict';

  class MissMinutesRegistrationModal {
    constructor() {
      this.modal = document.getElementById('miss-minutes-modal');
      this.dialog = document.getElementById('mm-modal-card') || document.getElementById('mm-modal-dialog');
      this.closeBtn = document.getElementById('mm-modal-close-btn');
      this.trigger = document.getElementById('miss-minutes-overlay');
      this.registerBtn = document.getElementById('mm-register-btn');
      this.statusNote = document.getElementById('mm-status-note');
      this.video = document.querySelector('.mm-modal-video');

      this.isOpen = false;
      this.savedScrollY = 0;

      this.init();
    }

    init() {
      if (!this.modal) return;

      // 1. Floating Miss Minutes trigger
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

      // 2. Close button (✕)
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        });
      }

      // 3. Click on backdrop closes modal (clicks inside dialog do not close)
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });

      // 4. Escape key closes modal & Tab focus trap
      window.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
          return;
        }

        if (e.key === 'Tab') {
          this.trapFocus(e);
        }
      });

      // 5. Register button action
      if (this.registerBtn) {
        this.syncRegistrationUrl();
      }
    }

    syncRegistrationUrl() {
      if (!this.registerBtn) return;
      const config = window.OVERCLOCK_CONFIG || {};
      const url = config.UNSTOP_EVENT_URL || config.registrationUrl;

      if (url) {
        this.registerBtn.href = url;
        this.registerBtn.target = '_blank';
        this.registerBtn.rel = 'noopener noreferrer';
        this.registerBtn.removeAttribute('aria-disabled');
        this.registerBtn.classList.remove('is-pending');
        this.registerBtn.title = 'Proceed to official Unstop registration page';
        if (this.statusNote) {
          this.statusNote.textContent = config.registrationLiveStatus || 'REGISTRATION PORTAL // OFFICIAL UNSTOP LIVE';
        }
      } else {
        this.registerBtn.href = '#';
        this.registerBtn.setAttribute('aria-disabled', 'true');
        this.registerBtn.classList.add('is-pending');
        this.registerBtn.title = 'Official Unstop registration portal activates on 01 November 2026';
        if (this.statusNote) {
          this.statusNote.textContent = config.registrationPendingStatus || 'PORTAL // OPENS 01 NOV 2026';
        }
        this.registerBtn.onclick = (e) => {
          e.preventDefault();
          this.playAudio(650);
          if (window.bureauEngine?.showRegistrationNotice) {
            window.bureauEngine.showRegistrationNotice('Official Unstop registration portal activates on 01 November 2026. Stay tuned!');
          }
        };
      }
    }

    playAudio(freq = 1100) {
      if (window.bureauEngine && typeof window.bureauEngine.playRelayClick === 'function') {
        window.bureauEngine.playRelayClick(freq);
      }
    }

    open() {
      if (this.isOpen || !this.modal) return;

      // 1. Save scroll position
      this.savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      // 2. Lock scroll on background page without jumping
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.savedScrollY}px`;
      document.body.style.width = '100%';
      document.body.classList.add('modal-blurred-open');

      // 3. Mark modal as open
      this.isOpen = true;
      this.syncRegistrationUrl();
      this.modal.classList.add('is-open');
      this.modal.setAttribute('aria-hidden', 'false');

      // Hide speech bubble while modal is open
      const speech = document.getElementById('miss-minutes-speech');
      if (speech) speech.style.display = 'none';

      // Ensure video plays smoothly
      if (this.video) {
        try {
          this.video.currentTime = 0;
          const playPromise = this.video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        } catch (_) {}
      }

      // 4. Focus close button or register button
      setTimeout(() => {
        if (this.closeBtn) {
          this.closeBtn.focus();
        } else if (this.registerBtn) {
          this.registerBtn.focus();
        }
      }, 80);

      this.playAudio(1200);
    }

    close() {
      if (!this.isOpen || !this.modal) return;

      // 1. Hide modal
      this.isOpen = false;
      this.modal.classList.remove('is-open');
      this.modal.setAttribute('aria-hidden', 'true');

      // 2. Restore body scroll position seamlessly
      const scrollY = this.savedScrollY;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('modal-blurred-open');
      window.scrollTo(0, scrollY);

      // Restore speech bubble display
      const speech = document.getElementById('miss-minutes-speech');
      if (speech) speech.style.display = '';

      // 3. Return focus to Miss Minutes trigger button
      if (this.trigger) {
        this.trigger.focus();
      }

      this.playAudio(880);
    }

    trapFocus(e) {
      if (!this.modal) return;
      const focusables = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const focusableArr = Array.from(focusables).filter(el => el.offsetParent !== null);
      if (focusableArr.length === 0) return;

      const firstEl = focusableArr[0];
      const lastEl = focusableArr[focusableArr.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    // Backwards-compatible stubs for legacy game hooks
    resetAllMissions() {}
    transitionTo() {}
    announce() {}
  }

  // Initialize and export controller globally
  document.addEventListener('DOMContentLoaded', () => {
    const mmModal = new MissMinutesRegistrationModal();
    window.missMinutesModal = mmModal;
    window.tvaInspectionGame = mmModal; // Backwards-compatible alias
  });
})();
