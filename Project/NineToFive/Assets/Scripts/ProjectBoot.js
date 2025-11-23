(function () {
    const projectScripts = [
        "Assets/Scripts/UI/Commands/OpenLevelSelectCommand.js",
        "Assets/Scripts/UI/Commands/OpenTalentsCommand.js",
        "Assets/Scripts/UI/Commands/OpenInventoryCommand.js",
        "Assets/Scripts/UI/Commands/OpenSettingsCommand.js",
        "Assets/Scripts/Items/Item.js",
        // "Assets/Scripts/Entities/ActorShadow.js", // Removed as we use CanvasRenderer directly
        "Assets/Scripts/Entities/Actor.js",
        "Assets/Scripts/Entities/Player.js",
        "Assets/Scripts/Entities/Bullet.js",
        "Assets/Scripts/Entities/Enemy.js",
        "Assets/Scripts/Entities/EnemyManager.js",
        "Assets/Scripts/Entities/GridBackground.js",
        "Assets/Scripts/Entities/Loot.js",
        "Assets/Scripts/Entities/LootManager.js",
        "Assets/Scripts/Cards/Card.js",
        "Assets/Scripts/Cards/impl/AttackUp.js",
        "Assets/Scripts/Cards/impl/SpeedUp.js",
        "Assets/Scripts/Cards/impl/Heal.js",
        "Assets/Scripts/Cards/impl/MultiShot.js",
        "Assets/Scripts/Cards/CardManager.js",
        "Assets/Scripts/UI/UIManager.js",
        "Assets/Scripts/Core/GMManager.js",
        "Assets/Scripts/Core/Game.js",
        "Assets/Scripts/main.js"
    ];

    function loadScript(index) {
        if (index >= projectScripts.length) {
            console.log("Project Loaded. Starting Game...");
            return;
        }

        const src = projectScripts[index];
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => loadScript(index + 1);
        script.onerror = () => console.error("Failed to load project script: " + src);
        document.head.appendChild(script);
    }

    loadScript(0);
})();
