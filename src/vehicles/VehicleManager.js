import * as THREE from 'three';
import { VehicleController } from './VehicleController.js';

export class VehicleManager {
  constructor(game) {
    this.game = game;
    this.currentController = null;
    this.isDriving = false;

    // Interaction prompt element
    this.promptElement = document.getElementById('vehicle-prompt');
    this.drivingControlsElement = document.getElementById('driving-controls-overlay');

    this.nearestVehicle = null;

    this.initVirtualControls();
  }

  initVirtualControls() {
    // Wire up on-screen driving buttons (accelerate, brake, left, right, horn, exit)
    const btnAccel = document.getElementById('ctrl-accel');
    const btnBrake = document.getElementById('ctrl-brake');
    const btnLeft = document.getElementById('ctrl-left');
    const btnRight = document.getElementById('ctrl-right');
    const btnHorn = document.getElementById('ctrl-horn');
    const btnExit = document.getElementById('ctrl-exit');

    const bindButton = (el, prop) => {
      if (!el) return;
      const start = (e) => {
        e.preventDefault();
        if (this.currentController) this.currentController.virtualControls[prop] = true;
      };
      const end = (e) => {
        e.preventDefault();
        if (this.currentController) this.currentController.virtualControls[prop] = false;
      };
      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', end);
      el.addEventListener('mouseleave', end);
      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('touchend', end, { passive: false });
    };

    bindButton(btnAccel, 'accelerate');
    bindButton(btnBrake, 'brake');
    bindButton(btnLeft, 'steerLeft');
    bindButton(btnRight, 'steerRight');

    if (btnHorn) {
      btnHorn.addEventListener('click', () => {
        if (this.currentController) {
          if (this.currentController.type === 'bus') this.game.audioManager.playBusHorn(0);
          else if (this.currentController.type === 'car') this.game.audioManager.playCarHorn(0);
          else this.game.audioManager.playAutoHorn(0);
        }
      });
    }

    if (btnExit) {
      btnExit.addEventListener('click', () => {
        this.exitVehicle();
      });
    }

    if (this.promptElement) {
      this.promptElement.addEventListener('click', () => {
        if (!this.isDriving && this.nearestVehicle) {
          this.enterVehicle(this.nearestVehicle);
        }
      });
    }
  }

  update(dt) {
    if (this.isDriving && this.currentController) {
      // Update active vehicle controller
      const otherVehicles = this.game.trafficAI ? this.game.trafficAI.getVehicles() : [];
      this.currentController.update(dt, otherVehicles);

      // Check 'KeyE' to exit vehicle
      if (this.game.inputManager.wasJustPressed('KeyE')) {
        this.exitVehicle();
      }
    } else {
      // Player is on foot: detect nearest vehicle for boarding
      this.checkVehicleProximity();

      // Check 'KeyE' to enter vehicle
      if (this.nearestVehicle && this.game.inputManager.wasJustPressed('KeyE')) {
        this.enterVehicle(this.nearestVehicle);
      }
    }
  }

  checkVehicleProximity() {
    const playerPos = this.game.player.group.position;
    const allVehicles = this.game.trafficAI ? this.game.trafficAI.getVehicles() : [];

    let closest = null;
    let minDist = 4.0; // 4 meters entry range

    for (const v of allVehicles) {
      const dist = playerPos.distanceTo(v.mesh.position);
      if (dist < minDist) {
        minDist = dist;
        closest = v;
      }
    }

    this.nearestVehicle = closest;

    if (this.promptElement) {
      if (closest) {
        let label = 'DRIVE CAR';
        if (closest.type === 'bus') label = 'DRIVE BMTC BUS';
        else if (closest.type === 'auto') label = 'DRIVE AUTO-RICKSHAW';

        this.promptElement.textContent = `[E] ${label}`;
        this.promptElement.classList.remove('hidden');
      } else {
        this.promptElement.classList.add('hidden');
      }
    }
  }

  enterVehicle(vehicle) {
    if (this.isDriving) return;

    this.isDriving = true;
    this.game.audioManager.playClick();

    // Hide player model while inside vehicle
    this.game.player.group.visible = false;

    // Temporarily take vehicle out of AI autopilot
    vehicle.isControlledByPlayer = true;

    // Instantiate vehicle controller
    this.currentController = new VehicleController(
      vehicle,
      this.game.camera,
      this.game.inputManager,
      this.game.audioManager,
      this.game.sceneManager,
      (reason) => this.game.triggerPlayerDeath(reason)
    );

    // Show on-screen driving controls overlay
    if (this.drivingControlsElement) {
      this.drivingControlsElement.classList.remove('hidden');
    }

    // Hide on-foot prompt
    if (this.promptElement) this.promptElement.classList.add('hidden');

    const name = vehicle.type === 'bus' ? 'BMTC City Bus' : (vehicle.type === 'auto' ? 'Bengaluru Auto' : 'Car');
    this.game.showToast(`Driving: ${name}. Use W/S/A/D to drive or on-screen pedals!`);
  }

  exitVehicle() {
    if (!this.isDriving || !this.currentController) return;

    const v = this.currentController.vehicle;
    v.isControlledByPlayer = false;

    // Position player next to driver side door
    const exitOffset = new THREE.Vector3(-2.2, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.mesh.rotation.y);
    const exitPos = v.mesh.position.clone().add(exitOffset);
    exitPos.y = this.game.characterController.getGroundHeight(exitPos.x, exitPos.z);

    this.game.player.setPosition(exitPos);
    this.game.player.group.visible = true;

    // Clean up controller
    this.currentController.destroy();
    this.currentController = null;
    this.isDriving = false;

    // Hide on-screen driving controls
    if (this.drivingControlsElement) {
      this.drivingControlsElement.classList.add('hidden');
    }

    this.game.showToast('Exited vehicle. On foot.');
  }

  getCurrentSpeedKmh() {
    return this.currentController ? this.currentController.getSpeedKmh() : 0;
  }
}

