/**
 * OAuth Authentication Handler
 * Handles OAuth button clicks and loading states
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Handle OAuth button clicks
    const oauthButtons = document.querySelectorAll('.oauth-buttons a');
    
    oauthButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add loading state
            this.classList.add('btn-oauth-loading');
            this.style.pointerEvents = 'none';
            
            // Store original text
            const originalText = this.innerHTML;
            
            // Add loading indicator
            const loadingText = this.innerHTML.replace(
                /Đăng (nhập|ký)/,
                'Đang chuyển hướng'
            );
            this.innerHTML = loadingText;
            
            // If redirect fails after 5 seconds, restore button
            setTimeout(() => {
                this.classList.remove('btn-oauth-loading');
                this.style.pointerEvents = '';
                this.innerHTML = originalText;
            }, 5000);
        });
    });
    
    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
        showOAuthError(error);
    }
    
    // Handle OAuth callback
    if (window.location.pathname.includes('/auth/') && window.location.pathname.includes('/callback')) {
        // Show loading message while processing
        const container = document.querySelector('.container');
        if (container) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'alert alert-info text-center';
            loadingDiv.innerHTML = `
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Đang xử lý đăng nhập...
            `;
            container.insertBefore(loadingDiv, container.firstChild);
        }
    }
});

/**
 * Show OAuth error message
 */
function showOAuthError(error) {
    const errorMessages = {
        'access_denied': 'Bạn đã từ chối quyền truy cập. Vui lòng thử lại.',
        'invalid_grant': 'Mã xác thực không hợp lệ. Vui lòng thử lại.',
        'invalid_request': 'Yêu cầu không hợp lệ. Vui lòng liên hệ hỗ trợ.',
        'server_error': 'Lỗi server. Vui lòng thử lại sau.'
    };
    
    const message = errorMessages[error] || 'Đã xảy ra lỗi trong quá trình đăng nhập.';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
    }
}

/**
 * Validate OAuth configuration (for admin use)
 */
function validateOAuthConfig() {
    const googleClientId = document.querySelector('[name="google_client_id"]');
    const zaloAppId = document.querySelector('[name="zalo_app_id"]');
    
    if (googleClientId && !googleClientId.value) {
        console.warn('Google Client ID is not configured');
    }
    
    if (zaloAppId && !zaloAppId.value) {
        console.warn('Zalo App ID is not configured');
    }
}
