import re

with open('Views/Home/Index.cshtml', 'r', encoding='utf-8') as f:
    content = f.read()

# For trending movies "ĐẶT VÉ"
content = re.sub(
    r'<button class="btn btn-warning btn-sm rounded-3 fw-medium w-100 mt-2">ĐẶT VÉ</button>',
    r'<button class="btn btn-warning btn-sm rounded-3 fw-medium w-100 mt-2" onclick="event.stopPropagation(); openBookingModal(@movie.Id)">ĐẶT VÉ</button>',
    content
)

# For now showing "ĐẶT VÉ"
content = re.sub(
    r'<span class="badge bg-warning text-white font-monospace" style="font-size: 0\.75rem;">ĐẶT VÉ</span>',
    r'<button class="btn btn-warning btn-sm px-3 py-1 text-white font-monospace border-0 rounded-pill shadow-sm" style="font-size: 0.75rem;" onclick="event.stopPropagation(); openBookingModal(@movie.Id)">ĐẶT VÉ</button>',
    content
)

# Append modal container and script
script = """
<div id="homeBookingModalContainer"></div>

@section Scripts {
    <script>
        function openBookingModal(movieId) {
            const container = document.getElementById('homeBookingModalContainer');
            container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-warning" role="status"></div></div>';
            
            fetch(`/movies/${movieId}/booking-modal`)
                .then(res => res.text())
                .then(html => {
                    container.innerHTML = html;
                    const modal = new bootstrap.Modal(document.getElementById('movieBookingModal'));
                    modal.show();
                })
                .catch(err => console.error(err));
        }

        function loadBookingModal(movieId, date) {
            fetch(`/movies/${movieId}/booking-modal?date=${date}`)
                .then(res => res.text())
                .then(html => {
                    const container = document.getElementById('homeBookingModalContainer');
                    // Hide current modal without backdrop cleanup issues
                    const currentModalEl = document.getElementById('movieBookingModal');
                    const currentModal = bootstrap.Modal.getInstance(currentModalEl);
                    if (currentModal) {
                        currentModal.hide();
                    }
                    
                    setTimeout(() => {
                        container.innerHTML = html;
                        const newModal = new bootstrap.Modal(document.getElementById('movieBookingModal'));
                        newModal.show();
                    }, 300);
                })
                .catch(err => console.error(err));
        }
    </script>
}
"""

if "homeBookingModalContainer" not in content:
    content = content + script

with open('Views/Home/Index.cshtml', 'w', encoding='utf-8') as f:
    f.write(content)
