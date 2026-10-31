import * as THREE from 'three';

export class ThirdPersonCamera {
  constructor(camera, target, sceneManager, inputManager) {
    this.camera = camera;
    this.target = target;
    this.sceneManager = sceneManager;
    this.inputManager = inputManager;

    // Spherical orbit angles
    this.yaw = 0;
    this.pitch = 0.25; // Gentle downward look

    // Camera distances
    this.idealDistance = 4.2;
    this.currentDistance = 4.2;
    this.minDistance = 1.2;
    this.maxDistance = 8.0;

    // View Modes: 'third_person' or 'first_person'
    this.mode = 'third_person';

    // Offsets
    this.targetOffset = new THREE.Vector3(0, 1.5, 0); // Shoulder/head height
    this.smoothedTarget = new THREE.Vector3();

    // Raycast for camera collision prevention
    this.camRaycaster = new THREE.Raycaster();

    this.init();
  }

  init() {
    this.camera.fov = 65;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.updateProjectionMatrix();

    if (this.target) {
      this.smoothedTarget.copy(this.target.position).add(this.targetOffset);
    }
  }

  toggleViewMode() {
    this.mode = (this.mode === 'third_person') ? 'first_person' : 'third_person';
    // Hide/show player model in first person
    if (this.target) {
      this.target.visible = (this.mode === 'third_person');
    }
  }

  update(dt) {
    if (!this.target) return;

    // Check for View Mode Toggle key ('KeyC')
    if (this.inputManager.wasJustPressed('KeyC')) {
      this.toggleViewMode();
    }

    // 1. Process Mouse Rotation
    const { x: dx, y: dy } = this.inputManager.getMouseDelta();
    const rotSpeed = 0.0028;

    this.yaw -= dx * rotSpeed;
    this.pitch -= dy * rotSpeed;

    // Clamp Pitch to prevent camera flipping
    this.pitch = Math.max(-0.6, Math.min(1.25, this.pitch));

    // Normalize Yaw
    while (this.yaw < 0) this.yaw += Math.PI * 2;
    while (this.yaw >= Math.PI * 2) this.yaw -= Math.PI * 2;

    // 2. Process Zoom
    const wheel = this.inputManager.consumeWheelDelta();
    if (wheel !== 0) {
      this.idealDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.idealDistance + wheel * 0.5));
    }

    // 3. Smooth Target Follow
    const currentTargetPos = this.target.position.clone().add(this.targetOffset);
    this.smoothedTarget.lerp(currentTargetPos, 16 * dt);

    if (this.mode === 'first_person') {
      // First Person: Camera placed directly at eye level
      this.camera.position.copy(this.smoothedTarget);

      const lookTarget = new THREE.Vector3(
        this.camera.position.x - Math.sin(this.yaw) * Math.cos(this.pitch) * 10,
        this.camera.position.y + Math.sin(this.pitch) * 10,
        this.camera.position.z - Math.cos(this.yaw) * Math.cos(this.pitch) * 10
      );
      this.camera.lookAt(lookTarget);
    } else {
      // Third Person GTA-Style Chase Orbit
      const cosPitch = Math.cos(this.pitch);
      const sinPitch = Math.sin(this.pitch);
      const sinYaw = Math.sin(this.yaw);
      const cosYaw = Math.cos(this.yaw);

      // Desired unoccluded camera offset
      const desiredOffset = new THREE.Vector3(
        sinYaw * cosPitch * this.idealDistance,
        sinPitch * this.idealDistance,
        cosYaw * cosPitch * this.idealDistance
      );

      const desiredCamPos = this.smoothedTarget.clone().add(desiredOffset);

      // 4. Spring-Arm Raycast Collision with World Geometry
      const rayOrigin = this.smoothedTarget.clone();
      const rayDir = desiredCamPos.clone().sub(rayOrigin).normalize();
      const rayDist = this.idealDistance;

      const hit = this.sceneManager.raycast(rayOrigin, rayDir, rayDist);

      let actualDistance = this.idealDistance;
      if (hit && hit.distance > 0.5) {
        // Pull camera closer to avoid penetrating the geometry
        actualDistance = Math.max(0.6, hit.distance - 0.25);
      }

      this.currentDistance = THREE.MathUtils.lerp(this.currentDistance, actualDistance, 20 * dt);

      // Final camera position
      this.camera.position.set(
        this.smoothedTarget.x + sinYaw * cosPitch * this.currentDistance,
        this.smoothedTarget.y + sinPitch * this.currentDistance,
        this.smoothedTarget.z + cosYaw * cosPitch * this.currentDistance
      );

      // Subtle look-ahead target
      const lookOffset = new THREE.Vector3(0, 0.2, 0);
      this.camera.lookAt(this.smoothedTarget.clone().add(lookOffset));
    }
  }

  getYaw() {
    return this.yaw;
  }
}

