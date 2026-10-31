import * as THREE from 'three';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.timeOfDay = 'sunset';

    // Sky Dome Mesh
    this.skyMesh = null;

    // Lights
    this.sunLight = null;
    this.ambientLight = null;
    this.hemiLight = null;

    // Streetlights registry
    this.streetLights = [];

    this.init();
  }

  init() {
    // Hemisphere Light for natural ambient bounce
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Directional Sunlight with Shadows
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    this.sunLight.castShadow = true;

    // Shadow frustum tuned for city scale
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 300;

    const shadowDistance = 60;
    this.sunLight.shadow.camera.left = -shadowDistance;
    this.sunLight.shadow.camera.right = shadowDistance;
    this.sunLight.shadow.camera.top = shadowDistance;
    this.sunLight.shadow.camera.bottom = -shadowDistance;
    this.sunLight.shadow.bias = -0.0005;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Create Sky Dome
    this.createSky();

    // Scene Fog
    this.scene.fog = new THREE.FogExp2(0x8fa3b0, 0.0045);

    // Apply initial preset
    this.setTimeOfDay('sunset');
  }

  createSky() {
    const skyGeo = new THREE.SphereGeometry(600, 32, 16);
    this.skyMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: 0x223344
    });
    this.skyMesh = new THREE.Mesh(skyGeo, this.skyMat);
    this.scene.add(this.skyMesh);
  }

  registerStreetLight(pointLight) {
    this.streetLights.push(pointLight);
    pointLight.visible = (this.timeOfDay === 'sunset' || this.timeOfDay === 'night');
  }

  setTimeOfDay(time) {
    this.timeOfDay = time;

    let skyColor, sunColor, sunIntensity, hemiSky, hemiGround, fogColor, sunPos;

    switch (time) {
      case 'morning':
        skyColor = new THREE.Color(0x8cb6d9);
        sunColor = new THREE.Color(0xffeedd);
        sunIntensity = 1.6;
        hemiSky = new THREE.Color(0xaad3df);
        hemiGround = new THREE.Color(0x55606e);
        fogColor = new THREE.Color(0x9dbbd4);
        sunPos = new THREE.Vector3(80, 50, 40);
        break;

      case 'afternoon':
        skyColor = new THREE.Color(0x5ba4e5);
        sunColor = new THREE.Color(0xffffff);
        sunIntensity = 2.0;
        hemiSky = new THREE.Color(0xddeeff);
        hemiGround = new THREE.Color(0x444444);
        fogColor = new THREE.Color(0x7caad1);
        sunPos = new THREE.Vector3(20, 100, 20);
        break;

      case 'sunset':
      default:
        // Bengaluru Daze Golden Hour
        skyColor = new THREE.Color(0xb26033);
        sunColor = new THREE.Color(0xffaa44);
        sunIntensity = 1.9;
        hemiSky = new THREE.Color(0xcc6633);
        hemiGround = new THREE.Color(0x332211);
        fogColor = new THREE.Color(0x734832);
        sunPos = new THREE.Vector3(100, 30, -70);
        break;

      case 'night':
        skyColor = new THREE.Color(0x060912);
        sunColor = new THREE.Color(0x335588);
        sunIntensity = 0.35;
        hemiSky = new THREE.Color(0x0f172a);
        hemiGround = new THREE.Color(0x05070a);
        fogColor = new THREE.Color(0x0a0e17);
        sunPos = new THREE.Vector3(40, 70, -30);
        break;
    }

    if (this.skyMat) this.skyMat.color.copy(skyColor);
    this.sunLight.color.copy(sunColor);
    this.sunLight.intensity = sunIntensity;
    this.sunLight.position.copy(sunPos);

    this.hemiLight.color.copy(hemiSky);
    this.hemiLight.groundColor.copy(hemiGround);

    if (this.scene.fog) {
      this.scene.fog.color.copy(fogColor);
      this.scene.fog.density = time === 'night' ? 0.006 : 0.0038;
    }

    // Toggle Streetlights
    const lightsOn = (time === 'sunset' || time === 'night');
    for (const light of this.streetLights) {
      light.visible = lightsOn;
      light.intensity = time === 'night' ? 2.5 : 1.2;
    }
  }

  update(playerPos) {
    if (!playerPos) return;

    // Center sky and sunlight on player to eliminate shadow clipping
    this.skyMesh.position.copy(playerPos);

    // Keep sunlight offset constant relative to player
    const offset = this.sunLight.position.clone().sub(this.sunLight.target.position);
    this.sunLight.target.position.set(playerPos.x, 0, playerPos.z);
    this.sunLight.position.set(playerPos.x + offset.x, offset.y, playerPos.z + offset.z);
  }
}

