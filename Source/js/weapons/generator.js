// --- 武器生成器 ---

const WeaponGenerator = {
    // 生成随机武器
    generate(rarity = 'common') {
        const templates = Weapon.getAllTemplates().filter(t => {
            if (rarity === 'common') return t.rarity === 'common';
            if (rarity === 'uncommon') return ['common', 'uncommon'].includes(t.rarity);
            if (rarity === 'rare') return ['uncommon', 'rare'].includes(t.rarity);
            if (rarity === 'epic') return ['rare', 'epic'].includes(t.rarity);
            return true;
        });
        
        if (templates.length === 0) {
            templates.push(...Weapon.getAllTemplates());
        }
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        return this.createFromTemplate(template);
    },
    
    // 从模板创建武器
    createFromTemplate(template) {
        const affixes = [];
        
        // 固定词条
        if (template.fixedAffix) {
            const def = WEAPON_AFFIXES[template.fixedAffix];
            if (def) {
                const value = this.rollValue(def.valueRange);
                affixes.push({ id: def.id, value });
            }
        }
        
        // 随机词条
        const affixPool = Object.values(WEAPON_AFFIXES).filter(a => a.id !== template.fixedAffix);
        const affixCount = (template.affixCount || 1) - (template.fixedAffix ? 1 : 0);
        
        for (let i = 0; i < affixCount && affixPool.length > 0; i++) {
            const idx = Math.floor(Math.random() * affixPool.length);
            const def = affixPool[idx];
            const value = this.rollValue(def.valueRange);
            affixes.push({ id: def.id, value });
            affixPool.splice(idx, 1);
        }
        
        return new Weapon(template, affixes);
    },
    
    // 生成Boss掉落的三选一
    generateBossDrops(bossLevel = 1) {
        const rarities = ['common', 'uncommon', 'rare'];
        if (bossLevel >= 2) rarities.push('epic');
        
        const weapons = [];
        for (let i = 0; i < 3; i++) {
            const rarity = rarities[Math.floor(Math.random() * rarities.length)];
            weapons.push(this.generate(rarity));
        }
        return weapons;
    },
    
    rollValue(range) {
        return Math.floor(range[0] + Math.random() * (range[1] - range[0] + 1));
    }
};
