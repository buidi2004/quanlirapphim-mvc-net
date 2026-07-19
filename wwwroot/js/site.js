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
