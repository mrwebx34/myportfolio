document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing visitor tracking...');
    // Start tracking immediately without IP address
    collectAndSendVisitorData();
});

function collectAndSendVisitorData() {
    try {
        console.log('Collecting visitor data...');
        // Collect basic visitor information without external API calls
        const visitorData = {
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            sessionId: getOrCreateSessionId()
            // Removed IP address collection which was causing CORS issues
        };
        
        console.log('Visitor data collected, sending to Google Form...');
        sendDataToGoogleForm(visitorData);
    } catch (error) {
        console.error('Error in visitor data collection:', error);
    }
}

function sendDataToGoogleForm(visitorData) {
    // Google Form submission URL
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfgEmJ-hS8EMVcGHXsmxW0LyJsl9WEbNKFkebuKXIpsanNd9Q/formResponse";
    
    // Create form data with the collected information
    const formData = new FormData();
    formData.append('entry.13047354', visitorData.timestamp);
    formData.append('entry.122166452', visitorData.page);
    formData.append('entry.750308820', visitorData.referrer);
    formData.append('entry.1754175536', visitorData.userAgent);
    formData.append('entry.1879776745', visitorData.screenSize);
    formData.append('entry.1210324880', visitorData.language);
    formData.append('entry.184010741', visitorData.sessionId);
    // Leave IP address field empty or with placeholder
    formData.append('entry.1399472212', 'Not collected');
    // Leave cookies field empty or with placeholder
    formData.append('entry.1287774854', 'Not collected');
    
    // Use a hidden iframe approach to avoid CORS issues with Google Forms
    submitFormWithIframe(formUrl, formData);
}

function submitFormWithIframe(formUrl, formData) {
    try {
        // Create a temporary hidden form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = formUrl;
        form.target = '_blank'; // This can be made hidden with an iframe if needed
        form.style.display = 'none';
        
        // Convert FormData to form elements
        for (const [key, value] of formData.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }
        
        // Add the form to the document and submit it
        document.body.appendChild(form);
        console.log('Submitting form data...');
        form.submit();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(form);
            console.log('Form submission completed.');
        }, 1000);
    } catch (error) {
        console.error('Error submitting form:', error);
        
        // Fallback method if the above fails
        try {
            // Try with fetch as a fallback (though may still have CORS issues)
            fetch(formUrl, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            })
            .then(() => console.log('Data sent via fetch fallback'))
            .catch(err => console.error('Fetch fallback also failed:', err));
        } catch (fetchError) {
            console.error('All submission methods failed:', fetchError);
        }
    }
}

function getOrCreateSessionId() {
    try {
        let sessionId = localStorage.getItem('visitor_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + '_' + new Date().getTime();
            localStorage.setItem('visitor_session_id', sessionId);
            console.log('Created new session ID');
        } else {
            console.log('Using existing session ID');
        }
        return sessionId;
    } catch (error) {
        console.error('Error with session storage:', error);
        return 'session_error_' + new Date().getTime();
    }
}