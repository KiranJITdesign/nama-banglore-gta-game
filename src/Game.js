import * as THREE from 'three';
import { Renderer } from './core/Renderer.js';
import { SceneManager } from './core/SceneManager.js';
import { InputManager } from './core/InputManager.js';
import { AssetManager } from './core/AssetManager.js';
import { SaveManager } from './core/SaveManager.js';
import { AudioManager } from './audio/AudioManager.js';

import { Environment } from './world/Environment.js';
import { RoadNetwork } from './world/RoadNetwork.js';
import { BuildingGenerator } from './world/BuildingGenerator.js';
import { CityGenerator } from './world/CityGenerator.js';
import { DestructibleManager } from './world/DestructibleManager.js';

import { TrafficAI } from './ai/TrafficAI.js';
import { PoliceAI } from './ai/PoliceAI.js';
import { PedestrianAI } from './ai/PedestrianAI.js';

import { CharacterCustomization } from './player/CharacterCustomization.js';
import { Player } from './player/Player.js';
import { CharacterController } from './player/CharacterController.js';
import { ThirdPersonCamera } from './player/ThirdPersonCamera.js';
import { VehicleManager } from './vehicles/VehicleManager.js';
import { WantedSystem } from './gameplay/WantedSystem.js';

import { HUD } from './ui/HUD.js';
import { MainMenu } from './ui/MainMenu.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { CityMapUI } from './ui/CityMapUI.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED'
    this.lastTime = performance.now();
    this.menuOrbitAngle = 0;

    // Death / Wasted state
    this.isDead = false;
    this.wastedScreen = null;
    this.wastedReasonText = null;

    // Toast Timer
    this.toastTimer = null;
  }

  async init() {
    console.log('Initializing Bengaluru: City of Dreams - Police & NPCs...');

    // 1. Core Services
    this.renderer = new Renderer(this.canvas);
    this.sceneManager = new SceneManager();
    this.inputManager = new InputManager(this.canvas);
    this.assetManager = new AssetManager();
    this.saveManager = new SaveManager();
    this.audioManager = new AudioManager();

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(65, this.renderer.getAspect(), 0.1, 1000);
    this.camera.position.set(0, 15, 60);

    // 3. World Generation & Destructible Property
    this.environment = new Environment(this.sceneManager.scene);
    this.roadNetwork = new RoadNetwork(this.sceneManager, this.assetManager, this.environment);
    this.buildingGenerator = new BuildingGenerator(this.sceneManager, this.assetManager);
    this.cityGenerator = new CityGenerator(this.sceneManager, this.assetManager, this.buildingGenerator);
    this.destructibleManager = new DestructibleManager(this);

    // 4. Moving Traffic Simulation
    this.trafficAI = new TrafficAI(this.sceneManager, this.assetManager, this.audioManager);

    // 5. Player & Customization
    const savedData = this.saveManager.load();
    this.characterCustomization = new CharacterCustomization(savedData.player);
    this.player = new Player(this.sceneManager, this.characterCustomization);

    this.thirdPersonCamera = new ThirdPersonCamera(
      this.camera,
      this.player.group,
      this.sceneManager,
      this.inputManager
    );

    this.characterController = new CharacterController(
      this.player,
      this.inputManager,
      this.thirdPersonCamera,
      this.sceneManager,
      this.audioManager
    );

    // 6. Gameplay Systems (Vehicles, Wanted System, Police, Pedestrians)
    this.vehicleManager = new VehicleManager(this);
    this.wantedSystem = new WantedSystem(this);
    this.policeAI = new PoliceAI(this);
    this.pedestrianAI = new PedestrianAI(this);

    // 7. User Interface & City Map
    this.hud = new HUD(this);
    this.mainMenu = new MainMenu(this);
    this.pauseMenu = new PauseMenu(this);
    this.cityMapUI = new CityMapUI(this);

    this.wastedScreen = document.getElementById('wasted-screen');
    this.wastedReasonText = document.getElementById('wasted-reason');

    // Initial District Setup
    this.currentDistrict = this.cityGenerator.getDistrictById(savedData.currentDistrict || 'ambedkar_road');
    this.player.setPosition(this.currentDistrict.spawn);

    // Apply Settings
    if (savedData.settings) {
      this.renderer.setQuality(savedData.settings.graphicsQuality || 'high');
      this.inputManager.setSensitivity(savedData.settings.mouseSensitivity || 1.2);
      this.audioManager.setVolume(savedData.settings.masterVolume || 0.8);
    }

    // Set Initial Time of Day
    this.environment.setTimeOfDay(savedData.timeOfDay || 'sunset');

    // Canvas click to request pointer lock during gameplay
    this.canvas.addEventListener('click', () => {
      this.audioManager.unlock();
      if (this.state === 'MENU') {
        this.startGame(this.currentDistrict ? this.currentDistrict.id : 'ambedkar_road');
      } else if (this.state === 'PLAYING' && !this.inputManager.isPointerLocked && !this.cityMapUI.isOpen) {
        this.inputManager.requestPointerLock();
      }
    });

    // Start Game Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));

    console.log('Bengaluru: City of Dreams ready.');
  }

  startGame(districtId) {
    if (districtId) {
      this.currentDistrict = this.cityGenerator.getDistrictById(districtId);
      this.player.setPosition(this.currentDistrict.spawn);
    }

    this.audioManager.unlock();
    this.audioManager.startAmbience();

    this.state = 'PLAYING';
    this.mainMenu.hide();
    this.pauseMenu.hide();
    this.hud.show();

    this.inputManager.requestPointerLock();

    this.hud.showSubtitle('Conquer the streets. And make Bangalore yours.', 5000);
    this.showToast(`Entering ${this.currentDistrict.name}`);
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.inputManager.exitPointerLock();
    this.pauseMenu.show();
    this.hud.hide();
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.pauseMenu.hide();
    this.hud.show();
    if (!this.cityMapUI.isOpen) {
      this.inputManager.requestPointerLock();
    }
  }

  /**
   * FATAL COLLISION / DEATH ("WASTED") SEQUENCE
   */
  triggerPlayerDeath(reason = 'Fatal traffic collision') {
    if (this.isDead) return;
    this.isDead = true;

    // Sounds
    this.audioManager.playCrash(1.8);
    this.audioManager.playWastedSound();

    // If driving, exit vehicle
    if (this.vehicleManager.isDriving) {
      this.vehicleManager.exitVehicle();
    }

    // Clear Wanted stars on death / arrest
    if (this.wantedSystem) {
      this.wantedSystem.clearWanted();
    }

    // Show Wasted Screen
    if (this.wastedScreen) {
      if (this.wastedReasonText) {
        this.wastedReasonText.textContent = reason.toUpperCase();
      }
      this.wastedScreen.classList.remove('hidden');
    }

    this.inputManager.exitPointerLock();

    // Respawn after 2.6 seconds
    setTimeout(() => {
      this.respawnPlayer();
      if (this.wastedScreen) {
        this.wastedScreen.classList.add('hidden');
      }
      this.isDead = false;
      this.inputManager.requestPointerLock();
    }, 2600);
  }

  respawnPlayer() {
    if (this.currentDistrict) {
      const spawnSafe = this.currentDistrict.spawn.clone();
      spawnSafe.x = 12.0; // Place safely on sidewalk
      this.player.setPosition(spawnSafe);
      this.player.group.visible = true;

      this.characterController.hp = this.characterController.maxHp;
      this.characterController.stamina = this.characterController.maxStamina;
      this.characterController.verticalVelocity = 0;
      this.showToast(`Respawned safely at ${this.currentDistrict.name}`);
    }
  }

  returnToMainMenu() {
    if (this.vehicleManager.isDriving) {
      this.vehicleManager.exitVehicle();
    }
    if (this.cityMapUI.isOpen) {
      this.cityMapUI.close();
    }
    if (this.wantedSystem) {
      this.wantedSystem.clearWanted();
    }
    this.state = 'MENU';
    this.pauseMenu.hide();
    this.hud.hide();
    this.mainMenu.show();
    this.inputManager.exitPointerLock();
  }

  showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  loop(timestamp) {
    requestAnimationFrame((t) => this.loop(t));

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    // Auto-enter game if user presses W, A, S, D, or Space from Menu
    if (this.state === 'MENU') {
      const { forward, strafe } = this.inputManager.getMoveVector();
      if (forward !== 0 || strafe !== 0 || this.inputManager.isJumping()) {
        this.startGame(this.currentDistrict ? this.currentDistrict.id : 'ambedkar_road');
      }
    }

    // Toggle Enlarged Map Key (M)
    if (this.inputManager.wasJustPressed('KeyM')) {
      if (this.state === 'PLAYING') {
        this.cityMapUI.toggle();
      }
    }

    // ESC Key Handling
    if (this.inputManager.wasJustPressed('Escape')) {
      if (this.cityMapUI.isOpen) {
        this.cityMapUI.close();
      } else if (this.state === 'PLAYING') {
        this.pauseGame();
      } else if (this.state === 'PAUSED') {
        this.resumeGame();
      }
    }

    // Determine current active player position (either on foot or vehicle center)
    const activePos = (this.vehicleManager.isDriving && this.vehicleManager.currentController)
      ? this.vehicleManager.currentController.mesh.position
      : this.player.group.position;

    // Update traffic simulation
    if (this.trafficAI) {
      const footPos = (!this.vehicleManager.isDriving && !this.isDead) ? this.player.group.position : null;
      this.trafficAI.update(dt, footPos, (hitVehicle) => {
        if (!this.vehicleManager.isDriving && !this.isDead) {
          const name = hitVehicle.type === 'bus' ? 'BMTC City Bus' : (hitVehicle.type === 'car' ? 'Oncoming Car' : 'Auto-Rickshaw');
          this.triggerPlayerDeath(`Hit by oncoming ${name} on Dr B R Ambedkar Road`);
        }
      });
    }

    // Update Wanted System & Police Pursuit
    if (this.wantedSystem) {
      this.wantedSystem.update(dt);
    }

    if (this.policeAI) {
      this.policeAI.update(dt, activePos);
    }

    // Update Autonomous Pedestrians
    if (this.pedestrianAI) {
      this.pedestrianAI.update(dt, this.player.group.position);
    }

    // Update Destructible Street Furniture
    if (this.destructibleManager) {
      this.destructibleManager.update(
        dt,
        activePos,
        this.vehicleManager.isDriving,
        this.vehicleManager.getCurrentSpeedKmh()
      );
    }

    if (this.state === 'PLAYING' && !this.isDead) {
      // 1. Fixed physics step
      this.sceneManager.step(dt);

      // 2. Vehicle Driving or Foot Character update
      if (this.vehicleManager.isDriving) {
        this.vehicleManager.update(dt);
      } else {
        this.characterController.update(dt);
        this.thirdPersonCamera.update(dt);
        this.vehicleManager.update(dt); // Check proximity to enter vehicles
      }

      // 3. Dynamic environment update
      this.environment.update(activePos);

      // 4. In-Game HUD update
      const activeHeading = this.vehicleManager.isDriving && this.vehicleManager.currentController
        ? this.vehicleManager.currentController.heading
        : this.player.group.rotation.y;

      const displayController = this.vehicleManager.isDriving ? {
        getSpeedKmh: () => this.vehicleManager.getCurrentSpeedKmh(),
        getStaminaPercent: () => 100,
        getHealthPercent: () => this.characterController.getHealthPercent()
      } : this.characterController;

      this.hud.update(
        displayController,
        activePos,
        activeHeading,
        this.trafficAI ? this.trafficAI.getVehicles() : []
      );

      // 5. Update enlarged map if open
      if (this.cityMapUI.isOpen) {
        this.cityMapUI.update();
      }
    } else if (this.state === 'MENU') {
      // Cinematic Camera Orbit around Bengaluru City Center
      this.menuOrbitAngle += dt * 0.12;
      const radius = 55;
      this.camera.position.x = Math.sin(this.menuOrbitAngle) * radius;
      this.camera.position.z = Math.cos(this.menuOrbitAngle) * radius + 20;
      this.camera.position.y = 18 + Math.sin(this.menuOrbitAngle * 2) * 3;
      this.camera.lookAt(0, 4, 30);

      this.environment.update(new THREE.Vector3(0, 0, 30));
    }

    // Input cleanup
    this.inputManager.update();

    // Render 3D Scene
    this.renderer.render(this.sceneManager.scene, this.camera);
  }
}
