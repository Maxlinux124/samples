/* =========================================================
   MAX DIGITAL MARKETING
   COMPONENT — SERVICE CARD SLIDER
   ---------------------------------------------------------
   Progressive-enhancement controller for .service-card-slider.

   The slider scrolls natively (CSS scroll-snap), so with JS
   disabled it degrades to a horizontal swipe list. This module
   only adds:
     - .is-current on the card nearest the viewport centre
     - prev / next controls
     - optional dots
     - keyboard arrow support

   Hookup (all optional except the container):
     <div class="service-card-slider" data-service-slider>
     <button data-service-slider-prev> ... </button>
     <button data-service-slider-next> ... </button>
     <div data-service-slider-dots></div>

   Zero dependencies; no globals except the
   'servicecard:change' event fired on the container.
   ========================================================= */

(function () {
    'use strict';

    var REDUCED_MOTION = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    function scrollBehavior() {
        return REDUCED_MOTION && REDUCED_MOTION.matches ? 'auto' : 'smooth';
    }

    /* Resolve a control that may live inside or outside the slider. */
    function findTarget(root, attribute) {
        return root.querySelector('[' + attribute + ']')
            || document.querySelector('[' + attribute + ']');
    }

    function ServiceCardSlider(root) {
        this.root = root;
        this.cards = Array.prototype.slice.call(root.querySelectorAll('.service-card'));
        this.current = -1;
        this.dots = [];
        this.dotsHost = findTarget(root, 'data-service-slider-dots');
        this.statusHost = findTarget(root, 'data-service-slider-status');

        if (!this.cards.length) {
            return;
        }

        this.buildDots();
        this.bindControls();
        this.bindScroll();

        this.sync(true);
    }

    ServiceCardSlider.prototype.buildDots = function () {
        if (!this.dotsHost) {
            return;
        }

        var host = this.dotsHost;
        var self = this;

        host.innerHTML = '';

        this.cards.forEach(function (card, index) {
            var dot = document.createElement('button');

            dot.type = 'button';
            dot.className = 'service-card-slider__dot';
            dot.setAttribute('aria-label', 'Go to service ' + (index + 1) + ' of ' + self.cards.length);
            dot.addEventListener('click', function () {
                self.goTo(index);
            });

            host.appendChild(dot);
        });

        this.dots = Array.prototype.slice.call(host.children);
    };

    ServiceCardSlider.prototype.bindControls = function () {
        var self = this;

        [
            ['data-service-slider-prev', -1],
            ['data-service-slider-next', 1]
        ].forEach(function (pair) {
            var button = findTarget(self.root, pair[0]);

            if (!button) {
                return;
            }

            button.addEventListener('click', function () {
                self.step(pair[1]);
            });
        });

        /* Arrow keys work whenever focus is inside the slider. */
        this.root.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                self.step(-1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                self.step(1);
            }
        });
    };

    ServiceCardSlider.prototype.bindScroll = function () {
        var self = this;
        var queued = false;

        this.root.addEventListener('scroll', function () {
            if (queued) {
                return;
            }

            queued = true;

            window.requestAnimationFrame(function () {
                queued = false;
                self.sync(false);
            });
        }, { passive: true });

        window.addEventListener('resize', function () {
            self.sync(true);
        });
    };

    /* Card closest to the container's horizontal centre. */
    ServiceCardSlider.prototype.nearest = function () {
        var centre = this.root.scrollLeft + this.root.clientWidth / 2;
        var best = 0;
        var bestDistance = Infinity;

        this.cards.forEach(function (card, index) {
            var distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre);

            if (distance < bestDistance) {
                bestDistance = distance;
                best = index;
            }
        });

        return best;
    };

    ServiceCardSlider.prototype.sync = function (force) {
        var index = this.nearest();

        if (!force && index === this.current) {
            return;
        }

        this.current = index;

        this.cards.forEach(function (card, position) {
            card.classList.toggle('is-current', position === index);
        });

        this.dots.forEach(function (dot, position) {
            if (position === index) {
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.removeAttribute('aria-current');
            }
        });

        if (this.statusHost) {
            this.statusHost.textContent = 'Card ' + (index + 1) + ' of ' + this.cards.length;
        }

        this.root.dispatchEvent(new CustomEvent('servicecard:change', {
            detail: { index: index, total: this.cards.length }
        }));
    };

    ServiceCardSlider.prototype.goTo = function (index) {
        var card = this.cards[Math.max(0, Math.min(this.cards.length - 1, index))];

        if (!card) {
            return;
        }

        this.root.scrollTo({
            left: card.offsetLeft - (this.root.clientWidth - card.offsetWidth) / 2,
            behavior: scrollBehavior()
        });
    };

    ServiceCardSlider.prototype.step = function (direction) {
        this.goTo((this.current < 0 ? 0 : this.current) + direction);
    };

    function boot() {
        Array.prototype.forEach.call(
            document.querySelectorAll('[data-service-slider]'),
            function (root) {
                if (root.dataset.serviceSliderReady === 'true') {
                    return;
                }

                root.dataset.serviceSliderReady = 'true';

                new ServiceCardSlider(root);
            }
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
}());

