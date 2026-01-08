// --- 背包系统 ---

const Inventory = {
    // 工作台
    workbenchSlots: [null, null, null],
    workbenchOpen: false,
    
    // 长按计时器
    longPressTimer: null,
    longPressDelay: 500,
    
    // 显示技能详情弹窗
    showSkillTooltip(skill, x, y) {
        this.hideSkillTooltip();
        
        const star = skill.star || 1;
        const cost = typeof SKILL_COSTS !== 'undefined' ? (SKILL_COSTS[skill.id] || 0) : 0;
        const desc = (skill.getDesc && typeof skill.getDesc === 'function') ? skill.getDesc(star) : (skill.desc || '');
        const typeText = skill.type === 'magic' ? '主动技能' : '被动技能';
        
        const tooltip = document.createElement('div');
        tooltip.id = 'skill-tooltip';
        tooltip.className = 'skill-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-icon">${skill.icon}</span>
                <div class="tooltip-title">
                    <span class="tooltip-name">${skill.name}</span>
                    <span class="tooltip-star">${'⭐'.repeat(star)}</span>
                </div>
            </div>
            <div class="tooltip-type">${typeText}</div>
            <div class="tooltip-desc">${desc}</div>
            ${cost > 0 ? `<div class="tooltip-cost">⚡ 能量消耗: ${cost}</div>` : ''}
            <div class="tooltip-hint">点击任意处关闭</div>
        `;
        
        document.body.appendChild(tooltip);
        
        // 点击任意处关闭
        setTimeout(() => {
            document.addEventListener('touchstart', this.hideSkillTooltip, { once: true });
            document.addEventListener('click', this.hideSkillTooltip, { once: true });
        }, 100);
    },
    
    hideSkillTooltip() {
        const tooltip = document.getElementById('skill-tooltip');
        if (tooltip) tooltip.remove();
    },
    
    // 绑定长按事件（移动端）
    bindLongPress(element, skill) {
        if (!isMobile) return;
        
        element.addEventListener('touchstart', (e) => {
            this.longPressTimer = setTimeout(() => {
                e.preventDefault();
                const touch = e.touches[0];
                this.showSkillTooltip(skill, touch.clientX, touch.clientY);
            }, this.longPressDelay);
        }, { passive: false });
        
        element.addEventListener('touchend', () => {
            clearTimeout(this.longPressTimer);
        });
        
        element.addEventListener('touchmove', () => {
            clearTimeout(this.longPressTimer);
        });
    },
    
    // 打开背包（现在由 Screen.Manager 调用）
    open() {
        this.workbenchOpen = false;
        this.workbenchSlots = [null, null, null];
        
        // 重置为武器槽视图
        document.getElementById('weapon-wand-area')?.classList.remove('hidden');
        document.getElementById('workbench-area')?.classList.add('hidden');
        const btn = document.getElementById('workbench-toggle-btn');
        btn?.classList.remove('active');
        if (btn) btn.textContent = '🔧 工作台';
        
        this.render();
    },
    
    // 关闭背包（现在由 Screen.Manager 调用）
    close() {
        // 把工作台里的技能放回背包
        if (this.workbenchOpen) {
            this.workbenchSlots.forEach((item) => {
                if (item && Game.player) {
                    Game.player.skillInventory.push(item.skill);
                }
            });
            this.workbenchSlots = [null, null, null];
            this.workbenchOpen = false;
        }
    },
    
    // 渲染背包
    render() {
        this.renderWeaponWandRows();
        this.renderWeaponInventory();
        this.renderSkillInventory();
    },
    
    // 渲染武器+技能槽行
    renderWeaponWandRows() {
        const container = document.getElementById('weapon-wand-rows');
        if (!container || !Game.player) return;
        container.innerHTML = '';
        
        const player = Game.player;
        
        for (let rowIdx = 0; rowIdx < player.weaponSlots.length; rowIdx++) {
            const weapon = player.weaponSlots[rowIdx];
            const isActive = rowIdx === player.currentWeaponIndex;
            
            const rowDiv = document.createElement('div');
            rowDiv.className = 'weapon-wand-row' + (isActive ? ' active' : '');
            
            // 武器槽
            const weaponSlot = document.createElement('div');
            weaponSlot.className = 'row-weapon-slot';
            weaponSlot.dataset.weaponSlotIndex = rowIdx;
            
            if (weapon) {
                weaponSlot.classList.add(`rarity-${weapon.rarity}`);
                weaponSlot.innerHTML = `
                    <span class="row-weapon-index">${rowIdx + 1}</span>
                    <span class="row-weapon-icon">${weapon.icon}</span>
                `;
                weaponSlot.title = this.buildWeaponTooltip(weapon);
                weaponSlot.onclick = () => {
                    player.switchWeapon(rowIdx);
                    this.render();
                };
            } else {
                weaponSlot.classList.add('empty');
                weaponSlot.innerHTML = `<span class="row-weapon-index">${rowIdx + 1}</span>`;
                weaponSlot.title = '空武器槽 - 从武器背包拖入武器';
            }
            
            // 武器槽拖拽
            weaponSlot.ondragover = (e) => { e.preventDefault(); weaponSlot.classList.add('drag-over'); };
            weaponSlot.ondragleave = () => weaponSlot.classList.remove('drag-over');
            weaponSlot.ondrop = (e) => {
                e.preventDefault();
                weaponSlot.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type');
                if (type === 'weaponInventory') {
                    const invIdx = parseInt(e.dataTransfer.getData('weaponInventoryIndex'));
                    if (!isNaN(invIdx)) {
                        player.equipWeaponToSlot(invIdx, rowIdx);
                        this.render();
                    }
                }
            };
            
            rowDiv.appendChild(weaponSlot);
            
            // 技能槽
            const skillSlotsDiv = document.createElement('div');
            skillSlotsDiv.className = 'row-skill-slots';
            
            const slotCount = weapon ? weapon.slotCount : 0;
            const slots = weapon ? weapon.slots : [];
            
            for (let i = 0; i < slotCount; i++) {
                const slot = slots[i];
                const slotDiv = document.createElement('div');
                slotDiv.className = 'row-skill-slot';
                slotDiv.dataset.weaponIndex = rowIdx;
                slotDiv.dataset.slotIndex = i;
                
                if (slot) {
                    const star = slot.star || 1;
                    const cost = typeof SKILL_COSTS !== 'undefined' ? (SKILL_COSTS[slot.id] || 0) : 0;
                    slotDiv.classList.add('has-skill');
                    slotDiv.classList.add(slot.type === 'magic' ? 'magic-type' : 'modifier-type');
                    const starText = '⭐'.repeat(star);
                    const costText = cost > 0 ? `<span class="skill-cost">⚡${cost}</span>` : '';
                    slotDiv.innerHTML = `<span class="slot-index">${i + 1}</span>${slot.icon}<span class="star-badge">${starText}</span>${costText}`;
                    // 支持动态描述（如拓展技能根据星级显示不同描述）
                    const desc = (slot.getDesc && typeof slot.getDesc === 'function') ? slot.getDesc(star) : (slot.desc || '');
                    slotDiv.title = `${slot.name} (${star}星)\n${desc}\n能量消耗: ${cost}`;
                    
                    // 移动端长按显示详情
                    if (isMobile) {
                        this.bindLongPress(slotDiv, slot);
                    }
                } else {
                    slotDiv.innerHTML = `<span class="slot-index">${i + 1}</span>`;
                }
                
                slotDiv.onclick = () => {
                    if (weapon && weapon.slots[i]) {
                        this.unequipSkillFromWeapon(i, weapon);
                        this.render();
                    }
                };
                
                // 移动端禁用拖拽
                if (isMobile) {
                    slotDiv.draggable = false;
                } else {
                    slotDiv.draggable = true;
                    slotDiv.ondragstart = (e) => {
                        if (weapon && weapon.slots[i]) {
                            e.dataTransfer.setData('type', 'slot');
                            e.dataTransfer.setData('weaponIndex', rowIdx.toString());
                            e.dataTransfer.setData('slotIndex', i.toString());
                            slotDiv.classList.add('dragging');
                        } else {
                            e.preventDefault();
                        }
                    };
                    slotDiv.ondragend = () => slotDiv.classList.remove('dragging');
                }
                
                slotDiv.ondragover = (e) => { e.preventDefault(); slotDiv.classList.add('drag-over'); };
                slotDiv.ondragleave = () => slotDiv.classList.remove('drag-over');
                slotDiv.ondrop = (e) => {
                    e.preventDefault();
                    slotDiv.classList.remove('drag-over');
                    const type = e.dataTransfer.getData('type');
                    
                    if (type === 'slot') {
                        const fromWeaponIdx = parseInt(e.dataTransfer.getData('weaponIndex'));
                        const fromSlotIdx = parseInt(e.dataTransfer.getData('slotIndex'));
                        if (fromWeaponIdx === rowIdx && fromSlotIdx !== i && weapon) {
                            // 交换槽位时检查拓展技能
                            const fromSkill = weapon.slots[fromSlotIdx];
                            const toSkill = weapon.slots[i];
                            [weapon.slots[fromSlotIdx], weapon.slots[i]] = [toSkill, fromSkill];
                            // 如果涉及拓展技能，更新槽位数量
                            if ((fromSkill && fromSkill.id === 'expand') || (toSkill && toSkill.id === 'expand')) {
                                weapon.updateSlotCount();
                            }
                            this.render();
                        }
                    } else if (type === 'inventory') {
                        const invIndex = parseInt(e.dataTransfer.getData('inventoryIndex'));
                        if (!isNaN(invIndex) && weapon) {
                            this.equipSkillToWeapon(invIndex, i, weapon);
                            this.render();
                        }
                    }
                };
                
                skillSlotsDiv.appendChild(slotDiv);
            }
            
            if (!weapon) {
                const hintDiv = document.createElement('div');
                hintDiv.style.cssText = 'color: #666; font-size: 12px; padding: 10px;';
                hintDiv.textContent = '拖入武器以解锁技能槽';
                skillSlotsDiv.appendChild(hintDiv);
            }
            
            // 渲染特殊技能槽（紫色边框）
            if (weapon && weapon.specialSlot && weapon.specialSlots) {
                const specialSlotCount = weapon.specialSlot.slots || 0;
                for (let i = 0; i < specialSlotCount; i++) {
                    const slot = weapon.specialSlots[i];
                    const slotDiv = document.createElement('div');
                    slotDiv.className = 'row-skill-slot special-slot';
                    slotDiv.dataset.weaponIndex = rowIdx;
                    slotDiv.dataset.specialSlotIndex = i;
                    slotDiv.draggable = true;
                    
                    if (slot) {
                        const star = slot.star || 1;
                        const cost = typeof SKILL_COSTS !== 'undefined' ? (SKILL_COSTS[slot.id] || 0) : 0;
                        slotDiv.classList.add('has-skill');
                        slotDiv.classList.add(slot.type === 'magic' ? 'magic-type' : 'modifier-type');
                        const starText = '⭐'.repeat(star);
                        const costText = cost > 0 ? `<span class="skill-cost">⚡${cost}</span>` : '';
                        slotDiv.innerHTML = `<span class="slot-index">S${i + 1}</span>${slot.icon}<span class="star-badge">${starText}</span>${costText}`;
                        const desc = (slot.getDesc && typeof slot.getDesc === 'function') ? slot.getDesc(star) : (slot.desc || '');
                        slotDiv.title = `[特殊槽] ${slot.name} (${star}星)\n${desc}\n能量消耗: ${cost}`;
                    } else {
                        slotDiv.innerHTML = `<span class="slot-index">S${i + 1}</span>`;
                        slotDiv.title = '特殊技能槽 - 满足条件时自动触发';
                    }
                    
                    slotDiv.onclick = () => {
                        if (weapon && weapon.specialSlots[i]) {
                            this.unequipSkillFromSpecialSlot(i, weapon);
                            this.render();
                        }
                    };
                    
                    slotDiv.ondragstart = (e) => {
                        if (weapon && weapon.specialSlots[i]) {
                            e.dataTransfer.setData('type', 'specialSlot');
                            e.dataTransfer.setData('weaponIndex', rowIdx.toString());
                            e.dataTransfer.setData('specialSlotIndex', i.toString());
                            slotDiv.classList.add('dragging');
                        } else {
                            e.preventDefault();
                        }
                    };
                    slotDiv.ondragend = () => slotDiv.classList.remove('dragging');
                    
                    slotDiv.ondragover = (e) => { e.preventDefault(); slotDiv.classList.add('drag-over'); };
                    slotDiv.ondragleave = () => slotDiv.classList.remove('drag-over');
                    slotDiv.ondrop = (e) => {
                        e.preventDefault();
                        slotDiv.classList.remove('drag-over');
                        const type = e.dataTransfer.getData('type');
                        
                        if (type === 'specialSlot') {
                            const fromWeaponIdx = parseInt(e.dataTransfer.getData('weaponIndex'));
                            const fromSlotIdx = parseInt(e.dataTransfer.getData('specialSlotIndex'));
                            if (fromWeaponIdx === rowIdx && fromSlotIdx !== i && weapon) {
                                [weapon.specialSlots[fromSlotIdx], weapon.specialSlots[i]] = [weapon.specialSlots[i], weapon.specialSlots[fromSlotIdx]];
                                this.render();
                            }
                        } else if (type === 'inventory') {
                            const invIndex = parseInt(e.dataTransfer.getData('inventoryIndex'));
                            if (!isNaN(invIndex) && weapon) {
                                this.equipSkillToSpecialSlot(invIndex, i, weapon);
                                this.render();
                            }
                        }
                    };
                    
                    skillSlotsDiv.appendChild(slotDiv);
                }
            }
            
            rowDiv.appendChild(skillSlotsDiv);
            container.appendChild(rowDiv);
        }
    },
    
    // 构建武器tooltip
    buildWeaponTooltip(weapon) {
        const castIntervalSec = (weapon.getCastInterval() / 60).toFixed(2);
        let tooltipText = `【${weapon.name}】\n`;
        tooltipText += `稀有度: ${this.getRarityName(weapon.rarity)}\n`;
        tooltipText += `─────────\n`;
        tooltipText += `⚡ 能量: ${Math.floor(weapon.energy)}/${weapon.maxEnergy}\n`;
        tooltipText += `💧 回复: ${weapon.getEnergyRegen().toFixed(1)}/秒\n`;
        tooltipText += `⏱️ 攻击间隔: ${castIntervalSec}秒\n`;
        tooltipText += `🔮 技能槽: ${weapon.slotCount}个\n`;
        
        if (weapon.affixes && weapon.affixes.length > 0 && typeof WEAPON_AFFIXES !== 'undefined') {
            tooltipText += `─────────\n`;
            weapon.affixes.forEach(affix => {
                const def = WEAPON_AFFIXES[affix.id];
                if (def) {
                    const desc = def.desc.replace('{value}', affix.value);
                    tooltipText += `✦ ${desc}\n`;
                }
            });
        }
        
        if (weapon.specialSlot && typeof SPECIAL_TRIGGERS !== 'undefined') {
            const trigger = SPECIAL_TRIGGERS[weapon.specialSlot.trigger];
            if (trigger) {
                tooltipText += `─────────\n`;
                const triggerDesc = trigger.desc.replace('{value}', weapon.specialSlot.value);
                tooltipText += `⚡ 特殊槽(${weapon.specialSlot.slots}): ${triggerDesc}`;
            }
        }
        
        return tooltipText;
    },
    
    getRarityName(rarity) {
        const names = { common: '普通', uncommon: '优秀', rare: '稀有', epic: '史诗' };
        return names[rarity] || rarity;
    },
    
    // 装备技能到武器
    equipSkillToWeapon(inventoryIndex, slotIndex, weapon) {
        const inventory = Game.player.skillInventory;
        if (inventoryIndex < 0 || inventoryIndex >= inventory.length) return false;
        if (slotIndex < 0 || slotIndex >= weapon.slotCount) return false;
        
        const skill = inventory[inventoryIndex];
        if (weapon.slots[slotIndex] !== null) {
            const oldSkill = weapon.slots[slotIndex];
            // 如果卸下的是拓展技能，先更新槽位
            if (oldSkill.id === 'expand') {
                inventory.push(oldSkill);
                weapon.slots[slotIndex] = null;
                weapon.updateSlotCount();
                // 重新检查槽位是否有效
                if (slotIndex >= weapon.slotCount) {
                    slotIndex = weapon.slotCount - 1;
                    if (weapon.slots[slotIndex] !== null) {
                        inventory.push(weapon.slots[slotIndex]);
                    }
                }
            } else {
                inventory.push(oldSkill);
            }
        }
        weapon.slots[slotIndex] = skill;
        inventory.splice(inventoryIndex, 1);
        
        // 如果装备的是拓展技能，更新槽位数量
        if (skill.id === 'expand') {
            weapon.updateSlotCount();
        }
        return true;
    },
    
    // 从武器卸下技能
    unequipSkillFromWeapon(slotIndex, weapon) {
        if (slotIndex < 0 || slotIndex >= weapon.slotCount) return false;
        if (weapon.slots[slotIndex] === null) return false;
        
        const skill = weapon.slots[slotIndex];
        Game.player.skillInventory.push(skill);
        weapon.slots[slotIndex] = null;
        
        // 如果卸下的是拓展技能，更新槽位数量
        if (skill.id === 'expand') {
            weapon.updateSlotCount();
        }
        return true;
    },
    
    // 装备技能到特殊槽
    equipSkillToSpecialSlot(inventoryIndex, slotIndex, weapon) {
        const inventory = Game.player.skillInventory;
        if (!weapon.specialSlots) return false;
        if (inventoryIndex < 0 || inventoryIndex >= inventory.length) return false;
        if (slotIndex < 0 || slotIndex >= weapon.specialSlots.length) return false;
        
        const skill = inventory[inventoryIndex];
        if (weapon.specialSlots[slotIndex] !== null) {
            const oldSkill = weapon.specialSlots[slotIndex];
            // 如果卸下的是拓展技能，先更新槽位
            if (oldSkill.id === 'expand') {
                inventory.push(oldSkill);
                weapon.specialSlots[slotIndex] = null;
                weapon.updateSlotCount();
                if (slotIndex >= weapon.specialSlots.length) {
                    slotIndex = weapon.specialSlots.length - 1;
                    if (weapon.specialSlots[slotIndex] !== null) {
                        inventory.push(weapon.specialSlots[slotIndex]);
                    }
                }
            } else {
                inventory.push(oldSkill);
            }
        }
        weapon.specialSlots[slotIndex] = skill;
        inventory.splice(inventoryIndex, 1);
        
        // 如果装备的是拓展技能，更新槽位数量
        if (skill.id === 'expand') {
            weapon.updateSlotCount();
        }
        return true;
    },
    
    // 从特殊槽卸下技能
    unequipSkillFromSpecialSlot(slotIndex, weapon) {
        if (!weapon.specialSlots) return false;
        if (slotIndex < 0 || slotIndex >= weapon.specialSlots.length) return false;
        if (weapon.specialSlots[slotIndex] === null) return false;
        
        const skill = weapon.specialSlots[slotIndex];
        Game.player.skillInventory.push(skill);
        weapon.specialSlots[slotIndex] = null;
        
        // 如果卸下的是拓展技能，更新槽位数量
        if (skill.id === 'expand') {
            weapon.updateSlotCount();
        }
        return true;
    },

    // 渲染技能背包
    renderSkillInventory() {
        const container = document.getElementById('inventory-items');
        if (!container || !Game.player) return;
        container.innerHTML = '';
        
        const player = Game.player;
        const weapon = player.weapon;
        const totalSlots = 100;
        const inventory = player.skillInventory;
        
        inventory.forEach((skill, idx) => {
            const star = skill.star || 1;
            const cost = typeof SKILL_COSTS !== 'undefined' ? (SKILL_COSTS[skill.id] || 0) : 0;
            const div = document.createElement('div');
            div.className = 'inventory-item ' + (skill.type === 'magic' ? 'magic-type' : 'modifier-type');
            if (star >= 2) div.classList.add(`star-${star}`);
            div.draggable = true;
            div.dataset.inventoryIndex = idx;
            const starText = '⭐'.repeat(star);
            const costText = cost > 0 ? `<span class="skill-cost">⚡${cost}</span>` : '';
            div.innerHTML = `<span class="item-icon">${skill.icon}</span><span class="star-badge">${starText}</span>${costText}`;
            // 支持动态描述
            const desc = (skill.getDesc && typeof skill.getDesc === 'function') ? skill.getDesc(star) : (skill.desc || '');
            div.title = `${skill.name} (${star}星)\n${desc}\n能量消耗: ${cost}`;
            
            // 移动端：禁用拖拽，绑定长按
            if (isMobile) {
                div.draggable = false;
                this.bindLongPress(div, skill);
            } else {
                div.draggable = true;
                div.ondragstart = (e) => {
                    e.dataTransfer.setData('type', 'inventory');
                    e.dataTransfer.setData('inventoryIndex', idx.toString());
                    div.classList.add('dragging');
                };
                div.ondragend = () => div.classList.remove('dragging');
            }
            
            div.ondragover = (e) => { e.preventDefault(); div.classList.add('drag-over'); };
            div.ondragleave = () => div.classList.remove('drag-over');
            div.ondrop = (e) => {
                e.preventDefault();
                div.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type');
                if (type === 'workbench') {
                    const wbIdx = parseInt(e.dataTransfer.getData('workbenchIndex'));
                    if (!isNaN(wbIdx)) {
                        this.dropFromWorkbenchToInventory(wbIdx);
                    }
                }
            };
            
            div.onclick = () => {
                // 如果工作台打开，点击技能放入工作台
                if (this.workbenchOpen) {
                    // 找到第一个空的工作台槽位
                    let targetSlot = -1;
                    for (let i = 0; i < 3; i++) {
                        if (this.workbenchSlots[i] === null) {
                            targetSlot = i;
                            break;
                        }
                    }
                    if (targetSlot >= 0) {
                        this.dropToWorkbench(idx, targetSlot);
                    }
                    return;
                }
                
                // 否则装备到武器槽
                if (!weapon) return;
                let targetSlot = -1;
                for (let i = 0; i < weapon.slotCount; i++) {
                    if (weapon.slots[i] === null) {
                        targetSlot = i;
                        break;
                    }
                }
                if (targetSlot >= 0) {
                    this.equipSkillToWeapon(idx, targetSlot, weapon);
                } else {
                    this.equipSkillToWeapon(idx, weapon.slotCount - 1, weapon);
                }
                this.render();
            };
            
            container.appendChild(div);
        });
        
        // 空槽位
        const emptySlots = totalSlots - inventory.length;
        for (let i = 0; i < emptySlots; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'inventory-slot-empty';
            
            emptyDiv.ondragover = (e) => { e.preventDefault(); emptyDiv.classList.add('drag-over'); };
            emptyDiv.ondragleave = () => emptyDiv.classList.remove('drag-over');
            emptyDiv.ondrop = (e) => {
                e.preventDefault();
                emptyDiv.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type');
                
                if (type === 'slot') {
                    const weaponIdx = parseInt(e.dataTransfer.getData('weaponIndex'));
                    const slotIndex = parseInt(e.dataTransfer.getData('slotIndex'));
                    const targetWeapon = Game.player.weaponSlots[weaponIdx];
                    if (targetWeapon && targetWeapon.slots[slotIndex]) {
                        this.unequipSkillFromWeapon(slotIndex, targetWeapon);
                        this.render();
                    }
                } else if (type === 'workbench') {
                    const wbIdx = parseInt(e.dataTransfer.getData('workbenchIndex'));
                    if (!isNaN(wbIdx)) {
                        this.dropFromWorkbenchToInventory(wbIdx);
                    }
                }
            };
            
            container.appendChild(emptyDiv);
        }
    },
    
    // 渲染武器背包
    renderWeaponInventory() {
        const container = document.getElementById('weapon-inventory');
        if (!container || !Game.player) return;
        container.innerHTML = '';
        
        const player = Game.player;
        
        if (player.weaponInventory.length === 0) {
            container.innerHTML = '<div style="color:#666;font-size:12px;padding:10px;">暂无武器，击败Boss获取</div>';
            return;
        }
        
        player.weaponInventory.forEach((weapon, idx) => {
            const div = document.createElement('div');
            div.className = `weapon-inv-item rarity-${weapon.rarity}`;
            div.draggable = true;
            div.dataset.weaponIndex = idx;
            
            div.innerHTML = `
                <span class="weapon-inv-icon">${weapon.icon}</span>
                <span class="weapon-inv-name">${weapon.name}</span>
            `;
            div.title = this.buildWeaponTooltip(weapon);
            
            div.ondragstart = (e) => {
                e.dataTransfer.setData('type', 'weaponInventory');
                e.dataTransfer.setData('weaponInventoryIndex', idx.toString());
                div.classList.add('dragging');
            };
            div.ondragend = () => div.classList.remove('dragging');
            
            container.appendChild(div);
        });
    },
    
    // 渲染祝福
    renderPerks() {
        const container = document.getElementById('perks-display');
        if (!container || !Game.player) return;
        container.innerHTML = '';
        
        const perks = Game.player.perkManager ? Game.player.perkManager.getAllPerks() : [];
        
        if (perks.length === 0) {
            container.innerHTML = '<div class="perks-empty">暂无祝福，升级后可获得</div>';
        } else {
            perks.forEach(item => {
                const perk = item.perk;
                const level = item.level;
                const div = document.createElement('div');
                div.className = 'perk-item';
                div.innerHTML = `
                    <span class="perk-icon">${perk.icon}</span>
                    <div class="perk-info">
                        <span class="perk-name">${perk.name}</span>
                        <span class="perk-level">Lv.${level}</span>
                    </div>
                `;
                const desc = perk.getDesc ? perk.getDesc(level) : perk.desc;
                div.title = desc;
                container.appendChild(div);
            });
        }
    },
    
    // ========== 工作台 ==========
    
    toggleWorkbench() {
        this.workbenchOpen = !this.workbenchOpen;
        const weaponArea = document.getElementById('weapon-wand-area');
        const workbenchArea = document.getElementById('workbench-area');
        const btn = document.getElementById('workbench-toggle-btn');
        
        if (this.workbenchOpen) {
            weaponArea?.classList.add('hidden');
            workbenchArea?.classList.remove('hidden');
            btn?.classList.add('active');
            if (btn) btn.textContent = '🗡️ 武器槽';
            this.renderWorkbench();
        } else {
            this.workbenchSlots.forEach((item) => {
                if (item && Game.player) {
                    Game.player.skillInventory.push(item.skill);
                }
            });
            this.workbenchSlots = [null, null, null];
            weaponArea?.classList.remove('hidden');
            workbenchArea?.classList.add('hidden');
            btn?.classList.remove('active');
            if (btn) btn.textContent = '🔧 工作台';
            this.render();
        }
    },
    
    renderWorkbench() {
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`workbench-slot-${i}`);
            if (!slot) continue;
            
            const item = this.workbenchSlots[i];
            if (item) {
                const starText = '⭐'.repeat(item.skill.star || 1);
                slot.innerHTML = `<span class="wb-icon">${item.skill.icon}</span><span class="wb-star">${starText}</span>`;
                slot.classList.add('filled');
                slot.draggable = true;
                
                slot.ondragstart = (e) => {
                    e.dataTransfer.setData('type', 'workbench');
                    e.dataTransfer.setData('workbenchIndex', i.toString());
                    slot.classList.add('dragging');
                };
                slot.ondragend = () => slot.classList.remove('dragging');
            } else {
                slot.innerHTML = '<span class="wb-empty">+</span>';
                slot.classList.remove('filled');
                slot.draggable = false;
                slot.ondragstart = null;
                slot.ondragend = null;
            }
            
            slot.ondragover = (e) => { e.preventDefault(); slot.classList.add('drag-over'); };
            slot.ondragleave = () => slot.classList.remove('drag-over');
            slot.ondrop = (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type');
                
                if (type === 'inventory') {
                    const invIdx = parseInt(e.dataTransfer.getData('inventoryIndex'));
                    if (!isNaN(invIdx)) {
                        this.dropToWorkbench(invIdx, i);
                    }
                } else if (type === 'workbench') {
                    const fromIdx = parseInt(e.dataTransfer.getData('workbenchIndex'));
                    if (!isNaN(fromIdx) && fromIdx !== i) {
                        this.swapWorkbenchSlots(fromIdx, i);
                    }
                }
            };
        }
        
        this.updateCraftResult();
    },
    
    dropToWorkbench(inventoryIdx, slotIdx) {
        if (this.workbenchSlots[slotIdx] !== null && Game.player) {
            Game.player.skillInventory.push(this.workbenchSlots[slotIdx].skill);
        }
        
        const skill = Game.player.skillInventory[inventoryIdx];
        this.workbenchSlots[slotIdx] = { skill };
        Game.player.skillInventory.splice(inventoryIdx, 1);
        this.renderWorkbench();
        this.render();
    },
    
    swapWorkbenchSlots(fromIdx, toIdx) {
        const temp = this.workbenchSlots[fromIdx];
        this.workbenchSlots[fromIdx] = this.workbenchSlots[toIdx];
        this.workbenchSlots[toIdx] = temp;
        this.renderWorkbench();
    },
    
    removeFromWorkbench(slotIdx) {
        const item = this.workbenchSlots[slotIdx];
        if (!item || !Game.player) return;
        
        Game.player.skillInventory.push(item.skill);
        this.workbenchSlots[slotIdx] = null;
        this.renderWorkbench();
        this.render();
    },
    
    dropFromWorkbenchToInventory(workbenchIdx) {
        const item = this.workbenchSlots[workbenchIdx];
        if (!item || !Game.player) return;
        
        Game.player.skillInventory.push(item.skill);
        this.workbenchSlots[workbenchIdx] = null;
        this.renderWorkbench();
        this.render();
    },
    
    updateCraftResult() {
        const resultDiv = document.getElementById('workbench-result');
        const tipDiv = document.getElementById('workbench-tip');
        const craftBtn = document.getElementById('workbench-craft-btn');
        if (!resultDiv || !tipDiv || !craftBtn) return;
        
        const filledSlots = this.workbenchSlots.filter(s => s !== null);
        const craftResult = this.getCraftResult();
        
        if (craftResult) {
            if (craftResult.type === 'upgrade') {
                const starText = '⭐'.repeat(craftResult.newStar);
                resultDiv.innerHTML = `<span class="wb-result-icon">${craftResult.skill.icon}</span><span class="wb-result-star">${starText}</span>`;
                tipDiv.innerHTML = `✨ 升星合成: ${craftResult.skill.name} → ${starText}`;
            } else if (craftResult.type === 'random') {
                const probText = this.getRandomCraftProbText(craftResult.slots);
                resultDiv.innerHTML = `<span class="wb-result-icon">🎲</span><span class="wb-result-text">随机</span>`;
                tipDiv.innerHTML = `🎲 随机合成<br>${probText}`;
            }
            resultDiv.classList.add('ready');
            craftBtn.disabled = false;
        } else {
            resultDiv.innerHTML = '<span class="wb-empty">?</span>';
            resultDiv.classList.remove('ready');
            craftBtn.disabled = true;
            
            if (filledSlots.length === 0) {
                tipDiv.innerHTML = '拖入技能进行合成：<br>✨ 3个相同技能 → 升星 (最高3星)<br>🎲 2个不同技能 → 随机新技能';
            } else if (filledSlots.length === 1) {
                tipDiv.innerHTML = '再添加1个技能进行随机合成，或添加2个相同技能进行升星';
            } else if (filledSlots.length === 2) {
                const s1 = filledSlots[0].skill;
                const s2 = filledSlots[1].skill;
                if (s1.id === s2.id && (s1.star || 1) === (s2.star || 1)) {
                    tipDiv.innerHTML = '再添加1个相同技能可升星';
                }
            } else {
                tipDiv.innerHTML = '无法合成，请检查技能组合';
            }
        }
    },
    
    getRandomCraftProbText(slots) {
        let totalValue = 0;
        slots.forEach(slot => {
            const star = slot.skill.star || 1;
            totalValue += Math.pow(2, star - 1);
        });
        
        if (totalValue >= 4) {
            const p1 = Math.round(1 / totalValue * 100);
            const p2 = Math.round(2 / totalValue * 100);
            const p3 = 100 - p1 - p2;
            return `⭐${p1}% ⭐⭐${p2}% ⭐⭐⭐${p3}%`;
        } else if (totalValue >= 2) {
            if (totalValue === 2) return `必定获得 ⭐⭐`;
            const p2 = Math.round((totalValue - 1) / totalValue * 100);
            const p1 = 100 - p2;
            return `⭐${p1}% ⭐⭐${p2}%`;
        }
        return `必定获得 ⭐`;
    },
    
    getCraftResult() {
        const filledSlots = this.workbenchSlots.filter(s => s !== null);
        
        if (filledSlots.length === 3) {
            const s1 = filledSlots[0].skill;
            const s2 = filledSlots[1].skill;
            const s3 = filledSlots[2].skill;
            const star1 = s1.star || 1;
            const star2 = s2.star || 1;
            const star3 = s3.star || 1;
            
            if (s1.id === s2.id && s2.id === s3.id && star1 === star2 && star2 === star3) {
                if (star1 < 3) {
                    return { type: 'upgrade', skill: s1, newStar: star1 + 1 };
                }
            }
            return { type: 'random', slots: filledSlots };
        }
        
        if (filledSlots.length === 2) {
            const s1 = filledSlots[0].skill;
            const s2 = filledSlots[1].skill;
            if (s1.id !== s2.id || (s1.star || 1) !== (s2.star || 1)) {
                return { type: 'random', slots: filledSlots };
            }
        }
        
        return null;
    },
    
    calculateRandomCraftStar(slots) {
        let totalValue = 0;
        slots.forEach(slot => {
            const star = slot.skill.star || 1;
            totalValue += Math.pow(2, star - 1);
        });
        
        const rand = Math.random() * totalValue;
        
        if (totalValue >= 4) {
            if (rand < 1) return 1;
            if (rand < 3) return 2;
            return 3;
        } else if (totalValue >= 2) {
            if (rand < totalValue - 2 + 1) return 1;
            return 2;
        }
        return 1;
    },
    
    doCraft() {
        const craftResult = this.getCraftResult();
        if (!craftResult || !Game.player) return;
        
        if (craftResult.type === 'upgrade') {
            const newSkill = { ...craftResult.skill, star: craftResult.newStar };
            Game.player.skillInventory.push(newSkill);
            this.workbenchSlots = [null, null, null];
            Game.addFloatingText(`升星成功! ${newSkill.name} ${'⭐'.repeat(craftResult.newStar)}`, Game.player.x, Game.player.y - 40, '#ffd700');
            Audio.play('levelup');
        } else if (craftResult.type === 'random') {
            const resultStar = this.calculateRandomCraftStar(craftResult.slots);
            const allSkillIds = typeof ALL_SKILLS !== 'undefined' ? Object.keys(ALL_SKILLS) : [];
            const randomId = allSkillIds[Math.floor(Math.random() * allSkillIds.length)];
            const randomSkill = { ...ALL_SKILLS[randomId], star: resultStar };
            Game.player.skillInventory.push(randomSkill);
            this.workbenchSlots = [null, null, null];
            const starText = resultStar > 1 ? ' ' + '⭐'.repeat(resultStar) : '';
            Game.addFloatingText(`获得: ${randomSkill.icon} ${randomSkill.name}${starText}!`, Game.player.x, Game.player.y - 40, '#00ffff');
            Audio.play('pickup');
        }
        
        this.renderWorkbench();
        this.render();
    },
    
    autoMergeAll() {
        if (!Game.player) return;
        
        let mergeCount = 0;
        let continueLoop = true;
        
        while (continueLoop) {
            continueLoop = false;
            const inventory = Game.player.skillInventory;
            
            const skillCounts = {};
            inventory.forEach((skill, idx) => {
                const key = `${skill.id}_${skill.star || 1}`;
                if (!skillCounts[key]) {
                    skillCounts[key] = { skill, star: skill.star || 1, indices: [] };
                }
                skillCounts[key].indices.push(idx);
            });
            
            for (const key in skillCounts) {
                const data = skillCounts[key];
                if (data.indices.length >= 3 && data.star < 3) {
                    const toRemove = data.indices.slice(0, 3).sort((a, b) => b - a);
                    toRemove.forEach(idx => inventory.splice(idx, 1));
                    
                    const newSkill = { ...data.skill, star: data.star + 1 };
                    inventory.push(newSkill);
                    
                    mergeCount++;
                    continueLoop = true;
                    break;
                }
            }
        }
        
        if (mergeCount > 0) {
            Game.addFloatingText(`一键合成完成! 合成了 ${mergeCount} 次`, Game.player.x, Game.player.y - 40, '#ffd700');
            Audio.play('levelup');
            this.render();
        } else {
            Game.addFloatingText('没有可合成的技能', Game.player.x, Game.player.y - 40, '#888888');
        }
    }
};
