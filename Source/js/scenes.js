// --- 场景管理模块 ---

const SceneManager = {
    currentScene: null,
    scenes: ['grass', 'ocean', 'desert', 'snow'],
    
    // 场景映射（地图名 -> 场景名）
    mapToScene: {
        'forest': 'grass',
        'desert': 'desert',
        'snow': 'snow',
        'ocean': 'ocean'
    },
    
    // 设置指定场景
    setScene(mapName) {
        this.currentScene = this.mapToScene[mapName] || 'grass';
        this.init();
        return this.currentScene;
    },
    
    // 随机选择场景
    randomScene() {
        const idx = Math.floor(Math.random() * this.scenes.length);
        this.currentScene = this.scenes[idx];
        this.init();
        return this.currentScene;
    },
    
    // 初始化当前场景
    init() {
        switch (this.currentScene) {
            case 'grass':
                this.initGrass();
                break;
            case 'ocean':
                this.initOcean();
                break;
            case 'desert':
                this.initDesert();
                break;
            case 'snow':
                this.initSnow();
                break;
        }
    },
    
    // ========== 草地场景 ==========
    grassElements: [],
    
    initGrass() {
        this.grassElements = [];
        for (let i = 0; i < 25; i++) {
            this.grassElements.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT * 2 - CONFIG.GAME_HEIGHT,
                type: Math.random() > 0.3 ? 'tree' : 'rock',
                size: 25 + Math.random() * 20
            });
        }
    },
    
    updateGrass(scrollSpeed) {
        this.grassElements.forEach(el => {
            el.y += scrollSpeed;
            if (el.y > CONFIG.GAME_HEIGHT + 100) {
                el.y = -100;
                el.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });
    },
    
    drawGrass(ctx, scrollY) {
        // 草地背景
        ctx.fillStyle = '#8ccf7e';
        ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // 棋盘格纹理
        ctx.fillStyle = '#83c276';
        const tileSize = 100;
        const offsetY = scrollY % tileSize;
        
        for (let i = 0; i < CONFIG.GAME_WIDTH; i += tileSize) {
            for (let j = -tileSize + offsetY; j < CONFIG.GAME_HEIGHT + tileSize; j += tileSize) {
                if ((Math.floor(i / tileSize) + Math.floor((j - offsetY + scrollY) / tileSize)) % 2 === 0) {
                    ctx.fillRect(i, j, tileSize / 2, tileSize / 2);
                }
            }
        }
        
        // 树和石头
        this.grassElements.forEach(el => {
            if (el.type === 'tree') {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.arc(el.x, el.y + 10, el.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#8d6e63';
                ctx.fillRect(el.x - 5, el.y - 10, 10, 20);
                ctx.fillStyle = '#4caf50';
                ctx.beginPath();
                ctx.arc(el.x, el.y - 20, el.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#66bb6a';
                ctx.beginPath();
                ctx.arc(el.x - 5, el.y - 25, el.size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.arc(el.x, el.y + 5, el.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#9e9e9e';
                ctx.beginPath();
                ctx.moveTo(el.x - el.size, el.y);
                ctx.lineTo(el.x, el.y - el.size);
                ctx.lineTo(el.x + el.size, el.y);
                ctx.lineTo(el.x, el.y + el.size * 0.6);
                ctx.fill();
            }
        });
    },
    
    // ========== 星空场景 ==========
    stars: [],
    
    initSpace() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 2 + 1,
                brightness: Math.random()
            });
        }
    },
    
    updateSpace() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > CONFIG.GAME_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });
    },
    
    drawSpace(ctx, scrollY, frameCount) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // 星星
        this.stars.forEach(star => {
            const alpha = 0.3 + star.brightness * 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 星云
        const time = frameCount * 0.01;
        const colors = ['rgba(100, 50, 150, 0.1)', 'rgba(50, 100, 150, 0.1)', 'rgba(150, 50, 100, 0.1)'];
        for (let i = 0; i < 3; i++) {
            const x = CONFIG.GAME_WIDTH / 2 + Math.sin(time + i * 2) * 200;
            const y = (scrollY * 0.1 + i * 500) % (CONFIG.GAME_HEIGHT + 200) - 100;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 150);
            gradient.addColorStop(0, colors[i]);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 150, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    // ========== 海洋场景 ==========
    waves: [],
    bubbles: [],
    seaweeds: [],
    
    initOcean() {
        this.waves = [];
        this.bubbles = [];
        this.seaweeds = [];
        
        // 生成海草
        for (let i = 0; i < 15; i++) {
            this.seaweeds.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT * 2 - CONFIG.GAME_HEIGHT,
                height: 60 + Math.random() * 40,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        // 生成气泡
        for (let i = 0; i < 20; i++) {
            this.bubbles.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT,
                size: 3 + Math.random() * 8,
                speed: 0.5 + Math.random() * 1.5,
                wobble: Math.random() * Math.PI * 2
            });
        }
    },
    
    updateOcean(scrollSpeed, frameCount) {
        // 更新海草
        this.seaweeds.forEach(sw => {
            sw.y += scrollSpeed;
            if (sw.y > CONFIG.GAME_HEIGHT + 100) {
                sw.y = -100;
                sw.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });
        
        // 更新气泡
        this.bubbles.forEach(b => {
            b.y -= b.speed;
            b.x += Math.sin(frameCount * 0.05 + b.wobble) * 0.5;
            if (b.y < -20) {
                b.y = CONFIG.GAME_HEIGHT + 20;
                b.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });
    },
    
    drawOcean(ctx, scrollY, frameCount) {
        // 深海渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.GAME_HEIGHT);
        gradient.addColorStop(0, '#1a5276');
        gradient.addColorStop(0.5, '#154360');
        gradient.addColorStop(1, '#0e2f44');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // 光线效果
        for (let i = 0; i < 5; i++) {
            const x = 100 + i * 150;
            const rayGradient = ctx.createLinearGradient(x, 0, x + 50, CONFIG.GAME_HEIGHT);
            rayGradient.addColorStop(0, 'rgba(255, 255, 200, 0.1)');
            rayGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
            ctx.fillStyle = rayGradient;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 80, CONFIG.GAME_HEIGHT);
            ctx.lineTo(x + 30, CONFIG.GAME_HEIGHT);
            ctx.closePath();
            ctx.fill();
        }
        
        // 海草
        this.seaweeds.forEach(sw => {
            ctx.strokeStyle = '#2e7d32';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(sw.x, sw.y + sw.height);
            
            const segments = 5;
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const waveOffset = Math.sin(frameCount * 0.03 + sw.phase + t * 3) * 15 * t;
                ctx.lineTo(sw.x + waveOffset, sw.y + sw.height * (1 - t));
            }
            ctx.stroke();
        });
        
        // 气泡
        this.bubbles.forEach(b => {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.stroke();
            
            // 高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
    },
    
    // ========== 沙漠场景 ==========
    dunes: [],
    cacti: [],
    tumbleweeds: [],
    
    initDesert() {
        this.dunes = [];
        this.cacti = [];
        this.tumbleweeds = [];
        
        // 生成沙丘
        for (let i = 0; i < 8; i++) {
            this.dunes.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT * 2 - CONFIG.GAME_HEIGHT,
                width: 150 + Math.random() * 100,
                height: 30 + Math.random() * 20
            });
        }
        
        // 生成仙人掌
        for (let i = 0; i < 10; i++) {
            this.cacti.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT * 2 - CONFIG.GAME_HEIGHT,
                size: 20 + Math.random() * 15,
                type: Math.floor(Math.random() * 2)
            });
        }
        
        // 风滚草
        for (let i = 0; i < 5; i++) {
            this.tumbleweeds.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT,
                size: 15 + Math.random() * 10,
                speedX: 1 + Math.random() * 2,
                rotation: 0
            });
        }
    },
    
    updateDesert(scrollSpeed, frameCount) {
        // 更新沙丘
        this.dunes.forEach(d => {
            d.y += scrollSpeed * 0.8;
            if (d.y > CONFIG.GAME_HEIGHT + 50) {
                d.y = -50;
                d.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });
        
        // 更新仙人掌
        this.cacti.forEach(c => {
            c.y += scrollSpeed;
            if (c.y > CONFIG.GAME_HEIGHT + 50) {
                c.y = -50;
                c.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });
        
        // 更新风滚草
        this.tumbleweeds.forEach(tw => {
            tw.x += tw.speedX;
            tw.y += scrollSpeed * 0.5;
            tw.rotation += 0.1;
            if (tw.x > CONFIG.GAME_WIDTH + 50) {
                tw.x = -50;
            }
            if (tw.y > CONFIG.GAME_HEIGHT + 50) {
                tw.y = -50;
            }
        });
    },
    
    drawDesert(ctx, scrollY, frameCount) {
        // 沙漠渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.GAME_HEIGHT);
        gradient.addColorStop(0, '#f4d03f');
        gradient.addColorStop(0.3, '#e9c46a');
        gradient.addColorStop(1, '#d4a84b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // 热浪效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 3; i++) {
            const waveY = (scrollY * 0.5 + i * 200) % CONFIG.GAME_HEIGHT;
            ctx.beginPath();
            ctx.moveTo(0, waveY);
            for (let x = 0; x <= CONFIG.GAME_WIDTH; x += 20) {
                ctx.lineTo(x, waveY + Math.sin(x * 0.02 + frameCount * 0.05) * 10);
            }
            ctx.lineTo(CONFIG.GAME_WIDTH, waveY + 30);
            ctx.lineTo(0, waveY + 30);
            ctx.fill();
        }
        
        // 沙丘
        this.dunes.forEach(d => {
            ctx.fillStyle = '#c9a227';
            ctx.beginPath();
            ctx.ellipse(d.x, d.y, d.width, d.height, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 仙人掌
        this.cacti.forEach(c => {
            ctx.fillStyle = '#2d5a27';
            if (c.type === 0) {
                // 简单仙人掌
                ctx.fillRect(c.x - 5, c.y - c.size, 10, c.size);
                ctx.fillRect(c.x - 15, c.y - c.size * 0.7, 10, c.size * 0.4);
                ctx.fillRect(c.x + 5, c.y - c.size * 0.5, 10, c.size * 0.3);
            } else {
                // 圆形仙人掌
                ctx.beginPath();
                ctx.ellipse(c.x, c.y - c.size * 0.5, c.size * 0.4, c.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // 风滚草
        this.tumbleweeds.forEach(tw => {
            ctx.save();
            ctx.translate(tw.x, tw.y);
            ctx.rotate(tw.rotation);
            ctx.strokeStyle = '#8b7355';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * tw.size, Math.sin(angle) * tw.size);
                ctx.stroke();
            }
            ctx.restore();
        });
    },
    
    // ========== 通用方法 ==========
    update(scrollSpeed, frameCount) {
        switch (this.currentScene) {
            case 'grass':
                this.updateGrass(scrollSpeed);
                break;
            case 'ocean':
                this.updateOcean(scrollSpeed, frameCount);
                break;
            case 'desert':
                this.updateDesert(scrollSpeed, frameCount);
                break;
            case 'snow':
                this.updateSnow(scrollSpeed, frameCount);
                break;
        }
    },
    
    draw(ctx, scrollY, frameCount) {
        switch (this.currentScene) {
            case 'grass':
                this.drawGrass(ctx, scrollY);
                break;
            case 'ocean':
                this.drawOcean(ctx, scrollY, frameCount);
                break;
            case 'desert':
                this.drawDesert(ctx, scrollY, frameCount);
                break;
            case 'snow':
                this.drawSnow(ctx, scrollY, frameCount);
                break;
        }
    },
    
    // 获取背景底色（用于清屏）
    getBackgroundColor() {
        switch (this.currentScene) {
            case 'grass': return '#8ccf7e';
            case 'ocean': return '#1a5276';
            case 'desert': return '#f4d03f';
            case 'snow': return '#e8f4f8';
            default: return '#8ccf7e';
        }
    },
    
    // ========== 雪地场景 ==========
    snowflakes: [],
    snowTrees: [],
    snowRocks: [],
    
    initSnow() {
        this.snowflakes = [];
        this.snowTrees = [];
        this.snowRocks = [];
        
        // 生成雪花
        for (let i = 0; i < 80; i++) {
            this.snowflakes.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT,
                size: 2 + Math.random() * 4,
                speed: 1 + Math.random() * 2,
                wobble: Math.random() * Math.PI * 2
            });
        }
        
        // 生成雪松
        for (let i = 0; i < 12; i++) {
            this.snowTrees.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT * 2 - CONFIG.GAME_HEIGHT,
                size: 30 + Math.random() * 25
            });
        }
        
        // 生成雪堆/岩石
        for (let i = 0; i < 8; i++) {
            this.snowRocks.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT * 2 - CONFIG.GAME_HEIGHT,
                size: 20 + Math.random() * 15
            });
        }
    },
    
    updateSnow(scrollSpeed, frameCount) {
        // 更新雪花
        this.snowflakes.forEach(sf => {
            sf.y += sf.speed;
            sf.x += Math.sin(frameCount * 0.02 + sf.wobble) * 0.5;
            if (sf.y > CONFIG.GAME_HEIGHT + 10) {
                sf.y = -10;
                sf.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });
        
        // 更新树
        this.snowTrees.forEach(t => {
            t.y += scrollSpeed;
            if (t.y > CONFIG.GAME_HEIGHT + 100) {
                t.y = -100;
                t.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });
        
        // 更新雪堆
        this.snowRocks.forEach(r => {
            r.y += scrollSpeed;
            if (r.y > CONFIG.GAME_HEIGHT + 50) {
                r.y = -50;
                r.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });
    },
    
    drawSnow(ctx, scrollY, frameCount) {
        // 雪地背景
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.GAME_HEIGHT);
        gradient.addColorStop(0, '#e8f4f8');
        gradient.addColorStop(1, '#c5dde8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // 雪堆
        this.snowRocks.forEach(r => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, r.size * 1.2, r.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#d0e8f0';
            ctx.beginPath();
            ctx.ellipse(r.x + 5, r.y + 3, r.size * 0.8, r.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 雪松
        this.snowTrees.forEach(t => {
            // 树干
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(t.x - 4, t.y - 5, 8, 15);
            
            // 树冠（三层）
            ctx.fillStyle = '#2e7d32';
            for (let i = 0; i < 3; i++) {
                const layerY = t.y - 10 - i * (t.size * 0.35);
                const layerSize = t.size * (1 - i * 0.25);
                ctx.beginPath();
                ctx.moveTo(t.x, layerY - layerSize * 0.8);
                ctx.lineTo(t.x - layerSize * 0.6, layerY);
                ctx.lineTo(t.x + layerSize * 0.6, layerY);
                ctx.closePath();
                ctx.fill();
            }
            
            // 雪覆盖
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 3; i++) {
                const layerY = t.y - 10 - i * (t.size * 0.35);
                const layerSize = t.size * (1 - i * 0.25);
                ctx.beginPath();
                ctx.moveTo(t.x, layerY - layerSize * 0.8);
                ctx.lineTo(t.x - layerSize * 0.3, layerY - layerSize * 0.5);
                ctx.lineTo(t.x + layerSize * 0.3, layerY - layerSize * 0.5);
                ctx.closePath();
                ctx.fill();
            }
        });
        
        // 雪花
        ctx.fillStyle = '#ffffff';
        this.snowflakes.forEach(sf => {
            ctx.beginPath();
            ctx.arc(sf.x, sf.y, sf.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
};
