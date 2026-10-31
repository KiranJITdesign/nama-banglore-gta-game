import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetManager {
  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.textureCache = new Map();
    this.materialCache = new Map();
  }

  /**
   * Load GLTF/GLB with fallback
   */
  async loadGLTF(url) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => resolve(gltf),
        undefined,
        (err) => {
          console.warn(`Could not load GLTF from ${url}, using procedural fallback.`, err);
          resolve(null);
        }
      );
    });
  }

  /**
   * Generates high-definition asphalt texture with road markings
   */
  getAsphaltTexture(type = 'lane') {
    const key = `asphalt_${type}`;
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base dark asphalt
    ctx.fillStyle = '#22252c';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle asphalt noise/grain
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Road Markings based on type
    if (type === 'avenue') {
      // Double Yellow Center Lines (Classic Indian Highway/Avenue)
      ctx.fillStyle = '#f5b000';
      ctx.fillRect(504, 0, 6, 1024);
      ctx.fillRect(514, 0, 6, 1024);

      // White Dashed Lane Dividers
      ctx.fillStyle = '#f0f0f0';
      ctx.setLineDash([64, 48]);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(256, 0);
      ctx.lineTo(256, 1024);
      ctx.moveTo(768, 0);
      ctx.lineTo(768, 1024);
      ctx.stroke();

      // White Solid Outer Edge lines
      ctx.setLineDash([]);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#e6e6e6';
      ctx.beginPath();
      ctx.moveTo(32, 0);
      ctx.lineTo(32, 1024);
      ctx.moveTo(992, 0);
      ctx.lineTo(992, 1024);
      ctx.stroke();
    } else if (type === 'crosswalk') {
      // Zebra Crossing
      ctx.fillStyle = '#e8ecf0';
      const stripeHeight = 60;
      const gap = 50;
      for (let y = 30; y < 1000; y += stripeHeight + gap) {
        ctx.fillRect(80, y, 864, stripeHeight);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Concrete sidewalk with paving slabs and expansion joints
   */
  getSidewalkTexture() {
    const key = 'sidewalk_paving';
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base concrete light grey
    ctx.fillStyle = '#b8bec8';
    ctx.fillRect(0, 0, 512, 512);

    // Noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 12;
      data[i] += n;
      data[i + 1] += n;
      data[i + 2] += n;
    }
    ctx.putImageData(imgData, 0, 0);

    // Paver grid
    ctx.strokeStyle = 'rgba(70, 75, 85, 0.45)';
    ctx.lineWidth = 3;
    const gridSize = 64;
    for (let x = 0; x <= 512; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Generates varied architectural facades (Glass tech park, commercial shopfronts)
   */
  getFacadeTexture(style = 'tech-glass') {
    const key = `facade_${style}`;
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (style === 'tech-glass') {
      // Modern Bengaluru IT Park Glass Facade
      ctx.fillStyle = '#1c2836';
      ctx.fillRect(0, 0, 512, 512);

      const rows = 8;
      const cols = 6;
      const padX = 8;
      const padY = 8;
      const w = (512 - padX * (cols + 1)) / cols;
      const h = (512 - padY * (rows + 1)) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = padX + c * (w + padX);
          const y = padY + r * (h + padY);

          // Glass gradient reflection
          const grad = ctx.createLinearGradient(x, y, x + w, y + h);
          grad.addColorStop(0, '#5fa8d3');
          grad.addColorStop(0.5, '#1b4965');
          grad.addColorStop(1, '#0e2538');

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, w, h);

          // Highlight frame
          ctx.strokeStyle = '#324a5f';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
        }
      }
    } else if (style === 'commercial-shops') {
      // Bengaluru Commercial Street / Brigade Road style
      ctx.fillStyle = '#d6ccc2';
      ctx.fillRect(0, 0, 512, 512);

      // Windows on upper floors
      ctx.fillStyle = '#2b2d42';
      for (let y = 40; y < 320; y += 70) {
        for (let x = 30; x < 480; x += 80) {
          ctx.fillRect(x, y, 50, 45);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, 50, 45);
        }
      }

      // Ground floor shop boards
      ctx.fillStyle = '#ffb800';
      ctx.fillRect(20, 380, 220, 40);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('NAMMA CAFE', 50, 406);

      ctx.fillStyle = '#d90429';
      ctx.fillRect(270, 380, 220, 40);
      ctx.fillStyle = '#fff';
      ctx.fillText('BENGALURU TECH', 290, 406);

      // Glass storefronts below
      ctx.fillStyle = '#1a2238';
      ctx.fillRect(20, 430, 220, 70);
      ctx.fillRect(270, 430, 220, 70);
    } else {
      // Residential Stucco
      ctx.fillStyle = '#ede0d4';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#7f5539';
      for (let y = 50; y < 450; y += 90) {
        for (let x = 40; x < 460; x += 90) {
          ctx.fillRect(x, y, 50, 55);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Road signage texture with Kannada and English text
   */
  getRoadSignTexture(primaryText, secondaryText = 'ಬೆಂಗಳೂರು • BENGALURU') {
    const key = `sign_${primaryText}`;
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Bengaluru green directional road sign
    ctx.fillStyle = '#0e623b';
    ctx.roundRect ? ctx.roundRect(10, 10, 492, 236, 16) : ctx.rect(10, 10, 492, 236);
    ctx.fill();

    // White border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.roundRect ? ctx.roundRect(18, 18, 476, 220, 12) : ctx.strokeRect(18, 18, 476, 220);
    ctx.stroke();

    // Primary text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(primaryText, 256, 110);

    // Secondary text
    ctx.fillStyle = '#ffdd55';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(secondaryText, 256, 165);

    const texture = new THREE.CanvasTexture(canvas);
    this.textureCache.set(key, texture);
    return texture;
  }
}

