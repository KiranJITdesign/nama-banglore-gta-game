import * as THREE from 'three';

export class TrafficAI {
  constructor(sceneManager, assetManager, audioManager) {
    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.audioManager = audioManager;

    this.group = new THREE.Group();
    this.sceneManager.addMesh(this.group);

    this.vehicles = [];

    // Periodic honking timer
    this.ambientHonkTimer = 2.0;

    this.init();
  }

  init() {
    this.spawnFleet();
  }

  spawnFleet() {
    // 1. BMTC City Buses (Bangalore Metropolitan Transport Corporation)
    this.vehicles.push(this.createBMTCBus({
      id: 'bmtc_1',
      x: 5.5,
      z: -120,
      dirZ: 1, // Moving Northbound
      speed: 10.5, // ~38 km/h
      route: '335E • MAJESTIC - WHITEFIELD'
    }));

    this.vehicles.push(this.createBMTCBus({
      id: 'bmtc_2',
      x: -5.5,
      z: 140,
      dirZ: -1, // Moving Southbound
      speed: 9.8,
      route: '500D • SILK BOARD - HEBBAL'
    }));

    // 2. Cars (Sedans, SUVs, Sports cars matching screenshot)
    // Yellow Sports Car (matching screenshot)
    this.vehicles.push(this.createCar({
      id: 'sports_yellow',
      x: -8.5,
      z: 40,
      dirZ: -1,
      speed: 14.5, // ~52 km/h
      color: 0xf5b000,
      type: 'sports'
    }));

    // Red Sedan
    this.vehicles.push(this.createCar({
      id: 'sedan_red',
      x: 8.5,
      z: -60,
      dirZ: 1,
      speed: 12.0,
      color: 0xd63031,
      type: 'sedan'
    }));

    // Blue SUV
    this.vehicles.push(this.createCar({
      id: 'suv_blue',
      x: -5.5,
      z: -50,
      dirZ: -1,
      speed: 11.5,
      color: 0x0984e3,
      type: 'suv'
    }));

    // Silver Sedan
    this.vehicles.push(this.createCar({
      id: 'sedan_silver',
      x: 8.5,
      z: 80,
      dirZ: 1,
      speed: 12.5,
      color: 0xdfe6e9,
      type: 'sedan'
    }));

    // White Hatchback on Margosa Cross Road (Eastbound)
    this.vehicles.push(this.createCar({
      id: 'hatch_white',
      x: -120,
      z: -4.5,
      dirX: 1, // Moving East
      speed: 11.0,
      color: 0xf5f6fa,
      type: 'sedan'
    }));

    // Green Hatchback on Margosa Cross Road (Westbound)
    this.vehicles.push(this.createCar({
      id: 'hatch_green',
      x: 110,
      z: 4.5,
      dirX: -1, // Moving West
      speed: 11.2,
      color: 0x00b894,
      type: 'sedan'
    }));

    // 3. Cruising Auto-Rickshaw
    this.vehicles.push(this.createMovingAuto({
      id: 'auto_cruise_1',
      x: 8.5,
      z: -160,
      dirZ: 1,
      speed: 9.0
    }));

    this.vehicles.push(this.createMovingAuto({
      id: 'auto_cruise_2',
      x: -8.5,
      z: 180,
      dirZ: -1,
      speed: 8.8
    }));
  }

  /**
   * BMTC City Bus Model & Controller
   */
  createBMTCBus({ id, x, z, dirZ, speed, route }) {
    const bus = new THREE.Group();
    bus.position.set(x, 0, z);

    const length = 10.5;
    const width = 2.8;
    const height = 3.2;

    // Bus Body (BMTC Blue Lower, White Upper)
    const lowerGeo = new THREE.BoxGeometry(width, 1.4, length);
    const bmtcBlueMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, roughness: 0.35 });
    const lowerBody = new THREE.Mesh(lowerGeo, bmtcBlueMat);
    lowerBody.position.y = 1.1;
    lowerBody.castShadow = true;
    bus.add(lowerBody);

    const upperGeo = new THREE.BoxGeometry(width * 0.98, 1.5, length * 0.98);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const upperBody = new THREE.Mesh(upperGeo, whiteMat);
    upperBody.position.y = 2.45;
    upperBody.castShadow = true;
    bus.add(upperBody);

    // Panoramic Windshield
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x223344,
      roughness: 0.1,
      metalness: 0.85
    });
    const frontWindshield = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.88, 1.2), glassMat);
    frontWindshield.position.set(0, 2.4, length / 2 + 0.02);
    bus.add(frontWindshield);

    // Route Destination LED Signboard
    const routeCanvas = document.createElement('canvas');
    routeCanvas.width = 512;
    routeCanvas.height = 128;
    const rCtx = routeCanvas.getContext('2d');
    rCtx.fillStyle = '#0a0a0a';
    rCtx.fillRect(0, 0, 512, 128);
    rCtx.fillStyle = '#ffb800';
    rCtx.font = 'bold 36px sans-serif';
    rCtx.textAlign = 'center';
    rCtx.fillText(route, 256, 75);
    const routeTex = new THREE.CanvasTexture(routeCanvas);

    const signGeo = new THREE.PlaneGeometry(2.4, 0.55);
    const signMat = new THREE.MeshBasicMaterial({ map: routeTex });
    const destSign = new THREE.Mesh(signGeo, signMat);
    destSign.position.set(0, 3.1, length / 2 + 0.03);
    bus.add(destSign);

    // Headlights
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.1), lightMat);
    hl1.position.set(-1.0, 1.0, length / 2 + 0.02);
    bus.add(hl1);

    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.1), lightMat);
    hl2.position.set(1.0, 1.0, length / 2 + 0.02);
    bus.add(hl2);

    // Wheels (6 wheels: 2 front, 4 rear)
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.32, 16);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    const wheelPositions = [
      [-1.3, 0.5, 3.2], [1.3, 0.5, 3.2],
      [-1.3, 0.5, -2.5], [1.3, 0.5, -2.5],
      [-1.3, 0.5, -3.6], [1.3, 0.5, -3.6]
    ];

    for (const [wx, wy, wz] of wheelPositions) {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      bus.add(w);
      wheels.push(w);
    }

    if (dirZ === -1) {
      bus.rotation.y = Math.PI; // Face South
    }

    this.group.add(bus);

    return {
      id,
      type: 'bus',
      mesh: bus,
      wheels,
      wheelRadius: 0.5,
      targetSpeed: speed,
      currentSpeed: speed,
      dirZ: dirZ || 0,
      dirX: 0,
      length,
      width,
      honkCooldown: Math.random() * 5 + 3
    };
  }

  /**
   * Indian Passenger Car Model & Controller
   */
  createCar({ id, x, z, dirZ, dirX, speed, color, type = 'sedan' }) {
    const car = new THREE.Group();
    car.position.set(x, 0, z);

    const length = type === 'sports' ? 4.6 : 4.4;
    const width = 1.9;
    const height = type === 'suv' ? 1.7 : 1.35;

    const carMat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.4,
      roughness: 0.35
    });

    // Lower Chassis
    const lowerGeo = new THREE.BoxGeometry(width, 0.65, length);
    const lowerBody = new THREE.Mesh(lowerGeo, carMat);
    lowerBody.position.y = 0.55;
    lowerBody.castShadow = true;
    car.add(lowerBody);

    // Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(width * 0.88, 0.6, length * 0.55);
    const cabin = new THREE.Mesh(cabinGeo, carMat);
    cabin.position.set(0, 1.15, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    // Windshield & Windows
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.1,
      metalness: 0.9
    });
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.8, 0.55), glassMat);
    windshield.position.set(0, 1.15, length * 0.28);
    windshield.rotation.x = -0.3;
    car.add(windshield);

    // Headlights
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.08), hlMat);
    hl1.position.set(-0.65, 0.55, length / 2 + 0.01);
    car.add(hl1);

    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.08), hlMat);
    hl2.position.set(0.65, 0.55, length / 2 + 0.01);
    car.add(hl2);

    // Taillights
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.08), tlMat);
    tl1.position.set(-0.65, 0.55, -length / 2 - 0.01);
    car.add(tl1);

    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.08), tlMat);
    tl2.position.set(0.65, 0.55, -length / 2 - 0.01);
    car.add(tl2);

    // Wheels (4 wheels)
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 14);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    const wheelOffsets = [
      [-width / 2 - 0.02, 0.34, length * 0.3],
      [width / 2 + 0.02, 0.34, length * 0.3],
      [-width / 2 - 0.02, 0.34, -length * 0.3],
      [width / 2 + 0.02, 0.34, -length * 0.3]
    ];

    for (const [wx, wy, wz] of wheelOffsets) {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      car.add(w);
      wheels.push(w);
    }

    if (dirZ === -1) {
      car.rotation.y = Math.PI; // Face South
    } else if (dirX === 1) {
      car.rotation.y = Math.PI / 2; // Face East
    } else if (dirX === -1) {
      car.rotation.y = -Math.PI / 2; // Face West
    }

    this.group.add(car);

    return {
      id,
      type: 'car',
      mesh: car,
      wheels,
      wheelRadius: 0.34,
      targetSpeed: speed,
      currentSpeed: speed,
      dirZ: dirZ || 0,
      dirX: dirX || 0,
      length,
      width,
      honkCooldown: Math.random() * 6 + 3
    };
  }

  /**
   * Moving Bengaluru Auto-Rickshaw
   */
  createMovingAuto({ id, x, z, dirZ, speed }) {
    const auto = new THREE.Group();
    auto.position.set(x, 0, z);

    // Lower green body
    const lowerGeo = new THREE.BoxGeometry(1.6, 0.85, 2.5);
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x008040, roughness: 0.35 });
    const lowerBody = new THREE.Mesh(lowerGeo, greenMat);
    lowerBody.position.y = 0.7;
    lowerBody.castShadow = true;
    auto.add(lowerBody);

    // Yellow top
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf5b000, roughness: 0.5 });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.75, 2.4), yellowMat);
    canopy.position.set(0, 1.45, -0.05);
    canopy.castShadow = true;
    auto.add(canopy);

    // Nose & Windshield
    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.75, 0.7), greenMat);
    nose.position.set(0, 0.65, 1.25);
    auto.add(nose);

    // Wheels
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.3, 1.1);
    auto.add(frontWheel);
    wheels.push(frontWheel);

    const rearLeft = new THREE.Mesh(wheelGeo, tireMat);
    rearLeft.rotation.z = Math.PI / 2;
    rearLeft.position.set(-0.75, 0.3, -0.7);
    auto.add(rearLeft);
    wheels.push(rearLeft);

    const rearRight = new THREE.Mesh(wheelGeo, tireMat);
    rearRight.rotation.z = Math.PI / 2;
    rearRight.position.set(0.75, 0.3, -0.7);
    auto.add(rearRight);
    wheels.push(rearRight);

    if (dirZ === -1) {
      auto.rotation.y = Math.PI;
    }

    this.group.add(auto);

    return {
      id,
      type: 'auto',
      mesh: auto,
      wheels,
      wheelRadius: 0.3,
      targetSpeed: speed,
      currentSpeed: speed,
      dirZ,
      dirX: 0,
      length: 2.6,
      width: 1.6,
      honkCooldown: Math.random() * 5 + 2
    };
  }

  /**
   * Main Traffic Simulation Update Loop
   */
  update(dt, playerPos, onPlayerHit) {
    // 1. Periodic City Traffic Ambient Honk
    this.ambientHonkTimer -= dt;
    if (this.ambientHonkTimer <= 0) {
      this.ambientHonkTimer = Math.random() * 3.5 + 2.5; // Every 2.5 - 6s
      this.triggerRandomTrafficHonk(playerPos);
    }

    // 2. Update each vehicle
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];

      // Skip AI update if currently driven by player
      if (v.isControlledByPlayer) continue;

      // Radar & Collision avoidance against vehicles ahead & player
      let mustBrake = false;

      // Check distance to other vehicles in the same lane
      for (let j = 0; j < this.vehicles.length; j++) {
        if (i === j) continue;
        const other = this.vehicles[j];

        if (v.dirZ !== 0 && other.dirZ === v.dirZ && Math.abs(v.mesh.position.x - other.mesh.position.x) < 2.0) {
          const deltaZ = (other.mesh.position.z - v.mesh.position.z) * v.dirZ;
          if (deltaZ > 0 && deltaZ < (v.length + other.length + 5.0)) {
            mustBrake = true;
            break;
          }
        } else if (v.dirX !== 0 && other.dirX === v.dirX && Math.abs(v.mesh.position.z - other.mesh.position.z) < 2.0) {
          const deltaX = (other.mesh.position.x - v.mesh.position.x) * v.dirX;
          if (deltaX > 0 && deltaX < (v.length + other.length + 5.0)) {
            mustBrake = true;
            break;
          }
        }
      }

      // Check distance to Player on road
      if (playerPos) {
        const distToPlayer = v.mesh.position.distanceTo(playerPos);
        const lethalDist = (v.length * 0.45 + 0.8);

        // FATAL TRAFFIC COLLISION (Player dies if hit by moving car or bus)
        if (distToPlayer < lethalDist && v.currentSpeed > 3.5) {
          if (onPlayerHit) {
            onPlayerHit(v);
          }
        }

        if (v.dirZ !== 0 && Math.abs(v.mesh.position.x - playerPos.x) < 2.5) {
          const deltaZ = (playerPos.z - v.mesh.position.z) * v.dirZ;
          if (deltaZ > 0 && deltaZ < 10.0) {
            mustBrake = true;

            // Honk directly at player if blocking road!
            v.honkCooldown -= dt;
            if (v.honkCooldown <= 0) {
              v.honkCooldown = 2.5;
              this.playVehicleHonk(v, playerPos);
            }
          }
        } else if (v.dirX !== 0 && Math.abs(v.mesh.position.z - playerPos.z) < 2.5) {
          const deltaX = (playerPos.x - v.mesh.position.x) * v.dirX;
          if (deltaX > 0 && deltaX < 10.0) {
            mustBrake = true;
            v.honkCooldown -= dt;
            if (v.honkCooldown <= 0) {
              v.honkCooldown = 2.5;
              this.playVehicleHonk(v, playerPos);
            }
          }
        }
      }

      // Accelerate or brake
      if (mustBrake) {
        v.currentSpeed = Math.max(0, v.currentSpeed - 18.0 * dt);
      } else {
        v.currentSpeed = Math.min(v.targetSpeed, v.currentSpeed + 8.0 * dt);
      }

      // Advance vehicle position
      if (v.dirZ !== 0) {
        v.mesh.position.z += v.dirZ * v.currentSpeed * dt;

        // Wrap around Ambedkar Road (length 500m)
        if (v.dirZ === 1 && v.mesh.position.z > 240) {
          v.mesh.position.z = -240;
        } else if (v.dirZ === -1 && v.mesh.position.z < -240) {
          v.mesh.position.z = 240;
        }
      } else if (v.dirX !== 0) {
        v.mesh.position.x += v.dirX * v.currentSpeed * dt;

        // Wrap around Margosa Cross Road (length 400m)
        if (v.dirX === 1 && v.mesh.position.x > 190) {
          v.mesh.position.x = -190;
        } else if (v.dirX === -1 && v.mesh.position.x < -190) {
          v.mesh.position.x = 190;
        }
      }

      // Rotate wheels smoothly with ground travel
      const wheelAngularSpeed = (v.currentSpeed / v.wheelRadius) * dt;
      for (const wheel of v.wheels) {
        wheel.rotation.x += wheelAngularSpeed;
      }
    }
  }

  playVehicleHonk(vehicle, playerPos) {
    const dist = playerPos ? vehicle.mesh.position.distanceTo(playerPos) : 10;
    if (vehicle.type === 'bus') {
      this.audioManager.playBusHorn(dist);
    } else if (vehicle.type === 'car') {
      this.audioManager.playCarHorn(dist);
    } else {
      this.audioManager.playAutoHorn(dist);
    }
  }

  triggerRandomTrafficHonk(playerPos) {
    if (this.vehicles.length === 0) return;
    const randomVehicle = this.vehicles[Math.floor(Math.random() * this.vehicles.length)];
    this.playVehicleHonk(randomVehicle, playerPos);
  }

  getVehicles() {
    return this.vehicles;
  }
}

