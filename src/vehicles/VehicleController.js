import * as THREE from 'three';

export class VehicleController {
  constructor(vehicle, camera, inputManager, audioManager, sceneManager, onCrashCallback) {
    this.vehicle = vehicle;
    this.mesh = vehicle.mesh;
    this.camera = camera;
    this.inputManager = inputManager;
    this.audioManager = audioManager;
    this.sceneManager = sceneManager;
    this.onCrash = onCrashCallback;

    // Vehicle Specs based on type
    this.type = vehicle.type; // 'car', 'bus', 'auto'
    this.setupSpecs();

    // Motion State
    this.currentSpeed = 0; // m/s
    this.steeringAngle = 0; // radians
    this.heading = this.mesh.rotation.y;

    // Virtual Controls State (for touch/click buttons)
    this.virtualControls = {
      accelerate: false,
      brake: false,
      steerLeft: false,
      steerRight: false,
      handbrake: false
    };

    // Chase Camera Parameters
    this.cameraDistance = this.type === 'bus' ? 9.5 : (this.type === 'auto' ? 5.2 : 6.0);
    this.cameraHeight = this.type === 'bus' ? 4.2 : (this.type === 'auto' ? 2.2 : 2.5);
    this.cameraOffset = new THREE.Vector3();
    this.smoothedCamPos = new THREE.Vector3();

    // Start engine audio
    this.audioManager.startEngine(this.type);
  }

  setupSpecs() {
    if (this.type === 'bus') {
      this.maxSpeed = 16.5; // ~60 km/h
      this.reverseMax = 6.0;
      this.accel = 6.5;
      this.brakeDecel = 18.0;
      this.turnSpeed = 1.3;
      this.maxSteer = 0.55;
    } else if (this.type === 'auto') {
      this.maxSpeed = 15.2; // ~55 km/h
      this.reverseMax = 5.0;
      this.accel = 9.0;
      this.brakeDecel = 22.0;
      this.turnSpeed = 2.0;
      this.maxSteer = 0.75;
    } else {
      // Car / Sports
      const isSports = this.vehicle.id.includes('sports');
      this.maxSpeed = isSports ? 30.5 : 23.5; // ~110 km/h or 85 km/h
      this.reverseMax = 8.0;
      this.accel = isSports ? 18.0 : 13.0;
      this.brakeDecel = 26.0;
      this.turnSpeed = 1.8;
      this.maxSteer = 0.65;
    }
  }

  update(dt, otherVehicles = []) {
    this.handleInput(dt);
    this.updateMotion(dt);
    this.updateWheels(dt);
    this.checkCollisions(otherVehicles);
    this.updateCamera(dt);

    // Audio update
    const isAccel = this.inputManager.isKeyDown('KeyW') ||
                    this.inputManager.isKeyDown('ArrowUp') ||
                    this.virtualControls.accelerate;
    this.audioManager.updateEngine(this.getSpeedKmh(), this.maxSpeed * 3.6, isAccel);

    // Horn key
    if (this.inputManager.wasJustPressed('KeyH')) {
      if (this.type === 'bus') this.audioManager.playBusHorn(0);
      else if (this.type === 'car') this.audioManager.playCarHorn(0);
      else this.audioManager.playAutoHorn(0);
    }
  }

  handleInput(dt) {
    const isW = this.inputManager.isKeyDown('KeyW') || this.inputManager.isKeyDown('ArrowUp') || this.virtualControls.accelerate;
    const isS = this.inputManager.isKeyDown('KeyS') || this.inputManager.isKeyDown('ArrowDown') || this.virtualControls.brake;
    const isA = this.inputManager.isKeyDown('KeyA') || this.inputManager.isKeyDown('ArrowLeft') || this.virtualControls.steerLeft;
    const isD = this.inputManager.isKeyDown('KeyD') || this.inputManager.isKeyDown('ArrowRight') || this.virtualControls.steerRight;
    const isHandbrake = this.inputManager.isKeyDown('Space') || this.virtualControls.handbrake;

    // Acceleration & Braking
    if (isW) {
      if (this.currentSpeed < 0) {
        // Braking while reversing
        this.currentSpeed = Math.min(0, this.currentSpeed + this.brakeDecel * dt);
      } else {
        this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.accel * dt);
      }
    } else if (isS) {
      if (this.currentSpeed > 0.5) {
        // Braking while moving forward
        this.currentSpeed = Math.max(0, this.currentSpeed - this.brakeDecel * dt);
      } else {
        // Reverse gear
        this.currentSpeed = Math.max(-this.reverseMax, this.currentSpeed - (this.accel * 0.6) * dt);
      }
    } else {
      // Natural rolling friction / deceleration
      this.currentSpeed *= Math.pow(0.85, dt * 60);
      if (Math.abs(this.currentSpeed) < 0.1) this.currentSpeed = 0;
    }

    if (isHandbrake) {
      this.currentSpeed *= Math.pow(0.65, dt * 60);
    }

    // Steering
    let targetSteer = 0;
    if (isA) targetSteer += this.maxSteer;
    if (isD) targetSteer -= this.maxSteer;

    // Steering sensitivity drops slightly at high speeds for stability
    const speedFactor = 1.0 - Math.min(0.5, Math.abs(this.currentSpeed) / this.maxSpeed);
    this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, targetSteer * speedFactor, 12 * dt);

    // Apply vehicle yaw turn
    if (Math.abs(this.currentSpeed) > 0.1) {
      const turnDirection = this.currentSpeed >= 0 ? 1 : -1;
      this.heading += this.steeringAngle * this.turnSpeed * turnDirection * (Math.abs(this.currentSpeed) / this.maxSpeed) * dt * 2.2;
      this.mesh.rotation.y = this.heading;
    }
  }

  updateMotion(dt) {
    // Forward direction from vehicle heading
    const forwardX = Math.sin(this.heading);
    const forwardZ = Math.cos(this.heading);

    const nextX = this.mesh.position.x + forwardX * this.currentSpeed * dt;
    const nextZ = this.mesh.position.z + forwardZ * this.currentSpeed * dt;

    // World Boundary Clamp
    if (Math.abs(nextX) < 220 && Math.abs(nextZ) < 240) {
      this.mesh.position.x = nextX;
      this.mesh.position.z = nextZ;
    } else {
      this.currentSpeed = -this.currentSpeed * 0.3; // Bounce back
      this.audioManager.playCrash(0.8);
    }
  }

  updateWheels(dt) {
    if (!this.vehicle.wheels) return;
    const spinStep = (this.currentSpeed / (this.vehicle.wheelRadius || 0.4)) * dt;

    for (const w of this.vehicle.wheels) {
      w.rotation.x += spinStep;
    }
  }

  checkCollisions(otherVehicles) {
    for (const other of otherVehicles) {
      if (other.id === this.vehicle.id) continue;
      const dist = this.mesh.position.distanceTo(other.mesh.position);
      const minSafeDist = (this.vehicle.length + other.length) * 0.45;

      if (dist < minSafeDist) {
        // Collision impact!
        const relativeSpeed = Math.abs(this.currentSpeed) + Math.abs(other.currentSpeed);
        this.audioManager.playCrash(Math.min(1.5, relativeSpeed / 12.0));

        // Bounce back
        this.currentSpeed = -this.currentSpeed * 0.4;

        // Head-on severe crash lethality
        if (relativeSpeed > 16.0 && (this.type === 'car' || this.type === 'auto') && other.type === 'bus') {
          if (this.onCrash) {
            this.onCrash('head_on_bus');
          }
        }
        break;
      }
    }
  }

  updateCamera(dt) {
    // GTA Chase Camera: positioned behind vehicle according to heading
    const speedRatio = Math.abs(this.currentSpeed) / this.maxSpeed;
    const dynamicDist = this.cameraDistance + speedRatio * 2.2;
    const dynamicHeight = this.cameraHeight + speedRatio * 0.8;

    const targetPos = this.mesh.position.clone();

    const camX = targetPos.x - Math.sin(this.heading) * dynamicDist;
    const camZ = targetPos.z - Math.cos(this.heading) * dynamicDist;
    const camY = targetPos.y + dynamicHeight;

    const desiredCamPos = new THREE.Vector3(camX, camY, camZ);
    this.smoothedCamPos.lerp(desiredCamPos, 10 * dt);

    this.camera.position.copy(this.smoothedCamPos);
    this.camera.lookAt(targetPos.x, targetPos.y + 1.2, targetPos.z);
  }

  getSpeedKmh() {
    return Math.round(Math.abs(this.currentSpeed) * 3.6);
  }

  destroy() {
    this.audioManager.stopEngine();
  }
}

