// Save as track.js in your netlify/functions folder
const axios = require('axios');
const querystring = require('querystring');

exports.handler = async function(event, context) {
  try {
    // Get the IP address from the Netlify request
    const ip = event.headers['client-ip'] || 
               event.headers['x-forwarded-for'] || 
               'unknown';
    
    // Get parameters from query string
    const params = event.queryStringParameters;
    
    // Add IP address to the data
    params.ip = ip;
    
    // Prepare data for Google Forms
    const formData = {
      'entry.13047354': params.t || '', // timestamp
      'entry.122166452': params.p || '', // page
      'entry.750308820': params.r || '', // referrer
      'entry.1754175536': params.ua || '', // userAgent
      'entry.1879776745': params.s || '', // screenSize
      'entry.1210324880': params.l || '', // language
      'entry.184010741': params.sid || '', // sessionId
      'entry.1399472212': ip, // IP address
      'entry.1287774854': params.c || '' // cookies
    };
    
    // Google Form submission URL
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfgEmJ-hS8EMVcGHXsmxW0LyJsl9WEbNKFkebuKXIpsanNd9Q/formResponse";
    
    // Send data to Google Forms
    const response = await axios.post(formUrl, querystring.stringify(formData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Return a tiny transparent GIF image (1x1 pixel)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      isBase64Encoded: true
    };
  } catch (error) {
    // Still return a successful response with the GIF to avoid errors in the browser
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
      body: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      isBase64Encoded: true
    };
  }
};