// --- 唤雷者 ---

Weapon.register('storm_caller', {
    name: '唤雷者',
    icon: '🪄',
    iconColor: '#66ccff',
    rarity: 'rare',
    desc: '雷电专精，连锁攻击',
    maxEnergy: 90,
    energyRegen: 12,
    castInterval: 12,
    slotCount: 5,
    specialSlot: { trigger: 'timer', value: 5, slots: 2 },
    affixCount: 2,
    fixedAffix: 'lightning_affinity'
});
