// --- 闪电链 ---

class LightningChainModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'lightning_chain',
            name: '闪电链',
            icon: '⚡',
            desc: '命中后连锁攻击附近敌人'
        });
    }
    
    modify(mods, star) {
        mods.chainCount = (mods.chainCount || 0) + 2;
    }
}

// 注册技能
SkillRegistry.registerModifier(new LightningChainModifier());
