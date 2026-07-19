// public/assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
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
