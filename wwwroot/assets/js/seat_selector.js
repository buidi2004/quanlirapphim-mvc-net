// public/assets/js/seat_selector.js

function initSeatSelector() {
    let showtimeId = null;
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        const input = bookingForm.querySelector('input[name="showtimeId"]');
        if(input) showtimeId = input.value;
    }

    // ── SignalR Seat Locking ────────────────────────────────────────
    let connection = null;
    const selectedSeats = new Set();

    if (showtimeId && typeof signalR !== 'undefined') {
        connection = new signalR.HubConnectionBuilder()
            .withUrl("/seathub")
            .withAutomaticReconnect()
            .build();

        connection.on("InitializeLocks", (lockedSeats) => {
            lockedSeats.forEach(seatCode => {
                const btn = document.querySelector(`.seat-btn[data-seat="${seatCode}"]`);
                if (btn && !selectedSeats.has(seatCode) && !btn.disabled) {
                    btn.classList.add('seat-status-holding');
                }
            });
        });

        connection.on("SeatLocked", (seatCode) => {
            const btn = document.querySelector(`.seat-btn[data-seat="${seatCode}"]`);
            if (btn && !selectedSeats.has(seatCode) && !btn.disabled) {
                btn.classList.add('seat-status-holding');
            }
        });

        connection.on("SeatUnlocked", (seatCode) => {
            const btn = document.querySelector(`.seat-btn[data-seat="${seatCode}"]`);
            if (btn && !selectedSeats.has(seatCode) && !btn.disabled) {
                btn.classList.remove('seat-status-holding');
            }
        });

        connection.start().then(() => {
            connection.invoke("JoinShowtimeGroup", parseInt(showtimeId));
        }).catch(err => console.error('SignalR Connection Error: ', err));
    }

    // ── Seat Selection ────────────────────────────────────────
    const MAX_SEATS      = 5;
    const pricePerSeatElement = document.querySelector('[data-price-per-seat]');
    const pricePerSeat   = pricePerSeatElement ? parseFloat(pricePerSeatElement.dataset.pricePerSeat) : 0;

    document.querySelectorAll('.seat-btn[data-seat]').forEach(btn => {
        btn.addEventListener('click', () => {
            const seat = btn.dataset.seat;

            if (selectedSeats.has(seat)) {
                // Bỏ chọn
                btn.classList.remove('seat-selected');
                selectedSeats.delete(seat);
                
                if (connection && showtimeId && connection.state === 'Connected') {
                    try {
                        connection.invoke("UnlockSeat", parseInt(showtimeId), seat).catch(console.error);
                    } catch (err) { console.error(err); }
                }
            } else {
                // Kiểm tra giới hạn
                if (selectedSeats.size >= MAX_SEATS) {
                    alert(`Chỉ được chọn tối đa ${MAX_SEATS} ghế.`);
                    return;
                }
                
                // Chọn
                btn.classList.add('seat-selected');
                selectedSeats.add(seat);

                // SignalR Lock
                if (connection && showtimeId && connection.state === 'Connected') {
                    try {
                        connection.invoke("LockSeat", parseInt(showtimeId), seat).then(success => {
                            if (!success) {
                                alert("Ghế này vừa có người khác chọn!");
                                selectedSeats.delete(seat);
                                btn.classList.remove('seat-selected');
                                btn.classList.add('seat-status-holding');
                                updateSummary();
                            }
                        }).catch(console.error);
                    } catch (err) { console.error(err); }
                }
            }

            updateSummary();
        });
    });

    function updateSummary() {
        const count = selectedSeats.size;
        const total = count * pricePerSeat;

        // Cập nhật UI
        const seatCountEl = document.getElementById('seat-count');
        if (seatCountEl) seatCountEl.textContent = count;
        
        const totalPriceEl = document.getElementById('total-price');
        const formattedTotal = total.toLocaleString('vi-VN') + '₫';
        if (totalPriceEl) totalPriceEl.textContent = formattedTotal;

        // Cập nhật danh sách ghế hiển thị
        const display = document.getElementById('selected-seats-display');
        if (display) {
            if (count === 0) {
                display.innerHTML = '<span class="text-secondary fst-italic">Chưa chọn ghế</span>';
            } else {
                display.innerHTML = [...selectedSeats]
                    .map(s => `<span class="badge bg-success me-1 shadow-sm">${s}</span>`)
                    .join('');
            }
        }

        // Enable/disable nút Giữ ghế
        const btn = document.getElementById('btn-hold');
        if (btn) btn.disabled = (count === 0);

        // #6 Sticky Checkout Mobile logic
        const stickyBar = document.getElementById('sticky-checkout');
        const stickySeatInfo = document.getElementById('sticky-seat-info');
        const stickyTotalPrice = document.getElementById('sticky-total-price');
        const stickyBtnHold = document.getElementById('sticky-btn-hold');

        if (stickyBar) {
            if (count > 0) {
                stickyBar.classList.add('visible');
                stickySeatInfo.textContent = `${count} ghế đã chọn`;
                stickyTotalPrice.textContent = formattedTotal;
                if (stickyBtnHold) stickyBtnHold.disabled = false;
            } else {
                stickyBar.classList.remove('visible');
                stickySeatInfo.textContent = 'Chưa chọn ghế';
                stickyTotalPrice.textContent = '0₫';
                if (stickyBtnHold) stickyBtnHold.disabled = true;
            }
        }
    }

    // Inject seat_codes vào form trước khi submit
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            if (selectedSeats.size === 0) {
                e.preventDefault();
                alert('Vui lòng chọn ít nhất 1 ghế.');
                return;
            }
            
            // Show loading spinner
            const btnHold = document.getElementById('btn-hold');
            const stickyBtnHold = document.getElementById('sticky-btn-hold');
            if (btnHold) {
                btnHold.disabled = true;
                btnHold.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang giữ ghế...';
            }
            if (stickyBtnHold) {
                stickyBtnHold.disabled = true;
                stickyBtnHold.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang giữ...';
            }
            
            e.preventDefault();

            // Submit form via AJAX to handle redirects nicely
            const csrf = bookingForm.querySelector('input[name="__RequestVerificationToken"]')?.value;
            
            const params = new URLSearchParams();
            params.append('showtimeId', showtimeId);
            if (csrf) params.append('__RequestVerificationToken', csrf);
            selectedSeats.forEach(seat => {
                params.append('seatCodes', seat);
            });

            fetch(bookingForm.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirectUrl;
                } else {
                    alert(data.error || 'Lỗi không xác định.');
                    resetHoldButtons();
                }
            })
            .catch(() => {
                alert('Lỗi kết nối. Vui lòng thử lại.');
                resetHoldButtons();
            });

            function resetHoldButtons() {
                if (btnHold) {
                    btnHold.disabled = false;
                    btnHold.innerHTML = '<i class="bi bi-lock me-2"></i>GIỮ GHẾ (10 PHÚT)';
                }
                if (stickyBtnHold) {
                    stickyBtnHold.disabled = false;
                    stickyBtnHold.innerHTML = '<i class="bi bi-lock me-2"></i>Giữ Ghế';
                }
            }
        });
    }

    // ── #5 Countdown Timer ───────────────────────────────────────
    const timerEl = document.getElementById('countdown-timer');
    if (timerEl) {
        const remainingSeconds = parseInt(timerEl.dataset.remainingSeconds ?? '600');
        let timeLeft = remainingSeconds;

        const interval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(interval);
                alert('Phiên giữ chỗ đã hết hạn. Vui lòng chọn lại ghế.');
                window.location.href = '/movies';
                return;
            }
            timeLeft--;
            
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

            // Pulse effect when urgent (<= 60 seconds)
            if (timeLeft <= 60) {
                timerEl.classList.add('timer-urgent');
                timerEl.classList.add('text-danger');
            }
        }, 1000);
    }

    // ── Apply Promo Code (AJAX) ───────────────────────────────
    const btnPromo = document.getElementById('btn-apply-promo');
    if (btnPromo) {
        btnPromo.addEventListener('click', async () => {
            const code     = document.getElementById('promo-input').value.trim();
            const subtotal = parseFloat(document.getElementById('final-total').value);
            const feedback = document.getElementById('promo-feedback');

            if (!code) return;

            btnPromo.disabled = true;
            btnPromo.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
            const csrfInput = document.querySelector('input[name="__RequestVerificationToken"]');
            const csrf = csrfInput ? csrfInput.value : '';

            try {
                const res = await fetch('/booking/apply-promo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `code=${encodeURIComponent(code)}&subtotal=${subtotal}&__RequestVerificationToken=${csrf}`
                });
                const data = await res.json();

                if (data.success) {
                    feedback.innerHTML = `<span class="text-success fw-bold">✓ Giảm ${data.discount.toLocaleString('vi-VN')}₫</span>`;
                    document.getElementById('total-display').textContent =
                        data.totalPrice.toLocaleString('vi-VN') + '₫';
                    document.getElementById('final-total').value = data.totalPrice;
                    document.getElementById('final-promo').value = code;
                    document.getElementById('discount-row').style.setProperty('display', '', 'important');
                    document.getElementById('discount-display').textContent =
                        '-' + data.discount.toLocaleString('vi-VN') + '₫';
                } else {
                    feedback.innerHTML = `<span class="text-danger">✗ ${data.error}</span>`;
                }
            } catch {
                feedback.innerHTML = '<span class="text-danger">Lỗi kết nối. Thử lại.</span>';
            } finally {
                btnPromo.disabled = false;
                btnPromo.textContent = 'Áp dụng';
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSeatSelector);
} else {
    initSeatSelector();
}
