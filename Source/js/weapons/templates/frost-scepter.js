// --- 冰霜权杖 ---

Weapon.register('frost_scepter', {
    name: '冰霜权杖',
    icon: '🪄',
    iconColor: '#00ffff',
    rarity: 'rare',
    desc: '冰冻专精，减速敌人',
    maxEnergy: 100,
    energyRegen: 10,
    castInterval: 16,
    slotCount: 6,
    specialSlot: { trigger: 'hits', value: 10, slots: 2 },
    affixCount: 2,
    fixedAffix: 'frost_affinity'
});
