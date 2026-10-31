export class MainMenu {
  constructor(game) {
    this.game = game;

    this.menuElement = document.getElementById('main-menu');
    this.btnStart = document.getElementById('btn-start-game');
    this.btnCustom = document.getElementById('btn-customization');
    this.btnDistrict = document.getElementById('btn-district-select');
    this.btnTime = document.getElementById('btn-time-select');
    this.btnSettings = document.getElementById('btn-settings');

    // Subpanels
    this.subpanels = {
      district: document.getElementById('panel-district'),
      customization: document.getElementById('panel-customization'),
      time: document.getElementById('panel-time'),
      settings: document.getElementById('panel-settings')
    };

    this.selectedDistrictId = 'ambedkar_road';

    this.init();
  }

  init() {
    this.bindNavigation();
    this.populateDistricts();
    this.setupCharacterCustomizer();
    this.setupTimeSelector();
    this.setupSettings();
  }

  show() {
    if (this.menuElement) this.menuElement.classList.remove('hidden');
  }

  hide() {
    if (this.menuElement) this.menuElement.classList.add('hidden');
  }

  switchSubpanel(name) {
    for (const key in this.subpanels) {
      if (this.subpanels[key]) {
        if (key === name) {
          this.subpanels[key].classList.remove('hidden');
        } else {
          this.subpanels[key].classList.add('hidden');
        }
      }
    }
  }

  bindNavigation() {
    if (this.btnStart) {
      this.btnStart.addEventListener('click', () => {
        this.game.audioManager.unlock();
        this.game.audioManager.playClick();
        this.game.startGame(this.selectedDistrictId);
      });
    }

    if (this.btnDistrict) {
      this.btnDistrict.addEventListener('click', () => {
        this.game.audioManager.playClick();
        this.switchSubpanel('district');
      });
    }

    if (this.btnCustom) {
      this.btnCustom.addEventListener('click', () => {
        this.game.audioManager.playClick();
        this.switchSubpanel('customization');
      });
    }

    if (this.btnTime) {
      this.btnTime.addEventListener('click', () => {
        this.game.audioManager.playClick();
        this.switchSubpanel('time');
      });
    }

    if (this.btnSettings) {
      this.btnSettings.addEventListener('click', () => {
        this.game.audioManager.playClick();
        this.switchSubpanel('settings');
      });
    }
  }

  populateDistricts() {
    const container = document.getElementById('district-cards');
    if (!container) return;

    const districts = this.game.cityGenerator.getDistricts();
    container.innerHTML = '';

    districts.forEach((d) => {
      const card = document.createElement('div');
      card.className = `district-card ${d.id === this.selectedDistrictId ? 'active' : ''}`;
      card.dataset.id = d.id;

      card.innerHTML = `
        <div class="district-name">${d.name}</div>
        <div class="district-type">${d.tagline}</div>
        <div class="district-desc">${d.desc}</div>
      `;

      card.addEventListener('click', () => {
        this.game.audioManager.playClick();
        this.selectedDistrictId = d.id;
        container.querySelectorAll('.district-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.game.showToast(`Selected Starting District: ${d.name}`);
      });

      container.appendChild(card);
    });
  }

  setupCharacterCustomizer() {
    const cust = this.game.characterCustomization;

    // Name Input
    const nameInput = document.getElementById('cust-name');
    if (nameInput) {
      nameInput.value = cust.name;
      nameInput.addEventListener('input', (e) => cust.setName(e.target.value));
    }

    // Build Palettes
    this.buildPalette('cust-skin-palette', cust.skinPalette, cust.skinTone, (hex) => cust.setSkinTone(hex));
    this.buildPalette('cust-shirt-palette', cust.shirtPalette, cust.shirtColor, (hex) => cust.setShirtColor(hex));
    this.buildPalette('cust-jeans-palette', cust.jeansPalette, cust.jeansColor, (hex) => cust.setJeansColor(hex));
    this.buildPalette('cust-shoes-palette', cust.shoesPalette, cust.shoesColor, (hex) => cust.setShoesColor(hex));
  }

  buildPalette(containerId, colors, selectedColor, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    colors.forEach((hex) => {
      const swatch = document.createElement('div');
      swatch.className = `palette-swatch ${hex === selectedColor ? 'active' : ''}`;
      swatch.style.backgroundColor = hex;

      swatch.addEventListener('click', () => {
        this.game.audioManager.playClick();
        container.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        onSelect(hex);
      });

      container.appendChild(swatch);
    });
  }

  setupTimeSelector() {
    const cards = document.querySelectorAll('.time-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        this.game.audioManager.playClick();
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const time = card.dataset.time;
        this.game.environment.setTimeOfDay(time);
        this.game.showToast(`Time of day set to: ${time.toUpperCase()}`);
      });
    });
  }

  setupSettings() {
    // Quality Select
    const qualitySelect = document.getElementById('setting-graphics');
    if (qualitySelect) {
      qualitySelect.addEventListener('change', (e) => {
        this.game.renderer.setQuality(e.target.value);
        this.game.showToast(`Graphics preset: ${e.target.value.toUpperCase()}`);
      });
    }

    // Mouse Sensitivity Slider
    const sensSlider = document.getElementById('setting-sensitivity');
    if (sensSlider) {
      sensSlider.addEventListener('input', (e) => {
        this.game.inputManager.setSensitivity(parseFloat(e.target.value));
      });
    }

    // Audio Volume Slider
    const volSlider = document.getElementById('setting-volume');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        this.game.audioManager.setVolume(parseFloat(e.target.value));
      });
    }
  }
}

