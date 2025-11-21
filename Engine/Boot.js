(function() {
    const engineScripts = [
        "../../Engine/Base/EngineObject.js",
        "../../Engine/Base/Asset.js",
        "../../Engine/Base/Component.js",
        "../../Engine/Input/InputManager.js",
        "../../Engine/UI/Button.js",
        "../../Engine/Base/GameBehaviour.js",
        "../../Engine/Base/Transform.js",
        "../../Engine/Physics/Collider.js",
        "../../Engine/Physics/CircleCollider.js",
        "../../Engine/Physics/RigidBody.js",
        "../../Engine/Rendering/Renderer.js",
        "../../Engine/Rendering/Camera.js",
        "../../Engine/Rendering/SpriteRenderer.js",
        "../../Engine/Rendering/Animator.js",
        "../../Engine/Rendering/CanvasRenderer.js",
        "../../Engine/Rendering/TextRenderer.js",
        "../../Engine/Rendering/ShapeRenderer.js",
        "../../Engine/Rendering/ParticleSystemRenderer.js",
        "../../Engine/Base/GameObject.js",
        "../../Engine/Scene/Scene.js",
        "../../Engine/Scene/SceneManager.js",
        "../../Engine/Resources/Prefab.js",
        "../../Engine/Resources/AnimationClip.js",
        "../../Engine/Resources/AnimatorController.js",
        "../../Engine/Resources/ResourceManager.js",
        "../../Engine/Utils/Utils.js",
        "../../Engine/Particles/Particle.js",
        "../../Engine/Particles/ParticleSystem.js",
        "../../Engine/Particles/ParticleSystemManager.js"
    ];

    function loadScript(index) {
        if (index >= engineScripts.length) {
            console.log("Engine Loaded. Loading Project...");
            loadProject();
            return;
        }

        const src = engineScripts[index];
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => loadScript(index + 1);
        script.onerror = () => console.error("Failed to load engine script: " + src);
        document.head.appendChild(script);
    }

    function loadProject() {
        const script = document.createElement('script');
        script.src = "Assets/ProjectBoot.js";
        document.head.appendChild(script);
    }

    loadScript(0);
})();
