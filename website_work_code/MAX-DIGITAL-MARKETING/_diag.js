/* Temporary diagnostic probe for Section 02. Deleted after the audit. */
window.addEventListener('load', function () {
    setTimeout(function () {
        var root = document.querySelector('[data-service-carousel]');
        var stage = document.querySelector('[data-carousel-stage]');
        var cards = document.querySelectorAll('[data-carousel-card]');
        var lines = [];

        lines.push('cards=' + cards.length);
        lines.push('root=' + (root ? root.className : 'NA'));
        lines.push('stage=' + (stage ? stage.className : 'NA'));

        if (stage) {
            var sr = stage.getBoundingClientRect();
            var sc = getComputedStyle(stage);
            lines.push('stage box=' + Math.round(sr.left) + ',' + Math.round(sr.top) + ' ' + Math.round(sr.width) + 'x' + Math.round(sr.height));
            lines.push('stage perspective=' + sc.perspective + ' overflow=' + sc.overflow);
        }

        Array.prototype.forEach.call(cards, function (c, i) {
            var r = c.getBoundingClientRect();
            var cs = getComputedStyle(c);
            lines.push(
                'c' + (i + 1) +
                ' svx=' + (c.style.getPropertyValue('--sv-x') || '-') +
                ' rect=' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) +
                ' op=' + cs.opacity +
                ' cls=' + c.className.replace('services-carousel__card', '') +
                ' tf=' + cs.transform.slice(0, 44)
            );
        });

        var title = document.querySelector('.services-carousel__card-title');
        if (title) {
            var tc = getComputedStyle(title);
            lines.push('title fs=' + tc.fontSize + ' lh=' + tc.lineHeight);
        }

        var txt = document.querySelector('.services-carousel__card-text');
        if (txt) {
            var xc = getComputedStyle(txt);
            lines.push('text fs=' + xc.fontSize + ' maxw=' + xc.maxWidth + ' marTop=' + xc.marginTop);
        }

        var icon = document.querySelector('.services-carousel__icon');
        if (icon) {
            var ic = getComputedStyle(icon);
            var ir = icon.getBoundingClientRect();
            var svg = icon.querySelector('svg');
            var sr2 = svg ? svg.getBoundingClientRect() : null;
            lines.push('icon box=' + ic.width + 'x' + ic.height + ' rect=' + Math.round(ir.width) + 'x' + Math.round(ir.height));
            if (sr2) {
                lines.push('icon svg=' + Math.round(sr2.width) + 'x' + Math.round(sr2.height) + ' maxw=' + getComputedStyle(svg).maxWidth);
            }
        }

        var status = document.querySelector('.services-carousel__status');
        if (status) {
            var stc = getComputedStyle(status);
            lines.push('status fs=' + stc.fontSize + ' maxw=' + stc.maxWidth + ' marTop=' + stc.marginTop);
        }

        var pre = document.createElement('pre');
        pre.id = 'diag';
        pre.textContent = lines.join('\n');
        pre.style.cssText = 'position:absolute;z-index:99999;top:0;left:0;background:#000;color:#0f0;font:11px monospace;padding:8px;white-space:pre;margin:0;';
        document.body.insertBefore(pre, document.body.firstChild);
    }, 1600);
});
