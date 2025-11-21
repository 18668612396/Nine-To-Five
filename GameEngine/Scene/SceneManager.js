class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentScene = null;
    }

    loadScene(scene) {
        if (this.currentScene) {
            // Optional: cleanup old scene
        }
        this.currentScene = scene;
        console.log(`SceneManager: Loaded scene '${scene.name}'`);
    }

    loadSceneFromJSON(json) {
        const scene = Scene.fromJSON(json);
        this.loadScene(scene);
    }

    update(dt) {
        if (this.currentScene) {
            this.currentScene.update(dt);
        }
    }

    draw(ctx) {
        if (this.currentScene) {
            this.currentScene.draw(ctx);
        }
    }

    static async loadScene(path) {
        const scene = await ResourceManager.loadScene(path);
        if (scene) {
            SceneManager.load(scene);
        }
    }
}

window.SceneManager = SceneManager;
