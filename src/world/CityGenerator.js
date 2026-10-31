import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class CityGenerator {
  constructor(sceneManager, assetManager, buildingGenerator) {
    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.buildingGenerator = buildingGenerator;

    this.group = new THREE.Group();
    this.sceneManager.addMesh(this.group);

    this.districts = [
      {
        id: 'ambedkar_road',
        name: 'Dr B R Ambedkar Road',
        tagline: 'Sampangi Rama Nagara • Heart of Bengaluru',
        spawn: new THREE.Vector3(0, 1.2, 40),
        desc: 'Wide arterial avenue near Vidhana Soudha with grand boulevards and administrative centers.'
      },
      {
        id: 'mg_road',
        name: 'MG Road & Brigade',
        tagline: 'Commercial Hub • Cafes & Nightlife',
        spawn: new THREE.Vector3(45, 1.2, -60),
        desc: 'Bustling retail, premier bookshops, historic restaurants and metro connectivity.'
      },
      {
        id: 'whitefield_tech',
        name: 'Whitefield IT Park',
        tagline: 'Silicon Valley of India',
        spawn: new THREE.Vector3(-65, 1.2, 120),
        desc: 'Gleaming glass technology towers, software campuses, and modern startups.'
      },
      {
        id: 'malleshwaram',
        name: 'Margosa Road, Malleshwaram',
        tagline: 'Traditional Heritage & Trees',
        spawn: new THREE.Vector3(-80, 1.2, -10),
        desc: 'Avenue lined with ancient neem and rain trees, traditional tiffin rooms, and temples.'
      }
    ];

    this.init();
  }

  init() {
    this.buildCityBlocks();
    this.buildTreesAndPark();
    this.buildFuelStation();
    this.buildBengaluruAutos();
    this.buildStreetProps();
  }

  getDistricts() {
    return this.districts;
  }

  getDistrictById(id) {
    return this.districts.find(d => d.id === id) || this.districts[0];
  }

  /**
   * Layout City Blocks along avenues
   */
  buildCityBlocks() {
    // East Side Blocks (Commercial & IT)
    this.buildingGenerator.createBuilding({
      x: 35, z: 60, width: 28, depth: 32, height: 48, style: 'tech-glass'
    });
    this.buildingGenerator.createBuilding({
      x: 35, z: 120, width: 26, depth: 28, height: 38, style: 'commercial-shops'
    });
    this.buildingGenerator.createBuilding({
      x: 35, z: -60, width: 30, depth: 30, height: 56, style: 'tech-glass'
    });
    this.buildingGenerator.createBuilding({
      x: 35, z: -130, width: 26, depth: 26, height: 32, style: 'commercial-shops'
    });

    // West Side Blocks (Offices & Heritage)
    this.buildingGenerator.createBuilding({
      x: -35, z: 60, width: 28, depth: 30, height: 42, style: 'commercial-shops'
    });
    this.buildingGenerator.createBuilding({
      x: -35, z: 130, width: 30, depth: 32, height: 62, style: 'tech-glass'
    });
    this.buildingGenerator.createBuilding({
      x: -35, z: -60, width: 26, depth: 28, height: 36, style: 'residential'
    });

    // Cross Road East Blocks
    this.buildingGenerator.createBuilding({
      x: 90, z: 32, width: 32, depth: 26, height: 45, style: 'tech-glass'
    });
    this.buildingGenerator.createBuilding({
      x: 90, z: -32, width: 28, depth: 26, height: 40, style: 'commercial-shops'
    });

    // Cross Road West Blocks (Malleshwaram style low-rise)
    this.buildingGenerator.createBuilding({
      x: -90, z: 32, width: 26, depth: 24, height: 26, style: 'residential'
    });
    this.buildingGenerator.createBuilding({
      x: -90, z: -32, width: 28, depth: 24, height: 24, style: 'residential'
    });

    // Perimeter compound walls along sidewalks
    this.buildingGenerator.createCompoundWall({ x: 22, z: 60, length: 28, rotationY: Math.PI / 2 });
    this.buildingGenerator.createCompoundWall({ x: -22, z: 60, length: 28, rotationY: Math.PI / 2 });
  }

  /**
   * Bengaluru "Garden City" Trees (Gulmohar with scarlet flowers, Rain trees)
   */
  buildTreesAndPark() {
    // Trees along Ambedkar Road sidewalks
    for (let z = -180; z <= 180; z += 30) {
      if (Math.abs(z) < 30) continue;
      this.createBengaluruTree(-18, z, (z % 60 === 0) ? 'gulmohar' : 'rain-tree');
      this.createBengaluruTree(18, z, (z % 60 === 0) ? 'gulmohar' : 'rain-tree');
    }

    // Cubbon Park inspired garden corner in North-West
    const parkX = -50;
    const parkZ = -120;
    const lawnGeo = new THREE.PlaneGeometry(50, 60);
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(parkX, 0.04, parkZ);
    lawn.receiveShadow = true;
    this.group.add(lawn);

    // Park trees inside the lawn
    this.createBengaluruTree(parkX - 12, parkZ - 10, 'gulmohar');
    this.createBengaluruTree(parkX + 10, parkZ - 8, 'rain-tree');
    this.createBengaluruTree(parkX - 8, parkZ + 12, 'rain-tree');
    this.createBengaluruTree(parkX + 12, parkZ + 14, 'gulmohar');
  }

  createBengaluruTree(x, z, type = 'gulmohar') {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 4.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.95 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Foliage (Low-poly faceted crowns matching screenshot art style)
    const crownGeo = new THREE.DodecahedronGeometry(2.8, 1);
    const crownMat = new THREE.MeshStandardMaterial({
      color: type === 'gulmohar' ? 0x2e7d32 : 0x388e3c,
      roughness: 0.85,
      flatShading: true
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 5.6;
    crown.castShadow = true;
    crown.receiveShadow = true;
    tree.add(crown);

    // If Gulmohar, add scarlet red flower accents
    if (type === 'gulmohar') {
      const flowerGeo = new THREE.DodecahedronGeometry(1.6, 0);
      const flowerMat = new THREE.MeshStandardMaterial({
        color: 0xd63031,
        roughness: 0.7,
        flatShading: true
      });
      const flowers = new THREE.Mesh(flowerGeo, flowerMat);
      flowers.position.set(0.6, 6.4, 0.4);
      flowers.castShadow = true;
      tree.add(flowers);
    }

    this.group.add(tree);

    // Physics trunk cylinder collider
    const trunkBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Cylinder(0.4, 0.6, 4.5, 8),
      position: new CANNON.Vec3(x, 2.25, z)
    });
    this.sceneManager.addBody(trunkBody);
    this.sceneManager.addCollider(trunk);
  }

  /**
   * Fuel Station (Directly matching screenshot media_1793456707525_dc509ece.jpg)
   */
  buildFuelStation() {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(-38, 0, -10);

    // Concrete Pad
    const padGeo = new THREE.BoxGeometry(22, 0.15, 20);
    const padMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, roughness: 0.85 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.08;
    pad.receiveShadow = true;
    stationGroup.add(pad);

    // Green Canopy Roof (Quintessential Indian Petrol Pump)
    const canopyGeo = new THREE.BoxGeometry(18, 0.7, 14);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x00b894, roughness: 0.4 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 5.5, 0);
    canopy.castShadow = true;
    stationGroup.add(canopy);

    // White Support Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.5 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.5, 12), pillarMat);
    p1.position.set(-6, 2.75, 0);
    p1.castShadow = true;
    stationGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.5, 12), pillarMat);
    p2.position.set(6, 2.75, 0);
    p2.castShadow = true;
    stationGroup.add(p2);

    // Fuel Dispenser Pumps (Green and Blue)
    const pumpGeo = new THREE.BoxGeometry(1.2, 2.2, 1.4);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, roughness: 0.3 });
    const pump1 = new THREE.Mesh(pumpGeo, pumpMat);
    pump1.position.set(-2, 1.1, 0);
    pump1.castShadow = true;
    stationGroup.add(pump1);

    const pump2 = new THREE.Mesh(pumpGeo, new THREE.MeshStandardMaterial({ color: 0x00b894 }));
    pump2.position.set(2, 1.1, 0);
    pump2.castShadow = true;
    stationGroup.add(pump2);

    // Canopy Lights
    const pumpLight = new THREE.PointLight(0xffffff, 2.0, 18);
    pumpLight.position.set(0, 5.0, 0);
    stationGroup.add(pumpLight);

    this.group.add(stationGroup);

    // Colliders for station pillars & pumps
    const pBody1 = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Cylinder(0.4, 0.4, 5.5, 8),
      position: new CANNON.Vec3(-38 - 6, 2.75, -10)
    });
    this.sceneManager.addBody(pBody1);
    this.sceneManager.addCollider(p1);

    const pBody2 = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Cylinder(0.4, 0.4, 5.5, 8),
      position: new CANNON.Vec3(-38 + 6, 2.75, -10)
    });
    this.sceneManager.addBody(pBody2);
    this.sceneManager.addCollider(p2);
  }

  /**
   * Iconic Bengaluru Auto-Rickshaws (Green & Yellow Bajaj RE styling)
   */
  buildBengaluruAutos() {
    // Parked Auto on East Sidewalk
    this.createAutoRickshaw(new THREE.Vector3(12.5, 0.15, 25), -Math.PI / 2);

    // Parked Auto on West Sidewalk near cafe
    this.createAutoRickshaw(new THREE.Vector3(-12.5, 0.15, -45), Math.PI / 2);

    // Auto parked near crossroad
    this.createAutoRickshaw(new THREE.Vector3(45, 0.15, 12), 0);
  }

  createAutoRickshaw(position, rotationY) {
    const auto = new THREE.Group();
    auto.position.copy(position);
    auto.rotation.y = rotationY;

    // 1. Lower Body (Green - Karnataka Eco Green)
    const lowerGeo = new THREE.BoxGeometry(1.6, 0.9, 2.6);
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x008040, roughness: 0.35, metalness: 0.1 });
    const lowerBody = new THREE.Mesh(lowerGeo, greenMat);
    lowerBody.position.y = 0.75;
    lowerBody.castShadow = true;
    auto.add(lowerBody);

    // 2. Yellow Canvas Top Canopy (Classic Bangalore Auto Yellow)
    const canopyGeo = new THREE.BoxGeometry(1.56, 0.8, 2.5);
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf5b000, roughness: 0.5 });
    const canopy = new THREE.Mesh(canopyGeo, yellowMat);
    canopy.position.set(0, 1.5, -0.05);
    canopy.castShadow = true;
    auto.add(canopy);

    // 3. Windshield and Front Nose
    const noseGeo = new THREE.BoxGeometry(1.4, 0.8, 0.8);
    const nose = new THREE.Mesh(noseGeo, greenMat);
    nose.position.set(0, 0.7, 1.25);
    nose.castShadow = true;
    auto.add(nose);

    // Glass Windshield
    const glassGeo = new THREE.PlaneGeometry(1.3, 0.65);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.9
    });
    const windshield = new THREE.Mesh(glassGeo, glassMat);
    windshield.position.set(0, 1.45, 1.2);
    windshield.rotation.x = -0.15;
    auto.add(windshield);

    // Headlight (Single central round lamp)
    const headlightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16);
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfffae6,
      emissive: 0xfffae6,
      emissiveIntensity: 0.6
    });
    const headlight = new THREE.Mesh(headlightGeo, headlightMat);
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 0.75, 1.68);
    auto.add(headlight);

    // Wheels (3 wheels: 1 front, 2 rear)
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });

    // Front Wheel
    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.32, 1.1);
    frontWheel.castShadow = true;
    auto.add(frontWheel);

    // Rear Left Wheel
    const rearLeft = new THREE.Mesh(wheelGeo, tireMat);
    rearLeft.rotation.z = Math.PI / 2;
    rearLeft.position.set(-0.75, 0.32, -0.7);
    rearLeft.castShadow = true;
    auto.add(rearLeft);

    // Rear Right Wheel
    const rearRight = new THREE.Mesh(wheelGeo, tireMat);
    rearRight.rotation.z = Math.PI / 2;
    rearRight.position.set(0.75, 0.32, -0.7);
    rearRight.castShadow = true;
    auto.add(rearRight);

    // Rear Board / Ad Panel (matching "WOKANDAP" / "2GT" from screenshots)
    const adGeo = new THREE.BoxGeometry(0.9, 0.45, 0.05);
    const adMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.5 });
    const adPlate = new THREE.Mesh(adGeo, adMat);
    adPlate.position.set(0, 1.35, -1.32);
    auto.add(adPlate);

    this.group.add(auto);

    // Physics Obstacle Body for Auto
    const autoBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(0.85, 0.9, 1.4)),
      position: new CANNON.Vec3(position.x, position.y + 0.9, position.z)
    });
    autoBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationY);
    this.sceneManager.addBody(autoBody);
    this.sceneManager.addCollider(lowerBody);
  }

  /**
   * Roadside Chai Stall & Stalls
   */
  buildStreetProps() {
    const chaiGroup = new THREE.Group();
    chaiGroup.position.set(-14, 0.25, -20);

    // Wooden cart / counter
    const cartGeo = new THREE.BoxGeometry(2.4, 1.1, 1.4);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0x8c531b, roughness: 0.8 });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.position.y = 0.55;
    cart.castShadow = true;
    chaiGroup.add(cart);

    // Overhead Red/Yellow Tarpaulin Awning
    const tarpGeo = new THREE.BoxGeometry(2.8, 0.1, 2.0);
    const tarpMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.6 });
    const tarp = new THREE.Mesh(tarpGeo, tarpMat);
    tarp.position.set(0, 2.2, 0);
    tarp.rotation.x = 0.1;
    tarp.castShadow = true;
    chaiGroup.add(tarp);

    // Brass Samovar for Hot Filter Coffee / Chai
    const urnGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 12);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    const urn = new THREE.Mesh(urnGeo, brassMat);
    urn.position.set(0.6, 1.4, 0);
    urn.castShadow = true;
    chaiGroup.add(urn);

    this.group.add(chaiGroup);

    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(1.2, 0.6, 0.7)),
      position: new CANNON.Vec3(-14, 0.85, -20)
    });
    this.sceneManager.addBody(body);
    this.sceneManager.addCollider(cart);
  }
}

