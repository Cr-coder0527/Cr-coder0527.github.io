/**
 * 鼠标点击爱心特效
 * 点击页面任意位置飘出彩色爱心，纯原生 JS，无依赖
 */
(function (window, document) {
    var hearts = [];
    var colors = ['#ff4d6d', '#ff8fa3', '#ffb3c1', '#ff758f', '#c9184a', '#00bcd4', '#5c6bc0'];
    var symbols = ['❤'];
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    window.addEventListener('resize', function () {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    });

    function Heart(x, y) {
        this.x = x;
        this.y = y;
        this.scale = Math.random() * 0.6 + 0.8;
        this.speed = Math.random() * 1 + 0.5; // 上升速度
        this.drift = (Math.random() - 0.5) * 2; // 水平漂移
        this.alpha = 1;
        this.angle = (Math.random() - 0.5) * 30;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.el = document.createElement('span');
        this.el.textContent = symbols[0];
        this.el.style.cssText = 'position:fixed;z-index:999999;pointer-events:none;'
            + 'font-size:' + (16 * this.scale) + 'px;line-height:1;'
            + 'color:' + this.color + ';will-change:transform,opacity;'
            + 'transform:translate(' + this.x + 'px,' + this.y + 'px) '
            + 'translate(-50%,-50%) rotate(' + this.angle + 'deg);';
        document.body.appendChild(this.el);
    }

    Heart.prototype.update = function () {
        this.y -= this.speed * 1.4;
        this.x += this.drift * 0.4;
        this.angle += this.drift * 0.6;
        this.alpha -= 0.012;
        this.el.style.opacity = this.alpha;
        this.el.style.transform = 'translate(' + this.x + 'px,' + this.y + 'px) '
            + 'translate(-50%,-50%) rotate(' + this.angle + 'deg) scale(' + this.scale + ')';
        if (this.alpha <= 0) {
            this.el.remove();
            return false;
        }
        return true;
    };

    // requestAnimationFrame 循环
    function loop() {
        for (var i = 0; i < hearts.length; i++) {
            if (!hearts[i].update()) {
                hearts.splice(i, 1);
                i--;
            }
        }
        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);

    var lastTime = 0;
    document.addEventListener('click', function (e) {
        // 移动端/连续点击限频，避免性能问题
        var now = Date.now();
        if (now - lastTime < 30) return;
        lastTime = now;
        var count = 6;
        for (var i = 0; i < count; i++) {
            hearts.push(new Heart(
                e.clientX + (Math.random() - 0.5) * 20,
                e.clientY + (Math.random() - 0.5) * 10
            ));
        }
    });
})(window, document);
