(function() {
    const projectScripts = [
        "Assets/UI/Commands/OpenLevelSelectCommand.js",
        "Assets/UI/Commands/OpenTalentsCommand.js",
        "Assets/UI/Commands/OpenInventoryCommand.js",
        "Assets/UI/Commands/OpenSettingsCommand.js",
        "Assets/Items/Item.js",
        "Assets/Entities/Player.js",
        "Assets/Entities/Bullet.js",
        "Assets/Entities/Enemy.js",
        "Assets/Entities/Loot.js",
        "Assets/Cards/Card.js",
        "Assets/Cards/impl/AttackUp.js",
        "Assets/Cards/impl/SpeedUp.js",
        "Assets/Cards/impl/Heal.js",
        "Assets/Cards/impl/MultiShot.js",
        "Assets/Cards/CardManager.js",
        "Assets/UI/UIManager.js",
        "Assets/Core/GMManager.js",
        "Assets/Core/Game.js",
        "Assets/main.js"
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
