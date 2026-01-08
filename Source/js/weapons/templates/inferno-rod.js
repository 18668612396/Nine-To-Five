// --- 炎魔之杖 ---

Weapon.register('inferno_rod', {
    name: '炎魔之杖',
    icon: '🪄',
    iconColor: '#ff6600',
    rarity: 'rare',
    desc: '火焰专精，高伤害',
    maxEnergy: 120,
    energyRegen: 8,
    castInterval: 20,
    slotCount: 6,
    specialSlot: { trigger: 'kills', value: 5, slots: 2 },
    affixCount: 2,
    fixedAffix: 'fire_affinity'
});
