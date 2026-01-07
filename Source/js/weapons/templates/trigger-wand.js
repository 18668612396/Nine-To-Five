// --- 触发法杖 ---

Weapon.register('trigger_wand', {
    name: '触发法杖',
    icon: '✨',
    rarity: 'uncommon',
    desc: '带有特殊触发槽',
    maxEnergy: 80,
    energyRegen: 8,
    castInterval: 15,
    slotCount: 5,
    specialSlot: { trigger: 'energy_spent', value: 20, slots: 1 },
    affixCount: 1
});
