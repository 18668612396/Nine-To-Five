const rand = (min, max) => Math.random() * (max - min) + min;

const checkCol = (c1, c2) => {
    // Support both old {x,y,r} objects and new Collider components
    let x1, y1, r1, x2, y2, r2;

    if (c1 instanceof CircleCollider) {
        x1 = c1.gameObject.transform.x + c1.offsetX;
        y1 = c1.gameObject.transform.y + c1.offsetY;
        r1 = c1.radius;
    } else if (c1 instanceof GameObject) {
        // Fallback if passing GameObject directly (try to find collider or use legacy props)
        const col = c1.getComponent('CircleCollider');
        if (col) {
            x1 = c1.transform.x + col.offsetX;
            y1 = c1.transform.y + col.offsetY;
            r1 = col.radius;
        } else {
            x1 = c1.x; y1 = c1.y; r1 = c1.r || 0;
        }
    } else {
        x1 = c1.x; y1 = c1.y; r1 = c1.r || 0;
    }

    if (c2 instanceof CircleCollider) {
        x2 = c2.gameObject.transform.x + c2.offsetX;
        y2 = c2.gameObject.transform.y + c2.offsetY;
        r2 = c2.radius;
    } else if (c2 instanceof GameObject) {
        const col = c2.getComponent('CircleCollider');
        if (col) {
            x2 = c2.transform.x + col.offsetX;
            y2 = c2.transform.y + col.offsetY;
            r2 = col.radius;
        } else {
            x2 = c2.x; y2 = c2.y; r2 = c2.r || 0;
        }
    } else {
        x2 = c2.x; y2 = c2.y; r2 = c2.r || 0;
    }

    const dx = x1 - x2;
    const dy = y1 - y2;
    const dist = Math.sqrt(dx*dx + dy*dy);
    return dist < (r1 + r2);
};

