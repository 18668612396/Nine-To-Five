class Collider extends Component {
    constructor(name = 'Collider') {
        super(name);
        this.isTrigger = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }
}
