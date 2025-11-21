class Renderer extends Component {
    constructor(name = 'Renderer') {
        super(name);
        this.visible = true;
        this.sortingOrder = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this._materials = [new Material()]; // Default material
    }

    get material() {
        if (this._materials.length === 0) {
            this._materials.push(new Material());
        }
        return this._materials[0];
    }

    set material(val) {
        if (this._materials.length > 0) {
            this._materials[0] = val;
        } else {
            this._materials.push(val);
        }
    }

    get materials() {
        return this._materials;
    }

    set materials(val) {
        this._materials = val;
    }

    // Replaces draw(ctx)
    render(pipeline) {
        // Base render method
    }
}

window.Renderer = Renderer;
