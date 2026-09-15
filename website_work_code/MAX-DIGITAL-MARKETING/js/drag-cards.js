document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".sm-glass-card");

    cards.forEach((card) => {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const startDrag = (e) => {
            isDragging = true;
            card.classList.add("is-dragging");

            const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            const rect = card.getBoundingClientRect();
            const parentRect = card.offsetParent.getBoundingClientRect();

            initialLeft = rect.left - parentRect.left;
            initialTop = rect.top - parentRect.top;

            card.style.right = "auto";
            card.style.bottom = "auto";
            card.style.left = `${initialLeft}px`;
            card.style.top = `${initialTop}px`;
        };

        const onDrag = (e) => {
            if (!isDragging) return;

            const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            card.style.left = `${initialLeft + deltaX}px`;
            card.style.top = `${initialTop + deltaY}px`;
        };

        const stopDrag = () => {
            if (isDragging) {
                isDragging = false;
                card.classList.remove("is-dragging");
            }
        };

        // Desktop Events
        card.addEventListener("mousedown", startDrag);
        window.addEventListener("mousemove", onDrag);
        window.addEventListener("mouseup", stopDrag);

        // Mobile Events
        card.addEventListener("touchstart", startDrag, { passive: true });
        window.addEventListener("touchmove", onDrag, { passive: true });
        window.addEventListener("touchend", stopDrag);
    });
});

// Add Hero Text Heading as a Connection Target Node in Canvas
const heroText = document.querySelector(".hero-text");

if (heroText) {
    // Canvas nodes array me heroText center ko push karein
    nodes.push(getElementCenter(heroText));
}

/* ==========================================================================
   CYBER GLASS — PREMIUM INTERACTION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const hero = document.querySelector(".hero");
    const cards = document.querySelectorAll(".sm-glass-card");

    if (!hero || !cards.length) return;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    let mouseX = 0;
    let mouseY = 0;

    /* --------------------------------------------------------------
       Mouse tracking
       -------------------------------------------------------------- */

    hero.addEventListener("pointermove", (event) => {

        const rect = hero.getBoundingClientRect();

        mouseX = (event.clientX - rect.left) / rect.width - 0.5;
        mouseY = (event.clientY - rect.top) / rect.height - 0.5;

    });

    /* --------------------------------------------------------------
       Smooth 3D movement
       -------------------------------------------------------------- */

    let currentX = 0;
    let currentY = 0;

    function animate() {

        currentX += (mouseX - currentX) * 0.06;
        currentY += (mouseY - currentY) * 0.06;

        cards.forEach((card) => {

            if (card.classList.contains("is-dragging")) {
                return;
            }

            const strength =
                window.innerWidth <= 768 ? 5 : 9;

            const moveX = currentX * strength;
            const moveY = currentY * strength;

            card.style.setProperty(
                "--mouse-x",
                `${moveX}px`
            );

            card.style.setProperty(
                "--mouse-y",
                `${moveY}px`
            );

        });

        requestAnimationFrame(animate);
    }

    animate();

    /* --------------------------------------------------------------
       Hover tilt
       -------------------------------------------------------------- */

    cards.forEach((card) => {

        card.addEventListener("pointerenter", () => {

            card.style.animationPlayState = "paused";

        });

        card.addEventListener("pointermove", (event) => {

            if (window.innerWidth <= 768) return;

            const rect = card.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width -
                0.5;

            const y =
                (event.clientY - rect.top) /
                rect.height -
                0.5;

            const rotateX = y * -7;
            const rotateY = x * 7;

            card.style.transform = `
                translate3d(
                    ${x * 5}px,
                    ${y * -5}px,
                    0
                )
                perspective(800px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.04)
            `;

        });

        card.addEventListener("pointerleave", () => {

            card.style.transform = "";

            card.style.animationPlayState = "";

        });

    });

    /* --------------------------------------------------------------
       Cursor glow
       -------------------------------------------------------------- */

    hero.addEventListener("pointermove", (event) => {

        const rect = hero.getBoundingClientRect();

        const x =
            ((event.clientX - rect.left) / rect.width) * 100;

        const y =
            ((event.clientY - rect.top) / rect.height) * 100;

        hero.style.setProperty(
            "--cursor-x",
            `${x}%`
        );

        hero.style.setProperty(
            "--cursor-y",
            `${y}%`
        );

    });

});


