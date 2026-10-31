/**
 * OVERCLOCK 2027 — INTERACTIVE 3D TVA CHRONO-CORE GYROSCOPE
 * High-End Forward Three.js Component inside Hero HUD Telemetry Console
 * FCRIT × EESA · ISLE · IEEE Student Branch
 */

import * as THREE from './node_modules/three/build/three.module.js';

class ChronoHolo3D {
  constructor() {
    this.canvas = document.getElementById('chrono-holo-3d');
    this.container = document.getElementById('console-holo-viewport');
    if (!this.canvas || !this.container) return;

    this.speedMult = 1.0;
    this.targetSpeedMult = 1.0;
    this.clockFrequency = 1.0;

    // Mouse & Touch Drag tracking
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.targetRotation = { x: 0.25, y: -0.35 };
    this.currentRotation = { x: 0.25, y: -0.35 };

    // Telemetry DOM elements
    this.freqVal = document.getElementById('hud-freq-val');
    this.statusVal = document.getElementById('hud-status-val');
    this.tempVal = document.getElementById('hud-temp-val');
    this.led = document.getElementById('console-led-pip');
    this.freqButtons = document.querySelectorAll('.hud-freq-btn');

    this.initScene();
    this.createGimbalRings();
    this.createCoreAndParticles();
    this.bindEvents();
    this.bindModals();
    this.animate();
  }

  initScene() {
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || 380;
    const height = rect.height || 220;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7.2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Dynamic 3D Lights
    const ambient = new THREE.AmbientLight(0xfff0dd, 0.85);
    this.scene.add(ambient);

    this.keyLight = new THREE.DirectionalLight(0xffaa44, 2.2);
    this.keyLight.position.set(5, 6, 6);
    this.scene.add(this.keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-6, -4, 4);
    this.scene.add(fillLight);

    this.coreLight = new THREE.PointLight(0xff7700, 3.5, 9);
    this.coreLight.position.set(0, 0, 0);
    this.scene.add(this.coreLight);
  }

  createGimbalRings() {
    this.gimbalGroup = new THREE.Group();
    this.scene.add(this.gimbalGroup);

    // 1. Outer Ring: Brushed TVA Brass
    const outerGeo = new THREE.TorusGeometry(2.1, 0.08, 24, 72);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0xd9a93a,
      metalness: 0.9,
      roughness: 0.22,
      emissive: 0x3d2805,
      emissiveIntensity: 0.35
    });
    this.outerRing = new THREE.Mesh(outerGeo, outerMat);
    this.gimbalGroup.add(this.outerRing);

    // Outer Ring Tick Pips
    const tickGeo = new THREE.BoxGeometry(0.06, 0.2, 0.04);
    const tickMat = new THREE.MeshStandardMaterial({ color: 0xffe680, metalness: 0.9, roughness: 0.1 });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, 0);
      tick.rotation.z = angle;
      this.outerRing.add(tick);
    }

    // 2. Middle Ring: Polished Rose Copper
    const midGeo = new THREE.TorusGeometry(1.65, 0.07, 24, 64);
    const midMat = new THREE.MeshStandardMaterial({
      color: 0xc87d55,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x3a1508,
      emissiveIntensity: 0.3
    });
    this.midRing = new THREE.Mesh(midGeo, midMat);
    this.gimbalGroup.add(this.midRing);

    // 3. Inner Ring: Dark Chrono Gunmetal
    const innerGeo = new THREE.TorusGeometry(1.22, 0.065, 20, 56);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0x111625,
      emissiveIntensity: 0.4
    });
    this.innerRing = new THREE.Mesh(innerGeo, innerMat);
    this.gimbalGroup.add(this.innerRing);
  }

  createCoreAndParticles() {
    // 4. Central Molten Plasma Core
    const coreGeo = new THREE.IcosahedronGeometry(0.55, 2);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0xff9900,
      emissive: 0xff5500,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.4,
      wireframe: false
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.gimbalGroup.add(this.coreMesh);

    // Wireframe Exo-Cage around Core
    const cageGeo = new THREE.OctahedronGeometry(0.72, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xffcc33,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    this.cageMesh = new THREE.Mesh(cageGeo, cageMat);
    this.gimbalGroup.add(this.cageMesh);

    // 5. Orbiting Tachyon Sparks (Instanced / Particle System)
    const particleCount = 130;
    const posArray = new Float32Array(particleCount * 3);
    const colArray = new Float32Array(particleCount * 3);

    const cAmber = new THREE.Color(0xffaa33);
    const cCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.8 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      posArray[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      posArray[i * 3 + 1] = radius * Math.sin(theta) * Math.cos(phi);
      posArray[i * 3 + 2] = radius * Math.sin(phi);

      const color = Math.random() > 0.3 ? cAmber : cCyan;
      colArray[i * 3] = color.r;
      colArray[i * 3 + 1] = color.g;
      colArray[i * 3 + 2] = color.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.sparks = new THREE.Points(particleGeo, particleMat);
    this.gimbalGroup.add(this.sparks);
  }

  bindEvents() {
    // Window Resize
    window.addEventListener('resize', () => this.onResize(), { passive: true });

    // Interactive Drag / Tilt Controls on Viewport
    const v = this.container;

    v.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.prevMousePos.x;
        const dy = e.clientY - this.prevMousePos.y;
        this.targetRotation.y += dx * 0.012;
        this.targetRotation.x += dy * 0.012;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      } else {
        // Subtle hover tilt
        const rect = v.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          this.targetRotation.y = nx * 0.55;
          this.targetRotation.x = -ny * 0.45;
        }
      }
    });

    // Touch Support for Mobile
    v.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - this.prevMousePos.x;
        const dy = e.touches[0].clientY - this.prevMousePos.y;
        this.targetRotation.y += dx * 0.014;
        this.targetRotation.x += dy * 0.014;
        this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    // Overclock Frequency Buttons
    this.freqButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const freq = parseFloat(btn.dataset.freq) || 1.0;
        this.setFrequency(freq);

        this.freqButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Also notify the elevated background canvas engine
        if (window.bureauEngine && typeof window.bureauEngine.setClockFrequency === 'function') {
          window.bureauEngine.setClockFrequency(freq);
        }
      });
    });
  }

  setFrequency(freq) {
    this.clockFrequency = freq;

    if (freq <= 1.2) {
      this.targetSpeedMult = 1.0;
      if (this.freqVal) this.freqVal.textContent = '1.00 GHz';
      if (this.tempVal) this.tempVal.textContent = '36°C';
      if (this.statusVal) this.statusVal.textContent = 'NOMINAL';
      if (this.led) this.led.classList.remove('overclocked');
    } else if (freq <= 3.8) {
      this.targetSpeedMult = 2.4;
      if (this.freqVal) this.freqVal.textContent = `${freq.toFixed(2)} GHz`;
      if (this.tempVal) this.tempVal.textContent = '54°C';
      if (this.statusVal) this.statusVal.textContent = 'OVERCLOCK ACTIVE';
      if (this.led) this.led.classList.remove('overclocked');
    } else if (freq <= 5.8) {
      this.targetSpeedMult = 3.6;
      if (this.freqVal) this.freqVal.textContent = `${freq.toFixed(2)} GHz`;
      if (this.tempVal) this.tempVal.textContent = '72°C';
      if (this.statusVal) this.statusVal.textContent = 'TURBO ENGAGED';
      if (this.led) this.led.classList.remove('overclocked');
    } else {
      this.targetSpeedMult = 5.2;
      if (this.freqVal) this.freqVal.textContent = '8.42 GHz';
      if (this.tempVal) this.tempVal.textContent = '98°C';
      if (this.statusVal) this.statusVal.textContent = 'TEMPORAL BREACH';
      if (this.led) this.led.classList.add('overclocked');
    }
  }

  bindModals() {
    const btnCitadel = document.getElementById('btn-portal-citadel');
    const btnDawn = document.getElementById('btn-portal-dawn');
    const modal = document.getElementById('timeline-modal');
    const modalImg = document.getElementById('timeline-modal-img');
    const modalTitle = document.getElementById('timeline-modal-title');
    const modalDesc = document.getElementById('timeline-modal-desc');
    const modalClose = document.getElementById('timeline-modal-close');

    if (!modal) return;

    const openModal = (imgSrc, title, desc) => {
      if (modalImg) modalImg.src = imgSrc;
      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    };

    if (btnCitadel) {
      btnCitadel.addEventListener('click', () => {
        openModal(
          'images/tva-citadel-poster.jpg',
          'TIMELINE 01: THE TVA CITADEL & TEMPORAL LOOM',
          'Official bureau directive. Time is a resource to be shaped by engineers who refuse temporal decay. Step into the arena, stabilize the physical feed, and wire the dawn of computing.'
        );
      });
    }

    if (btnDawn) {
      btnDawn.addEventListener('click', () => {
        openModal(
          'images/dawn-of-doom-poster.jpg',
          'TIMELINE 02: DAWN OF PHYSICAL HARDWARE',
          'A broken world rebuilt through physical circuits, embedded systems, and relentless iteration. Your mind. A breadboard. And the next beginning.'
        );
      });
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  onResize() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || 380;
    const height = rect.height || 220;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Interpolate speed multiplier
    this.speedMult += (this.targetSpeedMult - this.speedMult) * 0.08;

    // Smooth inertia rotation tracking
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.06;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.06;

    this.gimbalGroup.rotation.x = this.currentRotation.x;
    this.gimbalGroup.rotation.y = this.currentRotation.y;

    // Opposing gyroscopic rotations for the 3 rings
    const baseSpeed = 0.012 * this.speedMult;
    if (this.outerRing) {
      this.outerRing.rotation.z += baseSpeed * 0.8;
      this.outerRing.rotation.x += baseSpeed * 0.4;
    }
    if (this.midRing) {
      this.midRing.rotation.y -= baseSpeed * 1.2;
      this.midRing.rotation.z += baseSpeed * 0.6;
    }
    if (this.innerRing) {
      this.innerRing.rotation.x += baseSpeed * 1.5;
      this.innerRing.rotation.y += baseSpeed * 0.9;
    }

    // Core pulsing & rotation
    const time = performance.now() * 0.003;
    if (this.coreMesh) {
      this.coreMesh.rotation.y += baseSpeed * 2.0;
      this.coreMesh.rotation.z -= baseSpeed * 1.2;
      const pulse = 1.0 + Math.sin(time * 3 * this.speedMult) * 0.08;
      this.coreMesh.scale.set(pulse, pulse, pulse);

      // Core glow intensity reacts to overclock
      const baseEmissive = 1.4 + (this.speedMult - 1) * 0.6;
      this.coreMat.emissiveIntensity = baseEmissive + Math.sin(time * 5) * 0.3;
    }

    if (this.cageMesh) {
      this.cageMesh.rotation.x -= baseSpeed * 1.4;
      this.cageMesh.rotation.y -= baseSpeed * 1.8;
    }

    if (this.sparks) {
      this.sparks.rotation.y += baseSpeed * 1.6;
      this.sparks.rotation.z += baseSpeed * 0.7;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.chronoHolo3D = new ChronoHolo3D();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (!window.chronoHolo3D) {
    window.chronoHolo3D = new ChronoHolo3D();
  }
}
