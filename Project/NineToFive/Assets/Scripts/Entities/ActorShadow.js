class ActorShadow extends Component {
    constructor() {
        super('ActorShadow');
        this.radius = 20;
        this.color = 'rgba(0, 0, 0, 0.5)';
        this.offsetY = 0;
    }

    onLoad(props) {
        if (props.radius) this.radius = props.radius;
        if (props.color) this.color = props.color;
        if (props.offsetY) this.offsetY = props.offsetY;
    }

    start() {
        // Add CanvasRenderer to THIS GameObject
        // This component is intended to be used on a dedicated Shadow GameObject
        // OR on the main object if we want to mix (but user requested separate logic)
        
        // Wait, if this is a component, it should probably manage the rendering itself 
        // OR add a renderer.
        // Let's follow the pattern: This component adds the visual representation.
        
        const renderer = new CanvasRenderer((ctx) => {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius, this.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        renderer.sortingOrder = -1; // Always behind
        this.gameObject.addComponent(renderer);
    }
}

window.ActorShadow = ActorShadow;
