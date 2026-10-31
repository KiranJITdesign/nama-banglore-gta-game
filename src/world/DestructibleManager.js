import * as THREE from 'three';

export class DestructibleManager {
  constructor(game) {
    this.game = game;
    this.sceneManager = game.sceneManager;
    this.audioManager = game.audioManager;

    this.group = new THREE.Group();
    this.sceneManager.addMesh(this.group);

    this.destructibles = [];

    this.init();
  }

  init() {
    // 1. Destructible Roadside Barricades along Ambedkar Road
    for (let z = -100; z <= 100; z += 40) {
      if (Math.abs(z) < 25) continue;
      this.destructibles.push(this.createBarricade(-9.8, z, 'Bengaluru Traffic Police Barricade'));
      this.destructibles.push(this.createBarricade(9.8, z, 'Bengaluru Traffic Police Barricade'));
    }

    // 2. Destructible Trash Bins on Sidewalks
    for (let z = -120; z <= 120; z += 35) {
      if (Math.abs(z) < 20) continue;
      this.destructibles.push(this.createTrashBin(13.2, z, 'Municipal Waste Bin'));
      this.destructibles.push(this.createTrashBin(-13.2, z, 'Municipal Waste Bin'));
    }

    // 3. Destructible Market Crates near Chai Stall
    this.destructibles.push(this.createMarketCrate(-12.8, -17, 'Chai Stall Fruit Crate'));
    this.destructibles.push(this.createMarketCrate(-12.8, -23, 'Tea & Coffee Supplies'));
  }

  createBarricade(x, z, name) {
    const mesh = new THREE.Group();
    mesh.position.set(x, 0.45, z);

    // Yellow & Black Striped Traffic Barricade
    const barGeo = new THREE.BoxGeometry(2.4, 0.75, 0.25);
    const barMat = new THREE.MeshStandardMaterial({ color: 0xf5b000, roughness: 0.5 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.castShadow = true;
    mesh.add(bar);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const l1 = new THREE.Mesh(legGeo, legMat);
    l1.position.set(-1.0, 0, 0);
    mesh.add(l1);
    const l2 = new THREE.Mesh(legGeo, legMat);
    l2.position.set(1.0, 0, 0);
    mesh.add(l2);

    this.group.add(mesh);

    return {
      name,
      mesh,
      radius: 1.4,
      isDestroyed: false,
      fallSpeed: 0
    };
  }

  createTrashBin(x, z, name) {
    const mesh = new THREE.Group();
    mesh.position.set(x, 0.45, z);

    const binGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.9, 12);
    const binMat = new THREE.MeshStandardMaterial({ color: 0x00a8ff, roughness: 0.4 });
    const bin = new THREE.Mesh(binGeo, binMat);
    bin.castShadow = true;
    mesh.add(bin);

    this.group.add(mesh);

    return {
      name,
      mesh,
      radius: 0.8,
      isDestroyed: false,
      fallSpeed: 0
    };
  }

  createMarketCrate(x, z, name) {
    const mesh = new THREE.Group();
    mesh.position.set(x, 0.35, z);

    const crateGeo = new THREE.BoxGeometry(0.8, 0.7, 0.8);
    const crateMat = new THREE.MeshStandardMaterial({ color: 0xcd84f1, roughness: 0.7 });
    const crate = new THREE.Mesh(crateGeo, crateMat);
    crate.castShadow = true;
    mesh.add(crate);

    this.group.add(mesh);

    return {
      name,
      mesh,
      radius: 0.75,
      isDestroyed: false,
      fallSpeed: 0
    };
  }

  update(dt, activePos, isDriving, vehicleSpeedKmh = 0) {
    if (!activePos) return;

    for (const prop of this.destructibles) {
      if (prop.isDestroyed) {
        // Animate toppled prop resting on ground
        if (prop.fallSpeed < Math.PI / 2) {
          prop.fallSpeed += 8.0 * dt;
          prop.mesh.rotation.z = Math.min(Math.PI / 2, prop.fallSpeed);
          prop.mesh.position.y = Math.max(0.15, prop.mesh.position.y - 1.5 * dt);
        }
        continue;
      }

      const dist = prop.mesh.position.distanceTo(activePos);

      // Check collision: if player vehicle rams it, or player runs forcefully into it
      const hitThreshold = isDriving ? (prop.radius + 1.2) : (prop.radius + 0.5);

      if (dist < hitThreshold) {
        if (isDriving && vehicleSpeedKmh < 10) continue; // Must have some speed

        // DESTROY PROPERTY
        prop.isDestroyed = true;
        prop.fallSpeed = 0.2;

        this.audioManager.playPropSmash();

        // Report Property Destruction Crime to Wanted System!
        if (this.game.wantedSystem) {
          this.game.wantedSystem.addCrime('property_destruction', 1);
        }

        this.game.showToast(`💥 Destroyed: ${prop.name}! Crime committed!`, 2500);
      }
    }
  }
}

