/**
 * 3D 球形标签云（零依赖）
 * 页面需提供：<div id="tagSphere"></div> 和 window.tagSphereData = [{text, link, weight}]
 * 标签随鼠标位置改变旋转方向与速度，无交互时缓慢自转
 */
(function (window, document) {
    var container = document.getElementById('tagSphere');
    if (!container || !window.tagSphereData || !window.tagSphereData.length) return;

    var items = window.tagSphereData;
    var RADIUS = container.clientWidth < 400 ? 120 : 150;  // 球半径
    var FOCAL = 320;                                       // 透视焦距
    var active = false;
    var entries = [];
    var mouseX = 0, mouseY = 0;   // -1 ~ 1
    var angleX = 0, angleY = 0;
    var rafId = null;

    // 均匀球面取点
    for (var i = 0; i < items.length; i++) {
        var k = (i + 0.5) / items.length;
        var phi = Math.acos(1 - 2 * k);           // 极角
        var theta = Math.PI * (1 + Math.sqrt(5)) * i; // 黄金角方位角
        var item = items[i];
        var el = document.createElement('a');
        el.href = item.link;
        el.textContent = item.text;
        el.className = 'tag-sphere-item';
        el.style.position = 'absolute';
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.whiteSpace = 'nowrap';
        el.style.textDecoration = 'none';
        el.style.fontWeight = '500';
        container.appendChild(el);
        entries.push({
            x: RADIUS * Math.sin(phi) * Math.cos(theta),
            y: RADIUS * Math.cos(phi),
            z: RADIUS * Math.sin(phi) * Math.sin(theta),
            el: el,
            weight: item.weight || 1
        });
    }

    function render() {
        // 旋转速度：跟随鼠标；无鼠标时缓慢自转
        var speedY = active ? mouseX * 0.04 : 0.0025;
        var speedX = active ? mouseY * 0.04 : 0;
        angleY += speedY;
        angleX += speedX;
        var cosY = Math.cos(angleY), sinY = Math.sin(angleY);
        var cosX = Math.cos(angleX), sinX = Math.sin(angleX);

        for (var i = 0; i < entries.length; i++) {
            var p = entries[i];
            // 绕 Y 轴旋转
            var x1 = p.x * cosY - p.z * sinY;
            var z1 = p.z * cosY + p.x * sinY;
            // 绕 X 轴旋转
            var y1 = p.y * cosX - z1 * sinX;
            var z2 = z1 * cosX + p.y * sinX;

            var scale = FOCAL / (FOCAL - z2);           // 近大远小
            var depth = (z2 + RADIUS) / (2 * RADIUS);   // 0(远) ~ 1(近)
            p.x = x1; p.y = y1; p.z = z2;

            var sizeScale = scale * (0.85 + Math.min(p.weight, 6) * 0.07);
            p.el.style.transform = 'translate(-50%,-50%) translate('
                + (x1 * scale) + 'px,' + (y1 * scale) + 'px) scale(' + sizeScale.toFixed(3) + ')';
            p.el.style.opacity = (0.35 + depth * 0.65).toFixed(2);
            p.el.style.zIndex = Math.round(depth * 100);
            // 近的标签用主题靛蓝，远的偏灰青
            p.el.style.color = depth > 0.5 ? '#3949ab' : '#5f8a9c';
            p.el.style.fontSize = (13 + Math.min(p.weight, 6) * 1.5) + 'px';
        }
        rafId = window.requestAnimationFrame(render);
    }

    function onMove(e) {
        var rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        active = true;
    }
    function onLeave() { active = false; }

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    // 移动端触摸支持
    container.addEventListener('touchmove', function (e) {
        if (!e.touches.length) return;
        var t = e.touches[0], rect = container.getBoundingClientRect();
        mouseX = ((t.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((t.clientY - rect.top) / rect.height - 0.5) * 2;
        active = true;
    }, {passive: true});

    // 不在屏幕中时暂停动画，省电
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries0) {
            if (entries0[0].isIntersecting) {
                if (!rafId) render();
            } else {
                if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }
            }
        }).observe(container);
    }
    render();
})(window, document);
