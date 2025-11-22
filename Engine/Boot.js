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
        "../../Engine/Rendering/Shader.js",
        "../../Engine/Rendering/SpriteShader.js",
        "../../Engine/Rendering/Material.js",
        "../../Engine/Rendering/RenderPipeline.js",
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
        "../../Engine/Particles/ParticleModules.js",
        "../../Engine/Particles/ParticleSystem.js"
    ];

    function loadScript(index) {
        if (index >= engineScripts.length) {
            console.log("Engine Loaded. Loading Project...");
            loadProject();
            return;
        }

        // Parallel loading for scripts that don't have strict immediate dependencies
        // But since we have inheritance (e.g. Component -> Renderer -> SpriteRenderer),
        // we must respect order for base classes.
        // However, we can try to load them all as async/defer, but execution order matters.
        // The current implementation is strictly serial (waterfall), which is slow.
        
        // Optimization: Use Promise.all for independent chunks if we knew them.
        // For now, let's keep it safe but maybe we can pre-fetch?
        // Actually, the browser cache should help on second load.
        
        const src = engineScripts[index];
        const script = document.createElement('script');
        script.src = src;
        // script.async = false; // Default for dynamic scripts is async=true, but we need order?
        // If we use onload recursion, we are forcing serial.
        
        script.onload = () => loadScript(index + 1);
        script.onerror = () => console.error("Failed to load engine script: " + src);
        document.head.appendChild(script);
    }

    function loadProject() {
        const script = document.createElement('script');
        script.src = "Assets/Scripts/ProjectBoot.js";
        document.head.appendChild(script);
    }

    loadScript(0);
})();
