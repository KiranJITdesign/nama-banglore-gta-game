import { Game } from './Game.js';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const game = new Game();
    window.game = game; // Expose for debugging & testing
    await game.init();
  } catch (error) {
    console.error('Fatal error initializing Bengaluru: City of Dreams:', error);
  }
});

