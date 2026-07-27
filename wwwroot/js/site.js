// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

function loadCgvShowtimes(movieId, date) {
    if (typeof loadBookingModal === 'function' && document.getElementById('homeBookingModalContainer')) {
        loadBookingModal(movieId, date);
    } else {
        window.location.href = `/movies/${movieId}?date=${date}#showtimes-section`;
    }
}

function selectCgvProvince(provName) {
    document.querySelectorAll('.cgv-prov-item:not(.disabled)').forEach(el => {
        if (el.dataset.prov === provName) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    document.querySelectorAll('.cgv-prov-pane').forEach(el => el.classList.add('d-none'));
    const paneId = 'pane-' + provName.replace(/\s+/g, '-');
    const pane = document.getElementById(paneId);
    if (pane) pane.classList.remove('d-none');
}

function filterCgvFormat(formatName, el) {
    document.querySelectorAll('.cgv-format-item').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');

    document.querySelectorAll('.format-group').forEach(group => {
        if (formatName === 'All' || group.dataset.format.includes(formatName)) {
            group.classList.remove('d-none');
        } else {
            group.classList.add('d-none');
        }
    });
}

// Smart Navbar Logic (Glassmorphism & Auto-hide)
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;
    
    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add glassmorphism effect when scrolled down slightly
        if (scrollTop > 10) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        // Auto-hide when scrolling down, show when scrolling up
        if (scrollTop > lastScrollTop && scrollTop > 150) {
            // Scrolling down & past threshold -> hide
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up -> show
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });

    // Trending Search Dropdown Logic
    const searchInput = document.getElementById('mainSearchInput');
    const trendingDropdown = document.getElementById('trendingSearchDropdown');
    
    if (searchInput && trendingDropdown) {
        searchInput.addEventListener('focus', () => {
            trendingDropdown.style.display = 'block';
        });
        
        // Hide when clicking outside
        document.addEventListener('click', (event) => {
            if (!searchInput.contains(event.target) && !trendingDropdown.contains(event.target)) {
                trendingDropdown.style.display = 'none';
            }
        });
    }

    // Quick Booking Logic
    const qbMovie = document.getElementById('qbMovie');
    const qbCinema = document.getElementById('qbCinema');
    const qbDate = document.getElementById('qbDate');
    const qbSubmit = document.getElementById('qbSubmit');
    const quickBookingForm = document.getElementById('quickBookingForm');

    if (qbMovie) {
        qbMovie.addEventListener('change', async function() {
            qbCinema.disabled = true;
            qbCinema.innerHTML = '<option value="" selected disabled>Đang tải rạp...</option>';
            qbDate.disabled = true;
            qbDate.innerHTML = '<option value="" selected disabled>Vui lòng chọn rạp trước</option>';
            qbSubmit.disabled = true;

            try {
                // In a real scenario, we'd fetch cinemas showing THIS specific movie. 
                // For now, we fetch all active cinemas or just simulate it.
                const res = await fetch('/api/cinemas');
                const data = await res.json();
                if (data.success && data.data.length > 0) {
                    qbCinema.innerHTML = '<option value="" selected disabled>Chọn Rạp</option>';
                    // Group by province or just list them
                    data.data.forEach(c => {
                        qbCinema.innerHTML += `<option value="${c.id}" data-prov="${c.province}">${c.name}</option>`;
                    });
                    qbCinema.disabled = false;
                } else {
                    qbCinema.innerHTML = '<option value="" selected disabled>Không có rạp chiếu</option>';
                }
            } catch (err) {
                console.error(err);
                qbCinema.innerHTML = '<option value="" selected disabled>Lỗi tải dữ liệu</option>';
            }
        });

        qbCinema.addEventListener('change', function() {
            qbDate.disabled = false;
            qbDate.innerHTML = '<option value="" selected disabled>Chọn Ngày</option>';
            // Generate next 7 days
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];
                const displayStr = d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
                qbDate.innerHTML += `<option value="${dateStr}">${displayStr}</option>`;
            }
            qbSubmit.disabled = true;
        });

        qbDate.addEventListener('change', function() {
            qbSubmit.disabled = false;
        });

        if (quickBookingForm) {
            quickBookingForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const movieId = qbMovie.value;
                const cinemaId = qbCinema.value;
                const date = qbDate.value;
                
                // Save selected province to auto-select in Detail page
                const selectedProv = qbCinema.options[qbCinema.selectedIndex].getAttribute('data-prov');
                if (selectedProv) {
                    sessionStorage.setItem('qb_target_province', selectedProv);
                }

                window.location.href = `/movies/${movieId}?date=${date}#showtimes-section`;
            });
        }
    }

    // Timeline Filter for Coming Soon
    const monthButtons = document.querySelectorAll('.month-filter-btn');
    const comingSoonItems = document.querySelectorAll('.coming-soon-item');

    if (monthButtons.length > 0 && comingSoonItems.length > 0) {
        monthButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all
                monthButtons.forEach(b => {
                    b.classList.remove('btn-primary', 'active');
                    b.classList.add('btn-outline-primary');
                });
                // Add active to current
                btn.classList.remove('btn-outline-primary');
                btn.classList.add('btn-primary', 'active');

                const filter = btn.getAttribute('data-filter');

                comingSoonItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-month') === filter) {
                        item.style.display = 'block';
                        // Add fade in animation
                        item.style.animation = 'none';
                        item.offsetHeight; // trigger reflow
                        item.style.animation = 'dropdownFade 0.3s ease forwards';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // Sticky Booking Bar Logic
    const stickyBookingBar = document.getElementById('stickyBookingBar');
    const heroSection = document.querySelector('.movie-hero-section');
    
    if (stickyBookingBar && heroSection) {
        window.addEventListener('scroll', () => {
            const heroBottom = heroSection.getBoundingClientRect().bottom;
            if (heroBottom < 0) {
                stickyBookingBar.classList.add('visible');
            } else {
                stickyBookingBar.classList.remove('visible');
            }
        });
    }

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        
        // Check local storage for theme
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-bs-theme', currentTheme);
        if (currentTheme === 'dark') {
            icon.classList.remove('bi-moon-stars');
            icon.classList.add('bi-sun');
        }

        themeToggleBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-bs-theme');
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-bs-theme', 'light');
                localStorage.setItem('theme', 'light');
                icon.classList.remove('bi-sun');
                icon.classList.add('bi-moon-stars');
            } else {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                icon.classList.remove('bi-moon-stars');
                icon.classList.add('bi-sun');
            }
        });
    }
});

    // Drag to scroll for swipeable timelines (Desktop UX)
    const sliders = document.querySelectorAll('.cgv-date-list, .bms-date-list');
    sliders.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'pointer';
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'pointer';
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            slider.scrollLeft = scrollLeft - walk;
        });
        slider.style.cursor = 'pointer';
    });
