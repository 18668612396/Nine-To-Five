const rand = (min, max) => Math.random() * (max - min) + min;

const checkCol = (c1, c2) => {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    return dist < (c1.r + c2.r);
};
