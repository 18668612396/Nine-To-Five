// --- 工具函数 ---

function checkRectCollide(r1, r2) {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
           r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
}

function checkCircleCollide(c1, c2) {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < c1.radius + c2.radius;
}

// 请求浏览器全屏
function requestFullscreen() {
    const el = document.documentElement;
    
    try {
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => {});
        } else if (el.webkitRequestFullscreen) {
            // iOS Safari 使用 webkitRequestFullscreen，不返回 Promise
            el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    } catch (e) {
        console.log('全屏请求失败:', e);
    }
}

// 退出全屏
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// 检查是否全屏
function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

// 监听全屏变化，确保焦点正确
document.addEventListener('fullscreenchange', () => {
    if (isFullscreen()) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.focus();
    }
});
document.addEventListener('webkitfullscreenchange', () => {
    if (isFullscreen()) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.focus();
    }
});

