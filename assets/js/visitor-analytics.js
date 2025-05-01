document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        collectAndSendVisitorData();
    }, 2000);
});

function collectAndSendVisitorData() {
    // Collect basic visitor information
    const visitorData = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        sessionId: getOrCreateSessionId(),
        ipAddress: '', // Placeholder for IP address
        cookies: document.cookie // Collecting cookies (requires consent)
    };

    // Get the IP address using ipify API
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            visitorData.ipAddress = data.ip; // Store the IP address

            // Send data to Google Sheets
            sendDataToGoogleSheets(visitorData);
        })
        .catch(error => {
            console.error('Error getting IP address:', error);
        });
}

function sendDataToGoogleSheets(visitorData) {
    // Send data to Google Sheets via a form submission
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfgEmJ-hS8EMVcGHXsmxW0LyJsl9WEbNKFkebuKXIpsanNd9Q/viewform?usp=header"; // Replace with your Google Form URL

    const formData = new FormData();
    formData.append('entry.13047354', visitorData.timestamp); // Replace with your actual form field IDs
    formData.append('entry.122166452', visitorData.page);
    formData.append('entry.750308820', visitorData.referrer);
    formData.append('entry.1754175536', visitorData.userAgent);
    formData.append('entry.1879776745', visitorData.screenSize);
    formData.append('entry.1210324880', visitorData.language);
    formData.append('entry.184010741', visitorData.sessionId);
    formData.append('entry.1399472212', visitorData.ipAddress); // Store IP address
    formData.append('entry.1287774854', visitorData.cookies); // Store cookies (make sure to get consent)

    // Send data using the Navigator.sendBeacon API
    if (navigator.sendBeacon) {
        navigator.sendBeacon(formUrl, formData);
    } else {
        fetch(formUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        }).catch(error => console.log('Logging completed'));
    }
}

function getOrCreateSessionId() {
    let sessionId = localStorage.getItem('rr_session_id');
    if (!sessionId) {
        sessionId = 'ss_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('rr_session_id', sessionId);
    }
    return sessionId;
}
