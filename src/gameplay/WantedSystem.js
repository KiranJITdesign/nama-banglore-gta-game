export class WantedSystem {
  constructor(game) {
    this.game = game;
    this.wantedLevel = 0; // 0 to 5 stars
    this.crimeScore = 0;

    // Evasion Countdown Parameters
    this.evasionMaxTime = 8.0; // 8 seconds out of sight to escape
    this.evasionTime = 0;
    this.isEvading = false;

    // HUD DOM elements
    this.starElements = [];
    this.evasionBanner = document.getElementById('hud-evasion');
    this.evasionText = document.getElementById('evasion-text');
    this.evasionFill = document.getElementById('evasion-fill');
    this.moneyElement = document.getElementById('hud-money');

    this.playerMoney = 12500;

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
    this.evasionTime = 0;
    this.isEvading = false;

    if (this.evasionBanner) {
      this.evasionBanner.classList.add('hidden');
    }

    this.updateHUD();

    // Alert police AI, blow whistle & start sirens
    if (this.game.policeAI) {
      this.game.policeAI.onWantedLevelChanged(this.wantedLevel);
    }

    // Crime notification
    if (this.wantedLevel > prevLevel) {
      const msgs = {
        property_destruction: 'CRIME: PROPERTY DESTRUCTION! Police charging!',
        pedestrian_assault: 'CRIME: ASSAULT ON CITIZEN! Police charging!',
        police_ram: 'CRIME: ASSAULT ON LAW ENFORCEMENT! Code 3 Chase!'
      };
      const text = msgs[type] || `WANTED LEVEL INCREASED TO ${this.wantedLevel} STARS!`;
      this.game.showToast(`⭐ ${text}`, 3000);
    }
  }

  update(dt) {
    if (this.wantedLevel === 0) {
      if (this.evasionBanner && !this.evasionBanner.classList.contains('hidden')) {
        this.evasionBanner.classList.add('hidden');
      }
      return;
    }

    // Check if player is currently in sight of police (cars or on-foot officers within 34m)
    const policeNear = this.game.policeAI ? this.game.policeAI.isAnyPoliceNearPlayer(34) : false;

    if (!policeNear) {
      // Player has broken line-of-sight / distanced from police: START EVASION
      this.isEvading = true;
      this.evasionTime += dt;

      const remaining = Math.max(0, this.evasionMaxTime - this.evasionTime);

      // Show and update Evasion HUD banner
      if (this.evasionBanner) {
        this.evasionBanner.classList.remove('hidden');
      }
      if (this.evasionText) {
        this.evasionText.textContent = `🚨 EVADING POLICE: ${Math.ceil(remaining)}s`;
      }
      if (this.evasionFill) {
        const pct = (remaining / this.evasionMaxTime) * 100;
        this.evasionFill.style.width = `${pct}%`;
      }

      // Flash stars on HUD
      const flash = Math.floor(this.evasionTime * 4) % 2 === 0;
      this.setStarsFlashing(flash);

      // ESCAPE SUCCESSFUL!
      if (remaining <= 0) {
        this.escapeSuccess();
      }
    } else {
      // Police spotted the player: RESET EVASION COUNTDOWN
      if (this.isEvading) {
        this.isEvading = false;
        this.evasionTime = 0;
        if (this.game.audioManager) {
          this.game.audioManager.playPoliceWhistle();
        }
        this.game.showToast('⚠️ POLICE RE-SPOTTED YOU! RUN!', 1800);
      }

      if (this.evasionBanner) {
        this.evasionBanner.classList.add('hidden');
      }
      this.setStarsFlashing(false);
    }
  }

  escapeSuccess() {
    this.wantedLevel = 0;
    this.evasionTime = 0;
    this.isEvading = false;

    if (this.evasionBanner) {
      this.evasionBanner.classList.add('hidden');
    }

    this.updateHUD();
    this.setStarsFlashing(false);

    // Reward player with cash for clean escape
    this.playerMoney += 500;
    if (this.moneyElement) {
      this.moneyElement.textContent = this.playerMoney.toLocaleString();
    }

    // Notify police to call off pursuit
    if (this.game.policeAI) {
      this.game.policeAI.onWantedLevelChanged(0);
    }

    this.game.showToast('✅ ⭐ PURSUIT EVADED! Clean escape (+₹500)', 4000);
  }

  updateHUD() {
    if (!this.starElements.length) this.initHUD();

    for (let i = 0; i < this.starElements.length; i++) {
      if (i < this.wantedLevel) {
        this.starElements[i].classList.add('active');
        this.starElements[i].style.opacity = '1.0';
      } else {
        this.starElements[i].classList.remove('active');
        this.starElements[i].style.opacity = '1.0';
      }
    }
  }

  setStarsFlashing(flash) {
    if (!this.starElements.length) return;
    for (let i = 0; i < this.wantedLevel; i++) {
      this.starElements[i].style.opacity = flash ? '0.2' : '1.0';
    }
  }

  clearWanted() {
    this.wantedLevel = 0;
    this.evasionTime = 0;
    this.isEvading = false;
    if (this.evasionBanner) {
      this.evasionBanner.classList.add('hidden');
    }
    this.updateHUD();
    this.setStarsFlashing(false);
    if (this.game.policeAI) {
      this.game.policeAI.onWantedLevelChanged(0);
    }
  }
}
