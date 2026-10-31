import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    // Physics World setup
    this.world = new CANNON.World();
    this.world.gravity.set(0, -18.0, 0); // Crisp game physics gravity
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;

    // Contact Materials
    this.defaultMaterial = new CANNON.Material('default');
    this.playerMaterial = new CANNON.Material('player');
    this.groundMaterial = new CANNON.Material('ground');

    const playerGroundContact = new CANNON.ContactMaterial(
      this.playerMaterial,
      this.groundMaterial,
      {
        friction: 0.1,
        restitution: 0.0
      }
    );
    this.world.addContactMaterial(playerGroundContact);

    // Track synced objects
    this.physicsObjects = [];

    // Collision boundaries & raycast targets
    this.colliders = [];
    this.colliderBoxes = [];
    this.raycaster = new THREE.Raycaster();
  }

  addMesh(mesh) {
    this.scene.add(mesh);
    return mesh;
  }

  removeMesh(mesh) {
    this.scene.remove(mesh);
  }

  addBody(body) {
    this.world.addBody(body);
    return body;
  }

  removeBody(body) {
    this.world.removeBody(body);
  }

  addPhysicsMesh(mesh, body) {
    this.addMesh(mesh);
    this.addBody(body);
    this.physicsObjects.push({ mesh, body });
  }

  addCollider(mesh, boxBounds = null) {
    this.colliders.push(mesh);
    if (boxBounds) {
      this.colliderBoxes.push(boxBounds);
    } else {
      const box = new THREE.Box3().setFromObject(mesh);
      this.colliderBoxes.push(box);
    }
  }

  getColliders() {
    return this.colliders;
  }

  getColliderBoxes() {
    return this.colliderBoxes;
  }

  /**
   * Fast Raycast against collision geometry
   */
  raycast(origin, direction, maxDistance = 100) {
    this.raycaster.set(origin, direction);
    this.raycaster.far = maxDistance;
    const intersects = this.raycaster.intersectObjects(this.colliders, true);
    return intersects.length > 0 ? intersects[0] : null;
  }

  /**
   * Fixed Timestep Physics Update
   */
  step(dt) {
    const fixedTimeStep = 1.0 / 60.0;
    this.world.step(fixedTimeStep, dt, 3);

    for (let i = 0; i < this.physicsObjects.length; i++) {
      const { mesh, body } = this.physicsObjects[i];
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    }
  }
}

