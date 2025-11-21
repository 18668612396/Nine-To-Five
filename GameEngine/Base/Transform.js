class Transform extends Component {
    constructor(x = 0, y = 0) {
        super('Transform');
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.scale = { x: 1, y: 1 };
    }
}

window.Transform = Transform;
