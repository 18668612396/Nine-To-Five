class OpenInventoryCommand extends Component {
    constructor() {
        super('OpenInventoryCommand');
    }

    start() {
        const btn = this.gameObject.getComponent('Button');
        if (btn) {
            btn.onClick(() => this.execute());
        }
    }

    execute() {
        if (window.game && window.game.uiManager) {
            window.game.uiManager.showInventory();
        }
    }
}

window.OpenInventoryCommand = OpenInventoryCommand;
