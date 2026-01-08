// --- 生命之杖 ---

Weapon.register('life_staff', {
    name: '生命之杖',
    icon: '🪄',
    iconColor: '#00ff66',
    rarity: 'rare',
    desc: '续航型，击杀回血',
    maxEnergy: 120,
    energyRegen: 7,
    castInterval: 18,
    slotCount: 5,
    specialSlot: { trigger: 'on_hurt', value: 1, slots: 2 },
    affixCount: 2,
    fixedAffix: 'life_steal'
});
