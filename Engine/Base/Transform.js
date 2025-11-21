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
            // Apply parent scale to local position offset
            // WorldX = ParentWorldX + (LocalX * ParentScaleX)
            // Note: Still ignoring rotation for simplicity as requested
            return this.parent.x + (this.localPosition.x * this.parent.scale.x); 
        }
        return this.localPosition.x;
    }

    set x(value) {
        if (this.parent) {
            // Inverse operation: LocalX = (WorldX - ParentWorldX) / ParentScaleX
            const pScaleX = this.parent.scale.x;
            if (pScaleX !== 0) {
                this.localPosition.x = (value - this.parent.x) / pScaleX;
            } else {
                this.localPosition.x = 0;
            }
        } else {
            this.localPosition.x = value;
        }
    }

    get y() {
        if (this.parent) {
            return this.parent.y + (this.localPosition.y * this.parent.scale.y);
        }
        return this.localPosition.y;
    }

    set y(value) {
        if (this.parent) {
            const pScaleY = this.parent.scale.y;
            if (pScaleY !== 0) {
                this.localPosition.y = (value - this.parent.y) / pScaleY;
            } else {
                this.localPosition.y = 0;
            }
        } else {
            this.localPosition.y = value;
        }
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
