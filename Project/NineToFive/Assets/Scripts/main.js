// import { Game } from './core/Game.js';

async function startGame() {
    if (window.resourceManager && window.resourceManager.ready) {
        await window.resourceManager.ready;
    }
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
