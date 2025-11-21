const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration: Project Root
const PROJECT_ROOT = path.join(__dirname, '../../Project/NineToFive');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'Assets');
const PACKAGES_DIR = path.join(PROJECT_ROOT, 'Packages');
const LIBRARY_DIR = path.join(PROJECT_ROOT, 'Library');
const ASSET_MAP_PATH = path.join(LIBRARY_DIR, 'AssetMap.json');

// Engine Dir (if we want to scan engine assets too, though usually they are separate)
// For now, let's assume Engine assets are also needed if referenced.
// But the user said Engine is separate. Let's scan Engine as well for built-in resources?
// The previous script scanned "Packages" which was the engine.
// Now Engine is at ../../Engine
const ENGINE_DIR = path.join(__dirname, '..'); 

// Helper to generate GUID (Unsigned)
function generateGUID() {
    const uuid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return uuid.replace(/-/g, '');
}

const assetMap = {};

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else {
            // Skip .meta files and Tools
            if (file.endsWith('.meta') || fullPath.includes('Tools')) return;

            const metaPath = fullPath + '.meta';
            let guid;

            if (fs.existsSync(metaPath)) {
                // Read existing meta
                try {
                    const metaContent = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
                    guid = metaContent.guid;
                } catch (e) {
                    console.error(`Error reading meta for ${file}:`, e);
                }
            }

            if (!guid) {
                // Generate new meta
                guid = generateGUID();
                const metaContent = {
                    guid: guid,
                    timestamp: Date.now()
                };
                fs.writeFileSync(metaPath, JSON.stringify(metaContent, null, 4));
                console.log(`Generated meta for ${file}: ${guid}`);
            }

            // Add to Asset Map
            // Path should be relative to the "Game Root" (where index.html is)
            // index.html is at Project/NineToFive/
            
            let relativePath = path.relative(PROJECT_ROOT, fullPath);
            // Normalize path separators to forward slashes for web
            relativePath = relativePath.split(path.sep).join('/');
            
            assetMap[guid] = relativePath;
        }
    });
}

// Command line argument support
const targetDir = process.argv[2];

if (targetDir) {
    console.log(`Scanning target directory: ${targetDir}`);
    // Resolve path relative to cwd if not absolute
    const resolvePath = path.isAbsolute(targetDir) ? targetDir : path.resolve(process.cwd(), targetDir);
    processDirectory(resolvePath);
    console.log("Done generating metas for target directory. (AssetMap not updated)");
} else {
    console.log("Scanning Project Assets...");
    processDirectory(ASSETS_DIR);

    console.log("Scanning Project Packages...");
    processDirectory(PACKAGES_DIR);

    console.log("Writing AssetMap...");
    if (!fs.existsSync(LIBRARY_DIR)) {
        fs.mkdirSync(LIBRARY_DIR, { recursive: true });
    }
    fs.writeFileSync(ASSET_MAP_PATH, JSON.stringify(assetMap, null, 4));
    console.log("Done. AssetMap saved to " + ASSET_MAP_PATH);
}
