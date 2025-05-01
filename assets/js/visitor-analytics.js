document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        collectAndSendVisitorData();
    }, 2000);
});

function collectAndSendVisitorData() {
    const visitorData = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        sessionId: getOrCreateSessionId()
    };

    // Correct Google Form submission URL (action URL from Google Form)
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfgEmJ-hS8EMVcGHXsmxW0LyJsl9WEbNKFkebuKXIpsanNd9Q/formResponse";

    const formData = new FormData();
    formData.append('entry.13047354', visitorData.timestamp); 
    formData.append('entry.122166452', visitorData.page);
    formData.append('entry.750308820', visitorData.referrer);
    formData.append('entry.1754175536', visitorData.userAgent);
    formData.append('entry.1879776745', visitorData.screenSize);
    formData.append('entry.1210324880', visitorData.language);
    formData.append('entry.184010741', visitorData.sessionId);

    // Use navigator.sendBeacon for reliability
    if (navigator.sendBeacon) {
        console.log('Sending data with sendBeacon...');
        navigator.sendBeacon(formUrl, formData);
    } else {
        // Fallback to fetch (but no response handling with 'no-cors')
        console.log('Sending data with fetch...');
        fetch(formUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // CORS issue still might occur
        }).catch(error => console.error('Error sending data:', error));
    }

    // Track page navigation
    trackPageNavigation();
}

function getOrCreateSessionId() {
    let sessionId = localStorage.getItem('rr_session_id');
    if (!sessionId) {
        sessionId = 'ss_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('rr_session_id', sessionId);
    }
    return sessionId;
}

function trackPageNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const sectionId = this.getAttribute('href').substring(1);
            if (sectionId) {
                console.log(`Navigated to section: ${sectionId}`);
            }
        });
    });
}
