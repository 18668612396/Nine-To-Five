class Renderer extends Component {
    constructor(name = 'Renderer') {
        super(name);
        this.visible = true;
        this.sortingOrder = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    draw(ctx) {
        // Base draw method
    }
}
