class OpenSettingsCommand extends Component {
    constructor() {
        super('OpenSettingsCommand');
    }

    start() {
        const btn = this.gameObject.getComponent('Button');
        if (btn) {
            btn.onClick(() => this.execute());
        }
    }

    execute() {
        if (window.game && window.game.uiManager) {
            window.game.uiManager.showSettings();
        }
    }
}

window.OpenSettingsCommand = OpenSettingsCommand;
