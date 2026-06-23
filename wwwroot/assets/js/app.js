// public/assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {

    // ── 3. Poster Phim Nghiêng 3D Theo Chuột ──────────────────────────────
    document.querySelectorAll('.movie-card-3d').forEach(card => {
        // Tìm element card bên trong
        const inner = card.querySelector('.movie-card');
        if (!inner) return;

        // Thêm class card-inner để có transition đúng chuẩn
        inner.classList.add('card-inner');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (centerY - y) / 12;
            const rotateY = (x - centerX) / 12;

            inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'rotateX(0) rotateY(0)';
        });
    });

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        console.log('AOS Init!');
        AOS.init({ once: true, offset: 50, duration: 800 });
        setTimeout(() => AOS.refresh(), 500);
    } else {
        console.error('AOS is undefined');
    }
});

setTimeout(() => { 
    if (!document.querySelector('.aos-animate') && document.querySelectorAll('[data-aos]').length > 0) { 
        document.querySelectorAll('[data-aos]').forEach(e => { 
            e.style.opacity = 1; 
            e.style.transform = 'none'; 
        }); 
        console.warn('AOS fallback applied'); 
    } 
}, 2000);
