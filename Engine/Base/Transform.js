class Transform extends Component {
    constructor(x = 0, y = 0) {
        super('Transform');
        this.localPosition = { x: x, y: y };
        this.localRotation = 0;
        this.localScale = { x: 1, y: 1 };
        
        this.parent = null;
        this.children = [];
    }

    // Getters for World Position
    get x() {
        if (this.parent) {
            // WorldX = ParentWorldX + (RotatedLocalX * ParentScaleX)
            const pRot = this.parent.rotation;
            const pScale = this.parent.scale;
            
            // Rotate local position
            const cos = Math.cos(pRot);
            const sin = Math.sin(pRot);
            
            const scaledX = this.localPosition.x * pScale.x;
            const scaledY = this.localPosition.y * pScale.y;
            
            const rotatedX = scaledX * cos - scaledY * sin;
            
            return this.parent.x + rotatedX;
        }
        return this.localPosition.x;
    }

    set x(value) {
        if (this.parent) {
            // This is complex because changing WorldX affects LocalX AND LocalY if rotated.
            // We need to calculate the delta in world space, then inverse transform it to local space.
            // For simplicity, let's just update localPosition based on current WorldY.
            const currentWorldY = this.y;
            this.setWorldPosition(value, currentWorldY);
        } else {
            this.localPosition.x = value;
        }
    }

    get y() {
        if (this.parent) {
            const pRot = this.parent.rotation;
            const pScale = this.parent.scale;
            
            const cos = Math.cos(pRot);
            const sin = Math.sin(pRot);
            
            const scaledX = this.localPosition.x * pScale.x;
            const scaledY = this.localPosition.y * pScale.y;
            
            const rotatedY = scaledX * sin + scaledY * cos;
            
            return this.parent.y + rotatedY;
        }
        return this.localPosition.y;
    }

    set y(value) {
        if (this.parent) {
            const currentWorldX = this.x;
            this.setWorldPosition(currentWorldX, value);
        } else {
            this.localPosition.y = value;
        }
    }

    /**
     * Helper to set world position correctly when parented
     */
    setWorldPosition(worldX, worldY) {
        if (!this.parent) {
            this.localPosition.x = worldX;
            this.localPosition.y = worldY;
            return;
        }

        // Inverse Transform
        // 1. Translate back to parent origin
        const dx = worldX - this.parent.x;
        const dy = worldY - this.parent.y;

        // 2. Inverse Rotate (rotate by -parentRotation)
        const pRot = this.parent.rotation;
        const cos = Math.cos(-pRot);
        const sin = Math.sin(-pRot);

        const unrotatedX = dx * cos - dy * sin;
        const unrotatedY = dx * sin + dy * cos;

        // 3. Inverse Scale
        const pScale = this.parent.scale;
        // Avoid division by zero
        const sX = pScale.x === 0 ? 0.0001 : pScale.x;
        const sY = pScale.y === 0 ? 0.0001 : pScale.y;

        this.localPosition.x = unrotatedX / sX;
        this.localPosition.y = unrotatedY / sY;
    }

    get rotation() {
        if (this.parent) {
            return this.parent.rotation + this.localRotation;
        }
        return this.localRotation;
    }

    set rotation(value) {
        if (this.parent) {
            this.localRotation = value - this.parent.rotation;
        } else {
            this.localRotation = value;
        }
    }

    get scale() {
        // Scale inheritance is tricky without matrices, but simple multiplication works for axis-aligned
        if (this.parent) {
            return {
                x: this.parent.scale.x * this.localScale.x,
                y: this.parent.scale.y * this.localScale.y
            };
        }
        return this.localScale;
    }

    setChild(childTransform) {
        if (childTransform.parent) {
            childTransform.parent.removeChild(childTransform);
        }
        childTransform.parent = this;
        this.children.push(childTransform);
    }

    removeChild(childTransform) {
        const index = this.children.indexOf(childTransform);
        if (index > -1) {
            this.children.splice(index, 1);
            childTransform.parent = null;
        }
    }

    setParent(parentTransform) {
        if (this.parent === parentTransform) return;
        
        if (this.parent) {
            this.parent.removeChild(this);
        }
        
        this.parent = parentTransform;
        if (parentTransform) {
            parentTransform.children.push(this);
        }
    }
}

window.Transform = Transform;
