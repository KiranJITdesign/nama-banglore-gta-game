export class WantedSystem {
  constructor(game) {
    this.game = game;
    this.wantedLevel = 0; // 0 to 5 stars
    this.crimeScore = 0;

    // Cooldown timer when evading police
    this.evasionTimer = 0;
    this.isEvading = false;

    // HUD star DOM elements
    this.starElements = [];
    this.initHUD();
  }

  initHUD() {
    const container = document.getElementById('hud-wanted');
    if (container) {
      this.starElements = Array.from(container.querySelectorAll('.star'));
    }
  }

  addCrime(type, starsToAdd = 1) {
    const prevLevel = this.wantedLevel;
    this.wantedLevel = Math.min(5, Math.max(1, this.wantedLevel + starsToAdd));
    this.evasionTimer = 0;
    this.isEvading = false;

    this.updateHUD();

    // Alert police AI and sound siren
    if (this.game.policeAI) {
      this.game.policeAI.onWantedLevelChanged(this.wantedLevel);
    }

    // Toast notification
    if (this.wantedLevel > prevLevel) {
      const msgs = {
        property_destruction: 'CRIME COMMITTED: PROPERTY DESTRUCTION! Police alerted.',
        pedestrian_assault: 'CRIME COMMITTED: ASSAULT ON CITIZEN! Police alerted.',
        police_ram: 'CRIME COMMITTED: ASSAULT ON LAW ENFORCEMENT!'
      };
      const text = msgs[type] || `WANTED LEVEL INCREASED TO ${this.wantedLevel} STARS!`;
      this.game.showToast(`⭐ ${text}`, 3500);
    }
  }

  update(dt) {
    if (this.wantedLevel === 0) return;

    // Check if player is currently in sight of police
    const policeNear = this.game.policeAI ? this.game.policeAI.isAnyPoliceNearPlayer(45) : false;

    if (!policeNear) {
      this.isEvading = true;
      this.evasionTimer += dt;

      // Flash stars on HUD while evading
      const flash = Math.floor(this.evasionTimer * 3) % 2 === 0;
      this.setStarsFlashing(flash);

      // Decay star every 12 seconds of successful evasion
      if (this.evasionTimer > 12.0) {
        this.evasionTimer = 0;
        this.wantedLevel = Math.max(0, this.wantedLevel - 1);
        this.updateHUD();

        if (this.game.policeAI) {
          this.game.policeAI.onWantedLevelChanged(this.wantedLevel);
        }

        if (this.wantedLevel === 0) {
          this.game.showToast('✅ POLICE PURSUIT EVADED. Wanted level cleared.');
          this.setStarsFlashing(false);
        }
      }
    } else {
      this.isEvading = false;
      this.evasionTimer = 0;
      this.setStarsFlashing(false);
    }
  }

  updateHUD() {
    if (!this.starElements.length) this.initHUD();

    for (let i = 0; i < this.starElements.length; i++) {
      if (i < this.wantedLevel) {
        this.starElements[i].classList.add('active');
      } else {
        this.starElements[i].classList.remove('active');
      }
    }
  }

  setStarsFlashing(flash) {
    if (!this.starElements.length) return;
    for (let i = 0; i < this.wantedLevel; i++) {
      if (flash) {
        this.starElements[i].style.opacity = '0.25';
      } else {
        this.starElements[i].style.opacity = '1.0';
      }
    }
  }

  clearWanted() {
    this.wantedLevel = 0;
    this.evasionTimer = 0;
    this.isEvading = false;
    this.updateHUD();
    if (this.game.policeAI) {
      this.game.policeAI.onWantedLevelChanged(0);
    }
  }
}

