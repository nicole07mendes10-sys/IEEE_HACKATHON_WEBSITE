/**
 * OVERCLOCK 2027 — TVA TEMPORAL ENTRY
 * Cinematic, Immersive 3D Intro Animation
 * 
 * Concept: Marvel TVA-inspired temporal facility entry portal.
 * Technology: Three.js WebGL procedural geometry, custom lighting,
 * particle vortex system, volumetric rays, and Web Audio synthesis.
 */

class TVATemporalIntroController {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.portalGroup = null;
    this.rings = [];
    this.particles = null;
    this.particleData = [];
    this.coreMesh = null;
    this.coronaMesh = null;
    this.electricStrands = [];
    this.volumetricCones = [];
    this.leftBanner = null;
    this.rightBanner = null;
    this.pointLight = null;
    this.keyLight = null;
    this.ambientLight = null;

    this.animFrameId = null;
    this.startTime = null;
    this.duration = 8800; // ~8.8 seconds total
    this.isPlaying = false;
    this.isAudioMuted = false;
    this.audioCtx = null;
    this.audioDrone = null;
    this.audioGain = null;
    this.hasBoundControls = false;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.hasFinished = false;
    this.hasTriggeredWarpAudio = false;
    this.hasTriggeredRevealAudio = false;

    // Attach global replay delegate immediately so replay button works even if initial load bypassed intro
    this.bindGlobalReplayDelegate();

    this.init();
  }

  /* ----------------------------------------------------------
     1. INITIALIZATION & ACCESSIBILITY CHECKS
  ---------------------------------------------------------- */
  bindGlobalReplayDelegate() {
    document.addEventListener('click', (e) => {
      const replayBtn = e.target.closest('#btn-replay-intro, .btn-replay-intro, [data-action="replay-intro"]');
      if (replayBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.replay();
      }
    });
  }

  resetScrollToTop() {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }

  async init() {
    this.resetScrollToTop();
    // Check Reduced Motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const urlParams = new URLSearchParams(window.location.search);
    const forceReplay = urlParams.get('intro') === 'replay' || urlParams.get('replay') === '1';
    const noIntro = urlParams.has('nointro') || urlParams.has('noboot');
    const alreadyPlayed = sessionStorage.getItem('oc2027_temporal_intro_played') === 'true';

    this.container = document.getElementById('tva-temporal-intro');
    if (!this.container) return;

    if (noIntro || (alreadyPlayed && !forceReplay) || prefersReducedMotion) {
      this.bypassIntroImmediate();
      return;
    }

    // Load Three.js dynamically
    const threeLoaded = await this.ensureThreeJS();
    if (!threeLoaded) {
      console.warn('[TVA Intro] Three.js not available; using fast fallback transition.');
      this.fastFallbackSequence();
      return;
    }

    this.setupDOMControls();
    this.build3DScene();
    this.bindEvents();
    this.startSequence();
  }

  async ensureThreeJS() {
    if (window.THREE) return true;
    try {
      const module = await import('./node_modules/three/build/three.module.js');
      window.THREE = module;
      return true;
    } catch (err) {
      // CDN Fallback
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => resolve(!!window.THREE);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    }
  }

  /* ----------------------------------------------------------
     2. DOM CONTROLS & EVENT BINDINGS
  ---------------------------------------------------------- */
  setupDOMControls() {
    if (this.hasBoundControls) return;
    this.hasBoundControls = true;

    const audioBtn = document.getElementById('tva-intro-audio-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => this.toggleAudio());
    }

    // Mouse parallax listener
    this.mouseHandler = (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', this.mouseHandler, { passive: true });

    // Window resize
    this.resizeHandler = () => this.onResize();
    window.addEventListener('resize', this.resizeHandler);
  }

  bindEvents() {
    // Touch interaction for mobile gyro/drag
    this.container.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     3. BUILD 3D TIME PORTAL SCENE (THREE.JS)
  ---------------------------------------------------------- */
  build3DScene() {
    const THREE = window.THREE;
    this.canvas = document.getElementById('tva-intro-canvas');
    if (!this.canvas) return;

    // Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070503, 0.038);

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(46, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 16.5);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // Lighting (Warm amber, fiery orange, bronze metallic highlights)
    this.ambientLight = new THREE.AmbientLight(0x28190e, 0.5);
    this.scene.add(this.ambientLight);

    // PointLight at the singularity core
    this.pointLight = new THREE.PointLight(0xff6600, 0.1, 35, 1.8);
    this.pointLight.position.set(0, 0, 0);
    this.scene.add(this.pointLight);

    // Key Directional Light for metallic surface sheen
    this.keyLight = new THREE.DirectionalLight(0xffd799, 1.8);
    this.keyLight.position.set(6, 9, 12);
    this.scene.add(this.keyLight);

    // Cyan/Teal Edge Counter-Light (creates cinematic contrast against dark charcoal)
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.55);
    rimLight.position.set(-8, -6, -4);
    this.scene.add(rimLight);

    // Portal Master Group
    this.portalGroup = new THREE.Group();
    this.scene.add(this.portalGroup);

    // --- A. Concentric Metallic Portal Rings ---
    this.createPortalRings(THREE);

    // --- B. Glowing Singularity Core & Plasma Spheres ---
    this.createCoreSingularity(THREE);

    // --- C. Branching Electric Temporal Strands ---
    this.createElectricStrands(THREE);

    // --- D. Volumetric Light Rays ---
    this.createVolumetricRays(THREE);

    // --- E. Flanking TVA Timeline Banners ---
    this.createTVABanners(THREE);

    // --- F. 1,600 Swirling Timeline Particles ---
    this.createParticleVortex(THREE);
  }

  createPortalRings(THREE) {
    // Ring 1: Outer Heavy Industrial Ring
    const outerGeo = new THREE.TorusGeometry(5.2, 0.22, 28, 120);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x1a120b,
      metalness: 0.94,
      roughness: 0.26,
      emissive: 0x331604,
      emissiveIntensity: 0.2
    });
    const outerRing = new THREE.Mesh(outerGeo, outerMat);
    this.portalGroup.add(outerRing);

    // Add 24 Mechanical Chrono-Lugs on outer ring
    const lugGeo = new THREE.BoxGeometry(0.18, 0.45, 0.35);
    const lugMat = new THREE.MeshStandardMaterial({ color: 0x4a3219, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const lug = new THREE.Mesh(lugGeo, lugMat);
      lug.position.set(Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0);
      lug.rotation.z = angle + Math.PI / 2;
      outerRing.add(lug);
    }
    this.rings.push({ mesh: outerRing, rotSpeedZ: 0.003, rotSpeedY: 0.001 });

    // Ring 2: Chrono Glyph Coordinate Ring (Hourglass Inscriptions)
    const midGeo1 = new THREE.TorusGeometry(4.0, 0.16, 24, 96);
    const midMat1 = new THREE.MeshStandardMaterial({
      color: 0x2b180a,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0xe8892b,
      emissiveIntensity: 0.75
    });
    const midRing1 = new THREE.Mesh(midGeo1, midMat1);
    midRing1.rotation.x = 0.08;
    this.portalGroup.add(midRing1);

    // 12 Glowing Amber Hour Markers
    const markerGeo = new THREE.BoxGeometry(0.12, 0.32, 0.22);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(Math.cos(angle) * 4.0, Math.sin(angle) * 4.0, 0.05);
      marker.rotation.z = angle;
      midRing1.add(marker);
    }
    this.rings.push({ mesh: midRing1, rotSpeedZ: -0.0055, rotSpeedX: 0.0015 });

    // Ring 3: High-Energy Plasma Conduit Ring
    const midGeo2 = new THREE.TorusGeometry(2.95, 0.11, 24, 80);
    const midMat2 = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0xff7700,
      emissiveIntensity: 2.2
    });
    const midRing2 = new THREE.Mesh(midGeo2, midMat2);
    midRing2.rotation.y = -0.1;
    this.portalGroup.add(midRing2);
    this.rings.push({ mesh: midRing2, rotSpeedZ: 0.0085, rotSpeedY: -0.002 });

    // Ring 4: Inner Aperture Shutter Ring
    const innerGeo = new THREE.TorusGeometry(1.9, 0.08, 20, 64);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffb347,
      metalness: 0.88,
      roughness: 0.2,
      emissive: 0xff4400,
      emissiveIntensity: 1.5
    });
    const innerRing = new THREE.Mesh(innerGeo, innerMat);
    this.portalGroup.add(innerRing);

    // 16 Mechanical Aperture Blades
    const bladeGeo = new THREE.ConeGeometry(0.28, 0.9, 3);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x331c0a, metalness: 0.85, roughness: 0.3 });
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0);
      blade.rotation.z = angle - Math.PI / 2;
      innerRing.add(blade);
    }
    this.rings.push({ mesh: innerRing, rotSpeedZ: -0.012, rotSpeedZBase: -0.012 });
  }

  createCoreSingularity(THREE) {
    // Intense Hot Singularity Core
    const coreGeo = new THREE.SphereGeometry(0.72, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfffae6,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.coreMesh.scale.set(0.01, 0.01, 0.01);
    this.portalGroup.add(this.coreMesh);

    // Radiant Plasma Corona
    const coronaGeo = new THREE.SphereGeometry(1.28, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    this.coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    this.coronaMesh.scale.set(0.01, 0.01, 0.01);
    this.portalGroup.add(this.coronaMesh);

    // Outer Vortex Glow Shell
    const shellGeo = new THREE.SphereGeometry(1.85, 24, 24);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0xcc3300,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    this.portalGroup.add(shellMesh);
  }

  createElectricStrands(THREE) {
    // 4 Orbiting Electric Timeline Loops
    const strandMat = new THREE.LineBasicMaterial({
      color: 0xffaa33,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 4; i++) {
      const radiusX = 1.3 + i * 0.35;
      const radiusY = 0.75 + i * 0.25;
      const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusY, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(50);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, strandMat);
      line.rotation.x = Math.random() * Math.PI;
      line.rotation.y = Math.random() * Math.PI;
      this.portalGroup.add(line);
      this.electricStrands.push({
        line,
        rotX: 0.02 + i * 0.01,
        rotY: 0.03 + i * 0.015,
        rotZ: 0.015
      });
    }
  }

  createVolumetricRays(THREE) {
    // 8 Radial Light Shaft Cones
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xff9922,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < 8; i++) {
      const coneGeo = new THREE.ConeGeometry(1.2, 9.0, 16, 1, true);
      const cone = new THREE.Mesh(coneGeo, rayMat);
      cone.rotation.x = Math.PI / 2;
      cone.position.z = 4.5;
      const rayGroup = new THREE.Group();
      rayGroup.rotation.z = (i / 8) * Math.PI * 2;
      rayGroup.add(cone);
      this.portalGroup.add(rayGroup);
      this.volumetricCones.push(rayGroup);
    }
  }

  createTVABanners(THREE) {
    // Procedural TVA Canvas Banners matching uploaded poster
    const createBannerTexture = (title, subtitle, tag) => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 1024;
      const ctx = c.getContext('2d');

      // Bronze/Charcoal Gradient Background
      const grad = ctx.createLinearGradient(0, 0, 0, 1024);
      grad.addColorStop(0, '#2b1b11');
      grad.addColorStop(0.5, '#160e09');
      grad.addColorStop(1, '#0c0704');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 1024);

      // Distressed Grid Lines & Orange Borders
      ctx.strokeStyle = 'rgba(232, 137, 43, 0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 472, 984);
      ctx.strokeRect(32, 32, 448, 960);

      // TVA Bold Wordmark
      ctx.fillStyle = '#ff7700';
      ctx.font = 'bold 110px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TVA', 256, 220);

      // Hourglass Emblem
      ctx.strokeStyle = '#ffaa33';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(256, 330, 48, 0, Math.PI * 2);
      ctx.stroke();

      // Banner Text
      ctx.fillStyle = '#ffdd99';
      ctx.font = 'bold 36px sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText(title, 256, 480);

      ctx.fillStyle = '#e6cca8';
      ctx.font = '26px monospace';
      ctx.fillText(subtitle, 256, 560);

      ctx.fillStyle = '#ff9922';
      ctx.font = 'bold 30px monospace';
      ctx.fillText(tag, 256, 740);

      const tex = new THREE.CanvasTexture(c);
      return tex;
    };

    const bannerGeo = new THREE.PlaneGeometry(2.3, 8.2);
    const leftTex = createBannerTexture('FOR A BRIGHTER', 'TOMORROW', 'BUILD · FIX · BRANCH');
    const rightTex = createBannerTexture('SAME IDEAS', 'DIFFERENT TIMELINES', 'A BRIGHTER TOMORROW');

    const bannerMatLeft = new THREE.MeshStandardMaterial({
      map: leftTex,
      metalness: 0.6,
      roughness: 0.4,
      emissive: 0x442200,
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide
    });
    const bannerMatRight = new THREE.MeshStandardMaterial({
      map: rightTex,
      metalness: 0.6,
      roughness: 0.4,
      emissive: 0x442200,
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide
    });

    this.leftBanner = new THREE.Mesh(bannerGeo, bannerMatLeft);
    this.leftBanner.position.set(-8.2, 0.2, -1.8);
    this.leftBanner.rotation.y = 0.38;
    this.portalGroup.add(this.leftBanner);

    this.rightBanner = new THREE.Mesh(bannerGeo, bannerMatRight);
    this.rightBanner.position.set(8.2, 0.2, -1.8);
    this.rightBanner.rotation.y = -0.38;
    this.portalGroup.add(this.rightBanner);
  }

  createParticleVortex(THREE) {
    const particleCount = 1600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cAmber = new THREE.Color(0xffaa22);
    const cOrange = new THREE.Color(0xff5500);
    const cGold = new THREE.Color(0xffd700);
    const cWhite = new THREE.Color(0xffffff);

    this.particleData = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.6 + Math.pow(Math.random(), 1.6) * 7.5;
      const angle = Math.random() * Math.PI * 2;
      const z = -6.0 + Math.random() * 24.0;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;

      // Color selection based on distance
      const rColor = Math.random();
      let color;
      if (rColor < 0.4) color = cAmber;
      else if (rColor < 0.7) color = cOrange;
      else if (rColor < 0.9) color = cGold;
      else color = cWhite;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      this.particleData.push({
        radius,
        angle,
        speed: 0.008 + (1.0 / (radius + 0.5)) * 0.02,
        zSpeed: 0.02 + Math.random() * 0.04,
        z,
        baseRadius: radius
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.portalGroup.add(this.particles);
  }

  /* ----------------------------------------------------------
     4. PROCEDURAL WEB AUDIO SYNTHESIS
  ---------------------------------------------------------- */
  initAudio() {
    if (this.audioCtx || this.isAudioMuted) return;
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      this.audioCtx = new AudioCtxClass();

      // Master Gain with soft fade-in
      this.audioGain = this.audioCtx.createGain();
      this.audioGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      this.audioGain.connect(this.audioCtx.destination);

      // Warm, atmospheric dual-sine ambient drone (TVA Sub-Quantum Gateway)
      this.audioDrone = this.audioCtx.createOscillator();
      this.audioDrone.type = 'sine';
      this.audioDrone.frequency.setValueAtTime(55, this.audioCtx.currentTime);

      this.audioDroneSub = this.audioCtx.createOscillator();
      this.audioDroneSub.type = 'sine';
      this.audioDroneSub.frequency.setValueAtTime(110, this.audioCtx.currentTime);

      const subGain = this.audioCtx.createGain();
      subGain.gain.setValueAtTime(0.22, this.audioCtx.currentTime);

      // Resonant Warm Lowpass Filter (eliminates all electrical buzz)
      this.audioFilter = this.audioCtx.createBiquadFilter();
      this.audioFilter.type = 'lowpass';
      this.audioFilter.frequency.setValueAtTime(125, this.audioCtx.currentTime);
      this.audioFilter.Q.setValueAtTime(1.4, this.audioCtx.currentTime);

      this.audioDrone.connect(this.audioFilter);
      this.audioDroneSub.connect(subGain);
      subGain.connect(this.audioFilter);
      this.audioFilter.connect(this.audioGain);

      this.audioDrone.start();
      this.audioDroneSub.start();

      // Smooth cinematic fade in
      this.audioGain.gain.exponentialRampToValueAtTime(0.16, this.audioCtx.currentTime + 1.8);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  triggerAudioWarp() {
    if (!this.audioCtx || this.isAudioMuted || this.hasTriggeredWarpAudio) return;
    this.hasTriggeredWarpAudio = true;
    try {
      const now = this.audioCtx.currentTime;
      // Smooth cinematic Doppler warp
      if (this.audioFilter) {
        this.audioFilter.frequency.exponentialRampToValueAtTime(320, now + 1.2);
      }
      if (this.audioDrone) {
        this.audioDrone.frequency.exponentialRampToValueAtTime(78, now + 1.2);
      }
    } catch (e) {}
  }

  triggerAudioRevealBoom() {
    // Strict single-shot guard: prevent duplicate frame triggers
    if (!this.audioCtx || this.isAudioMuted || this.hasTriggeredRevealAudio) return;
    this.hasTriggeredRevealAudio = true;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Master Reveal Sub-mix
      const revealMaster = ctx.createGain();
      revealMaster.gain.setValueAtTime(0.22, now);
      revealMaster.connect(ctx.destination);

      // 1. TVA Bronze Chronometer Bell Chime (Pure acoustic harmonic partials)
      const bellPartials = [
        { freq: 587.33, vol: 0.12, decay: 2.0 },  // Fundamental (D5) - warm bell resonance
        { freq: 880.00, vol: 0.055, decay: 1.4 }, // Fifth overtone (A5) - crystalline overtone
        { freq: 1174.66, vol: 0.028, decay: 0.8 }, // Octave ring (D6) - golden shimmer
        { freq: 1618.00, vol: 0.014, decay: 0.45 } // Golden ratio metallic bell strike
      ];

      bellPartials.forEach(partial => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(partial.freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(partial.vol, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay);

        osc.connect(gain);
        gain.connect(revealMaster);
        osc.start(now);
        osc.stop(now + partial.decay + 0.05);
      });

      // 2. Warm Orchestral Cello/Brass Chord Swell (D-minor cinematic pad)
      const chordFrequencies = [146.83, 220.00, 329.63]; // D3, A3, E4
      chordFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle'; // Warm, non-abrasive cello/horn tone
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, now);
        filter.frequency.exponentialRampToValueAtTime(480, now + 0.4);
        filter.frequency.exponentialRampToValueAtTime(180, now + 2.2);

        const vol = 0.08 / (idx * 0.7 + 1);
        chordGain.gain.setValueAtTime(0.0001, now);
        chordGain.gain.exponentialRampToValueAtTime(vol, now + 0.12);
        chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.3);

        osc.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(revealMaster);

        osc.start(now);
        osc.stop(now + 2.4);
      });

      // 3. Deep Velvet Sub Bass Pulse (Clean 52Hz -> 32Hz cinematic gravity lock)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(52, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.exponentialRampToValueAtTime(0.13, now + 0.018);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      subOsc.connect(subGain);
      subGain.connect(revealMaster);
      subOsc.start(now);
      subOsc.stop(now + 0.65);
    } catch (e) {}
  }

  toggleAudio() {
    this.isAudioMuted = !this.isAudioMuted;
    const btn = document.getElementById('tva-intro-audio-btn');
    if (btn) btn.innerHTML = this.isAudioMuted ? '<span>🔇</span>' : '<span>🔊</span>';
    if (this.audioGain && this.audioCtx) {
      this.audioGain.gain.setValueAtTime(this.isAudioMuted ? 0.0001 : 0.22, this.audioCtx.currentTime);
    } else if (!this.isAudioMuted) {
      this.initAudio();
    }
  }

  /* ----------------------------------------------------------
     5. MAIN CINEMATIC ANIMATION LOOP & SCENE PHASING
  ---------------------------------------------------------- */
  startSequence() {
    this.isPlaying = true;
    this.hasFinished = false;
    this.startTime = performance.now();

    // Prevent body scrolling during intro
    document.documentElement.classList.add('tva-intro-active');
    document.body.classList.add('tva-intro-active');

    // Attempt subtle audio start
    const startAudioOnce = () => {
      this.initAudio();
      window.removeEventListener('click', startAudioOnce);
      window.removeEventListener('keydown', startAudioOnce);
    };
    window.addEventListener('click', startAudioOnce);
    window.addEventListener('keydown', startAudioOnce);

    this.tick(this.startTime);
  }

  tick(now) {
    if (!this.isPlaying) return;

    const elapsed = now - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1.0);

    // Update Bottom Timeline UI
    this.updateHUDProgress(progress, elapsed);

    // Smooth Mouse / Gyro Parallax with silky inertia
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    // --- SCENE 1: Darkness & Temporal Activation (0 - 2.0s) ---
    if (elapsed < 2000) {
      const p1 = elapsed / 2000;
      // Smooth cubic ease-out ignition of the core singularity
      const ease1 = 1 - Math.pow(1 - p1, 3);
      const s = 0.02 + ease1 * 0.98;
      this.coreMesh.scale.set(s, s, s);
      this.coronaMesh.scale.set(s * 0.85, s * 0.85, s * 0.85);
      this.pointLight.intensity = ease1 * 3.2;

      // Gentle continuous camera dolly
      this.camera.position.x = this.mouse.x * 0.4;
      this.camera.position.y = -this.mouse.y * 0.3;
      this.camera.position.z = 16.5 - ease1 * 0.5;

      this.setStatusText('DETECTING TEMPORAL ACTIVATION · QUANTUM ANOMALY ENGAGED');
      this.setPhaseActive(0);
    }
    // --- SCENE 2: Portal Formation (2.0s - 4.6s) ---
    else if (elapsed < 4600) {
      const p2 = (elapsed - 2000) / 2600;
      // Singularity reaches full plasma bloom with organic multi-frequency breathing
      const pulse = 1.0 + Math.sin(elapsed * 0.005) * 0.08 + Math.cos(elapsed * 0.009) * 0.04;
      this.coreMesh.scale.set(pulse, pulse, pulse);
      this.coronaMesh.scale.set(pulse * 1.25, pulse * 1.25, pulse * 1.25);
      this.pointLight.intensity = 3.2 + p2 * 4.5 + Math.sin(elapsed * 0.01) * 0.7;

      // 3D Portal slowly tilts with gentle inertial parallax
      this.portalGroup.rotation.x = this.mouse.y * 0.10 + Math.sin(elapsed * 0.001) * 0.05;
      this.portalGroup.rotation.y = this.mouse.x * 0.15 + Math.cos(elapsed * 0.001) * 0.05;

      const camZ2 = 16.0 - p2 * 1.2;
      this.camera.position.x = this.mouse.x * 0.6;
      this.camera.position.y = -this.mouse.y * 0.5;
      this.camera.position.z = camZ2;

      this.setStatusText('CONCENTRIC TIME PORTAL FORMED · FREQUENCY LOCKED');
      this.setPhaseActive(1);
    }
    // --- SCENE 3: Camera Travel & Warp Fly-Through (4.6s - 6.4s) ---
    else if (elapsed < 6400) {
      const p3 = (elapsed - 4600) / 1800;
      if (p3 < 0.04) this.triggerAudioWarp();

      // Progressive exponential acceleration forward into the core singularity
      const warpEase = Math.pow(p3, 2.4);
      this.camera.position.z = 14.8 - warpEase * 14.2; // Smooth plunge right to z ~ 0.6
      this.camera.position.x = (1 - p3) * (this.mouse.x * 0.6);
      this.camera.position.y = (1 - p3) * (-this.mouse.y * 0.5);

      // Optical acceleration flare wash: blooms as camera enters singularity throat
      const flare = document.querySelector('.tva-intro-flare-overlay');
      if (flare) {
        const flareOp = p3 > 0.58 ? Math.min(1.0, (p3 - 0.58) / 0.38) : 0;
        flare.style.opacity = flareOp.toString();
      }

      this.setStatusText('ENTERING SUB-QUANTUM TIMELINE STREAM...');
      this.setPhaseActive(2);
    }
    // --- SCENE 4: OVERCLOCK 2027 Reveal (6.4s - 8.4s) ---
    else if (elapsed < 8400) {
      const p4 = (elapsed - 6400) / 2000;
      if (p4 < 0.04) this.triggerAudioRevealBoom();

      // Seamless optical flare dissolve: smoothly dissipates from 1.0 down to 0
      const flare = document.querySelector('.tva-intro-flare-overlay');
      if (flare) {
        const flareDissolve = Math.max(0, 1.0 - p4 * 2.2);
        flare.style.opacity = flareDissolve.toString();
      }

      // Continuous cinematic camera deceleration out of warp
      const decelEase = 1 - Math.pow(1 - Math.min(p4, 1.0), 3);
      const camZ4 = 13.0 - decelEase * 1.5; // Decelerates gracefully from 13.0 to 11.5
      this.camera.position.set(this.mouse.x * 0.35, -this.mouse.y * 0.25, camZ4);
      this.camera.lookAt(0, 0, 0);

      // Portal rings aura stabilization
      const aura = 1.0 + Math.sin(p4 * Math.PI) * 0.03;
      this.portalGroup.scale.set(aura, aura, aura);

      // Activate HTML/CSS Typography Reveal Card with optical focus rack
      const revealCard = document.getElementById('tva-intro-reveal');
      if (revealCard && !revealCard.classList.contains('reveal-active')) {
        revealCard.classList.add('reveal-active');
      }

      this.setStatusText('OVERCLOCK 2027 TEMPORAL FACILITY DISCOVERED');
      this.setPhaseActive(3);
    }
    // --- SCENE 5: Smooth Homepage Cross-Dissolve Transition (8.4s+) ---
    else {
      const p5 = Math.min((elapsed - 8400) / 1000, 1.0);
      this.setPhaseActive(4);
      this.setStatusText('INITIALIZING OVERCLOCK BUREAU SYSTEMS...');

      // Gentle camera push forward into the Bureau sector
      const forwardPush = p5 * p5;
      this.camera.position.z = 11.5 - forwardPush * 2.6;
      this.camera.position.x = this.mouse.x * 0.35 * (1 - p5);
      this.camera.position.y = -this.mouse.y * 0.25 * (1 - p5);

      if (!this.hasFinished) {
        this.transitionToHomepage();
      }
    }

    // --- CONTINUOUS ROTATION OF PORTAL RINGS & STRANDS ---
    this.rings.forEach(r => {
      r.mesh.rotation.z += r.rotSpeedZ || 0.005;
      if (r.rotSpeedX) r.mesh.rotation.x += r.rotSpeedX;
      if (r.rotSpeedY) r.mesh.rotation.y += r.rotSpeedY;
    });

    this.electricStrands.forEach(s => {
      s.line.rotation.x += s.rotX;
      s.line.rotation.y += s.rotY;
      s.line.rotation.z += s.rotZ;
    });

    this.volumetricCones.forEach((vg, i) => {
      vg.rotation.z += (i % 2 === 0 ? 0.004 : -0.004);
    });

    // --- PARTICLE VORTEX ANIMATION ---
    this.updateParticles(elapsed);

    // Render WebGL
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame((t) => this.tick(t));
  }

  updateParticles(elapsed) {
    if (!this.particles) return;
    const positions = this.particles.geometry.attributes.position.array;
    
    // Smooth particle warp acceleration and deceleration
    let warpFactor = 1.0;
    if (elapsed >= 4600 && elapsed < 6400) {
      const wProg = (elapsed - 4600) / 1800;
      warpFactor = 1.0 + Math.pow(wProg, 2) * 8.5;
    } else if (elapsed >= 6400 && elapsed < 7400) {
      const dProg = 1.0 - (elapsed - 6400) / 1000;
      warpFactor = 1.0 + dProg * 4.0;
    }

    for (let i = 0; i < this.particleData.length; i++) {
      const pd = this.particleData[i];

      // Swirling angular velocity
      pd.angle += pd.speed * (warpFactor > 1.5 ? 2.2 : 1.0);
      positions[i * 3] = Math.cos(pd.angle) * pd.radius;
      positions[i * 3 + 1] = Math.sin(pd.angle) * pd.radius;

      // Z motion (vortex stream)
      pd.z -= pd.zSpeed * warpFactor;
      if (pd.z < -6.0) pd.z = 20.0;
      positions[i * 3 + 2] = pd.z;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  updateHUDProgress(progress, elapsed) {
    const fill = document.getElementById('tva-progress-fill');
    if (fill) fill.style.width = `${Math.min(progress * 100, 100).toFixed(1)}%`;
  }

  setStatusText(text) {
    const el = document.getElementById('tva-status-text');
    if (el && el.textContent !== text) {
      el.textContent = text;
    }
  }

  setPhaseActive(index) {
    const items = document.querySelectorAll('.tva-phase-item');
    items.forEach((item, i) => {
      if (i === index) item.classList.add('active');
      else item.classList.remove('active');
    });
  }

  /* ----------------------------------------------------------
     6. HOMEPAGE HANDOVER & CLEANUP
  ---------------------------------------------------------- */
  skipIntro() {
    if (this.hasFinished) return;
    this.transitionToHomepage(true);
  }

  transitionToHomepage(isInstant = false) {
    if (this.hasFinished) return;
    this.hasFinished = true;

    // Fade Audio smoothly
    if (this.audioGain && this.audioCtx) {
      try {
        this.audioGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.8);
      } catch (e) {}
    }

    // Save session flag so it only auto-plays once per visit
    sessionStorage.setItem('oc2027_temporal_intro_played', 'true');

    // Fade out 3D intro container
    if (this.container) {
      this.container.classList.add('fading-out');

      // Seamless cross-dissolve: wake up homepage hero early so as the 3D veil fades,
      // the analog clock and bureau elements are smoothly emerging into view
      setTimeout(() => {
        this.triggerMainAppLifecycle();
      }, isInstant ? 50 : 250);

      setTimeout(() => {
        this.container.classList.add('intro-complete');
        this.container.classList.remove('fading-out');

        // Restore scrolling & pointer events
        document.documentElement.classList.remove('tva-intro-active');
        document.body.classList.remove('tva-intro-active');
        this.resetScrollToTop();

        // Stop render loop once intro is completely invisible
        this.isPlaying = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }, isInstant ? 350 : 950);
    } else {
      this.resetScrollToTop();
      this.triggerMainAppLifecycle();
    }
  }

  triggerMainAppLifecycle() {
    this.resetScrollToTop();
    if (window.bureauApp && typeof window.bureauApp.triggerHeroAnimations === 'function') {
      window.bureauApp.triggerHeroAnimations();
    } else {
      const heroSec = document.getElementById('hero');
      if (heroSec) {
        heroSec.classList.add('hero-anim-active');
        heroSec.classList.add('stamped');
      }
    }
    this.resetScrollToTop();
  }

  bypassIntroImmediate() {
    this.resetScrollToTop();
    if (this.container) {
      this.container.classList.add('intro-complete');
    }
    document.documentElement.classList.remove('tva-intro-active');
    document.body.classList.remove('tva-intro-active');
    this.resetScrollToTop();
    setTimeout(() => {
      this.resetScrollToTop();
      this.triggerMainAppLifecycle();
    }, 50);
  }

  fastFallbackSequence() {
    this.resetScrollToTop();
    // If WebGL fails, fast CSS reveal
    const revealCard = document.getElementById('tva-intro-reveal');
    if (revealCard) revealCard.classList.add('reveal-active');
    setTimeout(() => this.transitionToHomepage(), 3000);
  }

  async replay() {
    this.resetScrollToTop();
    sessionStorage.removeItem('oc2027_temporal_intro_played');

    if (!this.container) {
      this.container = document.getElementById('tva-temporal-intro');
    }
    if (!this.container) return;

    this.container.classList.remove('intro-complete', 'fading-out');
    const reveal = document.getElementById('tva-intro-reveal');
    if (reveal) reveal.classList.remove('reveal-active');
    const flare = document.querySelector('.tva-intro-flare-overlay');
    if (flare) flare.style.opacity = '0';

    // Prevent body scrolling during intro replay
    document.documentElement.classList.add('tva-intro-active');
    document.body.classList.add('tva-intro-active');

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.hasFinished = false;
    this.isPlaying = false;
    this.hasTriggeredWarpAudio = false;
    this.hasTriggeredRevealAudio = false;

    // Pause homepage clock ticking while 3D intro is replaying
    if (window.bureauApp) {
      window.bureauApp.isHomepageActive = false;
    }

    // Reset HUD
    this.updateHUDProgress(0, 0);
    this.setPhaseActive(0);
    this.setStatusText('DETECTING TEMPORAL ACTIVATION · QUANTUM ANOMALY ENGAGED');

    // Reset hero section animation classes so it will animate upon finish
    const heroSec = document.getElementById('hero');
    if (heroSec) {
      heroSec.classList.remove('hero-anim-active', 'stamped', 'revealed');
    }

    // Ensure Three.js and 3D scene are built
    if (!this.scene) {
      const threeLoaded = await this.ensureThreeJS();
      if (!threeLoaded) {
        this.fastFallbackSequence();
        return;
      }
      this.setupDOMControls();
      this.build3DScene();
      this.bindEvents();
    } else {
      this.setupDOMControls();
    }

    // Reset camera & 3D objects to Scene 1 initial positions
    if (this.camera) {
      this.camera.position.set(0, 0, 16.5);
      this.camera.lookAt(0, 0, 0);
    }
    if (this.coreMesh) {
      this.coreMesh.scale.set(0.05, 0.05, 0.05);
    }
    if (this.coronaMesh) {
      this.coronaMesh.scale.set(0.04, 0.04, 0.04);
    }
    if (this.portalGroup) {
      this.portalGroup.rotation.set(0, 0, 0);
    }
    if (this.pointLight) {
      this.pointLight.intensity = 0.1;
    }

    // Immediate audio restart upon user click
    if (!this.audioCtx) {
      this.initAudio();
    } else {
      if (this.audioCtx.state === 'suspended') {
        try { this.audioCtx.resume(); } catch (e) {}
      }
      if (this.audioGain && !this.isAudioMuted) {
        try {
          this.audioGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
          this.audioGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
          this.audioGain.gain.exponentialRampToValueAtTime(0.16, this.audioCtx.currentTime + 1.8);
        } catch (e) {}
      }
      if (this.audioFilter) {
        try {
          this.audioFilter.frequency.setValueAtTime(125, this.audioCtx.currentTime);
        } catch (e) {}
      }
    }

    this.startSequence();
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Instantiate and expose globally
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.TVATemporalIntro = new TVATemporalIntroController();
  });
} else {
  window.TVATemporalIntro = new TVATemporalIntroController();
}
