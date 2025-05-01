/**
 * Simple Visitor Analytics for Ranjan's Portfolio
 * This script collects basic visitor information and sends it to Google Sheets
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment to collect data
    setTimeout(function() {
      collectAndSendVisitorData();
    }, 2000);
  });
  
  /**
   * Collect visitor data and send to Google Sheets
   */
  function collectAndSendVisitorData() {
    // Collect basic visitor information
    const visitorData = {
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      sessionId: getOrCreateSessionId()
    };
  
    // Send data to Google Sheets via a form submission
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfgEmJ-hS8EMVcGHXsmxW0LyJsl9WEbNKFkebuKXIpsanNd9Q/viewform?usp=header"; // Replace with your Google Form URL
    
    // Create form data
    const formData = new FormData();
    formData.append('entry.13047354', visitorData.timestamp); // Replace with your actual form field IDs
    formData.append('entry.122166452', visitorData.page);
    formData.append('entry.750308820', visitorData.referrer);
    formData.append('entry.1754175536', visitorData.userAgent);
    formData.append('entry.1879776745', visitorData.screenSize);
    formData.append('entry.1210324880', visitorData.language);
    formData.append('entry.184010741', visitorData.sessionId);
  
    // Send data using the Navigator.sendBeacon API for reliability
    // This ensures data is sent even if the page is being closed
    if (navigator.sendBeacon) {
      navigator.sendBeacon(formUrl, formData);
    } else {
      // Fallback to fetch if sendBeacon is not available
      fetch(formUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      }).catch(error => console.log('Logging completed'));
    }
    
    // Also track navigation within the site
    trackPageNavigation();
  }
  
  /**
   * Generate or retrieve a session ID to track the same visitor across pages
   */
  function getOrCreateSessionId() {
    let sessionId = localStorage.getItem('rr_session_id');
    
    if (!sessionId) {
      sessionId = 'ss_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('rr_session_id', sessionId);
    }
    
    return sessionId;
  }
  
  /**
   * Track navigation to different sections of the page
   */
  function trackPageNavigation() {
    // Track clicks on navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const sectionId = this.getAttribute('href').substring(1);
        
        if (sectionId) {
          // Log the section navigation (optional)
          console.log(`Navigation to section: ${sectionId}`);
        }
      });
    });
  }