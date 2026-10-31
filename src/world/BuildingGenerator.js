import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class BuildingGenerator {
  constructor(sceneManager, assetManager) {
    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.group = new THREE.Group();
    this.sceneManager.addMesh(this.group);
  }

  /**
   * Spawns a high-detail building with rooftop details and physics collider
   */
  createBuilding({ x, z, width = 24, depth = 24, height = 35, style = 'tech-glass', rotationY = 0 }) {
    const buildingGroup = new THREE.Group();
    buildingGroup.position.set(x, 0, z);
    buildingGroup.rotation.y = rotationY;

    // Facade Texture
    const facadeTex = this.assetManager.getFacadeTexture(style);
    facadeTex.repeat.set(width / 8, height / 8);

    // Main Tower Mesh
    const buildingGeo = new THREE.BoxGeometry(width, height, depth);
    const buildingMat = new THREE.MeshStandardMaterial({
      map: facadeTex,
      roughness: style === 'tech-glass' ? 0.2 : 0.8,
      metalness: style === 'tech-glass' ? 0.6 : 0.1
    });

    const buildingMesh = new THREE.Mesh(buildingGeo, buildingMat);
    buildingMesh.position.y = height / 2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    buildingGroup.add(buildingMesh);

    // Rooftop Accents (Water tanks, AC condensers, communication tower)
    this.addRooftopDetails(buildingGroup, width, height, depth);

    // Ground Floor Entrance Porch / Canopy
    const canopyGeo = new THREE.BoxGeometry(width * 0.4, 0.4, 4);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, metalness: 0.8 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 4.5, depth / 2 + 2);
    canopy.castShadow = true;
    buildingGroup.add(canopy);

    this.group.add(buildingGroup);

    // Physics Static Collider Box
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)),
      position: new CANNON.Vec3(x, height / 2, z)
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationY);
    this.sceneManager.addBody(body);
    this.sceneManager.addCollider(buildingMesh);

    return buildingGroup;
  }

  /**
   * Authentic Indian Rooftop Props: Sintex water tank, AC units, Antenna
   */
  addRooftopDetails(parent, w, h, d) {
    const roofY = h;

    // 1. Classic Black Sintex Water Tank
    const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(w * 0.25, roofY + 1.25, d * 0.2);
    tank.castShadow = true;
    parent.add(tank);

    // 2. AC Condenser Units
    const acGeo = new THREE.BoxGeometry(2, 1.4, 1.2);
    const acMat = new THREE.MeshStandardMaterial({ color: 0xdfe6e9, metalness: 0.3 });
    const ac1 = new THREE.Mesh(acGeo, acMat);
    ac1.position.set(-w * 0.25, roofY + 0.7, -d * 0.2);
    ac1.castShadow = true;
    parent.add(ac1);

    // 3. Communications Mast
    const mastGeo = new THREE.CylinderGeometry(0.08, 0.15, 8, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xd63031, metalness: 0.9 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, roofY + 4, 0);
    mast.castShadow = true;
    parent.add(mast);

    // Red warning beacon at mast tip
    const beacon = new THREE.PointLight(0xff0000, 1.5, 12);
    beacon.position.set(0, roofY + 8, 0);
    parent.add(beacon);
  }

  /**
   * Compound Boundary Wall with Pillars and Gate
   */
  createCompoundWall({ x, z, length, rotationY = 0 }) {
    const wallGeo = new THREE.BoxGeometry(length, 2.2, 0.4);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe0d6cc, roughness: 0.9 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, 1.1, z);
    wall.rotation.y = rotationY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.group.add(wall);

    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(length / 2, 1.1, 0.2)),
      position: new CANNON.Vec3(x, 1.1, z)
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationY);
    this.sceneManager.addBody(body);
    this.sceneManager.addCollider(wall);
  }
}

