// --- 草地场景 ---

class GrassScene extends Scene {
    constructor() {
        super({
            id: 'grass',
            name: '草原',
            backgroundColor: '#8ccf7e',
            worldWidth: 4000,
            worldHeight: 4000,
            elementDensity: 0.000015,
            elementTypes: [
                { type: 'tree', weight: 3, config: { sizeRange: [30, 50] } },
                { type: 'rock', weight: 2, config: { sizeRange: [20, 35] } },
                { type: 'bush', weight: 4, config: { sizeRange: [15, 30] } }
            ]
        });
        
        this.tileSize = 100;
    }
    
    drawBackground(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        // 草地背景
        ctx.fillStyle = '#8ccf7e';
        ctx.fillRect(0, 0, viewWidth, viewHeight);
        
        // 棋盘格纹理
        ctx.fillStyle = '#83c276';
        const offsetX = -camX % this.tileSize;
        const offsetY = -camY % this.tileSize;
        
        const startTileX = Math.floor(camX / this.tileSize);
        const startTileY = Math.floor(camY / this.tileSize);
        
        for (let i = -1; i <= viewWidth / this.tileSize + 1; i++) {
            for (let j = -1; j <= viewHeight / this.tileSize + 1; j++) {
                const tileX = startTileX + i;
                const tileY = startTileY + j;
                
                if ((tileX + tileY) % 2 === 0) {
                    ctx.fillRect(
                        i * this.tileSize + offsetX,
                        j * this.tileSize + offsetY,
                        this.tileSize / 2,
                        this.tileSize / 2
                    );
                }
            }
        }
        
        // 小草装饰（固定在世界坐标）
        ctx.fillStyle = '#7bc26e';
        const grassSpacing = 120;
        const startGrassX = Math.floor(camX / grassSpacing) * grassSpacing;
        const startGrassY = Math.floor(camY / grassSpacing) * grassSpacing;
        
        for (let wx = startGrassX - grassSpacing; wx < camX + viewWidth + grassSpacing; wx += grassSpacing) {
            for (let wy = startGrassY - grassSpacing; wy < camY + viewHeight + grassSpacing; wy += grassSpacing) {
                // 用世界坐标生成伪随机偏移
                const seed = (wx * 137 + wy * 89) % 1000;
                const offsetX = (seed % 60) - 30;
                const offsetY = ((seed * 7) % 60) - 30;
                
                const screenX = wx + offsetX - camX;
                const screenY = wy + offsetY - camY;
                
                ctx.beginPath();
                ctx.moveTo(screenX, screenY);
                ctx.lineTo(screenX - 3, screenY - 8);
                ctx.lineTo(screenX + 3, screenY - 8);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
}

Scene.register('grass', GrassScene);
