import * as THREE from 'three';

export class CharacterController {
  constructor(player, inputManager, camera, sceneManager, audioManager) {
    this.player = player;
    this.inputManager = inputManager;
    this.camera = camera;
    this.sceneManager = sceneManager;
    this.audioManager = audioManager;

    // Movement Tuning
    this.walkSpeed = 5.2;     // ~19 km/h
    this.sprintSpeed = 10.5;  // ~38 km/h
    this.crouchSpeed = 2.6;   // ~9 km/h
    this.jumpForce = 7.8;     // Crisp jump force
    this.verticalVelocity = 0;
    this.gravity = 22.0;

    // Vitals
    this.hp = 100;
    this.maxHp = 100;
    this.stamina = 100;
    this.maxStamina = 100;
    this.isExhausted = false;

    // State
    this.isGrounded = true;
    this.currentSpeed = 0;
    this.headingAngle = 0;

    // Sound & Step Timers
    this.stepTimer = 0;

    // Obstacle bounds for collision & sliding
    this.playerRadius = 0.42;
  }

  update(dt) {
    this.handleVitals(dt);
    this.handleMovement(dt);
    this.handleVertical(dt);
    this.handleHonk();

    // Update animations
    const isCrouching = this.inputManager.isCrouching();
    this.player.updateAnimation(dt, this.currentSpeed, this.isGrounded, isCrouching);

    // Sync Cannon-es physics body with character position
    if (this.player.body) {
      this.player.body.position.x = this.player.group.position.x;
      this.player.body.position.y = this.player.group.position.y + 0.88;
      this.player.body.position.z = this.player.group.position.z;
      this.player.body.velocity.set(0, 0, 0); // Keep kinematic stability
    }

    // Play footstep sounds when moving on ground
    if (this.isGrounded && this.currentSpeed > 0.8) {
      const isSprinting = this.currentSpeed > 6.5;
      this.stepTimer += dt;
      const interval = isSprinting ? 0.3 : 0.48;
      if (this.stepTimer >= interval) {
        this.stepTimer = 0;
        this.audioManager.playFootstep(isSprinting);
      }
    } else {
      this.stepTimer = 0;
    }
  }

  handleVitals(dt) {
    const isMoving = this.currentSpeed > 1.0;
    const isSprinting = this.inputManager.isSprinting() && isMoving && !this.isExhausted;

    if (isSprinting) {
      this.stamina = Math.max(0, this.stamina - 24 * dt);
      if (this.stamina <= 0) {
        this.isExhausted = true;
      }
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + 20 * dt);
      if (this.isExhausted && this.stamina > 25) {
        this.isExhausted = false;
      }
    }
  }

  handleMovement(dt) {
    const { forward, strafe } = this.inputManager.getMoveVector();
    const isCrouching = this.inputManager.isCrouching();
    const isSprinting = this.inputManager.isSprinting() && !this.isExhausted && !isCrouching;

    let targetSpeed = 0;
    if (forward !== 0 || strafe !== 0) {
      if (isCrouching) {
        targetSpeed = this.crouchSpeed;
      } else if (isSprinting) {
        targetSpeed = this.sprintSpeed;
      } else {
        targetSpeed = this.walkSpeed;
      }
    }

    // Smooth acceleration / deceleration
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, 14 * dt);

    if (forward !== 0 || strafe !== 0) {
      // Calculate world direction vectors from camera horizontal yaw
      const camYaw = this.camera.getYaw();

      // Forward vector (-Z facing at yaw=0)
      const forwardX = -Math.sin(camYaw);
      const forwardZ = -Math.cos(camYaw);

      // Right strafe vector (+X at yaw=0)
      const rightX = Math.cos(camYaw);
      const rightZ = -Math.sin(camYaw);

      // Combine input
      let dirX = forwardX * forward + rightX * strafe;
      let dirZ = forwardZ * forward + rightZ * strafe;
      const mag = Math.hypot(dirX, dirZ);

      if (mag > 0.001) {
        dirX /= mag;
        dirZ /= mag;

        const moveStepX = dirX * this.currentSpeed * dt;
        const moveStepZ = dirZ * this.currentSpeed * dt;

        const currentX = this.player.group.position.x;
        const currentZ = this.player.group.position.z;

        // Slide collision response: test X and Z independently
        const nextX = currentX + moveStepX;
        const nextZ = currentZ + moveStepZ;

        if (!this.checkObstacleCollision(nextX, currentZ)) {
          this.player.group.position.x = nextX;
        }
        if (!this.checkObstacleCollision(this.player.group.position.x, nextZ)) {
          this.player.group.position.z = nextZ;
        }

        // Smoothly rotate character toward movement heading
        this.headingAngle = Math.atan2(dirX, dirZ);
        let currentAngle = this.player.group.rotation.y;
        let diff = this.headingAngle - currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.player.group.rotation.y += diff * 16 * dt;
      }
    }
  }

  handleVertical(dt) {
    // Apply Gravity
    this.verticalVelocity -= this.gravity * dt;
    let nextY = this.player.group.position.y + this.verticalVelocity * dt;

    // Determine ground height beneath player
    const groundHeight = this.getGroundHeight(
      this.player.group.position.x,
      this.player.group.position.z
    );

    if (nextY <= groundHeight) {
      if (!this.isGrounded && this.verticalVelocity < -3.0) {
        this.audioManager.playLand();
      }
      nextY = groundHeight;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    this.player.group.position.y = nextY;

    // Handle Jump
    if (this.inputManager.isJumping() && this.isGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
      this.audioManager.playJump();
    }
  }

  handleHonk() {
    if (this.inputManager.wasJustPressed('KeyH')) {
      this.audioManager.playAutoHorn(0);
    }
  }

  /**
   * Fast AABB Obstacle Collision & Sliding
   */
  checkObstacleCollision(testWorldX, testWorldZ) {
    // Map edge boundaries
    if (Math.abs(testWorldX) > 220 || Math.abs(testWorldZ) > 240) {
      return true;
    }

    const boxes = this.sceneManager.getColliderBoxes();
    const r = this.playerRadius;

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      // Expand box by player radius
      if (
        testWorldX >= box.min.x - r &&
        testWorldX <= box.max.x + r &&
        testWorldZ >= box.min.z - r &&
        testWorldZ <= box.max.z + r
      ) {
        // Check if player is above the box (e.g., walking on top of sidewalk or ramp)
        if (this.player.group.position.y >= box.max.y - 0.1) {
          continue; // Walking on top is allowed
        }
        return true;
      }
    }

    return false;
  }

  /**
   * Returns exact elevation of ground / sidewalks / flyover
   */
  getGroundHeight(x, z) {
    // Flyover elevated corridor
    if (Math.abs(x) < 7.0 && z >= -230 && z <= -70) {
      return 8.0;
    }

    // Sidewalks along Ambedkar Road (elevated curb 0.25m)
    if (Math.abs(x) >= 10.0 && Math.abs(x) <= 15.0 && Math.abs(z) > 12.0) {
      return 0.25;
    }

    // Default street asphalt
    return 0.0;
  }

  getSpeedKmh() {
    return Math.round(this.currentSpeed * 3.6);
  }

  getStaminaPercent() {
    return (this.stamina / this.maxStamina) * 100;
  }

  getHealthPercent() {
    return (this.hp / this.maxHp) * 100;
  }
}
