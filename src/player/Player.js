import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Player {
  constructor(sceneManager, customization) {
    this.sceneManager = sceneManager;
    this.customization = customization;

    this.group = new THREE.Group();
    this.sceneManager.addMesh(this.group);

    // Animation state
    this.animTime = 0;
    this.currentAnim = 'idle';
    this.blendFactor = 0;

    // Build Articulated 3D Rig
    this.buildCharacterRig();

    // Physics Body
    this.initPhysics();

    // Listen for customization updates
    this.customization.subscribe((data) => this.updateMaterials(data));
  }

  buildCharacterRig() {
    this.parts = {};

    // 1. Root Anchor
    this.root = new THREE.Group();
    this.group.add(this.root);

    // 2. Pelvis / Hips
    this.matJeans = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.customization.jeansColor),
      roughness: 0.75
    });

    const pelvisGeo = new THREE.BoxGeometry(0.38, 0.22, 0.24);
    this.pelvis = new THREE.Mesh(pelvisGeo, this.matJeans);
    this.pelvis.position.y = 0.95;
    this.pelvis.castShadow = true;
    this.root.add(this.pelvis);
    this.parts.pelvis = this.pelvis;

    // 3. Torso (Polo Shirt from reference art)
    this.matShirt = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.customization.shirtColor),
      roughness: 0.6
    });

    const torsoGeo = new THREE.BoxGeometry(0.42, 0.48, 0.26);
    this.torso = new THREE.Mesh(torsoGeo, this.matShirt);
    this.torso.position.y = 0.32;
    this.torso.castShadow = true;
    this.pelvis.add(this.torso);
    this.parts.torso = this.torso;

    // Polo Collar
    const collarGeo = new THREE.BoxGeometry(0.26, 0.08, 0.22);
    const collar = new THREE.Mesh(collarGeo, this.matShirt);
    collar.position.set(0, 0.26, 0.02);
    this.torso.add(collar);

    // 4. Head & Neck
    this.matSkin = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.customization.skinTone),
      roughness: 0.65
    });

    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.12, 12);
    const neck = new THREE.Mesh(neckGeo, this.matSkin);
    neck.position.y = 0.3;
    this.torso.add(neck);

    this.head = new THREE.Group();
    this.head.position.y = 0.15;
    neck.add(this.head);
    this.parts.head = this.head;

    const headGeo = new THREE.BoxGeometry(0.24, 0.26, 0.24);
    const headMesh = new THREE.Mesh(headGeo, this.matSkin);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Hair (Jet black styled hair with side sweep)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9 });
    const hairGeo = new THREE.BoxGeometry(0.26, 0.14, 0.26);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.12, -0.01);
    this.head.add(hair);

    // 5. Arms
    this.leftArm = this.createArm(-1);
    this.leftArm.position.set(-0.26, 0.18, 0);
    this.torso.add(this.leftArm);
    this.parts.leftArm = this.leftArm;

    this.rightArm = this.createArm(1);
    this.rightArm.position.set(0.26, 0.18, 0);
    this.torso.add(this.rightArm);
    this.parts.rightArm = this.rightArm;

    // 6. Legs & Sneakers
    this.matShoes = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.customization.shoesColor),
      roughness: 0.5
    });
    this.matSole = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

    this.leftLeg = this.createLeg(-1);
    this.leftLeg.position.set(-0.12, -0.1, 0);
    this.pelvis.add(this.leftLeg);
    this.parts.leftLeg = this.leftLeg;

    this.rightLeg = this.createLeg(1);
    this.rightLeg.position.set(0.12, -0.1, 0);
    this.pelvis.add(this.rightLeg);
    this.parts.rightLeg = this.rightLeg;
  }

  createArm(side) {
    const shoulder = new THREE.Group();

    // Upper arm (Polo short sleeve)
    const sleeveGeo = new THREE.BoxGeometry(0.12, 0.24, 0.12);
    const sleeve = new THREE.Mesh(sleeveGeo, this.matShirt);
    sleeve.position.y = -0.12;
    sleeve.castShadow = true;
    shoulder.add(sleeve);

    // Forearm & Hand (Skin)
    const forearmGeo = new THREE.BoxGeometry(0.1, 0.22, 0.1);
    const forearm = new THREE.Mesh(forearmGeo, this.matSkin);
    forearm.position.y = -0.32;
    forearm.castShadow = true;
    shoulder.add(forearm);

    return shoulder;
  }

  createLeg(side) {
    const hip = new THREE.Group();

    // Thigh
    const thighGeo = new THREE.BoxGeometry(0.15, 0.42, 0.15);
    const thigh = new THREE.Mesh(thighGeo, this.matJeans);
    thigh.position.y = -0.21;
    thigh.castShadow = true;
    hip.add(thigh);

    // Shin with rolled cuff
    const shinGeo = new THREE.BoxGeometry(0.13, 0.38, 0.13);
    const shin = new THREE.Mesh(shinGeo, this.matJeans);
    shin.position.y = -0.58;
    shin.castShadow = true;
    hip.add(shin);

    // Rolled Denim Cuff
    const cuffGeo = new THREE.BoxGeometry(0.15, 0.06, 0.15);
    const cuffMat = new THREE.MeshStandardMaterial({ color: 0x93b5e1, roughness: 0.9 });
    const cuff = new THREE.Mesh(cuffGeo, cuffMat);
    cuff.position.y = -0.74;
    hip.add(cuff);

    // Sneaker
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.84, 0.05);

    // Shoe Upper
    const shoeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.26);
    const shoeUpper = new THREE.Mesh(shoeGeo, this.matShoes);
    shoeUpper.castShadow = true;
    shoeGroup.add(shoeUpper);

    // White Rubber Sole
    const soleGeo = new THREE.BoxGeometry(0.15, 0.04, 0.27);
    const sole = new THREE.Mesh(soleGeo, this.matSole);
    sole.position.y = -0.06;
    sole.castShadow = true;
    shoeGroup.add(sole);

    hip.add(shoeGroup);
    return hip;
  }

  initPhysics() {
    // Player Cannon Physics Cylinder (capsule-like response)
    const radius = 0.35;
    const height = 1.75;
    const shape = new CANNON.Cylinder(radius, radius, height, 12);

    this.body = new CANNON.Body({
      mass: 75, // 75 kg player
      material: this.sceneManager.playerMaterial,
      fixedRotation: true, // Prevent player from tumbling
      linearDamping: 0.88
    });
    this.body.addShape(shape);
    this.body.position.set(0, 1.2, 40);

    this.sceneManager.addBody(this.body);
  }

  updateMaterials(data) {
    if (this.matSkin) this.matSkin.color.set(data.skinTone);
    if (this.matShirt) this.matShirt.color.set(data.shirtColor);
    if (this.matJeans) this.matJeans.color.set(data.jeansColor);
    if (this.matShoes) this.matShoes.color.set(data.shoesColor);
  }

  setAnimation(animName) {
    if (this.currentAnim !== animName) {
      this.currentAnim = animName;
    }
  }

  /**
   * Procedural Skeletal Animation Update
   */
  updateAnimation(dt, speed, isGrounded, isCrouching) {
    this.animTime += dt;

    if (!isGrounded) {
      // JUMP Airborne Pose
      this.parts.leftArm.rotation.x = THREE.MathUtils.lerp(this.parts.leftArm.rotation.x, -1.2, 0.2);
      this.parts.rightArm.rotation.x = THREE.MathUtils.lerp(this.parts.rightArm.rotation.x, -1.2, 0.2);
      this.parts.leftLeg.rotation.x = THREE.MathUtils.lerp(this.parts.leftLeg.rotation.x, -0.6, 0.2);
      this.parts.rightLeg.rotation.x = THREE.MathUtils.lerp(this.parts.rightLeg.rotation.x, 0.4, 0.2);
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.1, 0.2);
      this.pelvis.position.y = THREE.MathUtils.lerp(this.pelvis.position.y, 1.05, 0.2);
      return;
    }

    if (isCrouching) {
      // Crouch Pose
      this.pelvis.position.y = THREE.MathUtils.lerp(this.pelvis.position.y, 0.65, 0.15);
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.4, 0.15);
      this.parts.leftLeg.rotation.x = -0.3;
      this.parts.rightLeg.rotation.x = -0.3;
      return;
    }

    if (speed < 0.2) {
      // IDLE Breathing Cycle
      const breathe = Math.sin(this.animTime * 2.5);
      this.pelvis.position.y = THREE.MathUtils.lerp(this.pelvis.position.y, 0.95 + breathe * 0.015, 0.1);
      this.torso.rotation.x = breathe * 0.02;
      this.parts.leftArm.rotation.x = THREE.MathUtils.lerp(this.parts.leftArm.rotation.x, 0.05, 0.1);
      this.parts.rightArm.rotation.x = THREE.MathUtils.lerp(this.parts.rightArm.rotation.x, 0.05, 0.1);
      this.parts.leftLeg.rotation.x = THREE.MathUtils.lerp(this.parts.leftLeg.rotation.x, 0, 0.1);
      this.parts.rightLeg.rotation.x = THREE.MathUtils.lerp(this.parts.rightLeg.rotation.x, 0, 0.1);
      this.torso.rotation.y = THREE.MathUtils.lerp(this.torso.rotation.y, 0, 0.1);
    } else {
      // LOCOMOTION (Walk / Sprint)
      const freq = speed > 6.0 ? 11.0 : 7.0; // Higher frequency when sprinting
      const strideAngle = speed > 6.0 ? 0.95 : 0.65;
      const armAngle = speed > 6.0 ? 1.05 : 0.65;

      const cycle = Math.sin(this.animTime * freq);
      const verticalBob = Math.abs(Math.sin(this.animTime * freq)) * (speed > 6.0 ? 0.07 : 0.035);

      // Pelvis movement
      this.pelvis.position.y = 0.95 + verticalBob;

      // Legs alternating
      this.parts.leftLeg.rotation.x = cycle * strideAngle;
      this.parts.rightLeg.rotation.x = -cycle * strideAngle;

      // Arms swing counter to legs
      this.parts.leftArm.rotation.x = -cycle * armAngle;
      this.parts.rightArm.rotation.x = cycle * armAngle;

      // Torso lean into motion
      const forwardLean = speed > 6.0 ? 0.22 : 0.08;
      this.torso.rotation.x = forwardLean;
      this.torso.rotation.y = cycle * 0.08; // Torso twist
    }
  }

  setPosition(pos) {
    this.body.position.copy(pos);
    this.body.velocity.set(0, 0, 0);
    this.group.position.copy(pos);
  }

  getPosition() {
    return this.group.position;
  }
}

