// --- 武器生成器 ---

const WeaponGenerator = {
    // 生成随机武器
    // level: 武器等级，影响词条数量
    // rarity: 稀有度筛选
    generate(level = 1, rarity = null) {
        let templates = Weapon.getAllTemplates();
        
        // 按稀有度筛选
        if (rarity) {
            templates = templates.filter(t => {
                if (rarity === 'common') return t.rarity === 'common';
                if (rarity === 'uncommon') return ['common', 'uncommon'].includes(t.rarity);
                if (rarity === 'rare') return ['uncommon', 'rare'].includes(t.rarity);
                if (rarity === 'epic') return ['rare', 'epic'].includes(t.rarity);
                return true;
            });
        }
        
        if (templates.length === 0) {
            templates = Weapon.getAllTemplates();
        }
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        return this.createFromTemplate(template, level);
    },
    
    // 从模板创建武器
    createFromTemplate(template, level = 1) {
        const affixes = [];
        
        // 固定词条
        if (template.fixedAffix) {
            const def = WEAPON_AFFIXES[template.fixedAffix];
            if (def) {
                const value = this.rollValue(def.valueRange);
                affixes.push({ id: def.id, value });
            }
        }
        
        // 随机词条数量 = 基础数量 + 等级加成（每2级+1词条）
        const baseAffixCount = (template.affixCount || 1) - (template.fixedAffix ? 1 : 0);
        const bonusAffixes = Math.floor((level - 1) / 2);
        const guaranteedCount = baseAffixCount + bonusAffixes;
        
        // 浮动 -1 到 +1，最少为0
        const fluctuation = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
        const totalAffixCount = Math.max(0, guaranteedCount + fluctuation);
        
        // 随机词条
        const affixPool = Object.values(WEAPON_AFFIXES).filter(a => a.id !== template.fixedAffix);
        
        for (let i = 0; i < totalAffixCount && affixPool.length > 0; i++) {
            const idx = Math.floor(Math.random() * affixPool.length);
            const def = affixPool[idx];
            const value = this.rollValue(def.valueRange);
            affixes.push({ id: def.id, value });
            affixPool.splice(idx, 1);
        }
        
        const weapon = new Weapon(template, affixes);
        weapon.level = level;
        return weapon;
    },
    
    // 生成Boss掉落的三选一
    generateBossDrops(bossLevel = 1) {
        const rarities = ['common', 'uncommon', 'rare'];
        if (bossLevel >= 2) rarities.push('epic');
        
        const weapons = [];
        for (let i = 0; i < 3; i++) {
            const rarity = rarities[Math.floor(Math.random() * rarities.length)];
            weapons.push(this.generate(bossLevel, rarity));
        }
        return weapons;
    },
    
    rollValue(range) {
        return Math.floor(range[0] + Math.random() * (range[1] - range[0] + 1));
    }
};
