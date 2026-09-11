(() => {
    'use strict';

    const panel = document.querySelector('.hero-service-visual');

    if (!panel) {
        return;
    }

    const items = Array.from(panel.querySelectorAll('.hero-service-visual__item'));
    const counter = panel.querySelector('.hero-service-visual__counter');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const typeDelay = 62;
    const deleteDelay = 38;
    const pauseDelay = 1500;
    const transformDelay = 820;
    const terminal = document.querySelector('[data-visual-terminal]');
    const visualCard = document.querySelector('.hero-visual-card');
    const terminalMessages = [
        ' SYSTEM ONLINE_',
        ' SEO_ENGINE ACTIVE_',
        ' WEBSITE_BUILD_',
        ' ANALYTICS STREAM_',
        ' AI_AUTOMATION READY_'
    ];
    let activeIndex = 0;
    let timer = 0;
    let terminalTimer = 0;
    let terminalIndex = 0;
    let running = true;

    items.forEach((item) => {
        const title = item.querySelector('strong');
        item.dataset.serviceName = title ? title.textContent : '';
        if (title) {
            title.textContent = '';
        }
    });

    function setCounter(index) {
        if (counter) {
            counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
        }
    }

    function clearTimer() {
        window.clearTimeout(timer);
        timer = 0;
    }

    function typeTerminal(message, index = 0) {
        if (!terminal || !running || reducedMotion.matches) {
            return;
        }

        terminal.textContent = message.slice(0, index);

        if (index < message.length) {
            terminalTimer = window.setTimeout(() => typeTerminal(message, index + 1), 48);
            return;
        }

        terminalTimer = window.setTimeout(() => {
            terminalIndex = (terminalIndex + 1) % terminalMessages.length;
            typeTerminal(terminalMessages[terminalIndex], 0);
        }, 1350);
    }

    function typeText(item, index, callback) {
        if (!running) {
            return;
        }

        const title = item.querySelector('strong');
        const text = item.dataset.serviceName;
        title.textContent = text.slice(0, index);

        if (index < text.length) {
            timer = window.setTimeout(() => typeText(item, index + 1, callback), typeDelay);
            return;
        }

        timer = window.setTimeout(callback, pauseDelay);
    }

    function deleteText(item, index, callback) {
        if (!running) {
            return;
        }

        const title = item.querySelector('strong');
        const text = item.dataset.serviceName;
        title.textContent = text.slice(0, index);

        if (index > 0) {
            timer = window.setTimeout(() => deleteText(item, index - 1, callback), deleteDelay);
            return;
        }

        timer = window.setTimeout(callback, 100);
    }

    function showNext() {
        const current = items[activeIndex];
        const nextIndex = (activeIndex + 1) % items.length;
        const next = items[nextIndex];

        current.classList.remove('is-active');
        current.classList.add('is-exiting');
        next.classList.add('is-entering');
        activeIndex = nextIndex;
        setCounter(activeIndex);

        timer = window.setTimeout(() => {
            current.classList.remove('is-exiting');
            next.classList.remove('is-entering');
            next.classList.add('is-active');
            typeText(next, 0, () => deleteText(next, next.dataset.serviceName.length, showNext));
        }, transformDelay);
    }

    function start() {
        const first = items[0];
        first.classList.add('is-active');
        setCounter(0);

        if (reducedMotion.matches) {
            first.querySelector('strong').textContent = first.dataset.serviceName;
            if (terminal) {
                terminal.textContent = terminalMessages[0];
            }
            return;
        }

        typeText(first, 0, () => deleteText(first, first.dataset.serviceName.length, showNext));
        typeTerminal(terminalMessages[terminalIndex]);
    }

    if (visualCard && !reducedMotion.matches) {
        visualCard.addEventListener('pointermove', (event) => {
            const bounds = visualCard.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            visualCard.style.transform = `translateY(-50%) perspective(45rem) rotateY(${x * 5 - 7}deg) rotateX(${y * -4 + 2}deg)`;
        }, { passive: true });

        visualCard.addEventListener('pointerleave', () => {
            visualCard.style.transform = '';
        });
    }

    document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (!running) {
            clearTimer();
            window.clearTimeout(terminalTimer);
        } else if (!reducedMotion.matches) {
            start();
        }
    });

    start();
})();
