// import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    // Expose game to window for debugging if needed, 
    // but logic is now handled via event listeners in UIManager.
    window.game = game; 
});
