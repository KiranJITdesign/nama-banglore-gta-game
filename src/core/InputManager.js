export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.justPressed = {};

    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.wheelDelta = 0;

    this.isPointerLocked = false;
    this.isMouseDown = false;
    this.sensitivity = 1.0;

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.justPressed[e.code] = true;
      }
      this.keys[e.code] = true;

      // Prevent scrolling on Space or Arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Pointer Lock Listeners
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = (document.pointerLockElement === this.canvas);
      const crosshair = document.getElementById('crosshair');
      if (crosshair && this.isPointerLocked) {
        crosshair.classList.remove('hidden');
      } else if (crosshair) {
        crosshair.classList.add('hidden');
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isMouseDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDown = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked || this.isMouseDown) {
        this.mouseDeltaX += e.movementX * this.sensitivity;
        this.mouseDeltaY += e.movementY * this.sensitivity;
      }
    });

    window.addEventListener('wheel', (e) => {
      this.wheelDelta += Math.sign(e.deltaY);
    }, { passive: true });
  }

  requestPointerLock() {
    if (this.canvas.requestPointerLock) {
      this.canvas.requestPointerLock();
    }
  }

  exitPointerLock() {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  wasJustPressed(code) {
    const val = !!this.justPressed[code];
    this.justPressed[code] = false;
    return val;
  }

  setSensitivity(val) {
    this.sensitivity = Math.max(0.2, Math.min(val, 3.0));
  }

  getMoveVector() {
    let forward = 0;
    let strafe = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) forward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) forward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) strafe -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) strafe += 1;

    const length = Math.hypot(forward, strafe);
    if (length > 0) {
      forward /= length;
      strafe /= length;
    }

    return { forward, strafe };
  }

  isSprinting() {
    return !!(this.keys['ShiftLeft'] || this.keys['ShiftRight']);
  }

  isJumping() {
    return !!this.keys['Space'];
  }

  isCrouching() {
    return !!(this.keys['KeyC'] || this.keys['ControlLeft']);
  }

  getMouseDelta() {
    const delta = {
      x: this.mouseDeltaX,
      y: this.mouseDeltaY
    };
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return delta;
  }

  consumeWheelDelta() {
    const w = this.wheelDelta;
    this.wheelDelta = 0;
    return w;
  }

  update() {
    // Clear just-pressed flags if not consumed
    for (const key in this.justPressed) {
      this.justPressed[key] = false;
    }
  }
}

