const LoadSceneMode = {
    Single: 0,
    Additive: 1
};

class SceneManager {
    constructor(game) {
        this.game = game;
        this.loadedScenes = [];
        this.activeScene = null;
    }

    /**
     * Load a scene
     * @param {Scene} scene - The scene object to load
     * @param {number} mode - LoadSceneMode.Single or LoadSceneMode.Additive
     */
    loadScene(scene, mode = LoadSceneMode.Single) {
        console.log(`SceneManager: Request to load scene '${scene.name}' with mode ${mode}`);
        if (mode === LoadSceneMode.Single) {
            // Unload all existing scenes
            console.log(`SceneManager: Unloading ${this.loadedScenes.length} scenes`);
            this.loadedScenes = [];
        }

        // Check if scene is already loaded
        if (!this.loadedScenes.includes(scene)) {
            this.loadedScenes.push(scene);
        }

        // Set as active scene
        this.activeScene = scene;
        
        console.log(`SceneManager: Loaded scene '${scene.name}' in ${mode === LoadSceneMode.Single ? 'Single' : 'Additive'} mode. Total loaded: ${this.loadedScenes.length}`);
    }

    unloadScene(scene) {
        const index = this.loadedScenes.indexOf(scene);
        if (index > -1) {
            this.loadedScenes.splice(index, 1);
            if (this.activeScene === scene) {
                this.activeScene = this.loadedScenes.length > 0 ? this.loadedScenes[this.loadedScenes.length - 1] : null;
            }
        }
    }

    get currentScene() {
        return this.activeScene;
    }

    update(dt) {
        for (const scene of this.loadedScenes) {
            scene.update(dt);
        }
    }

    draw(ctx) {
        for (const scene of this.loadedScenes) {
            scene.draw(ctx);
        }
    }
}

SceneManager.LoadSceneMode = LoadSceneMode;
window.SceneManager = SceneManager;
window.LoadSceneMode = LoadSceneMode;
