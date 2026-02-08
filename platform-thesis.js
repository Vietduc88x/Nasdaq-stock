// Platform Thesis Article - Load content when tab is clicked
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the platform tab buttons to be available
    const platformTabBtn = document.querySelector('[data-tab="platform"]');
    const platformVnTabBtn = document.querySelector('[data-tab="platform-vn"]');
    
    if (platformTabBtn) {
        platformTabBtn.addEventListener('click', function() {
            loadPlatformArticle('en');
        });
    }
    
    if (platformVnTabBtn) {
        platformVnTabBtn.addEventListener('click', function() {
            loadPlatformArticle('vn');
        });
    }
});

async function loadPlatformArticle(language = 'en') {
    const containerId = language === 'vn' ? '#platform-vn-tab .platform-article-container' : '#platform-tab .platform-article-container';
    const container = document.querySelector(containerId);
    
    if (!container) return;
    
    // Check if already loaded
    if (container.dataset.loaded === 'true') return;
    
    // Show loading state
    const loadingText = language === 'vn' ? 'Đang tải bài viết...' : 'Loading article...';
    container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>${loadingText}</p></div>`;
    
    try {
        // Fetch the article content
        const filename = language === 'vn' ? 'platform-article-vn.html' : 'platform-article.html';
        const response = await fetch(filename);
        const html = await response.text();
        
        // Insert the content
        container.innerHTML = html;
        container.dataset.loaded = 'true';
        
        console.log(`✓ Platform thesis article (${language.toUpperCase()}) loaded successfully`);
    } catch (error) {
        console.error('Error loading platform thesis:', error);
        const errorText = language === 'vn' ? 'Lỗi khi tải nội dung bài viết. Vui lòng thử lại sau.' : 'Error loading article content. Please try again later.';
        container.innerHTML = `<div style="padding: 40px; text-align: center; color: #ef4444;"><p>${errorText}</p></div>`;
    }
}
