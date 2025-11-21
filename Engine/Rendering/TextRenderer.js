class TextRenderer extends Renderer {
    constructor(text = '', font = '20px Arial', color = '#fff') {
        super('TextRenderer');
        this.text = text;
        this.font = font;
        this.color = color;
        this.align = 'left';
        this.baseline = 'top';
        this.stroke = false;
        this.strokeColor = '#000';
        this.lineWidth = 1;
    }

    render(pipeline) {
        if (!this.gameObject || !this.gameObject.active) return;

        const t = this.gameObject.transform;

        pipeline.submit({
            type: 'TEXT',
            text: this.text,
            x: t.x,
            y: t.y,
            font: this.font,
            color: this.color,
            align: this.align,
            baseline: this.baseline,
            opacity: 1.0,
            sortingOrder: this.sortingOrder,
            y: t.y
        });
    }
}

window.TextRenderer = TextRenderer;
