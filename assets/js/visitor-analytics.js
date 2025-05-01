/**
 * Simple Visitor Analytics and Cookie Management
 * 
 * This script provides basic visitor tracking and cookie management
 * for your Netlify website.
 */

// Visitor tracking functionality
class VisitorTracker {
    constructor() {
      this.storageKey = 'site_visitor_data';
      this.initVisitorData();
      this.trackPageView();
    }
  
    // Initialize visitor data
    initVisitorData() {
      // Try to get existing visitor data
      let visitorData = this.getVisitorData();
      
      if (!visitorData) {
        // Create new visitor data if none exists
        visitorData = {
          visitorId: this.generateVisitorId(),
          firstVisit: new Date().toISOString(),
          visits: 0,
          pageViews: {},
        };
        this.setVisitorData(visitorData);
      }
    }
  
    // Generate a random visitor ID
    generateVisitorId() {
      return 'visitor_' + Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    }
  
    // Get visitor data from localStorage
    getVisitorData() {
      try {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        console.error('Error retrieving visitor data:', e);
        return null;
      }
    }
  
    // Save visitor data to localStorage
    setVisitorData(data) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (e) {
        console.error('Error saving visitor data:', e);
      }
    }
  
    // Track a page view
    trackPageView() {
      try {
        const visitorData = this.getVisitorData();
        
        if (!visitorData) return;
        
        // Increment visit count
        visitorData.visits += 1;
        visitorData.lastVisit = new Date().toISOString();
        
        // Track current page
        const currentPage = window.location.pathname;
        visitorData.pageViews[currentPage] = (visitorData.pageViews[currentPage] || 0) + 1;
        
        // Update visitor data
        this.setVisitorData(visitorData);
        
        // If you want to send this data to your server or analytics service,
        // you would add that code here
        
        console.log('Page view tracked:', currentPage);
      } catch (e) {
        console.error('Error tracking page view:', e);
      }
    }
  
    // Get visitor statistics
    getStats() {
      const data = this.getVisitorData();
      if (!data) return null;
      
      return {
        visitorId: data.visitorId,
        totalVisits: data.visits,
        firstVisit: new Date(data.firstVisit),
        lastVisit: data.lastVisit ? new Date(data.lastVisit) : null,
        pageViews: data.pageViews
      };
    }
  }
  
  // Cookie management functionality
  class CookieManager {
    // Set a cookie
    setCookie(name, value, days = 30) {
      let expires = '';
      
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      
      document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
      return true;
    }
  
    // Get a cookie by name
    getCookie(name) {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      
      return null;
    }
  
    // Delete a cookie
    deleteCookie(name) {
      this.setCookie(name, '', -1);
    }
  
    // Get all cookies as an object
    getAllCookies() {
      const cookies = {};
      const ca = document.cookie.split(';');
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        
        const parts = c.split('=');
        if (parts.length >= 2) {
          const name = parts[0];
          const value = decodeURIComponent(parts.slice(1).join('='));
          cookies[name] = value;
        }
      }
      
      return cookies;
    }
  }
  
  // Initialize visitor tracker and cookie manager
  const visitorTracker = new VisitorTracker();
  const cookieManager = new CookieManager();
  
  // Set a sample cookie for demonstration
  cookieManager.setCookie('last_visit', new Date().toISOString());
  
  // Example of how to create a visitor dashboard
  function createVisitorDashboard() {
    // Create dashboard container
    const dashboard = document.createElement('div');
    dashboard.id = 'visitor-dashboard';
    dashboard.style.position = 'fixed';
    dashboard.style.bottom = '20px';
    dashboard.style.right = '20px';
    dashboard.style.backgroundColor = '#f5f5f5';
    dashboard.style.padding = '15px';
    dashboard.style.borderRadius = '5px';
    dashboard.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    dashboard.style.zIndex = '1000';
    dashboard.style.display = 'none';
    
    // Get visitor stats
    const stats = visitorTracker.getStats();
    
    // Create dashboard content
    if (stats) {
      dashboard.innerHTML = `
        <h3 style="margin-top: 0;">Visitor Statistics</h3>
        <p>Visitor ID: ${stats.visitorId}</p>
        <p>Total Visits: ${stats.totalVisits}</p>
        <p>First Visit: ${stats.firstVisit.toLocaleString()}</p>
        ${stats.lastVisit ? `<p>Last Visit: ${stats.lastVisit.toLocaleString()}</p>` : ''}
        <h4>Page Views:</h4>
        <ul>
          ${Object.entries(stats.pageViews).map(([page, count]) => 
            `<li>${page || 'Home'}: ${count}</li>`
          ).join('')}
        </ul>
        <h4>Cookies:</h4>
        <ul>
          ${Object.entries(cookieManager.getAllCookies()).map(([name, value]) => 
            `<li>${name}: ${value}</li>`
          ).join('')}
        </ul>
        <button id="close-dashboard" style="margin-top: 10px;">Close</button>
      `;
    } else {
      dashboard.innerHTML = `
        <p>No visitor data available.</p>
        <button id="close-dashboard">Close</button>
      `;
    }
    
    // Add dashboard to page
    document.body.appendChild(dashboard);
    
    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-dashboard';
    toggleButton.textContent = 'Show Visitor Stats';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '20px';
    toggleButton.style.right = '20px';
    toggleButton.style.zIndex = '999';
    document.body.appendChild(toggleButton);
    
    // Add event listeners
    document.getElementById('toggle-dashboard').addEventListener('click', () => {
      const dashboard = document.getElementById('visitor-dashboard');
      const toggleButton = document.getElementById('toggle-dashboard');
      
      if (dashboard.style.display === 'none') {
        dashboard.style.display = 'block';
        toggleButton.style.display = 'none';
      } else {
        dashboard.style.display = 'none';
        toggleButton.style.display = 'block';
      }
    });
    
    document.getElementById('close-dashboard').addEventListener('click', () => {
      document.getElementById('visitor-dashboard').style.display = 'none';
      document.getElementById('toggle-dashboard').style.display = 'block';
    });
  }
  
  // Initialize the dashboard when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    createVisitorDashboard();
  });
  
  // Export utilities for use in other scripts
  window.visitorTracker = visitorTracker;
  window.cookieManager = cookieManager;