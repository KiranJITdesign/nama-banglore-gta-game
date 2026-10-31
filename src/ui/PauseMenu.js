export class PauseMenu {
  constructor(game) {
    this.game = game;
    this.pauseElement = document.getElementById('pause-menu');

    this.btnResume = document.getElementById('btn-pause-resume');
    this.btnRespawn = document.getElementById('btn-pause-respawn');
    this.btnTime = document.getElementById('btn-pause-time');
    this.btnMainMenu = document.getElementById('btn-pause-main-menu');

    this.timePresets = ['morning', 'afternoon', 'sunset', 'night'];
    this.timeIndex = 2; // Default sunset

    this.init();
  }

  init() {
    if (this.btnResume) {
      this.btnResume.addEventListener('click', () => {
        this.game.audioManager.playClick();
        this.game.resumeGame();
      });
    }

    if (this.btnRespawn) {
      this.btnRespawn.addEventListener('click', () => {
        this.game.audioManager.playClick();
        this.game.respawnPlayer();
        this.game.resumeGame();
      });
    }

    if (this.btnTime) {
      this.btnTime.addEventListener('click', () => {
        this.game.audioManager.playClick();
        this.timeIndex = (this.timeIndex + 1) % this.timePresets.length;
        const time = this.timePresets[this.timeIndex];
        this.game.environment.setTimeOfDay(time);
        this.game.showToast(`Time changed to: ${time.toUpperCase()}`);
      });
    }

    if (this.btnMainMenu) {
      this.btnMainMenu.addEventListener('click', () => {
        this.game.audioManager.playClick();
        this.game.returnToMainMenu();
      });
    }
  }

  show() {
    if (this.pauseElement) this.pauseElement.classList.remove('hidden');
  }

  hide() {
    if (this.pauseElement) this.pauseElement.classList.add('hidden');
  }
}

