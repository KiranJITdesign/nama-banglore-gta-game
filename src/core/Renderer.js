import * as THREE from 'three';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.quality = 'high';

    this.threeRenderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      depth: true,
      stencil: false
    });

    this.threeRenderer.outputColorSpace = THREE.SRGBColorSpace;
    this.threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.threeRenderer.toneMappingExposure = 1.08;

    // Shadows
    this.threeRenderer.shadowMap.enabled = true;
    this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.updateSize();
    window.addEventListener('resize', () => this.updateSize());
  }

  updateSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = this.getQualityPixelRatio();

    this.threeRenderer.setPixelRatio(pixelRatio);
    this.threeRenderer.setSize(width, height, false);
  }

  getQualityPixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    switch (this.quality) {
      case 'low': return Math.min(1.0, dpr * 0.75);
      case 'medium': return Math.min(1.25, dpr);
      case 'high': return Math.min(1.75, dpr);
      case 'ultra': return Math.min(2.0, dpr);
      default: return Math.min(1.5, dpr);
    }
  }

  setQuality(quality) {
    this.quality = quality;
    if (quality === 'low') {
      this.threeRenderer.shadowMap.enabled = false;
    } else {
      this.threeRenderer.shadowMap.enabled = true;
      this.threeRenderer.shadowMap.type = quality === 'ultra' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    }
    this.updateSize();
  }

  getAspect() {
    return window.innerWidth / window.innerHeight;
  }

  render(scene, camera) {
    this.threeRenderer.render(scene, camera);
  }
}

