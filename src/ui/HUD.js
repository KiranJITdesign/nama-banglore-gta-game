export class HUD {
  constructor(game) {
    this.game = game;

    // DOM Elements
    this.hudElement = document.getElementById('hud');
    this.roadElement = document.getElementById('hud-road');
    this.districtElement = document.getElementById('hud-district');
    this.speedElement = document.getElementById('hud-speed');
    this.speedCircle = document.getElementById('speed-circle');
    this.staminaBar = document.getElementById('stamina-bar');
    this.hpBar = document.getElementById('hp-bar');
    this.subtitleElement = document.getElementById('hud-subtitle');
    this.subtitleBox = document.getElementById('hud-subtitle-box');
    this.timeElement = document.getElementById('hud-time');
    this.coordsElement = document.getElementById('minimap-coords');

    // Minimap Canvas
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    this.minimapMarker = document.getElementById('minimap-marker');

    this.maxSpeedDial = 80; // km/h dial max
  }

  show() {
    if (this.hudElement) this.hudElement.classList.remove('hidden');
  }

  hide() {
    if (this.hudElement) this.hudElement.classList.add('hidden');
  }

  showSubtitle(text, durationMs = 4500) {
    if (!this.subtitleElement || !this.subtitleBox) return;
    this.subtitleElement.textContent = text;
    this.subtitleBox.style.opacity = '1';

    clearTimeout(this.subtitleTimeout);
    this.subtitleTimeout = setTimeout(() => {
      this.subtitleBox.style.opacity = '0';
    }, durationMs);
  }

  update(controller, playerPos, playerRotationY, vehicles = []) {
    if (!controller || !playerPos) return;

    // 1. Speedometer
    const speed = controller.getSpeedKmh();
    if (this.speedElement) this.speedElement.textContent = speed;

    if (this.speedCircle) {
      const maxOffset = 314;
      const ratio = Math.min(1.0, speed / this.maxSpeedDial);
      const dashoffset = maxOffset - (maxOffset * 0.75 * ratio);
      this.speedCircle.style.strokeDashoffset = dashoffset;
    }

    // 2. Vitals
    if (this.staminaBar) {
      this.staminaBar.style.width = `${controller.getStaminaPercent()}%`;
    }
    if (this.hpBar) {
      this.hpBar.style.width = `${controller.getHealthPercent()}%`;
    }

    // 3. Location Detection
    this.updateLocationInfo(playerPos);

    // 4. Minimap Rendering
    this.renderMinimap(playerPos, playerRotationY, vehicles);
  }

  updateLocationInfo(pos) {
    let road = 'Dr B R Ambedkar Road';
    let district = 'Sampangi Rama Nagara, Bengaluru';

    if (Math.abs(pos.z) < 25 && Math.abs(pos.x) > 20) {
      road = 'Margosa Road';
      district = 'Malleshwaram, Bengaluru';
    } else if (pos.x < -40 && pos.z < -90) {
      road = 'Cubbon Park Promenade';
      district = 'Central Bengaluru District';
    } else if (pos.x < -30 && Math.abs(pos.z) < 20) {
      road = 'Petrol Bunk Junction';
      district = 'Ambedkar Road Service Lane';
    } else if (pos.z < -90 && Math.abs(pos.x) < 10) {
      road = 'Silk Board - Hebbal Elevated Corridor';
      district = 'Outer Ring Expressway';
    }

    if (this.roadElement && this.roadElement.textContent !== road) {
      this.roadElement.textContent = road;
    }
    if (this.districtElement && this.districtElement.textContent !== district) {
      this.districtElement.textContent = district;
    }

    // GPS Latitude / Longitude readout
    if (this.coordsElement) {
      const lat = (12.9716 + pos.z * 0.00005).toFixed(4);
      const lon = (77.5946 + pos.x * 0.00005).toFixed(4);
      this.coordsElement.textContent = `LAT: ${lat}° N | LON: ${lon}° E`;
    }
  }

  renderMinimap(pos, playerRotationY, vehicles = []) {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const size = 200;
    const center = size / 2;
    const scale = 0.85; // pixels per world meter

    // Clear background
    ctx.fillStyle = '#11151c';
    ctx.fillRect(0, 0, size, size);

    // Save context for player-centric transformation
    ctx.save();
    ctx.translate(center, center);

    // World Roads
    ctx.fillStyle = '#2d3436';

    // Main Avenue (vertical road along Z)
    const mainRoadX = -pos.x * scale;
    const mainRoadW = 20 * scale;
    ctx.fillRect(mainRoadX - mainRoadW / 2, -100, mainRoadW, 200);

    // Cross Avenue (horizontal road along X)
    const crossRoadY = pos.z * scale;
    const crossRoadH = 18 * scale;
    ctx.fillRect(-100, crossRoadY - crossRoadH / 2, 200, crossRoadH);

    // Road Yellow Center Lines
    ctx.strokeStyle = '#f5b000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mainRoadX, -100);
    ctx.lineTo(mainRoadX, 100);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-100, crossRoadY);
    ctx.lineTo(100, crossRoadY);
    ctx.stroke();

    // Fuel station marker (Green square)
    const fuelX = (-38 - pos.x) * scale;
    const fuelY = (-10 + pos.z) * scale;
    ctx.fillStyle = '#00b894';
    ctx.fillRect(fuelX - 5, fuelY - 5, 10, 10);

    // Moving Traffic Vehicles Markers
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      const vx = (v.mesh.position.x - pos.x) * scale;
      const vy = (v.mesh.position.z - pos.z) * scale;

      if (v.type === 'bus') {
        // BMTC Bus (Blue rectangle)
        ctx.fillStyle = '#0984e3';
        ctx.fillRect(vx - 3, vy - 6, 6, 12);
      } else if (v.type === 'car') {
        // Cars (Red/White dot)
        ctx.fillStyle = '#ff7675';
        ctx.beginPath();
        ctx.arc(vx, vy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Autos (Yellow dot)
        ctx.fillStyle = '#f5b000';
        ctx.beginPath();
        ctx.arc(vx, vy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // Rotate Player Marker on Minimap
    if (this.minimapMarker) {
      const deg = (-playerRotationY * 180 / Math.PI) + 180;
      this.minimapMarker.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
    }
  }
}
