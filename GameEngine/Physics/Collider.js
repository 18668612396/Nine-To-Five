class Collider extends Component {
    constructor(name = 'Collider') {
        super(name);
        this.isTrigger = false;
    }

    checkCollision(other) {
        return false;
    }
}

window.Collider = Collider;
