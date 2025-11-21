// import { Game } from './core/Game.js';

function startGame() {
    const game = new Game();
    // Expose game to window for debugging if needed, 
    // but logic is now handled via event listeners in UIManager.
    window.game = game; 
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}
