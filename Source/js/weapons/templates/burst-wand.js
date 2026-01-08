// --- 爆裂短杖 ---

Weapon.register('burst_wand', {
    name: '爆裂短杖',
    icon: '🪄',
    iconColor: '#ff6600',
    rarity: 'common',
    desc: '爆发型，一次发射多发弹道',
    maxEnergy: 80,
    energyRegen: 8,
    castInterval: 24,
    slotCount: 5,
    specialSlot: null,
    affixCount: 1,
    fixedAffix: 'multi_shot'
});
