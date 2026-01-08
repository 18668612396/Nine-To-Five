// --- 吸血权杖 ---

Weapon.register('vampiric_scepter', {
    name: '吸血权杖',
    icon: '🪄',
    iconColor: '#cc00cc',
    rarity: 'epic',
    desc: '击杀回能，持久作战',
    maxEnergy: 150,
    energyRegen: 3,
    castInterval: 15,
    slotCount: 7,
    specialSlot: { trigger: 'on_hurt', value: 1, slots: 2 },
    affixCount: 3,
    fixedAffix: 'energy_on_kill'
});
