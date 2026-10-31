export class CityMapUI {
  constructor(game) {
    this.game = game;
    this.isOpen = false;

    // DOM Elements
    this.modal = document.getElementById('map-modal');
    this.canvas = document.getElementById('enlarged-map-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.btnClose = document.getElementById('btn-close-map');
    this.btnZoomIn = document.getElementById('btn-map-zoomin');
    this.btnZoomOut = document.getElementById('btn-map-zoomout');
    this.btnRecenter = document.getElementById('btn-map-recenter');

    // Pan & Zoom state
    this.zoom = 1.6;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.initEvents();
  }

  initEvents() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.close());
    }

    if (this.btnZoomIn) {
      this.btnZoomIn.addEventListener('click', () => {
        this.zoom = Math.min(4.0, this.zoom + 0.35);
        this.render();
      });
    }

    if (this.btnZoomOut) {
      this.btnZoomOut.addEventListener('click', () => {
        this.zoom = Math.max(0.6, this.zoom - 0.35);
        this.render();
      });
    }

    if (this.btnRecenter) {
      this.btnRecenter.addEventListener('click', () => {
        this.panX = 0;
        this.panY = 0;
        this.render();
      });
    }

    // Drag to Pan
    if (this.canvas) {
      this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isOpen || !this.isDragging) return;
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        this.panX += dx;
        this.panY += dy;
        this.render();
      });

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        this.zoom = Math.max(0.5, Math.min(4.5, this.zoom * factor));
        this.render();
      }, { passive: false });
    }

    // Clicking small minimap opens enlarged map!
    const smallMinimap = document.querySelector('.minimap-frame');
    if (smallMinimap) {
      smallMinimap.style.cursor = 'pointer';
      smallMinimap.title = 'Click to enlarge city map (or press M)';
      smallMinimap.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    if (this.modal) this.modal.classList.remove('hidden');
    this.game.audioManager.playClick();
    this.game.inputManager.exitPointerLock();

    // Resize canvas to match display size
    if (this.canvas) {
      this.canvas.width = Math.min(window.innerWidth * 0.9, 1000);
      this.canvas.height = Math.min(window.innerHeight * 0.8, 700);
    }
    this.panX = 0;
    this.panY = 0;
    this.render();
  }

  close() {
    this.isOpen = false;
    if (this.modal) this.modal.classList.add('hidden');
    this.game.audioManager.playClick();
    if (this.game.state === 'PLAYING') {
      this.game.inputManager.requestPointerLock();
    }
  }

  update() {
    if (this.isOpen) {
      this.render();
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2 + this.panX;
    const cy = h / 2 + this.panY;

    const playerPos = this.game.player.group.position;
    const playerHeading = this.game.player.group.rotation.y;
    const scale = this.zoom;

    // Dark Map Background
    ctx.fillStyle = '#0e121a';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(cx, cy);

    // City District Boundary / Blocks
    ctx.fillStyle = '#181e2b';
    ctx.fillRect(-220 * scale, -240 * scale, 440 * scale, 480 * scale);

    // Cubbon Park Lawn (Green area)
    ctx.fillStyle = '#1e4620';
    ctx.fillRect((-50 - 25) * scale, (-120 - 30) * scale, 50 * scale, 60 * scale);
    ctx.fillStyle = '#4ade80';
    ctx.font = `bold ${Math.max(10, 11 * scale)}px sans-serif`;
    ctx.fillText('CUBBON PARK', -70 * scale, -120 * scale);

    // Main Avenue: Dr B R Ambedkar Road (Vertical)
    const roadWidth = 20 * scale;
    ctx.fillStyle = '#2c3340';
    ctx.fillRect(-roadWidth / 2, -240 * scale, roadWidth, 480 * scale);

    // Cross Avenue: Margosa Road (Horizontal)
    const crossWidth = 18 * scale;
    ctx.fillRect(-220 * scale, -crossWidth / 2, 440 * scale, crossWidth);

    // Yellow Double Center Lines
    ctx.strokeStyle = '#f5b000';
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.beginPath();
    ctx.moveTo(0, -240 * scale);
    ctx.lineTo(0, 240 * scale);
    ctx.moveTo(-220 * scale, 0);
    ctx.lineTo(220 * scale, 0);
    ctx.stroke();

    // Elevated Flyover Corridor (Silk Board / Hebbal)
    ctx.fillStyle = 'rgba(74, 85, 104, 0.9)';
    ctx.fillRect(-7 * scale, -230 * scale, 14 * scale, 160 * scale);
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-7 * scale, -230 * scale, 14 * scale, 160 * scale);

    // Petrol Bunk (Fuel Station)
    ctx.fillStyle = '#00b894';
    ctx.fillRect((-38 - 11) * scale, (-10 - 10) * scale, 22 * scale, 20 * scale);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(9, 10 * scale)}px sans-serif`;
    ctx.fillText('PETROL BUNK', -48 * scale, -12 * scale);

    // District Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = `bold ${Math.max(11, 13 * scale)}px sans-serif`;
    ctx.fillText('DR B R AMBEDKAR ROAD', 14 * scale, 60 * scale);
    ctx.fillText('MARGOSA ROAD (MALLESHWARAM)', 40 * scale, -14 * scale);
    ctx.fillText('TECH PARK TOWERS', 40 * scale, 120 * scale);
    ctx.fillText('SILK BOARD ELEVATED CORRIDOR', -85 * scale, -180 * scale);

    // Render Live Moving Traffic Vehicles
    if (this.game.trafficAI) {
      const vehicles = this.game.trafficAI.getVehicles();
      for (const v of vehicles) {
        const vx = v.mesh.position.x * scale;
        const vy = v.mesh.position.z * scale;

        if (v.type === 'bus') {
          // BMTC Bus: Blue box
          ctx.fillStyle = '#0984e3';
          ctx.fillRect(vx - 5 * scale, vy - 10 * scale, 10 * scale, 20 * scale);
          ctx.strokeStyle = '#ffffff';
          ctx.strokeRect(vx - 5 * scale, vy - 10 * scale, 10 * scale, 20 * scale);
        } else if (v.type === 'car') {
          // Cars: Red dot
          ctx.fillStyle = '#ff4757';
          ctx.beginPath();
          ctx.arc(vx, vy, 4.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Autos: Yellow dot
          ctx.fillStyle = '#f5b000';
          ctx.beginPath();
          ctx.arc(vx, vy, 3.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Player Marker (Pulsing Amber Circle with Heading Arrow)
    const px = playerPos.x * scale;
    const py = playerPos.z * scale;

    ctx.save();
    ctx.translate(px, py);

    // Pulsing outer aura
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 14 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Player triangle facing direction
    ctx.rotate(playerHeading);
    ctx.fillStyle = '#ffb800';
    ctx.beginPath();
    ctx.moveTo(0, 9 * scale);
    ctx.lineTo(-6 * scale, -7 * scale);
    ctx.lineTo(6 * scale, -7 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // Map Legend (bottom-left)
    ctx.restore();
    this.renderLegend(ctx, w, h);
  }

  renderLegend(ctx, w, h) {
    ctx.fillStyle = 'rgba(14, 18, 26, 0.85)';
    ctx.fillRect(16, h - 85, 230, 70);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(16, h - 85, 230, 70);

    ctx.fillStyle = '#ffb800';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('MAP LEGEND', 26, h - 68);

    // Legend items
    ctx.fillStyle = '#0984e3';
    ctx.fillRect(26, h - 55, 12, 8);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.fillText('BMTC City Bus', 44, h - 48);

    ctx.fillStyle = '#ff4757';
    ctx.beginPath(); ctx.arc(32, h - 30, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('Moving Cars', 44, h - 26);

    ctx.fillStyle = '#f5b000';
    ctx.beginPath(); ctx.arc(130, h - 30, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('Auto-Rickshaws', 142, h - 26);
  }
}

