import * as THREE from 'three';

export class PoliceAI {
  constructor(game) {
    this.game = game;
    this.sceneManager = game.sceneManager;
    this.audioManager = game.audioManager;

    this.group = new THREE.Group();
    this.sceneManager.addMesh(this.group);

    this.policeUnits = [];
    this.lightbarTimer = 0;

    this.init();
  }

  init() {
    // Pre-create 3 Police Interceptors stationed across Bengaluru
    this.policeUnits.push(this.createPoliceInterceptor('police_1', new THREE.Vector3(12, 0, -180)));
    this.policeUnits.push(this.createPoliceInterceptor('police_2', new THREE.Vector3(-12, 0, 190)));
    this.policeUnits.push(this.createPoliceInterceptor('police_3', new THREE.Vector3(70, 0, 10)));

    // Initially inactive until crimes are committed
    for (const p of this.policeUnits) {
      p.mesh.visible = false;
      p.isActive = false;
    }
  }

  /**
   * Bengaluru City Police Interceptor Vehicle
   */
  createPoliceInterceptor(id, spawnPos) {
    const car = new THREE.Group();
    car.position.copy(spawnPos);

    const length = 4.8;
    const width = 2.0;
    const height = 1.6;

    // 1. White Police Body
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.35, metalness: 0.2 });
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(width, 0.7, length), whiteMat);
    lowerBody.position.y = 0.6;
    lowerBody.castShadow = true;
    car.add(lowerBody);

    // Blue & Red Karnataka Police Decal Stripe on sides
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x0984e3 });
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, length * 0.9), stripeMat);
    stripe1.position.set(-width / 2 - 0.02, 0.6, 0);
    car.add(stripe1);

    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, length * 0.9), stripeMat);
    stripe2.position.set(width / 2 + 0.02, 0.6, 0);
    car.add(stripe2);

    // 2. Cabin & Tinted Windows
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.88, 0.65, length * 0.55), whiteMat);
    cabin.position.set(0, 1.25, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 });
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.8, 0.6), glassMat);
    windshield.position.set(0, 1.25, length * 0.28);
    windshield.rotation.x = -0.3;
    car.add(windshield);

    // 3. Emergency Lightbar (Red & Blue Flashing Bar)
    const barGeo = new THREE.BoxGeometry(1.2, 0.15, 0.35);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const lightbar = new THREE.Mesh(barGeo, barMat);
    lightbar.position.set(0, 1.65, -0.2);
    car.add(lightbar);

    // Red LED (Left)
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
    const redLightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.3), redMat);
    redLightMesh.position.set(-0.3, 1.66, -0.2);
    car.add(redLightMesh);

    // Blue LED (Right)
    const blueMat = new THREE.MeshBasicMaterial({ color: 0x0984e3 });
    const blueLightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.3), blueMat);
    blueLightMesh.position.set(0.3, 1.66, -0.2);
    car.add(blueLightMesh);

    // Dynamic Police Flasher Point Light
    const flasherLight = new THREE.PointLight(0x0984e3, 3.0, 30);
    flasherLight.position.set(0, 2.0, -0.2);
    car.add(flasherLight);

    // 4. Wheels
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 14);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const wheelOffsets = [
      [-width / 2 - 0.02, 0.36, length * 0.3],
      [width / 2 + 0.02, 0.36, length * 0.3],
      [-width / 2 - 0.02, 0.36, -length * 0.3],
      [width / 2 + 0.02, 0.36, -length * 0.3]
    ];

    for (const [wx, wy, wz] of wheelOffsets) {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      car.add(w);
      wheels.push(w);
    }

    this.group.add(car);

    return {
      id,
      mesh: car,
      wheels,
      flasherLight,
      redLightMesh,
      blueLightMesh,
      currentSpeed: 0,
      maxSpeed: 21.0, // ~75 km/h
      heading: 0,
      isActive: false,
      length,
      width
    };
  }

  onWantedLevelChanged(level) {
    let activeCount = 0;
    if (level === 1) activeCount = 1;
    else if (level === 2) activeCount = 2;
    else if (level >= 3) activeCount = 3;

    for (let i = 0; i < this.policeUnits.length; i++) {
      const p = this.policeUnits[i];
      if (i < activeCount) {
        if (!p.isActive) {
          // Deploy unit near player route
          const playerPos = this.game.player.group.position;
          p.mesh.position.set(
            playerPos.x + (Math.random() > 0.5 ? 40 : -40),
            0,
            playerPos.z + (Math.random() > 0.5 ? 60 : -60)
          );
          p.mesh.visible = true;
          p.isActive = true;
          p.currentSpeed = 8.0;
        }
      } else {
        p.mesh.visible = false;
        p.isActive = false;
      }
    }

    if (level > 0) {
      this.audioManager.startSiren(15);
    } else {
      this.audioManager.stopSiren();
    }
  }

  update(dt, playerPos) {
    if (!playerPos) return;

    this.lightbarTimer += dt;
    const flashToggle = Math.floor(this.lightbarTimer * 9) % 2 === 0;

    let closestPoliceDist = 999;

    for (const p of this.policeUnits) {
      if (!p.isActive) continue;

      // 1. Alternate Police Lightbar Flashing (Red / Blue)
      if (p.flasherLight) {
        p.flasherLight.color.setHex(flashToggle ? 0xff1122 : 0x0984e3);
        p.redLightMesh.visible = flashToggle;
        p.blueLightMesh.visible = !flashToggle;
      }

      // 2. AI Pursuit Steering towards Player
      const dx = playerPos.x - p.mesh.position.x;
      const dz = playerPos.z - p.mesh.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < closestPoliceDist) closestPoliceDist = dist;

      const targetAngle = Math.atan2(dx, dz);
      let diff = targetAngle - p.heading;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      // Smooth steering toward target
      p.heading += diff * 3.5 * dt;
      p.mesh.rotation.y = p.heading;

      // Accelerate towards player
      if (dist > 8.0) {
        p.currentSpeed = Math.min(p.maxSpeed, p.currentSpeed + 14.0 * dt);
      } else {
        p.currentSpeed = Math.max(5.0, p.currentSpeed - 12.0 * dt);
      }

      // Forward motion
      p.mesh.position.x += Math.sin(p.heading) * p.currentSpeed * dt;
      p.mesh.position.z += Math.cos(p.heading) * p.currentSpeed * dt;

      // Rotate wheels
      const wheelSpin = (p.currentSpeed / 0.36) * dt;
      for (const w of p.wheels) {
        w.rotation.x += wheelSpin;
      }

      // 3. Collision / Arrest of Player
      if (dist < 3.2) {
        if (!this.game.vehicleManager.isDriving) {
          // On foot: Police car hits or arrests player!
          this.game.triggerPlayerDeath('Busted & Apprehended by Bengaluru City Police');
        } else {
          // In vehicle: Police ram player vehicle!
          this.audioManager.playCrash(1.2);
          if (this.game.wantedSystem) {
            this.game.wantedSystem.addCrime('police_ram', 1);
          }
        }
      }
    }

    // Update siren volume with distance to closest police unit
    if (this.game.wantedSystem && this.game.wantedSystem.wantedLevel > 0) {
      this.audioManager.updateSiren(closestPoliceDist);
    }
  }

  isAnyPoliceNearPlayer(maxDistance = 50) {
    const playerPos = this.game.player.group.position;
    for (const p of this.policeUnits) {
      if (p.isActive && p.mesh.position.distanceTo(playerPos) < maxDistance) {
        return true;
      }
    }
    return false;
  }
}

