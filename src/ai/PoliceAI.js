import * as THREE from 'three';

export class PoliceAI {
  constructor(game) {
    this.game = game;
    this.sceneManager = game.sceneManager;
    this.audioManager = game.audioManager;

    this.group = new THREE.Group();
    this.sceneManager.addMesh(this.group);

    this.policeUnits = [];      // Interceptor Vehicles
    this.policeOfficers = [];   // On-foot Karnataka Police Officers
    this.lightbarTimer = 0;

    this.init();
  }

  init() {
    // 1. Pre-create 3 Police Interceptor Vehicles
    this.policeUnits.push(this.createPoliceInterceptor('police_car_1', new THREE.Vector3(12, 0, -180)));
    this.policeUnits.push(this.createPoliceInterceptor('police_car_2', new THREE.Vector3(-12, 0, 190)));
    this.policeUnits.push(this.createPoliceInterceptor('police_car_3', new THREE.Vector3(70, 0, 10)));

    for (const p of this.policeUnits) {
      p.mesh.visible = false;
      p.isActive = false;
    }

    // 2. Pre-create 4 On-Foot Karnataka Police Officers stationed along sidewalks
    const officerSpawns = [
      new THREE.Vector3(13.5, 0.25, 45),    // Near Ambedkar Road main avenue
      new THREE.Vector3(-13.5, 0.25, -30),  // Near crossroad junction
      new THREE.Vector3(13.5, 0.25, -90),   // Near commercial tower
      new THREE.Vector3(-13.5, 0.25, 110)   // Near tech park sidewalk
    ];

    for (let i = 0; i < officerSpawns.length; i++) {
      this.policeOfficers.push(this.createPoliceOfficer(`officer_${i + 1}`, officerSpawns[i]));
    }
  }

  /**
   * 3D Karnataka Police Officer Character (Khaki uniform, peaked cap, duty belt, baton/lathi)
   */
  createPoliceOfficer(id, spawnPos) {
    const officer = new THREE.Group();
    officer.position.copy(spawnPos);

    // Uniform Materials
    const khakiMat = new THREE.MeshStandardMaterial({ color: 0xc2a057, roughness: 0.7 });
    const darkKhakiMat = new THREE.MeshStandardMaterial({ color: 0xb59146, roughness: 0.75 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x9e6c46, roughness: 0.65 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x221a15, roughness: 0.5 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xffb800, metalness: 0.8, roughness: 0.2 });
    const batonMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.4 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x4a1f1f, roughness: 0.6 }); // Deep maroon / navy cap

    // 1. Torso (Khaki Police Shirt)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.24), khakiMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    officer.add(torso);

    // Shoulder rank epaulets
    const epauletL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.18), brassMat);
    epauletL.position.set(-0.21, 0.24, 0);
    torso.add(epauletL);
    const epauletR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.18), brassMat);
    epauletR.position.set(0.21, 0.24, 0);
    torso.add(epauletR);

    // Leather Duty Belt with Brass Buckle
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.26), leatherMat);
    belt.position.y = -0.22;
    torso.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.04), brassMat);
    buckle.position.set(0, 0, 0.14);
    belt.add(buckle);

    // 2. Head & Karnataka Police Cap
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), skinMat);
    head.position.y = 1.54;
    head.castShadow = true;
    officer.add(head);

    // Police Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.15, 0.12, 16), capMat);
    cap.position.set(0, 0.14, 0.02);
    head.add(cap);

    // Cap Visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.12), leatherMat);
    visor.position.set(0, 0.08, 0.12);
    visor.rotation.x = 0.25;
    head.add(visor);

    // Gold Police Badge on Cap
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.02), brassMat);
    badge.position.set(0, 0.14, 0.16);
    head.add(badge);

    // 3. Left Arm (Natural swing)
    const armGeo = new THREE.BoxGeometry(0.11, 0.44, 0.11);
    const leftArm = new THREE.Mesh(armGeo, khakiMat);
    leftArm.position.set(-0.27, 1.15, 0);
    leftArm.castShadow = true;
    officer.add(leftArm);

    // 4. Right Arm holding Wooden Police Baton / Lathi
    const rightArm = new THREE.Mesh(armGeo, khakiMat);
    rightArm.position.set(0.27, 1.15, 0);
    rightArm.castShadow = true;
    officer.add(rightArm);

    // Wooden Lathi / Baton
    const batonGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.95, 8);
    const baton = new THREE.Mesh(batonGeo, batonMat);
    baton.position.set(0, -0.35, 0.15);
    baton.rotation.x = Math.PI / 4;
    baton.castShadow = true;
    rightArm.add(baton);

    // 5. Legs in Khaki Trousers & Boots
    const legGeo = new THREE.BoxGeometry(0.14, 0.72, 0.14);
    const leftLeg = new THREE.Mesh(legGeo, darkKhakiMat);
    leftLeg.position.set(-0.12, 0.45, 0);
    leftLeg.castShadow = true;
    officer.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, darkKhakiMat);
    rightLeg.position.set(0.12, 0.45, 0);
    rightLeg.castShadow = true;
    officer.add(rightLeg);

    this.group.add(officer);

    return {
      id,
      mesh: officer,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      baton,
      spawnPos: spawnPos.clone(),
      speed: 1.4,         // Patrol speed ~5 km/h
      chargeSpeed: 6.8,   // Sprint speed ~25 km/h
      currentSpeed: 1.4,
      heading: 0,
      state: 'PATROL',    // 'PATROL', 'CHARGING', 'ATTACKING', 'SEARCHING'
      attackCooldown: 0,
      animTime: Math.random() * 5,
      patrolDir: 1
    };
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

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.35, metalness: 0.2 });
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(width, 0.7, length), whiteMat);
    lowerBody.position.y = 0.6;
    lowerBody.castShadow = true;
    car.add(lowerBody);

    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x0984e3 });
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, length * 0.9), stripeMat);
    stripe1.position.set(-width / 2 - 0.02, 0.6, 0);
    car.add(stripe1);
    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, length * 0.9), stripeMat);
    stripe2.position.set(width / 2 + 0.02, 0.6, 0);
    car.add(stripe2);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.88, 0.65, length * 0.55), whiteMat);
    cabin.position.set(0, 1.25, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 });
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.8, 0.6), glassMat);
    windshield.position.set(0, 1.25, length * 0.28);
    windshield.rotation.x = -0.3;
    car.add(windshield);

    // Emergency Lightbar
    const barGeo = new THREE.BoxGeometry(1.2, 0.15, 0.35);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const lightbar = new THREE.Mesh(barGeo, barMat);
    lightbar.position.set(0, 1.65, -0.2);
    car.add(lightbar);

    const redMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
    const redLightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.3), redMat);
    redLightMesh.position.set(-0.3, 1.66, -0.2);
    car.add(redLightMesh);

    const blueMat = new THREE.MeshBasicMaterial({ color: 0x0984e3 });
    const blueLightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.3), blueMat);
    blueLightMesh.position.set(0.3, 1.66, -0.2);
    car.add(blueLightMesh);

    const flasherLight = new THREE.PointLight(0x0984e3, 3.0, 30);
    flasherLight.position.set(0, 2.0, -0.2);
    car.add(flasherLight);

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
    let activeCarCount = 0;
    if (level === 1) activeCarCount = 1;
    else if (level === 2) activeCarCount = 2;
    else if (level >= 3) activeCarCount = 3;

    // 1. Deploy Police Cars
    for (let i = 0; i < this.policeUnits.length; i++) {
      const p = this.policeUnits[i];
      if (i < activeCarCount) {
        if (!p.isActive) {
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

    // 2. Alert On-Foot Police Officers
    if (level > 0) {
      this.audioManager.startSiren(15);
      this.audioManager.playPoliceWhistle();

      for (const off of this.policeOfficers) {
        off.state = 'CHARGING';
        off.currentSpeed = off.chargeSpeed;
      }
    } else {
      // Wanted cleared / Escaped
      this.audioManager.stopSiren();
      for (const off of this.policeOfficers) {
        off.state = 'PATROL';
        off.currentSpeed = off.speed;
        off.rightArm.rotation.x = 0;
      }
    }
  }

  update(dt, playerPos) {
    if (!playerPos) return;

    this.lightbarTimer += dt;
    const flashToggle = Math.floor(this.lightbarTimer * 9) % 2 === 0;

    let closestPoliceDist = 999;

    // 1. UPDATE POLICE CARS
    for (const p of this.policeUnits) {
      if (!p.isActive) continue;

      if (p.flasherLight) {
        p.flasherLight.color.setHex(flashToggle ? 0xff1122 : 0x0984e3);
        p.redLightMesh.visible = flashToggle;
        p.blueLightMesh.visible = !flashToggle;
      }

      const dx = playerPos.x - p.mesh.position.x;
      const dz = playerPos.z - p.mesh.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < closestPoliceDist) closestPoliceDist = dist;

      const targetAngle = Math.atan2(dx, dz);
      let diff = targetAngle - p.heading;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      p.heading += diff * 3.5 * dt;
      p.mesh.rotation.y = p.heading;

      if (dist > 8.0) {
        p.currentSpeed = Math.min(p.maxSpeed, p.currentSpeed + 14.0 * dt);
      } else {
        p.currentSpeed = Math.max(5.0, p.currentSpeed - 12.0 * dt);
      }

      p.mesh.position.x += Math.sin(p.heading) * p.currentSpeed * dt;
      p.mesh.position.z += Math.cos(p.heading) * p.currentSpeed * dt;

      const wheelSpin = (p.currentSpeed / 0.36) * dt;
      for (const w of p.wheels) {
        w.rotation.x += wheelSpin;
      }

      if (dist < 3.2) {
        if (!this.game.vehicleManager.isDriving) {
          this.game.triggerPlayerDeath('Busted & Apprehended by Bengaluru City Police');
        } else {
          this.audioManager.playCrash(1.2);
          if (this.game.wantedSystem) {
            this.game.wantedSystem.addCrime('police_ram', 1);
          }
        }
      }
    }

    // 2. UPDATE ON-FOOT POLICE OFFICERS (CHARGING & ARRESTING)
    for (const off of this.policeOfficers) {
      off.animTime += dt;

      const dx = playerPos.x - off.mesh.position.x;
      const dz = playerPos.z - off.mesh.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < closestPoliceDist) closestPoliceDist = dist;

      if (off.state === 'CHARGING') {
        // Face and charge directly towards player
        off.heading = Math.atan2(dx, dz);
        off.mesh.rotation.y = off.heading;

        // Move towards player
        if (dist > 1.3) {
          off.mesh.position.x += Math.sin(off.heading) * off.chargeSpeed * dt;
          off.mesh.position.z += Math.cos(off.heading) * off.chargeSpeed * dt;
        }

        // Running animation (energetic stride)
        const stride = Math.sin(off.animTime * 10.0);
        off.leftLeg.rotation.x = stride * 0.75;
        off.rightLeg.rotation.x = -stride * 0.75;
        off.leftArm.rotation.x = -stride * 0.7;

        // Baton raised in attack posture
        off.rightArm.rotation.x = -1.2 + Math.sin(off.animTime * 8.0) * 0.3;

        // Baton Strike Attack on Player
        off.attackCooldown -= dt;
        if (dist < 1.7 && off.attackCooldown <= 0) {
          off.attackCooldown = 0.9;
          this.audioManager.playPunch();

          // Deal damage to player on foot
          if (!this.game.vehicleManager.isDriving && this.game.characterController) {
            this.game.characterController.hp = Math.max(0, this.game.characterController.hp - 20);
            this.game.showToast('💥 Strike from Police Baton! -20 HP', 1500);

            if (this.game.characterController.hp <= 0) {
              this.game.triggerPlayerDeath('Busted & Subdued by Bengaluru Police Officer');
            }
          }
        }
      } else {
        // Normal Sidewalk Walking Patrol
        off.mesh.position.z += off.patrolDir * off.speed * dt;
        if (off.mesh.position.z > off.spawnPos.z + 25) off.patrolDir = -1;
        if (off.mesh.position.z < off.spawnPos.z - 25) off.patrolDir = 1;

        off.mesh.rotation.y = off.patrolDir === 1 ? 0 : Math.PI;

        const cycle = Math.sin(off.animTime * 5.0);
        off.leftLeg.rotation.x = cycle * 0.45;
        off.rightLeg.rotation.x = -cycle * 0.45;
        off.leftArm.rotation.x = -cycle * 0.35;
        off.rightArm.rotation.x = 0; // Baton at side
      }
    }

    // Update siren volume with distance to closest police unit
    if (this.game.wantedSystem && this.game.wantedSystem.wantedLevel > 0) {
      this.audioManager.updateSiren(closestPoliceDist);
    }
  }

  isAnyPoliceNearPlayer(maxDistance = 34) {
    const playerPos = this.game.player.group.position;

    // Check Police Cars
    for (const p of this.policeUnits) {
      if (p.isActive && p.mesh.position.distanceTo(playerPos) < maxDistance) {
        return true;
      }
    }

    // Check On-Foot Police Officers
    for (const off of this.policeOfficers) {
      if (off.state === 'CHARGING' && off.mesh.position.distanceTo(playerPos) < maxDistance) {
        return true;
      }
    }

    return false;
  }
}
