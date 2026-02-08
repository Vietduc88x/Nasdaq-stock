// Platform Thesis Article - Load content when tab is clicked
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the platform tab button to be available
    const platformTabBtn = document.querySelector('[data-tab="platform"]');
    
    if (platformTabBtn) {
        platformTabBtn.addEventListener('click', function() {
            loadPlatformArticle();
        });
    }
});

async function loadPlatformArticle() {
    const container = document.querySelector('#platform-tab .platform-article-container');
    
    if (!container) return;
    
    // Check if already loaded
    if (container.dataset.loaded === 'true') return;
    
    // Show loading state
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading article...</p></div>';
    
    try {
        // Fetch the article content
        const response = await fetch('platform-article.html');
        const html = await response.text();
        
        // Insert the content
        container.innerHTML = html;
        container.dataset.loaded = 'true';
        
        console.log('✓ Platform thesis article loaded successfully');
    } catch (error) {
        console.error('Error loading platform thesis:', error);
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;"><p>Error loading article content. Please try again later.</p></div>';
    }
}
