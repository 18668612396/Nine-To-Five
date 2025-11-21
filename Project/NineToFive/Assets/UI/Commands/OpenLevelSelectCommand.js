class OpenLevelSelectCommand extends Component {
    constructor() {
        super('OpenLevelSelectCommand');
    }

    start() {
        // Find Button component on the same GameObject
        const btn = this.gameObject.getComponent('Button');
        if (btn) {
            btn.onClick(() => this.execute());
        } else {
            console.warn('OpenLevelSelectCommand: No Button component found on this GameObject');
        }
    }

    execute() {
        if (window.game && window.game.uiManager) {
            window.game.uiManager.showLevelSelect();
        }
    }
}

window.OpenLevelSelectCommand = OpenLevelSelectCommand;
