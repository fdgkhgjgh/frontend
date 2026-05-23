// frontend/js/theme-toggle.js
const themeStylesheet = document.getElementById('theme-stylesheet');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme') || 'light';
setTheme(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const newTheme = themeStylesheet.href.includes('dark-mode.css') ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

function setTheme(theme) {
    if (theme === 'dark') {
        themeStylesheet.href = 'css/dark-mode.css';
        body.classList.add('dark-mode');
        createStars();
    } else {
        themeStylesheet.href = 'css/style.css';
        body.classList.remove('dark-mode');
        const canvas = document.getElementById('star-canvas');
        if (canvas) canvas.remove();
    }
    localStorage.setItem('theme', theme);
}

function createStars() {
    const existing = document.getElementById('star-canvas');
    if (existing) existing.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'star-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random(),
        dOpacity: (Math.random() - 0.5) * 0.02
    }));

    function animate() {
        if (!document.body.classList.contains('dark-mode')) {
            canvas.remove();
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            star.x += star.dx;
            star.y += star.dy;

            if (star.x < 0) star.x = canvas.width;
            if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height;
            if (star.y > canvas.height) star.y = 0;

            star.opacity += star.dOpacity;
            if (star.opacity > 1 || star.opacity < 0) star.dOpacity *= -1;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
