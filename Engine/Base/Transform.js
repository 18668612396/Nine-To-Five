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
            // Simple 2D matrix multiplication simplified
            // WorldX = ParentWorldX + (LocalX * cos(ParentRot) - LocalY * sin(ParentRot)) * ParentScaleX
            // For now, let's assume no rotation/scale inheritance for simplicity, or implement full matrix later.
            // Let's implement basic position inheritance first.
            return this.parent.x + this.localPosition.x; 
        }
        return this.localPosition.x;
    }

    set x(value) {
        if (this.parent) {
            this.localPosition.x = value - this.parent.x;
        } else {
            this.localPosition.x = value;
        }
    }

    get y() {
        if (this.parent) {
            return this.parent.y + this.localPosition.y;
        }
        return this.localPosition.y;
    }

    set y(value) {
        if (this.parent) {
            this.localPosition.y = value - this.parent.y;
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
}

window.Transform = Transform;
