document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerImg = document.querySelector('.hero-center-target');
    const boxes = document.querySelectorAll('.network-box');

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawConnections() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerRect = centerImg.getBoundingClientRect();
        const containerRect = canvas.parentElement.getBoundingClientRect();

        const centerX = (centerRect.left + centerRect.width / 2) - containerRect.left;
        const centerY = (centerRect.top + centerRect.height / 2) - containerRect.top;

        boxes.forEach(box => {
            const boxRect = box.getBoundingClientRect();
            const boxX = (boxRect.left + boxRect.width / 2) - containerRect.left;
            const boxY = (boxRect.top + boxRect.height / 2) - containerRect.top;

            // Line Drawing
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(boxX, boxY);

            // Styling Line
            const isHovered = box.matches(':hover');
            ctx.strokeStyle = isHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.25)';
            ctx.lineWidth = isHovered ? 2.5 : 1;
            if (isHovered) {
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 10;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.stroke();

            // Small Neural Node Circle at Box Connection
            ctx.beginPath();
            ctx.arc(boxX, boxY, isHovered ? 5 : 3, 0, Math.PI * 2);
            ctx.fillStyle = isHovered ? '#38bdf8' : 'rgba(141, 234, 255, 0.6)';
            ctx.fill();
        });

        requestAnimationFrame(drawConnections);
    }

    drawConnections();
});