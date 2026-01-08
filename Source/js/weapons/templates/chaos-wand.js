// --- 混沌魔杖 ---

Weapon.register('chaos_wand', {
    name: '混沌魔杖',
    icon: '🪄',
    iconColor: '#ff00ff',
    rarity: 'epic',
    desc: '随机性，每次施法随机增强',
    maxEnergy: 100,
    energyRegen: 12,
    castInterval: 14,
    slotCount: 7,
    specialSlot: { trigger: 'timer', value: 5, slots: 2 },
    affixCount: 3,
    fixedAffix: 'chaos_power'
});
