// --- 虚空之眼 ---

Weapon.register('void_eye', {
    name: '虚空之眼',
    icon: '🪄',
    iconColor: '#9900ff',
    rarity: 'epic',
    desc: '穿透专精，弹道穿透多个敌人',
    maxEnergy: 80,
    energyRegen: 6,
    castInterval: 22,
    slotCount: 6,
    specialSlot: { trigger: 'kills', value: 3, slots: 3 },
    affixCount: 3,
    fixedAffix: 'void_penetration'
});
