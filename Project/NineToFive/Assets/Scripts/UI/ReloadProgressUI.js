/**
 * ReloadProgressUI - 换弹进度条UI组件
 * 纯粹的UI组件，接收换弹时间参数并显示进度
 */
class ReloadProgressUI extends GameBehaviour {
    constructor() {
        super('ReloadProgressUI');
        
        // 可配置参数
        this.reloadDuration = 60; // 换弹总时长（帧）
        this.radius = 30;
        this.lineWidth = 5;
        
        // 运行时状态
        this.currentTime = 0;
        this.isActive = false;
    }

    onLoad(props) {
        if (props.reloadDuration !== undefined) this.reloadDuration = props.reloadDuration;
        if (props.radius !== undefined) this.radius = props.radius;
        if (props.lineWidth !== undefined) this.lineWidth = props.lineWidth;
    }

    start() {
        // 创建CanvasRenderer并传入绘制回调
        const renderer = new CanvasRenderer(this.drawProgress.bind(this));
        renderer.sortingOrder = 100; // 确保在最上层渲染
        this.gameObject.addComponent(renderer);
    }

    /**
     * 开始换弹动画
     * @param {number} duration - 换弹时长（帧）
     */
    startReload(duration) {
        this.reloadDuration = duration;
        this.currentTime = 0;
        this.isActive = true;
        this.gameObject.active = true;
    }

    /**
     * 停止换弹动画
     */
    stopReload() {
        this.isActive = false;
        this.gameObject.active = false;
    }

    update(dt) {
        if (!this.isActive) return;

        // 更新进度
        this.currentTime += 1; // 每帧+1

        // 检查是否完成
        if (this.currentTime >= this.reloadDuration) {
            this.stopReload();
        }
    }

    /**
     * 绘制换弹进度环
     */
    drawProgress(ctx, gameObject) {
        if (!this.isActive) return;

        const progress = Math.min(1, this.currentTime / this.reloadDuration);
        const radius = this.radius;
        const lineWidth = this.lineWidth;

        // 外层发光
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(79, 195, 247, 0.5)';

        // 背景圆环（半透明黑色）
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = lineWidth + 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // 深色背景环
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 进度弧（带渐变）
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * progress);
        
        // 创建渐变
        const gradient = ctx.createLinearGradient(-radius, 0, radius, 0);
        gradient.addColorStop(0, '#4fc3f7');
        gradient.addColorStop(0.5, '#29b6f6');
        gradient.addColorStop(1, '#03a9f4');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.stroke();

        // 内发光效果
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#4fc3f7';
        ctx.strokeStyle = 'rgba(79, 195, 247, 0.6)';
        ctx.lineWidth = lineWidth - 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 中心背景圆
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, radius - lineWidth - 2, 0, Math.PI * 2);
        ctx.fill();

        // 换弹图标
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔄', 0, -2);

        // 百分比文字
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#4fc3f7';
        ctx.fillText(`${Math.floor(progress * 100)}%`, 0, 12);
    }

}

window.ReloadProgressUI = ReloadProgressUI;
