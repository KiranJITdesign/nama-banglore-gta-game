import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class RoadNetwork {
  constructor(sceneManager, assetManager, environment) {
    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.environment = environment;

    this.group = new THREE.Group();
    this.sceneManager.addMesh(this.group);

    // Track road corridors for minimap & GPS navigation
    this.roadSegments = [];

    this.init();
  }

  init() {
    this.createGroundTerrain();
    this.createMainAvenue();
    this.createCrossAvenue();
    this.createFlyoverRamp();
    this.createStreetFurniture();
  }

  /**
   * Base surrounding ground terrain
   */
  createGroundTerrain() {
    const geo = new THREE.PlaneGeometry(800, 800);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2d3436,
      roughness: 0.95,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Cannon Ground Body
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: this.sceneManager.groundMaterial
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.sceneManager.addBody(groundBody);
  }

  /**
   * Main Avenue: Dr B R Ambedkar Road
   */
  createMainAvenue() {
    const roadWidth = 20;
    const roadLength = 500;

    // Asphalt surface
    const asphaltTex = this.assetManager.getAsphaltTexture('avenue');
    asphaltTex.repeat.set(1, 25);

    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.8,
      metalness: 0.1
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0.02, 0);
    roadMesh.receiveShadow = true;
    this.group.add(roadMesh);

    this.roadSegments.push({
      id: 'ambedkar_road',
      name: 'Dr B R Ambedkar Road',
      district: 'Sampangi Rama Nagara',
      start: new THREE.Vector3(0, 0, -250),
      end: new THREE.Vector3(0, 0, 250),
      width: roadWidth
    });

    // Sidewalks (West and East)
    this.createSidewalk(-roadWidth / 2 - 2.5, roadLength, 5);
    this.createSidewalk(roadWidth / 2 + 2.5, roadLength, 5);

    // Curbs with Colliders
    this.createCurb(-roadWidth / 2, roadLength);
    this.createCurb(roadWidth / 2, roadLength);
  }

  /**
   * Cross Avenue: Margosa Road / Malleshwaram Junction
   */
  createCrossAvenue() {
    const roadWidth = 18;
    const roadLength = 400;

    const asphaltTex = this.assetManager.getAsphaltTexture('avenue');
    asphaltTex.repeat.set(1, 20);

    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.8,
      metalness: 0.1
    });
    const crossRoad = new THREE.Mesh(roadGeo, roadMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.rotation.z = Math.PI / 2; // Perpendicular
    crossRoad.position.set(0, 0.03, 0);
    crossRoad.receiveShadow = true;
    this.group.add(crossRoad);

    this.roadSegments.push({
      id: 'margosa_road',
      name: 'Margosa Road',
      district: 'Malleshwaram',
      start: new THREE.Vector3(-200, 0, 0),
      end: new THREE.Vector3(200, 0, 0),
      width: roadWidth
    });

    // Crosswalk zebra stripes around intersection
    this.createZebraCrossing(new THREE.Vector3(0, 0.04, 22), 0);
    this.createZebraCrossing(new THREE.Vector3(0, 0.04, -22), 0);
    this.createZebraCrossing(new THREE.Vector3(22, 0.04, 0), Math.PI / 2);
    this.createZebraCrossing(new THREE.Vector3(-22, 0.04, 0), Math.PI / 2);
  }

  createZebraCrossing(position, rotationY) {
    const tex = this.assetManager.getAsphaltTexture('crosswalk');
    const geo = new THREE.PlaneGeometry(16, 5);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      roughness: 0.85
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rotationY;
    mesh.position.copy(position);
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  createSidewalk(x, length, width) {
    const tex = this.assetManager.getSidewalkTexture();
    tex.repeat.set(width / 2, length / 4);

    const geo = new THREE.BoxGeometry(width, 0.25, length);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.9,
      metalness: 0.05
    });
    const sidewalk = new THREE.Mesh(geo, mat);
    sidewalk.position.set(x, 0.125, 0);
    sidewalk.receiveShadow = true;
    sidewalk.castShadow = true;
    this.group.add(sidewalk);

    // Physics static collider for sidewalk
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(width / 2, 0.125, length / 2)),
      position: new CANNON.Vec3(x, 0.125, 0)
    });
    this.sceneManager.addBody(body);
    this.sceneManager.addCollider(sidewalk);
  }

  createCurb(x, length) {
    const curbGeo = new THREE.BoxGeometry(0.3, 0.35, length);
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x95a5a6,
      roughness: 0.9
    });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(x, 0.175, 0);
    curb.receiveShadow = true;
    this.group.add(curb);
  }

  /**
   * Elevated Bengaluru Flyover Ramp (Inspired by Silk Board / Hebbal Flyover)
   */
  createFlyoverRamp() {
    const flyoverWidth = 14;
    const flyoverLength = 160;
    const peakHeight = 8;

    const rampGeo = new THREE.BoxGeometry(flyoverWidth, 0.6, flyoverLength);
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0x22252c,
      roughness: 0.8
    });
    const flyover = new THREE.Mesh(rampGeo, rampMat);
    flyover.position.set(0, peakHeight, -150);
    flyover.receiveShadow = true;
    flyover.castShadow = true;
    this.group.add(flyover);

    // Concrete pillars supporting flyover
    const pillarGeo = new THREE.CylinderGeometry(1.2, 1.2, peakHeight, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.85 });
    for (let z = -210; z <= -90; z += 35) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(0, peakHeight / 2, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.group.add(pillar);

      const pillarBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Cylinder(1.2, 1.2, peakHeight, 12),
        position: new CANNON.Vec3(0, peakHeight / 2, z)
      });
      this.sceneManager.addBody(pillarBody);
      this.sceneManager.addCollider(pillar);
    }

    // Concrete Jersey Barrier along center and edges of flyover
    this.createBarrier(-flyoverWidth / 2 + 0.3, flyoverLength, peakHeight + 0.5, -150);
    this.createBarrier(flyoverWidth / 2 - 0.3, flyoverLength, peakHeight + 0.5, -150);
    this.createBarrier(0, flyoverLength, peakHeight + 0.5, -150);
  }

  createBarrier(x, length, y, z) {
    const barrierGeo = new THREE.BoxGeometry(0.5, 0.8, length);
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, roughness: 0.7 });
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.position.set(x, y, z);
    barrier.castShadow = true;
    this.group.add(barrier);

    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.4, length / 2)),
      position: new CANNON.Vec3(x, y, z)
    });
    this.sceneManager.addBody(body);
    this.sceneManager.addCollider(barrier);
  }

  /**
   * Street Furniture: Streetlights, Signboards, Bus shelter
   */
  createStreetFurniture() {
    // Streetlights along main road
    for (let z = -200; z <= 200; z += 40) {
      if (Math.abs(z) < 25) continue; // Skip intersection
      this.createStreetLight(-13.5, z, false);
      this.createStreetLight(13.5, z, true);
    }

    // Overhead Bengaluru Green Road Signs
    this.createOverheadSign(
      new THREE.Vector3(0, 7.5, 30),
      'Dr B R Ambedkar Road',
      'Sampangi Rama Nagara • Vidhana Soudha'
    );
    this.createOverheadSign(
      new THREE.Vector3(0, 7.5, -30),
      'Margosa Road - Malleshwaram',
      'Traditional Streets • Flower Market'
    );

    // BMTC Bus Shelter
    this.createBMTCBusStop(new THREE.Vector3(-14, 0.25, 60));
  }

  createStreetLight(x, z, flip) {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(x, 0, z);

    // Metal pole
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.8, roughness: 0.3 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3.75;
    pole.castShadow = true;
    poleGroup.add(pole);

    // Curved arm
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.rotation.z = flip ? Math.PI / 4 : -Math.PI / 4;
    arm.position.set(flip ? -0.9 : 0.9, 7.2, 0);
    poleGroup.add(arm);

    // Lamp Head
    const headGeo = new THREE.BoxGeometry(0.4, 0.2, 0.7);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(flip ? -1.8 : 1.8, 7.9, 0);
    poleGroup.add(head);

    // Light bulb emissive
    const bulbGeo = new THREE.PlaneGeometry(0.35, 0.6);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.rotation.x = Math.PI / 2;
    bulb.position.set(flip ? -1.8 : 1.8, 7.79, 0);
    poleGroup.add(bulb);

    // Point Light
    const light = new THREE.PointLight(0xffeedd, 1.8, 25, 1.2);
    light.position.set(flip ? -1.8 : 1.8, 7.5, 0);
    poleGroup.add(light);
    this.environment.registerStreetLight(light);

    this.group.add(poleGroup);
  }

  createOverheadSign(position, primaryText, secondaryText) {
    const gantryGroup = new THREE.Group();
    gantryGroup.position.copy(position);

    // Gantry frame
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.7, roughness: 0.3 });
    const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 8, 12), trussMat);
    leftPillar.position.set(-11, 0, 0);
    leftPillar.castShadow = true;
    gantryGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 8, 12), trussMat);
    rightPillar.position.set(11, 0, 0);
    rightPillar.castShadow = true;
    gantryGroup.add(rightPillar);

    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(22.5, 0.4, 0.4), trussMat);
    crossBeam.position.set(0, 4, 0);
    gantryGroup.add(crossBeam);

    // Signboard
    const signTex = this.assetManager.getRoadSignTexture(primaryText, secondaryText);
    const signGeo = new THREE.BoxGeometry(10, 3, 0.2);
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 3.8, 0.2);
    gantryGroup.add(sign);

    this.group.add(gantryGroup);
  }

  createBMTCBusStop(position) {
    const stopGroup = new THREE.Group();
    stopGroup.position.copy(position);

    // Canopy roof (BMTC Blue/White style)
    const roofGeo = new THREE.BoxGeometry(6, 0.2, 2.5);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, roughness: 0.4 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 3, 0);
    roof.castShadow = true;
    stopGroup.add(roof);

    // Pillars
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x636e72, metalness: 0.8 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 8), metalMat);
    p1.position.set(-2.8, 1.5, -1);
    stopGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 8), metalMat);
    p2.position.set(2.8, 1.5, -1);
    stopGroup.add(p2);

    // Bench
    const benchGeo = new THREE.BoxGeometry(5, 0.1, 0.6);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0xd63031 });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.5, -0.6);
    bench.castShadow = true;
    stopGroup.add(bench);

    this.group.add(stopGroup);
  }
}

