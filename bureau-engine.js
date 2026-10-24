/**
 * OVERCLOCK 2027 — SCROLL-DRIVEN FRAME SEQUENCE BACKGROUND ENGINE
 * FCRIT × IEEE Student Branch
 * 
 * High-performance, scroll-driven frame-by-frame animation pipeline.
 * - Scrubs smoothly forward and backward through 50 frames (/images/ezgif-frame-001.jpg .. 050.jpg).
 * - Fully preserves native 1280x720 clarity with responsive high-DPI (Retina) cover scaling.
 * - Asynchronous preloading and GPU pre-decoding (img.decode) to eliminate main-thread jank.
 * - Decoupled requestAnimationFrame vsync render loop with inertia/lerp smoothing.
 * - Sub-frame temporal crossfade between adjacent frames for zero-stutter cinematic playback.
 * - Failsafe fallback ensuring zero blank frames, visual tearing, or rendering glitches.
 */

class BureauScrollSequenceEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`[ScrollSequenceEngine] Canvas #${canvasId} not found.`);
      return;
    }

    this.ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });

    this.frameCount = 50;
    this.frames = new Array(this.frameCount).fill(null);
    this.framesLoaded = new Array(this.frameCount).fill(false);
    this.loadedCount = 0;
    this.hasDrawnFirstFrame = false;

    // Viewport & Scaling
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    // Scroll mapping
    this.scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    this.maxScroll = 1;
    this.targetProgress = 0;
    this.currentProgress = 0;
    this.lastRenderedProgress = -1;

    // Animation physics
    // Lerp factor: 0.18 gives responsive immediate feedback with silky inertia
    this.lerpFactor = 0.18;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.prefersReducedMotion) {
      this.lerpFactor = 1.0;
    }

    // Lifecycle
    this.isTicking = false;
    this.init();
  }

  getFrameUrl(index) {
    const frameNum = String(index + 1).padStart(3, '0');
    return `images/ezgif-frame-${frameNum}.jpg`;
  }

  init() {
    this.updateDimensions();
    this.calculateScrollProgress();

    // Event listeners
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => this.onResize(), { passive: true });

    // Also track orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.onResize(), 100);
    }, { passive: true });

    // Begin preload pipeline
    this.preloadFrames();

    // Start render loop
    this.startLoop();
  }

  updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = this.width <= 768 ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2.5);

    const targetWidth = Math.round(this.width * this.dpr);
    const targetHeight = Math.round(this.height * this.dpr);

    if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
      this.canvas.width = targetWidth;
      this.canvas.height = targetHeight;
      this.lastRenderedProgress = -1;
    }

    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    // Maximum scroll calculation
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    this.maxScroll = Math.max(docHeight - this.height, 1);
  }

  onResize() {
    this.updateDimensions();
    this.calculateScrollProgress();
    this.lastRenderedProgress = -1; // Force immediate redraw
    this.renderFrame();
    this.requestTick();
  }

  onScroll() {
    this.calculateScrollProgress();
    this.requestTick();
  }

  calculateScrollProgress() {
    this.scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const progress = this.scrollY / this.maxScroll;
    this.targetProgress = Math.min(Math.max(progress, 0), 1);
  }

  preloadFrames() {
    // 1. High-priority load for Frame 1 (Index 0) to ensure immediate visual render
    const initialImg = new Image();
    initialImg.src = this.getFrameUrl(0);

    const onInitialReady = () => {
      this.frames[0] = initialImg;
      this.framesLoaded[0] = true;
      this.loadedCount++;
      this.lastRenderedProgress = -1;
      this.renderFrame();
      this.hasDrawnFirstFrame = true;
    };

    if (initialImg.complete && initialImg.naturalWidth > 0) {
      onInitialReady();
    } else if ('decode' in initialImg) {
      initialImg.decode().then(onInitialReady).catch(() => {
        initialImg.onload = onInitialReady;
      });
    } else {
      initialImg.onload = onInitialReady;
    }

    // 2. Concurrently load all remaining frames in the background
    for (let i = 1; i < this.frameCount; i++) {
      const idx = i;
      const img = new Image();
      img.src = this.getFrameUrl(idx);

      const onFrameReady = () => {
        this.frames[idx] = img;
        this.framesLoaded[idx] = true;
        this.loadedCount++;
        // If current position requires this frame, request tick
        const rawIndex = this.currentProgress * (this.frameCount - 1);
        if (Math.abs(rawIndex - idx) <= 1.5) {
          this.requestTick();
        }
      };

      if ('decode' in img) {
        img.decode().then(onFrameReady).catch(() => {
          img.onload = onFrameReady;
        });
      } else {
        img.onload = onFrameReady;
      }
    }
  }

  getReadyFrame(idealIndex) {
    idealIndex = Math.min(Math.max(idealIndex, 0), this.frameCount - 1);
    if (this.framesLoaded[idealIndex] && this.frames[idealIndex]) {
      return this.frames[idealIndex];
    }

    // Nearest-neighbor fallback search to prevent blank frames or tearing
    for (let offset = 1; offset < this.frameCount; offset++) {
      const left = idealIndex - offset;
      if (left >= 0 && this.framesLoaded[left] && this.frames[left]) {
        return this.frames[left];
      }
      const right = idealIndex + offset;
      if (right < this.frameCount && this.framesLoaded[right] && this.frames[right]) {
        return this.frames[right];
      }
    }

    return null;
  }

  drawCover(img, alpha = 1.0) {
    if (!img) return;

    const ctx = this.ctx;
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const naturalW = img.naturalWidth || 1280;
    const naturalH = img.naturalHeight || 720;

    const imageAspect = naturalW / naturalH;
    const canvasAspect = canvasW / canvasH;

    let drawW, drawH, drawX, drawY;

    // Preserve exact aspect ratio without distortion or downscaling compression
    if (canvasAspect >= 1.0) {
      // Desktop / Landscape: Preserve full widescreen cover framing
      if (canvasAspect > imageAspect) {
        drawW = canvasW;
        drawH = canvasW / imageAspect;
        drawX = 0;
        drawY = (canvasH - drawH) / 2;
      } else {
        drawH = canvasH;
        drawW = canvasH * imageAspect;
        drawX = (canvasW - drawW) / 2;
        drawY = 0;
      }
    } else {
      // Mobile / Portrait: Scale and position to ensure the cinematic amber-and-gold
      // ribbon is immediately visible spanning the hero area directly beneath the header.
      // Sized to ensure 100% viewport coverage with zero top or bottom gaps across all phones.
      const scale = 1.55;
      drawH = Math.round(canvasH * scale);
      drawW = Math.round(drawH * imageAspect);

      // Smooth focal transition:
      // At progress = 0 (hero): align amber ribbon with hero title/subtitle
      // As scroll advances (timeline/content): smoothly center the explosion
      const heroWeight = Math.max(0, 1 - (this.currentProgress / 0.20));
      const easeWeight = heroWeight * heroWeight * (3 - 2 * heroWeight); // smoothstep

      drawX = Math.round((canvasW - drawW) / 2 + (canvasW * 0.65 * easeWeight));
      drawY = Math.round((canvasH - drawH) / 2 - (canvasH * 0.26 * easeWeight));
    }

    // High clarity rendering settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    ctx.globalAlpha = Math.min(Math.max(alpha, 0), 1);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  renderFrame() {
    const rawIndex = this.currentProgress * (this.frameCount - 1);
    const baseIndex = Math.floor(rawIndex);
    const nextIndex = Math.min(baseIndex + 1, this.frameCount - 1);
    const subFrame = rawIndex - baseIndex;

    const baseFrame = this.getReadyFrame(baseIndex);
    const nextFrame = this.getReadyFrame(nextIndex);

    if (!baseFrame && !nextFrame) return;

    // 1. Draw base frame
    if (baseFrame) {
      this.drawCover(baseFrame, 1.0);
    } else if (nextFrame) {
      this.drawCover(nextFrame, 1.0);
    }

    // 2. Sub-frame temporal crossfade between adjacent frames
    // Creates continuous 60fps/120fps motion blur blending without stepping stutter
    if (nextFrame && nextFrame !== baseFrame && subFrame > 0.005) {
      this.drawCover(nextFrame, subFrame);
    }

    this.lastRenderedProgress = this.currentProgress;
    this.hasDrawnFirstFrame = true;
  }

  startLoop() {
    const tick = () => {
      const delta = this.targetProgress - this.currentProgress;

      if (Math.abs(delta) > 0.0001) {
        this.currentProgress += delta * this.lerpFactor;
        this.renderFrame();
      } else if (this.currentProgress !== this.targetProgress || this.lastRenderedProgress !== this.currentProgress || !this.hasDrawnFirstFrame) {
        this.currentProgress = this.targetProgress;
        this.renderFrame();
      }

      // Check if docHeight changed dynamically (e.g. FAQ opened or sponsors loaded)
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const expectedMaxScroll = Math.max(docHeight - this.height, 1);
      if (Math.abs(this.maxScroll - expectedMaxScroll) > 10) {
        this.maxScroll = expectedMaxScroll;
        this.calculateScrollProgress();
      }

      // Keep running rAF loop for responsive scrolling
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  requestTick() {
    // When scroll or resize occurs, ensure targetProgress is updated
    this.calculateScrollProgress();
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.bureauEngine = new BureauScrollSequenceEngine('circuit-canvas');
});

// Fallback in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (!window.bureauEngine) {
    window.bureauEngine = new BureauScrollSequenceEngine('circuit-canvas');
  }
}
