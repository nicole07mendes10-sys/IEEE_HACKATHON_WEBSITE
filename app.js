/**
 * OVERCLOCK 2027 — CENTRAL CONFIGURATION
 * Connect official Unstop URL when live, update crew names, or customize status tags.
 */
window.OVERCLOCK_CONFIG = {
  // When official Unstop registration URL is available, set it here (e.g. "https://unstop.com/..."):
  registrationUrl: null,
  registrationPendingStatus: "REGISTRATION PORTAL // LINK PENDING",
  registrationLiveStatus: "REGISTRATION PORTAL // OFFICIAL UNSTOP LIVE"
};

window.OVERCLOCK_CREW = [
  {
    role: "Chairperson",
    name: "Krishna Jaiswar",
    phone: "+91 90826 11721",
    tel: "tel:+919082611721"
  },
  {
    role: "Vice Chairperson",
    name: "Yash Bandkar",
    phone: "+91 77387 07573",
    tel: "tel:+917738707573"
  },
  {
    role: "Secretary",
    name: "Sujit Ratan",
    phone: "+91 85912 73903",
    tel: "tel:+918591273903"
  },
  {
    role: "Technical Head",
    name: "Nicole Mendes",
    phone: "+91 98220 09126",
    tel: "tel:+919822009126"
  }
];

/**
 * OVERCLOCK 2027 — APPLICATION LOGIC & BUREAU INTERACTIVITY
 * FCRIT × IEEE Student Branch
 * Features:
 * 1. Web Audio API sound synthesis (relay clicks, stamp thunk, flip-clock clicks).
 * 2. Session-cached fast boot sequence (max 2.5s).
 * 3. Scroll-linked Prime Timeline pulse runner & section rubber stamper.
 * 4. Hero clock animator with 60s overclock spin.
 * 5. 555 Timer "Sync the Clock" interactive mini puzzle solver.
 * 6. Dynamic Sponsors ("Authorized Partners") tier generator & card stamper.
 * 7. FAQ Manila folder typewriter expansion.
 * 8. Real-time live clock in Corner HUD.
 * 9. "Open a Case File" modal handler.
 */

/* ==========================================================
   BUREAU SPATIAL 3D SCROLL CONTROLLER
   Continuous, Bi-Directional, Scrub-Linked 3D Spatial System
========================================================== */
class BureauSpatialScrollController {
  constructor(app) {
    this.app = app;
    this.targetScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    this.smoothScrollY = this.targetScrollY;
    this.lerpFactor = 0.18;
    this.isTicking = false;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = window.innerWidth <= 768;
    this.pointerTilts = new WeakMap();

    this.cacheElements();
    this.setupListeners();
    this.startLoop();
  }

  cacheElements() {
    // Section 02: Briefing Dossier
    this.aboutSec = document.getElementById('about');
    this.dossierGrid = this.aboutSec ? this.aboutSec.querySelector('.case-notes-grid') : null;
    this.dossierCards = this.aboutSec ? Array.from(this.aboutSec.querySelectorAll('.case-note-card')) : [];

    // Section 03: Problem Statements Five Domains
    this.problemsSec = document.getElementById('problems');
    this.domainCards = this.problemsSec ? Array.from(this.problemsSec.querySelectorAll('.domain-slot-card')) : [];

    // Section 04: Results Shortlist Teletype
    this.resultsSec = document.getElementById('results');
    this.resultsChamber = this.resultsSec ? this.resultsSec.querySelector('.results-dossier-chamber') : null;

    // Section 05: Timeline Reel Deck
    this.timelineSec = document.getElementById('timeline');
    this.timelineDeck = this.timelineSec ? this.timelineSec.querySelector('.timeline-reel-deck') : null;
    this.spoolGraphics = this.timelineSec ? Array.from(this.timelineSec.querySelectorAll('.spool-graphic')) : [];
    this.filmFrames = this.timelineSec ? Array.from(this.timelineSec.querySelectorAll('.film-frame-card')) : [];
    this.timelineHeading = this.timelineSec ? this.timelineSec.querySelector('.section-main-heading') : null;

    // Section 06: Registration Terminal
    this.registrationSec = document.getElementById('registration');
    this.regTerminal = this.registrationSec ? this.registrationSec.querySelector('.registration-terminal-card') : null;

    // Section 07: Accommodation
    this.accommodationSec = document.getElementById('accommodation');
    this.quartersCards = this.accommodationSec ? Array.from(this.accommodationSec.querySelectorAll('.quarters-stat-card')) : [];

    // Section 08: Judging & Recognition
    this.judgingSec = document.getElementById('judging');
    this.pillarCards = this.judgingSec ? Array.from(this.judgingSec.querySelectorAll('.pillar-card')) : [];

    // Section 09: Sponsors Pinboard
    this.sponsorsSec = document.getElementById('sponsors');
    this.sponsorsPinboard = this.sponsorsSec ? this.sponsorsSec.querySelector('.sponsors-pinboard-deck') : null;
    this.cacheSponsorCards();

    // Section 10: FAQ Manila Folders
    this.faqSec = document.getElementById('faq');
    this.faqAccordion = this.faqSec ? this.faqSec.querySelector('.case-files-accordion') : null;
    this.faqFolders = this.faqSec ? Array.from(this.faqSec.querySelectorAll('.case-folder-unit')) : [];

    // Section 11: Contact Dossier
    this.contactSec = document.getElementById('contact');
    this.contactCards = this.contactSec ? Array.from(this.contactSec.querySelectorAll('.contact-dossier-card')) : [];

    // Section 12: Footer Filing Drawer
    this.footerSec = document.querySelector('.filing-cabinet-footer');
    this.filingDrawer = this.footerSec ? this.footerSec.querySelector('.filing-drawer-box') : null;
    this.completionCard = this.footerSec ? this.footerSec.querySelector('.center-timeline-complete-card') : null;
  }

  cacheSponsorCards() {
    if (this.sponsorsSec) {
      this.sponsorCards = Array.from(this.sponsorsSec.querySelectorAll('.auth-clearance-card'));
    } else {
      this.sponsorCards = [];
    }
  }

  setupListeners() {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      this.targetScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      this.render();
    }, { passive: true });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
        this.targetScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        this.render();
      }, 100);
    }, { passive: true });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
      this.render();
    });
  }

  onScroll() {
    this.targetScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (!this.isTicking) {
      this.startLoop();
    }
  }

  startLoop() {
    this.isTicking = true;
    requestAnimationFrame(() => this.render());
  }

  render() {
    if (this.isReducedMotion) {
      this.resetAllTransforms();
      this.isTicking = false;
      return;
    }

    const diff = this.targetScrollY - this.smoothScrollY;
    if (Math.abs(diff) < 0.05) {
      this.smoothScrollY = this.targetScrollY;
    } else {
      this.smoothScrollY += diff * this.lerpFactor;
    }

    this.updateBriefingSection();
    this.updateProblemsSection();
    this.updateResultsSection();
    this.updateTimelineSection();
    this.updateRegistrationSection();
    this.updateAccommodationSection();
    this.updateJudgingSection();
    this.updateSponsorsSection();
    this.updateFAQSection();
    this.updateContactSection();
    this.updateFooterSection();

    if (Math.abs(this.targetScrollY - this.smoothScrollY) >= 0.05) {
      requestAnimationFrame(() => this.render());
    } else {
      this.isTicking = false;
    }
  }

  getSectionProgress(el) {
    if (!el) return -1;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = vh + rect.height;
    if (total <= 0) return 0;
    return (vh - rect.top) / total;
  }

  setPointerTilt(card, tiltX, tiltY) {
    this.pointerTilts.set(card, { tiltX, tiltY });
    if (!this.isTicking) {
      this.startLoop();
    }
  }

  clearPointerTilt(card) {
    this.pointerTilts.delete(card);
    if (!this.isTicking) {
      this.startLoop();
    }
  }

  getPointerTilt(card) {
    return this.pointerTilts.get(card) || { tiltX: 0, tiltY: 0 };
  }

  /* --------------------------------------------------------
     1. BRIEFING / ABOUT SECTION (4 DOSSIER CARDS)
  -------------------------------------------------------- */
  updateBriefingSection() {
    if (!this.aboutSec || this.dossierCards.length === 0) return;
    const p = this.getSectionProgress(this.aboutSec);
    if (p < -0.1 || p > 1.1) return;

    const rotXInits = [5.5, 6.5, 6.5, 5.5];
    const rotYInits = [-4.5, -2.0, 2.0, 4.5];
    const rotZInits = [-1.2, -0.5, 0.5, 1.2];

    this.dossierCards.forEach((card, i) => {
      const c_i = 0.36 + i * 0.08;
      const d = p - c_i;
      const f = Math.max(0, 1 - Math.abs(d) / 0.12);
      const f_smooth = f * f * (3 - 2 * f);

      const enterT = Math.min(1, Math.max(0, (p - (c_i - 0.20)) / 0.20));
      const exitT = Math.min(1, Math.max(0, (p - c_i) / 0.25));

      const baseZ = -55 * (1 - enterT) - 35 * exitT;
      let tz = baseZ + (28 - baseZ) * f_smooth;

      let rx = (rotXInits[i] * (1 - enterT) - 3.0 * exitT) * (1 - f_smooth);
      let ry = (rotYInits[i] * (1 - enterT) + (rotYInits[i] * 0.4) * exitT) * (1 - f_smooth);
      let rz = rotZInits[i] * (1 - f_smooth);
      let scale = 0.98 + 0.05 * f_smooth;
      let tx = (i - 1.5) * 5 * (1 - f_smooth * 0.5);

      // Blend mouse pointer tilt if hovered
      const pt = this.getPointerTilt(card);
      rx += pt.tiltX;
      ry += pt.tiltY;

      if (this.isMobile) {
        rx *= 0.35;
        ry *= 0.35;
        rz = 0;
        tx = 0;
        tz = Math.max(-18, Math.min(14, tz));
        scale = Math.min(scale, 1.018);
      }

      card.style.transform = `perspective(1000px) translate3d(${tx.toFixed(1)}px, 0px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

      if (f_smooth > 0.04) {
        const glow = (f_smooth * 0.65).toFixed(2);
        const sy = (8 + f_smooth * 12).toFixed(1);
        const sb = (18 + f_smooth * 16).toFixed(1);
        card.style.boxShadow = `0 ${sy}px ${sb}px rgba(0, 0, 0, 0.45), 0 0 ${(f_smooth * 22).toFixed(1)}px rgba(232, 137, 43, ${glow}), inset 0 0 ${(f_smooth * 8).toFixed(1)}px rgba(232, 137, 43, 0.25)`;
        card.style.outline = `1.5px solid rgba(232, 137, 43, ${(f_smooth * 0.85).toFixed(2)})`;
      } else {
        card.style.boxShadow = '';
        card.style.outline = '';
      }

      const clip = card.querySelector('.paperclip-graphic');
      if (clip) {
        clip.style.transform = `translateY(${(-f_smooth * 4).toFixed(1)}px) rotate(${(f_smooth * 3).toFixed(1)}deg)`;
      }
    });
  }

  /* --------------------------------------------------------
     2. PROBLEM STATEMENTS (FIVE DOMAIN SLOTS)
  -------------------------------------------------------- */
  updateProblemsSection() {
    if (!this.problemsSec || this.domainCards.length === 0) return;
    const p = this.getSectionProgress(this.problemsSec);
    if (p < -0.1 || p > 1.1) return;

    const rotXInits = [5.5, 6.5, 6.0, 6.5, 5.5];
    const rotYInits = [-3.5, -1.8, 0, 1.8, 3.5];

    this.domainCards.forEach((card, i) => {
      const c_i = 0.28 + i * 0.08;
      const d = p - c_i;
      const f = Math.max(0, 1 - Math.abs(d) / 0.13);
      const f_smooth = f * f * (3 - 2 * f);

      const enterT = Math.min(1, Math.max(0, (p - (c_i - 0.20)) / 0.20));
      const exitT = Math.min(1, Math.max(0, (p - c_i) / 0.25));

      const baseZ = -45 * (1 - enterT) - 20 * exitT;
      let tz = baseZ + (26 - baseZ) * f_smooth;

      let rx = (rotXInits[i] * (1 - enterT) - 2.5 * exitT) * (1 - f_smooth);
      let ry = (rotYInits[i] * (1 - enterT) + (rotYInits[i] * 0.35) * exitT) * (1 - f_smooth);
      let scale = 0.98 + 0.035 * f_smooth;
      let tx = (i - 2.0) * 4 * (1 - f_smooth * 0.5);

      const pt = this.getPointerTilt(card);
      rx += pt.tiltX;
      ry += pt.tiltY;

      if (this.isMobile) {
        rx *= 0.35;
        ry *= 0.35;
        tx = 0;
        tz = Math.max(-15, Math.min(12, tz));
        scale = Math.min(scale, 1.015);
      }

      card.style.transform = `perspective(1000px) translate3d(${tx.toFixed(1)}px, 0px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    });
  }

  /* --------------------------------------------------------
     3. RESULTS (TELETYPE SHORTLIST CHAMBER)
  -------------------------------------------------------- */
  updateResultsSection() {
    if (!this.resultsSec || !this.resultsChamber) return;
    const p = this.getSectionProgress(this.resultsSec);
    if (p < -0.1 || p > 1.1) return;

    const enterT = Math.min(1, Math.max(0, (p - 0.15) / 0.35));
    const exitT = Math.min(1, Math.max(0, (p - 0.60) / 0.35));
    let rx = (3.5 * (1 - enterT) - 2.0 * exitT);
    let tz = -30 * (1 - enterT) + 18 * enterT * (1 - exitT);

    if (this.isMobile) {
      rx *= 0.35;
      tz = Math.max(-12, tz);
    }
    this.resultsChamber.style.transform = `perspective(1000px) translate3d(0px, 0px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg)`;
  }

  /* --------------------------------------------------------
     4. TIMELINE SECTION (REEL DECK & 5 MILESTONES)
  -------------------------------------------------------- */
  updateTimelineSection() {
    if (!this.timelineSec) return;
    const p = this.getSectionProgress(this.timelineSec);
    if (p < -0.1 || p > 1.1) return;

    // Rotate magnetic spools proportional to scroll progress
    const spoolRot = (p * 720).toFixed(1);
    this.spoolGraphics.forEach(spool => {
      spool.style.transform = `rotate(${spoolRot}deg)`;
    });

    // Milestone film frames (5 milestones)
    this.filmFrames.forEach((frame, i) => {
      const c_i = 0.28 + i * 0.08;
      const d = p - c_i;
      const f = Math.max(0, 1 - Math.abs(d) / 0.12);
      const f_smooth = f * f * (3 - 2 * f);

      const enterT = Math.min(1, Math.max(0, (p - (c_i - 0.20)) / 0.20));
      const exitT = Math.min(1, Math.max(0, (p - c_i) / 0.25));

      const isFinal = i === 4; // Milestone 05: Final Problem Statement
      const targetZ = isFinal ? 32 : 22;
      const baseZ = -40 * (1 - enterT) - 20 * exitT;
      let tz = baseZ + (targetZ - baseZ) * f_smooth;

      let rx = (3.5 * (1 - enterT) - 2.0 * exitT) * (1 - f_smooth);
      let ry = ((i - 2.0) * 2.5 * (1 - enterT)) * (1 - f_smooth);
      let scale = 0.98 + 0.04 * f_smooth;

      if (this.isMobile) {
        rx *= 0.35;
        ry *= 0.35;
        tz = Math.max(-15, Math.min(12, tz));
        scale = Math.min(scale, 1.018);
      }

      frame.style.transform = `perspective(1000px) translate3d(0px, 0px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

      if (isFinal && f_smooth > 0.05) {
        frame.style.boxShadow = `0 0 ${(16 + f_smooth * 20).toFixed(1)}px rgba(232, 137, 43, 0.4)`;
      } else if (f_smooth > 0.08) {
        frame.style.boxShadow = `0 8px 20px rgba(0, 0, 0, 0.5), 0 0 ${(f_smooth * 14).toFixed(1)}px rgba(217, 169, 58, 0.25)`;
      } else {
        frame.style.boxShadow = '';
      }
    });
  }

  /* --------------------------------------------------------
     5. REGISTRATION (TERMINAL CARD)
  -------------------------------------------------------- */
  updateRegistrationSection() {
    if (!this.registrationSec || !this.regTerminal) return;
    const p = this.getSectionProgress(this.registrationSec);
    if (p < -0.1 || p > 1.1) return;

    const enterT = Math.min(1, Math.max(0, (p - 0.15) / 0.35));
    const exitT = Math.min(1, Math.max(0, (p - 0.65) / 0.35));
    let rx = 3.5 * (1 - enterT) - 2.0 * exitT;
    let tz = -30 * (1 - enterT) + 20 * enterT * (1 - exitT);

    if (this.isMobile) {
      rx *= 0.35;
      tz = Math.max(-12, tz);
    }
    this.regTerminal.style.transform = `perspective(1000px) translate3d(0px, 0px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg)`;
  }

  /* --------------------------------------------------------
     6. ACCOMMODATION (QUARTERS STAT CARDS)
  -------------------------------------------------------- */
  updateAccommodationSection() {
    if (!this.accommodationSec || this.quartersCards.length === 0) return;
    const p = this.getSectionProgress(this.accommodationSec);
    if (p < -0.1 || p > 1.1) return;

    this.quartersCards.forEach((card, i) => {
      const c_i = 0.28 + i * 0.08;
      const d = p - c_i;
      const f = Math.max(0, 1 - Math.abs(d) / 0.12);
      const f_smooth = f * f * (3 - 2 * f);

      const enterT = Math.min(1, Math.max(0, (p - (c_i - 0.20)) / 0.20));
      const exitT = Math.min(1, Math.max(0, (p - c_i) / 0.25));

      const baseZ = -30 * (1 - enterT) - 15 * exitT;
      let tz = baseZ + (20 - baseZ) * f_smooth;
      let scale = 0.98 + 0.03 * f_smooth;

      if (this.isMobile) {
        tz = Math.max(-12, Math.min(10, tz));
        scale = 1;
      }

      card.style.transform = `perspective(800px) translate3d(0px, 0px, ${tz.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    });
  }

  /* --------------------------------------------------------
     7. JUDGING & RECOGNITION (EVALUATION PILLARS)
  -------------------------------------------------------- */
  updateJudgingSection() {
    if (!this.judgingSec || this.pillarCards.length === 0) return;
    const p = this.getSectionProgress(this.judgingSec);
    if (p < -0.1 || p > 1.1) return;

    this.pillarCards.forEach((card, i) => {
      const c_i = 0.28 + i * 0.08;
      const d = p - c_i;
      const f = Math.max(0, 1 - Math.abs(d) / 0.12);
      const f_smooth = f * f * (3 - 2 * f);

      const enterT = Math.min(1, Math.max(0, (p - (c_i - 0.20)) / 0.20));
      const exitT = Math.min(1, Math.max(0, (p - c_i) / 0.25));

      const baseZ = -30 * (1 - enterT) - 15 * exitT;
      let tz = baseZ + (22 - baseZ) * f_smooth;
      let scale = 0.98 + 0.035 * f_smooth;

      if (this.isMobile) {
        tz = Math.max(-12, Math.min(10, tz));
        scale = 1;
      }

      card.style.transform = `perspective(800px) translate3d(0px, 0px, ${tz.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    });
  }

  /* --------------------------------------------------------
     8. SPONSORS (PINBOARD CLEARANCE CARDS)
  -------------------------------------------------------- */
  updateSponsorsSection() {
    if (!this.sponsorsSec) return;
    const p = this.getSectionProgress(this.sponsorsSec);
    if (p < -0.1 || p > 1.1) return;

    if (this.sponsorCards && this.sponsorCards.length > 0) {
      this.sponsorCards.forEach((card, i) => {
        const c_i = 0.32 + (i % 6) * 0.07;
        const d = p - c_i;
        const f = Math.max(0, 1 - Math.abs(d) / 0.12);
        const f_smooth = f * f * (3 - 2 * f);

        const enterT = Math.min(1, Math.max(0, (p - (c_i - 0.20)) / 0.20));
        const exitT = Math.min(1, Math.max(0, (p - c_i) / 0.25));

        const baseZ = -35 * (1 - enterT) - 15 * exitT;
        let tz = baseZ + (22 - baseZ) * f_smooth;

        const tiltInit = (i % 2 === 0 ? -1.8 : 1.8);
        let rz = tiltInit * (1 - f_smooth);
        let rx = (3.5 * (1 - enterT)) * (1 - f_smooth);
        let scale = 0.98 + 0.04 * f_smooth;

        if (this.isMobile) {
          rx *= 0.35;
          rz = 0;
          tz = Math.max(-15, Math.min(12, tz));
          scale = Math.min(scale, 1.015);
        }

        card.style.transform = `perspective(1000px) translate3d(0px, 0px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

        if (f_smooth > 0.06) {
          card.style.boxShadow = `0 12px 28px rgba(0, 0, 0, 0.5), 0 0 ${(f_smooth * 20).toFixed(1)}px rgba(232, 137, 43, ${(f_smooth * 0.55).toFixed(2)})`;
        } else {
          card.style.boxShadow = '';
        }
      });
    }
  }

  /* --------------------------------------------------------
     9. FAQ (MANILA CASE FOLDERS)
  -------------------------------------------------------- */
  updateFAQSection() {
    if (!this.faqSec || this.faqFolders.length === 0) return;
    const p = this.getSectionProgress(this.faqSec);
    if (p < -0.1 || p > 1.1) return;

    this.faqFolders.forEach((folder, i) => {
      const c_i = 0.32 + i * 0.08;
      const d = p - c_i;
      const f = Math.max(0, 1 - Math.abs(d) / 0.12);
      const f_smooth = f * f * (3 - 2 * f);

      const enterT = Math.min(1, Math.max(0, (p - (c_i - 0.20)) / 0.20));
      const exitT = Math.min(1, Math.max(0, (p - c_i) / 0.25));

      const baseZ = -30 * (1 - enterT) - 12 * exitT;
      let tz = baseZ + (18 - baseZ) * f_smooth;
      let rx = (3.5 * (1 - enterT) - 2.0 * exitT) * (1 - f_smooth);
      let scale = 0.99 + 0.02 * f_smooth;

      if (this.isMobile) {
        rx *= 0.35;
        tz = Math.max(-12, Math.min(10, tz));
        scale = 1.0;
      }

      folder.style.transform = `perspective(800px) translate3d(0px, 0px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

      if (f_smooth > 0.1) {
        folder.style.boxShadow = `0 6px 20px rgba(0, 0, 0, 0.4), 0 0 ${(f_smooth * 18).toFixed(1)}px rgba(232, 137, 43, ${(f_smooth * 0.4).toFixed(2)})`;
      } else if (!folder.classList.contains('open')) {
        folder.style.boxShadow = '';
      }
    });
  }

  /* --------------------------------------------------------
     10. CONTACT (DOSSIER CARDS)
  -------------------------------------------------------- */
  updateContactSection() {
    if (!this.contactSec || this.contactCards.length === 0) return;
    const p = this.getSectionProgress(this.contactSec);
    if (p < -0.1 || p > 1.1) return;

    this.contactCards.forEach((card, i) => {
      const c_i = 0.30 + i * 0.09;
      const d = p - c_i;
      const f = Math.max(0, 1 - Math.abs(d) / 0.12);
      const f_smooth = f * f * (3 - 2 * f);

      const enterT = Math.min(1, Math.max(0, (p - (c_i - 0.20)) / 0.20));
      const exitT = Math.min(1, Math.max(0, (p - c_i) / 0.25));

      const baseZ = -28 * (1 - enterT) - 12 * exitT;
      let tz = baseZ + (18 - baseZ) * f_smooth;
      let scale = 0.99 + 0.025 * f_smooth;

      if (this.isMobile) {
        tz = Math.max(-10, Math.min(8, tz));
        scale = 1.0;
      }

      card.style.transform = `perspective(800px) translate3d(0px, 0px, ${tz.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    });
  }

  /* --------------------------------------------------------
     11. FOOTER (FILING CABINET DRAWER & COMPLETION CARD)
  -------------------------------------------------------- */
  updateFooterSection() {
    if (!this.footerSec) return;
    const p = this.getSectionProgress(this.footerSec);
    if (p < -0.1 || p > 1.1) return;

    if (this.filingDrawer) {
      const enterT = Math.min(1, Math.max(0, (p - 0.20) / 0.45));
      let rx = 4.0 * (1 - enterT);
      let tz = -35 + enterT * 45;
      if (this.isMobile) {
        rx *= 0.35;
        tz = Math.max(-15, Math.min(12, tz));
      }
      this.filingDrawer.style.transform = `perspective(1000px) translate3d(0px, 0px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg)`;
    }

    if (this.completionCard) {
      const enterT = Math.min(1, Math.max(0, (p - 0.35) / 0.35));
      const f_smooth = enterT * enterT * (3 - 2 * enterT);
      const tz = f_smooth * 16;
      this.completionCard.style.transform = `perspective(600px) translate3d(0px, 0px, ${tz.toFixed(1)}px)`;
      if (f_smooth > 0.1) {
        this.completionCard.style.boxShadow = `0 0 ${(f_smooth * 22).toFixed(1)}px rgba(232, 137, 43, ${(f_smooth * 0.45).toFixed(2)}), inset 0 0 ${(f_smooth * 14).toFixed(1)}px rgba(232, 137, 43, 0.15)`;
      } else {
        this.completionCard.style.boxShadow = '';
      }
    }
  }

  resetAllTransforms() {
    const all = [
      ...this.dossierCards,
      ...this.domainCards,
      this.resultsChamber,
      ...this.filmFrames,
      this.regTerminal,
      ...this.quartersCards,
      ...this.pillarCards,
      ...(this.sponsorCards || []),
      ...this.faqFolders,
      ...this.contactCards,
      this.filingDrawer,
      this.completionCard
    ];
    all.forEach(el => {
      if (el) {
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.borderColor = '';
        el.style.outline = '';
      }
    });
  }
}

class OverclockApp {
  constructor() {
    this.audioEnabled = false;
    this.audioCtx = null;
    this.hasBooted = sessionStorage.getItem('oc2027_booted') === 'true' || new URLSearchParams(window.location.search).has('skipboot');
    
    // Puzzle state
    this.puzzleSwitches = { 1: false, 2: false, 3: false };
    this.puzzleSolved = false;

    // Sponsors state
    this.sponsorsStamped = false;

    // Active Section & HUD state
    this.currentActiveSection = 'hero';
    this.countdownStarted = false;
    this.sectionLabels = {
      'hero': 'SEC 01/11: HERO',
      'about': 'SEC 02/11: ABOUT',
      'problems': 'SEC 03/11: DOMAINS',
      'results': 'SEC 04/11: RESULTS',
      'timeline': 'SEC 05/11: TIMELINE',
      'registration': 'SEC 06/11: REGISTER',
      'accommodation': 'SEC 07/11: QUARTERS',
      'judging': 'SEC 08/11: JUDGING',
      'sponsors': 'SEC 09/11: SPONSORS',
      'faq': 'SEC 10/11: FAQ',
      'contact': 'SEC 11/11: CONTACT'
    };

    this.init();
  }

  init() {
    this.setupAudio();
    this.setupBootSequence();
    this.setupHeroClock();
    this.setupTemporalClockNavigator();
    this.setupTimelineReveals();
    this.setupScrollAnimations();
    this.spatialController = new BureauSpatialScrollController(this);
    this.setupRegistrationCTA();
    this.setupFooterCrew();
    this.setupSponsorsSection();
    this.setupFAQ();
    this.setupModals();
    this.setupMobileNav();
    this.setupMissMinutesOverlay();
  }

  /* ==========================================================
     1. WEB AUDIO SYNTHESIZER
  ========================================================== */
  setupAudio() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.audioEnabled = !this.audioEnabled;
      audioBtn.style.color = this.audioEnabled ? '#7CFF9B' : '#D9A93A';
      audioBtn.style.borderColor = this.audioEnabled ? '#7CFF9B' : '#D9A93A';
      
      if (this.audioEnabled) {
        this.playRelayClick();
      }
    });
  }

  playRelayClick(freq = 1200) {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback
    }
  }

  playStampThunk() {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.13);
    } catch (e) {}
  }

  /* ==========================================================
     2. FAST BOOTLOADER SEQUENCE (MAX 2.5S)
  ========================================================== */
  setupBootSequence() {
    const overlay = document.getElementById('boot-overlay');
    const fill = document.getElementById('boot-progress-fill');
    const lines = document.querySelectorAll('.boot-line');
    
    if (!overlay) {
      this.triggerHeroAnimations();
      return;
    }

    if (this.hasBooted) {
      overlay.classList.add('hidden');
      setTimeout(() => this.triggerHeroAnimations(), 50);
      return;
    }

    const finishBoot = () => {
      overlay.classList.add('hidden');
      sessionStorage.setItem('oc2027_booted', 'true');
      this.playRelayClick(880);
      setTimeout(() => this.triggerHeroAnimations(), 100);
    };

    overlay.addEventListener('click', finishBoot);
    window.addEventListener('keydown', finishBoot, { once: true });

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step <= lines.length) {
        lines[step - 1].classList.add('active');
        if (fill) fill.style.width = `${(step / lines.length) * 100}%`;
        this.playRelayClick(600 + step * 150);
      } else {
        clearInterval(interval);
        setTimeout(finishBoot, 350);
      }
    }, 450);
  }

  triggerHeroAnimations() {
    const heroSec = document.getElementById('hero');
    if (!heroSec || heroSec.classList.contains('hero-anim-active')) return;

    heroSec.classList.add('hero-anim-active');
    heroSec.classList.add('stamped');
    heroSec.classList.add('revealed');

    // Sequential audio clicks for OVERCLOCK letters
    const flapBoxes = heroSec.querySelectorAll('.flap-char-box');
    flapBoxes.forEach((box, idx) => {
      setTimeout(() => {
        this.playRelayClick(1100 + idx * 75);
      }, idx * 40 + 40);
    });

    // TVA stamp impact sound for LOGGED #01
    setTimeout(() => {
      this.playStampThunk();
    }, 380);
  }

  /* ==========================================================
     3. HERO CLOCK ANIMATION WITH 60S OVERCLOCK SPIN
  ========================================================== */
  setupHeroClock() {
    const secHand = document.getElementById('hero-clock-sec');
    const minHand = document.getElementById('hero-clock-min');
    const hourHand = document.getElementById('hero-clock-hour');
    if (!secHand) return;

    let seconds = 0;
    let isOverclockSpin = false;

    setInterval(() => {
      seconds++;
      if (seconds % 60 === 0) {
        // Trigger fast 60s overclock spin
        isOverclockSpin = true;
        secHand.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        secHand.style.transform = `rotate(${seconds * 6 + 720}deg)`;
        this.playRelayClick(1800);
        setTimeout(() => {
          secHand.style.transition = 'none';
          isOverclockSpin = false;
        }, 850);
      } else if (!isOverclockSpin) {
        secHand.style.transform = `rotate(${seconds * 6}deg)`;
      }

      if (minHand) minHand.style.transform = `rotate(${seconds * 0.1}deg)`;
      if (hourHand) hourHand.style.transform = `rotate(${seconds * (0.1 / 12) + 45}deg)`;
    }, 1000);
  }

  /* ==========================================================
     4. TVA CORNER TEMPORAL CLOCK NAVIGATOR (PRECISION INSTRUMENT)
     Anchored to upper-right corner. 1/4 visible circle.
     Inner markers rotate with scrolling. Clicking opens sector directory.
  ========================================================== */
  setupTemporalClockNavigator() {
    const sectionIds = [
      'hero',
      'about',
      'problems',
      'results',
      'timeline',
      'registration',
      'accommodation',
      'judging',
      'sponsors',
      'faq',
      'contact'
    ];
    const sectionElements = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    const allSections = Array.from(document.querySelectorAll('.bureau-section'));
    const navContainer = document.getElementById('temporal-clock-navigator');
    const dialTrigger = document.getElementById('corner-dial-trigger');
    const dialPointer = document.getElementById('corner-dial-pointer');
    const markersRotor = document.getElementById('corner-markers-rotor');
    const dialMarkers = Array.from(document.querySelectorAll('.corner-rotor-marker'));
    const temporalMenu = document.getElementById('corner-temporal-menu');
    const menuCloseBtn = document.getElementById('corner-menu-close-btn');
    const sectorLinks = Array.from(document.querySelectorAll('.corner-temporal-menu .sector-link'));
    const menuCounter = document.getElementById('menu-active-counter');
    const navStatusSec = document.getElementById('nav-current-section-name');
    const mobileNavLinks = Array.from(document.querySelectorAll('.mobile-nav-link'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const backToStartBtn = document.getElementById('footer-back-to-start');

    // 11 section marker angles spanning the visible bottom-left quadrant (190deg to 260deg)
    const markerAngles = [190, 197, 204, 211, 218, 225, 232, 239, 246, 253, 260];

    const sectionLabelsMap = {
      'hero': 'HOME // OVERVIEW',
      'about': 'ABOUT BRIEFING',
      'problems': 'PROBLEM STATEMENTS',
      'results': 'SELECTION STATUS',
      'timeline': 'EVENT TIMELINE',
      'registration': 'REGISTRATION',
      'accommodation': 'STAY ON CAMPUS',
      'judging': 'JUDGING & RECOGNITION',
      'sponsors': 'SPONSORS & PARTNERS',
      'faq': 'CASE FILES (FAQ)',
      'contact': 'CONTACT & VENUE'
    };

    // Toggle expanded section directory menu
    let isMenuOpen = false;

    const openMenu = () => {
      if (isMenuOpen || !temporalMenu) return;
      isMenuOpen = true;
      temporalMenu.removeAttribute('hidden');
      void temporalMenu.offsetWidth;
      temporalMenu.classList.add('is-open');
      if (dialTrigger) {
        dialTrigger.setAttribute('aria-expanded', 'true');
        dialTrigger.setAttribute('aria-label', 'Close section navigation');
      }
      this.playRelayClick(1020);
    };

    const closeMenu = () => {
      if (!isMenuOpen || !temporalMenu) return;
      isMenuOpen = false;
      temporalMenu.classList.remove('is-open');
      if (dialTrigger) {
        dialTrigger.setAttribute('aria-expanded', 'false');
        dialTrigger.setAttribute('aria-label', 'Open section navigation');
      }
      setTimeout(() => {
        if (!isMenuOpen) {
          temporalMenu.setAttribute('hidden', '');
        }
      }, 220);
    };

    const toggleMenu = () => {
      if (isMenuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    if (dialTrigger) {
      dialTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      });
    }

    if (menuCloseBtn) {
      menuCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        if (dialTrigger) dialTrigger.focus();
      });
    }

    // Dismiss on outside click
    document.addEventListener('click', (e) => {
      if (isMenuOpen && navContainer && !navContainer.contains(e.target)) {
        closeMenu();
      }
    });

    // Dismiss on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
        if (dialTrigger) dialTrigger.focus();
      }
    });

    // Sector link smooth-scroll click interaction (Syncs clock pointer and marker highlight)
    sectorLinks.forEach((link, idx) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSecId = link.getAttribute('data-section');
        const targetSec = document.getElementById(targetSecId);

        // Immediately update pointer angle and active marker
        if (dialPointer && markerAngles[idx] !== undefined) {
          dialPointer.style.transform = `rotate(${markerAngles[idx]}deg)`;
        }
        dialMarkers.forEach((marker, mIdx) => {
          if (mIdx === idx) {
            marker.classList.add('active');
          } else {
            marker.classList.remove('active');
          }
        });
        sectorLinks.forEach((l, lIdx) => {
          if (lIdx === idx) {
            l.classList.add('active');
            l.setAttribute('aria-current', 'true');
          } else {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
          }
        });

        closeMenu();
        if (targetSec) {
          this.playRelayClick(880);
          targetSec.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    });

    // Footer BACK TO START single navigation action
    if (backToStartBtn) {
      backToStartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const heroSec = document.getElementById('hero');
        if (heroSec) {
          heroSec.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
        // Update dial pointer to Home (190deg)
        if (dialPointer) {
          dialPointer.style.transform = 'rotate(190deg)';
        }
        dialMarkers.forEach((m, mIdx) => {
          if (mIdx === 0) m.classList.add('active');
          else m.classList.remove('active');
        });
        sectorLinks.forEach((l, lIdx) => {
          if (lIdx === 0) {
            l.classList.add('active');
            l.setAttribute('aria-current', 'true');
          } else {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
          }
        });
      });
    }

    // Scroll state observer: updates active section, pointer angle, marker pulse & timeline progress
    const updateScrollState = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const viewportHeight = window.innerHeight;
      const scrollBottom = scrollY + viewportHeight;
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

      // Determine active section index
      let activeIdx = 0;

      if (scrollY < 120) {
        activeIdx = 0;
      } else if (scrollBottom >= docHeight - 60) {
        activeIdx = sectionElements.length - 1;
      } else {
        const triggerLine = viewportHeight * 0.38;
        let closestIdx = 0;
        let minDistance = Infinity;

        sectionElements.forEach((sec, idx) => {
          const rect = sec.getBoundingClientRect();
          if (rect.top <= triggerLine && rect.bottom > triggerLine) {
            closestIdx = idx;
            minDistance = 0;
          } else {
            const dist = Math.abs(rect.top - triggerLine);
            if (dist < minDistance && rect.top <= triggerLine + 220) {
              minDistance = dist;
              closestIdx = idx;
            }
          }
        });
        activeIdx = closestIdx;
      }

      // Check section reveals & rubber stamp logs across ALL page sections
      allSections.forEach((sec, idx) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= viewportHeight * 0.72) {
          if (!sec.classList.contains('stamped')) {
            sec.classList.add('stamped');
            sec.classList.add('revealed');
            const stampBadge = sec.querySelector('.section-rubber-stamp');
            const secNum = sec.dataset.sectionNum || `0${idx + 1}`;
            if (stampBadge) stampBadge.textContent = `LOGGED #${secNum}`;
            this.playStampThunk();

            if (sec.id === 'sponsors') {
              this.animateSponsorCards();
            }
          }
        }
      });

      // Update precision clock hand / pointer angle to track active section
      if (dialPointer) {
        const targetAngle = markerAngles[activeIdx] !== undefined ? markerAngles[activeIdx] : 190;
        dialPointer.style.transform = `rotate(${targetAngle}deg)`;
      }

      // Update corner dial markers states: active marker breathes subtly, others remain subdued bronze
      dialMarkers.forEach((marker, idx) => {
        if (idx === activeIdx) {
          marker.classList.add('active');
        } else {
          marker.classList.remove('active');
        }
      });

      // Update dropdown sector links
      sectorLinks.forEach((link, idx) => {
        if (idx === activeIdx) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'true');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });

      // Update mobile nav drawer links
      mobileNavLinks.forEach((link, idx) => {
        if (idx === activeIdx) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Update Timeline Golden Spine Progress Line
      const timelineSec = document.getElementById('timeline');
      const spineProgress = document.getElementById('timeline-spine-progress');
      if (timelineSec && spineProgress) {
        const tRect = timelineSec.getBoundingClientRect();
        const vh = window.innerHeight;
        const totalHeight = tRect.height + vh * 0.2;
        const currentScrolled = vh * 0.7 - tRect.top;
        const progress = Math.min(1, Math.max(0, currentScrolled / totalHeight));
        spineProgress.style.height = `${(progress * 100).toFixed(1)}%`;
      }

      // Update telemetry readouts in menu and navbar
      if (menuCounter) {
        menuCounter.textContent = `${String(activeIdx + 1).padStart(2, '0')}/${String(sectionElements.length).padStart(2, '0')}`;
      }

      const activeSecEl = sectionElements[activeIdx];
      if (activeSecEl) {
        const secId = activeSecEl.id;
        const fullLabel = sectionLabelsMap[secId] || secId.toUpperCase();
        if (navStatusSec) {
          navStatusSec.textContent = fullLabel;
        }
        this.currentActiveSection = secId;
      }
    };

    let isTicking = false;
    const onScroll = () => {
      if (!isTicking) {
        requestAnimationFrame(() => {
          updateScrollState();
          isTicking = false;
        });
        isTicking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    setTimeout(updateScrollState, 50);
  }

  /* ==========================================================
     4B. TVA EVENT TIMELINE ONE-TIME PROGRESSIVE SCROLL REVEAL
     IntersectionObserver ensures each milestone reveals ONLY ONCE
     per page session. Scrolling up keeps them fully visible,
     and scrolling down again never replays entrance animations.
  ========================================================== */
  setupTimelineReveals() {
    const milestoneItems = document.querySelectorAll('.timeline-milestone-item');
    if (!milestoneItems.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Once revealed, unobserve permanently so animation never repeats or disappears
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    milestoneItems.forEach(item => observer.observe(item));
  }

  /* ==========================================================
     SCROLL-TRIGGERED ANIMATION SYSTEM (INTERSECTION OBSERVER)
  ========================================================== */
  setupScrollAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.12
    };

    const onIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('revealed');
          observer.unobserve(el);

          // Section specific triggers
          if (el.id === 'overclock-24h' || el.classList.contains('overclock-crucible-chamber')) {
            this.triggerCountdownStartupSequence();
          } else if (el.id === 'sponsors' || el.classList.contains('sponsors-tier-wrapper')) {
            this.animateSponsorCards();
          } else if (el.id === 'branches' || el.classList.contains('crt-monitors-grid')) {
            this.triggerBranchCardsReveal();
          }
        }
      });
    };

    const observer = new IntersectionObserver(onIntersect, observerOptions);

    const elementsToObserve = document.querySelectorAll(`
      .bureau-section,
      .case-notes-grid,
      .crt-monitors-grid,
      .film-strip-track,
      .overclock-crucible-chamber,
      .requisition-paper-sheet,
      .sponsors-tier-wrapper,
      .case-files-accordion,
      .filing-cabinet-footer
    `);

    elementsToObserve.forEach(el => observer.observe(el));

    // Desktop pointer 3D tilt interactions
    if (!prefersReducedMotion) {
      this.setup3DPointerTilts();
    }
  }

  triggerBranchCardsReveal() {
    const branchCards = document.querySelectorAll('.crt-monitor-card');
    branchCards.forEach(card => card.classList.add('revealed'));
  }

  triggerCountdownStartupSequence() {
    if (this.countdownStarted) return;
    this.countdownStarted = true;

    const pills = document.querySelectorAll('.stage-dial-pill');
    pills.forEach((pill, idx) => {
      setTimeout(() => {
        pill.classList.add('startup-pulse');
        this.playRelayClick(880 + idx * 120);
      }, idx * 100 + 150);
    });
  }

  setup3DPointerTilts() {
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    // Memo Dossier Cards
    const memoCards = document.querySelectorAll('.case-note-card');
    memoCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotX = -y * 5;
        const rotY = x * 5;
        if (this.spatialController) {
          this.spatialController.setPointerTilt(card, rotX, rotY);
        }
      });

      card.addEventListener('mouseleave', () => {
        if (this.spatialController) {
          this.spatialController.clearPointerTilt(card);
        }
      });
    });

    // CRT Monitor Cards
    const crtCards = document.querySelectorAll('.crt-monitor-card');
    crtCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotX = -y * 4;
        const rotY = x * 4;
        if (this.spatialController) {
          this.spatialController.setPointerTilt(card, rotX, rotY);
        }
      });

      card.addEventListener('mouseleave', () => {
        if (this.spatialController) {
          this.spatialController.clearPointerTilt(card);
        }
      });
    });
  }

  /* ==========================================================
     5. TVA REGISTER NOW CALL TO ACTION INITIALIZER
     Handles central config, disabled states, accessibility,
     and seamless connection to official Unstop URL.
  ========================================================== */
  setupRegistrationCTA() {
    const config = window.OVERCLOCK_CONFIG || {};
    const url = config.registrationUrl;
    const ctaBlocks = document.querySelectorAll('[data-registration-component]');

    ctaBlocks.forEach(block => {
      const btn = block.querySelector('.btn-registration-cta');
      const statusText = block.querySelector('.registration-status-text');
      const lamp = block.querySelector('.status-lamp-mini');

      if (!btn) return;

      if (!url) {
        // Disabled pending state: accessible, styled, non-interactive
        btn.setAttribute('disabled', 'true');
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('is-pending');
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
        };
        if (statusText) {
          statusText.textContent = config.registrationPendingStatus || 'REGISTRATION PORTAL // LINK PENDING';
        }
        if (lamp) {
          lamp.classList.remove('live');
          lamp.classList.add('pending');
        }
      } else {
        // Active registration link
        btn.removeAttribute('disabled');
        btn.setAttribute('aria-disabled', 'false');
        btn.classList.remove('is-pending');
        btn.onclick = () => {
          window.open(url, '_blank', 'noopener,noreferrer');
        };
        if (statusText) {
          statusText.textContent = config.registrationLiveStatus || 'REGISTRATION PORTAL // OFFICIAL UNSTOP LIVE';
        }
        if (lamp) {
          lamp.classList.remove('pending');
          lamp.classList.add('live');
        }
      }
    });
  }

  /* ==========================================================
     6. FOOTER CREW ROSTER INITIALIZER
     Populates crew roles and sample-name placeholders from config.
  ========================================================== */
  setupFooterCrew() {
    const rosterContainer = document.getElementById('footer-crew-roster');
    if (!rosterContainer || !Array.isArray(window.OVERCLOCK_CREW)) return;

    rosterContainer.innerHTML = '';
    window.OVERCLOCK_CREW.forEach(member => {
      const card = document.createElement('div');
      card.className = 'crew-roster-card';
      card.innerHTML = `
        <div class="crew-role">${member.role}</div>
        <div class="crew-name">${member.name}</div>
        <div class="crew-phone">
          <a href="${member.tel}" class="crew-phone-link" aria-label="Call ${member.name} at ${member.phone}">
            <span class="crew-phone-icon" aria-hidden="true">☎</span>
            <span class="crew-phone-number">${member.phone}</span>
          </a>
        </div>
      `;
      rosterContainer.appendChild(card);
    });
  }

  /* ==========================================================
     6. SPONSORS ("AUTHORIZED PARTNERS") SECTION
  ========================================================== */
  setupSponsorsSection() {
    const container = document.getElementById('sponsors-tier-container');
    const contactBtn = document.getElementById('sponsor-contact-btn');
    const brochureBtn = document.getElementById('sponsor-brochure-btn');

    if (!container || typeof window.getSponsorsData !== 'function') return;

    const sponsors = window.getSponsorsData();
    const config = window.SPONSORS_CONFIG || {};

    // Setup action buttons
    if (contactBtn && config.sponsorContactEmail) {
      contactBtn.href = config.sponsorContactEmail;
    }
    if (brochureBtn) {
      if (config.brochureUrl) {
        brochureBtn.href = config.brochureUrl;
        brochureBtn.style.display = 'inline-flex';
      } else {
        brochureBtn.style.display = 'none';
      }
    }

    // Group sponsors by tiers
    container.innerHTML = '';
    const tiers = config.tiers || [];

    tiers.forEach(tierDef => {
      const tierSponsors = sponsors.filter(s => s.tier === tierDef.id);
      
      // Automatic rule: hide tier if 0 sponsors
      if (tierSponsors.length === 0) return;

      const groupEl = document.createElement('div');
      groupEl.className = 'tier-section-group';

      // Tier Divider Label
      const labelEl = document.createElement('div');
      labelEl.className = 'tier-divider-label';
      labelEl.textContent = tierDef.title;
      groupEl.appendChild(labelEl);

      // Grid Container based on Tier
      const gridEl = document.createElement('div');
      if (tierDef.id === 'TITLE') {
        gridEl.className = 'tier-title-container';
      } else if (tierDef.id === 'GOLD') {
        gridEl.className = 'tier-gold-grid';
      } else {
        gridEl.className = 'tier-silver-grid';
      }

      tierSponsors.forEach((sponsor, sIdx) => {
        const card = document.createElement('a');
        card.href = sponsor.url || '#';
        card.target = sponsor.url && sponsor.url !== '#' ? '_blank' : '_self';
        card.rel = 'noopener noreferrer';
        card.className = `auth-clearance-card ${tierDef.cardClass}`;
        card.dataset.sponsorIndex = sIdx;

        // Pushpin
        const pushpin = document.createElement('div');
        pushpin.className = 'card-pushpin-head';
        card.appendChild(pushpin);

        // Auth Clearance No
        const authNum = document.createElement('div');
        authNum.className = 'card-auth-number';
        authNum.textContent = `AUTH. NO. ${sponsor.id}`;
        card.appendChild(authNum);

        // Logo Container
        const logoBox = document.createElement('div');
        logoBox.className = 'card-logo-container';
        if (sponsor.logo) {
          const img = document.createElement('img');
          img.src = sponsor.logo;
          img.alt = `${sponsor.name} Logo`;
          img.style.maxHeight = '80%';
          img.style.maxWidth = '80%';
          img.style.objectFit = 'contain';
          logoBox.appendChild(img);
        } else {
          const placeholder = document.createElement('span');
          placeholder.className = 'card-logo-placeholder-text';
          placeholder.textContent = 'LOGO';
          logoBox.appendChild(placeholder);
        }
        card.appendChild(logoBox);

        // Sponsor Name
        const nameEl = document.createElement('div');
        nameEl.className = 'card-sponsor-name';
        nameEl.textContent = sponsor.name;
        card.appendChild(nameEl);

        // Tier Stamp Badge
        const tierBadge = document.createElement('div');
        tierBadge.className = `card-tier-stamp ${tierDef.badgeClass}`;
        tierBadge.textContent = tierDef.stampText;
        card.appendChild(tierBadge);

        // Approved Stamp Watermark
        const stampWatermark = document.createElement('div');
        stampWatermark.className = 'card-approved-stamp';
        stampWatermark.textContent = 'APPROVED';
        card.appendChild(stampWatermark);

        gridEl.appendChild(card);
      });

      groupEl.appendChild(gridEl);
      container.appendChild(groupEl);
    });

    if (this.spatialController) {
      this.spatialController.cacheSponsorCards();
    }
  }


  animateSponsorCards() {
    if (this.sponsorsStamped) return;
    this.sponsorsStamped = true;

    const cards = document.querySelectorAll('.auth-clearance-card');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      cards.forEach(c => {
        c.style.opacity = '1';
        c.style.transform = 'none';
        c.classList.add('revealed');
      });
      return;
    }

    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'opacity 0.35s ease';
        card.style.opacity = '1';
        card.classList.add('scan-active');
        card.classList.add('revealed');
        if (index < 3) this.playStampThunk();
      }, index * 95);
    });
  }

  /* ==========================================================
     7. FAQ MANILA FOLDER TYPEWRITER EXPANSION
  ========================================================== */
  setupFAQ() {
    const folders = document.querySelectorAll('.case-folder-unit');
    folders.forEach(folder => {
      const bar = folder.querySelector('.folder-tab-bar');
      if (!bar) return;

      bar.addEventListener('click', () => {
        const wasOpen = folder.classList.contains('open');
        folders.forEach(f => {
          f.classList.remove('open');
          const indicator = f.querySelector('.folder-tab-bar span:last-child');
          if (indicator) indicator.textContent = '[EXPAND]';
        });
        if (!wasOpen) {
          folder.classList.add('open');
          const indicator = folder.querySelector('.folder-tab-bar span:last-child');
          if (indicator) indicator.textContent = '[OPEN]';
          this.playRelayClick(950);
        }
      });
    });
  }


  /* ==========================================================
     9. "OPEN A CASE FILE" MODAL
  ========================================================== */
  setupModals() {
    const modal = document.getElementById('case-file-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const triggers = document.querySelectorAll('.open-case-file-trigger');
    const form = document.getElementById('case-intake-form');

    if (!modal) return;

    const openModal = (e) => {
      if (e) {
        e.preventDefault();
      }
      const drawer = document.getElementById('mobile-nav-drawer');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        if (toggleBtn) {
          toggleBtn.classList.remove('active');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
      }
      if (window.tvaInspectionGame) {
        this.playRelayClick(1100);
        window.tvaInspectionGame.open();
      } else {
        modal.classList.add('open');
        this.playRelayClick(1100);
      }
    };

    const closeModal = () => {
      modal.classList.remove('open');
    };

    triggers.forEach(t => t.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.textContent = 'LOGGED TO ARCHIVE ✓';
          submitBtn.style.background = '#7CFF9B';
          submitBtn.style.color = '#14100C';
        }
        this.playStampThunk();
        setTimeout(() => {
          closeModal();
          if (submitBtn) {
            submitBtn.textContent = 'Submit to Bureau Archive';
            submitBtn.style.background = '';
            submitBtn.style.color = '';
            form.reset();
          }
        }, 1200);
      });
    }
  }

  /* ==========================================================
     10. MOBILE NAVIGATION DRAWER
  ========================================================== */
  setupMobileNav() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');
    const closeBtn = document.getElementById('mobile-nav-close');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const navLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !drawer) return;

    const openDrawer = () => {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      this.playRelayClick(950);
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeDrawer();
        this.playRelayClick(600);
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            closeDrawer();
            this.playRelayClick(800);
            target.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          closeDrawer();
          this.playRelayClick(800);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  /* ==========================================================
     11. MISS MINUTES ANIMATED MASCOT OVERLAY
     Continuously loops Miss Minutes, dynamically tracking and
     concealing the background Gemini AI watermark across viewports.
  ========================================================== */
  setupMissMinutesOverlay() {
    const overlay = document.getElementById('miss-minutes-overlay');
    const video = document.getElementById('miss-minutes-video');
    if (!overlay || !video) return;

    // Calibrate overlay position to precisely track the Gemini logo on #circuit-canvas
    const updatePosition = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const imgAspect = 1280 / 720;
      const winAspect = winW / winH;

      let drawW, drawH, drawX, drawY;
      if (winAspect > imgAspect) {
        drawW = winW;
        drawH = winW / imgAspect;
        drawX = 0;
        drawY = (winH - drawH) / 2;
      } else {
        drawH = winH;
        drawW = winH * imgAspect;
        drawX = (winW - drawW) / 2;
        drawY = 0;
      }

      // Gemini watermark coordinates in 1280x720 source frame:
      // Center: (1159.4, 599.5), Native width/height: ~48px
      const geminiX = drawX + drawW * (1159.4 / 1280);
      const geminiY = drawY + drawH * (599.5 / 720);
      const geminiSize = drawH * (48 / 720);

      // Miss Minutes clock face diameter is ~63% of our 720x720 square crop.
      // Her solid clock face center is offset by dx=+8.2px, dy=-11.0px from the 720x720 center.
      // Scaling overlay to ~2.4x of the Gemini star size ensures her solid, 100% opaque
      // clock body completely and seamlessly covers the entire Gemini watermark across all dance frames.
      const overlaySize = Math.max(Math.round(geminiSize * 2.4), 84);

      // Align her clock face center precisely with the Gemini logo center
      const offsetX = Math.round(overlaySize * (368.2 / 720 - 0.5));
      const offsetY = Math.round(overlaySize * (349.0 / 720 - 0.5));

      // Recalculate positioning: verify if the target watermark area is inside current viewport
      const isWatermarkOnScreen = (
        geminiX + overlaySize / 2 >= 0 &&
        geminiX - overlaySize / 2 <= winW &&
        geminiY + overlaySize / 2 >= 0 &&
        geminiY - overlaySize / 2 <= winH
      );

      if (isWatermarkOnScreen) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.style.left = `${Math.round(geminiX - offsetX)}px`;
        overlay.style.top = `${Math.round(geminiY - offsetY)}px`;
        overlay.style.width = `${overlaySize}px`;
        overlay.style.height = `${overlaySize}px`;
      } else {
        // Fallback for portrait mobile: keep Miss Minutes visible and accessible at bottom-right
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.style.left = `${winW - 55}px`;
        overlay.style.top = `${winH - 65}px`;
        overlay.style.width = '84px';
        overlay.style.height = '84px';
      }
    };

    // Make Miss Minutes interactive — opens the TVA Inspection Terminal
    const openTerminal = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (window.tvaInspectionGame) {
        window.tvaInspectionGame.open();
      }
    };

    overlay.addEventListener('click', openTerminal);
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        openTerminal(e);
      }
    });

    updatePosition();
    window.addEventListener('resize', updatePosition, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(updatePosition, 100);
    }, { passive: true });

    // Handle reduced motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.playbackRate = 0.6;
    }

    // Video playback management - ensure continuous uninterrupted looping
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const playVideo = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // If browser policy prevents autoplay, resume on first user interaction
          const resumeOnAction = () => {
            video.play().catch(() => {});
            ['click', 'scroll', 'keydown', 'touchstart'].forEach(evt => {
              window.removeEventListener(evt, resumeOnAction);
            });
          };
          ['click', 'scroll', 'keydown', 'touchstart'].forEach(evt => {
            window.addEventListener(evt, resumeOnAction, { once: true, passive: true });
          });
        });
      }
    };

    // Ensure it keeps playing persistently
    video.addEventListener('pause', () => {
      if (!document.hidden) {
        playVideo();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        playVideo();
      }
    });

    playVideo();
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.overclockApp = new OverclockApp();
});
