import * as THREE from 'three';

export class PedestrianAI {
  constructor(game) {
    this.game = game;
    this.sceneManager = game.sceneManager;
    this.audioManager = game.audioManager;

    this.group = new THREE.Group();
    this.sceneManager.addMesh(this.group);

    this.pedestrians = [];

    this.init();
  }

  init() {
    // Spawn 14 animated pedestrians along sidewalks & crosswalks
    const outfits = [
      { shirt: '#2b2b2b', pants: '#4a6fa5', skin: '#a36d46' }, // Techie in jeans
      { shirt: '#d63031', pants: '#2d3436', skin: '#724a2e' }, // Red kurta
      { shirt: '#f5b000', pants: '#202c39', skin: '#c4916a' }, // Yellow shirt
      { shirt: '#00b894', pants: '#b89f72', skin: '#e0ab85' }, // Green polo
      { shirt: '#6c5ce7', pants: '#2d3436', skin: '#a36d46' }, // Purple top
      { shirt: '#ffffff', pants: '#4a6fa5', skin: '#724a2e' }, // White casual
    ];

    // Sidewalk pedestrians along Ambedkar Road (East and West sides)
    for (let z = -140; z <= 140; z += 25) {
      if (Math.abs(z) < 20) continue; // Skip intersection center
      const outfit = outfits[Math.floor(Math.random() * outfits.length)];
      const side = z % 50 === 0 ? -12.5 : 12.5;
      const dirZ = Math.random() > 0.5 ? 1 : -1;

      this.pedestrians.push(this.createPedestrian({
        id: `ped_${z}`,
        x: side + (Math.random() - 0.5) * 1.5,
        z: z,
        dirZ: dirZ,
        speed: 1.4 + Math.random() * 0.6, // Walking speed ~5 km/h
        outfit
      }));
    }
  }

  createPedestrian({ id, x, z, dirZ, speed, outfit }) {
    const ped = new THREE.Group();
    ped.position.set(x, 0.25, z); // On sidewalk level (y = 0.25)

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: outfit.skin, roughness: 0.65 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: outfit.shirt, roughness: 0.7 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: outfit.pants, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.22), shirtMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    ped.add(torso);

    // Head & Hair
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.22), skinMat);
    head.position.y = 1.5;
    head.castShadow = true;
    ped.add(head);

    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.24), hairMat);
    hair.position.set(0, 1.6, -0.01);
    ped.add(hair);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.1, 0.42, 0.1);
    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.set(-0.25, 1.1, 0);
    leftArm.castShadow = true;
    ped.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    rightArm.position.set(0.25, 1.1, 0);
    rightArm.castShadow = true;
    ped.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.13, 0.68, 0.13);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.11, 0.45, 0);
    leftLeg.castShadow = true;
    ped.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.11, 0.45, 0);
    rightLeg.castShadow = true;
    ped.add(rightLeg);

    this.group.add(ped);

    return {
      id,
      mesh: ped,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      dirZ,
      speed,
      animTime: Math.random() * 10,
      state: 'WALKING', // 'WALKING', 'ANGRY', 'FLEEING'
      attackCooldown: 0,
      baseX: x
    };
  }

  update(dt, playerPos) {
    if (!playerPos) return;

    for (const p of this.pedestrians) {
      p.animTime += dt;

      const distToPlayer = p.mesh.position.distanceTo(playerPos);

      // 1. Check if Player disturbs or attacks Pedestrian
      if (distToPlayer < 1.7 && p.state !== 'ANGRY') {
        p.state = 'ANGRY';
        p.attackCooldown = 0.5;
        this.game.showToast('⚠️ CITIZEN PROVOKED! Pedestrian is attacking in self-defense!', 2500);

        // Alert Wanted System
        if (this.game.wantedSystem) {
          this.game.wantedSystem.addCrime('pedestrian_assault', 1);
        }
      }

      if (p.state === 'ANGRY') {
        // Turn to face player
        const dx = playerPos.x - p.mesh.position.x;
        const dz = playerPos.z - p.mesh.position.z;
        p.mesh.rotation.y = Math.atan2(dx, dz);

        // Advance towards player to fight
        if (distToPlayer > 1.2) {
          p.mesh.position.x += Math.sin(p.mesh.rotation.y) * 2.5 * dt;
          p.mesh.position.z += Math.cos(p.mesh.rotation.y) * 2.5 * dt;
        }

        // Punch Attack
        p.attackCooldown -= dt;
        if (p.attackCooldown <= 0 && distToPlayer < 1.8) {
          p.attackCooldown = 1.1; // Attack cadence

          // Punch Animation (Arm thrust)
          p.rightArm.rotation.x = -1.4;
          this.audioManager.playPunch();

          // Deal damage to player!
          if (this.game.characterController) {
            this.game.characterController.hp = Math.max(0, this.game.characterController.hp - 16);
            this.game.showToast('💥 You were hit by the pedestrian! -16 HP', 1800);

            // If player dies from pedestrian brawl
            if (this.game.characterController.hp <= 0) {
              this.game.triggerPlayerDeath('Knocked Out in Street Brawl on Ambedkar Road');
            }
          }
        } else {
          p.rightArm.rotation.x = THREE.MathUtils.lerp(p.rightArm.rotation.x, -0.6, 0.2);
          p.leftArm.rotation.x = THREE.MathUtils.lerp(p.leftArm.rotation.x, -0.6, 0.2);
        }

        // Return to normal walking after 12 seconds if player runs away
        if (distToPlayer > 18.0) {
          p.state = 'WALKING';
        }
      } else {
        // Normal Autonomous Sidewalk Walk Cycle
        p.mesh.position.z += p.dirZ * p.speed * dt;

        // Wrap around sidewalk path
        if (p.dirZ === 1 && p.mesh.position.z > 160) {
          p.dirZ = -1;
        } else if (p.dirZ === -1 && p.mesh.position.z < -160) {
          p.dirZ = 1;
        }

        p.mesh.rotation.y = p.dirZ === 1 ? 0 : Math.PI;

        // Striding Animation
        const cycle = Math.sin(p.animTime * 6.0);
        p.leftLeg.rotation.x = cycle * 0.55;
        p.rightLeg.rotation.x = -cycle * 0.55;
        p.leftArm.rotation.x = -cycle * 0.45;
        p.rightArm.rotation.x = cycle * 0.45;
      }
    }
  }

  getPedestrians() {
    return this.pedestrians;
  }
}

