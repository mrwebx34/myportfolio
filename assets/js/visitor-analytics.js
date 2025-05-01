const { Octokit } = require("@octokit/rest");

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Parse the incoming data
    const data = JSON.parse(event.body);
    
    // Add the IP address (Netlify provides this in headers)
    const ip = event.headers["x-forwarded-for"] || "unknown";
    data.ip = anonymizeIP(ip); // Anonymize for privacy
    
    // Format the log entry
    const logEntry = `${new Date().toISOString()} | ${data.ip} | ${data.userAgent} | ${data.pageUrl} | ${data.referrer}\n`;
    
    // GitHub repository configuration - set these in Netlify environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || "visitor-logs";
    const owner = process.env.GITHUB_OWNER; // Your GitHub username
    const logFile = `logs/${getDateString()}.log`;

    if (githubToken && owner) {
      // Log to GitHub
      await logToGitHub(githubToken, owner, repo, logFile, logEntry, data);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Visitor data logged" })
    };
  } catch (error) {
    console.error("Error logging visitor:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error logging data" })
    };
  }
};

/**
 * Log data to a GitHub repository
 */
async function logToGitHub(token, owner, repo, path, logEntry, fullData) {
  const octokit = new Octokit({
    auth: token
  });

  try {
    // Check if the file already exists
    let sha;
    let existingContent = "";
    
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path
      });
      
      sha = data.sha;
      existingContent = Buffer.from(data.content, 'base64').toString();
    } catch (error) {
      // File doesn't exist yet, which is fine
    }
    
    // Prepare the new content (append to existing or create new)
    const newContent = existingContent + logEntry;
    
    // Prepare the JSON data log (stored in a separate file)
    const jsonLogFile = path.replace('.log', '.json');
    let jsonLogs = [];
    
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: jsonLogFile
      });
      
      jsonLogs = JSON.parse(Buffer.from(data.content, 'base64').toString());
    } catch (error) {
      // JSON file doesn't exist yet, which is fine
    }
    
    // Add the new log entry to the JSON array
    jsonLogs.push(fullData);
    
    // Update or create the text log file
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Update visitor log for ${getDateString()}`,
      content: Buffer.from(newContent).toString('base64'),
      sha: sha,
      committer: {
        name: "Visitor Logger",
        email: "noreply@example.com"
      }
    });
    
    // Update or create the JSON log file
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: jsonLogFile,
      message: `Update visitor data for ${getDateString()}`,
      content: Buffer.from(JSON.stringify(jsonLogs, null, 2)).toString('base64'),
      sha: jsonLogs.length > 0 ? jsonLogFileSha : undefined,
      committer: {
        name: "Visitor Logger",
        email: "noreply@example.com"
      }
    });
    
  } catch (error) {
    console.error("GitHub logging error:", error);
  }
}

/**
 * Get the current date in YYYY-MM-DD format for log filenames
 */
function getDateString() {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

/**
 * Anonymize IP address by removing the last octet
 */
function anonymizeIP(ip) {
  if (!ip || ip === "unknown") return "unknown";
  
  // For IPv4, replace the last octet with 0
  if (ip.includes('.')) {
    const parts = ip.split('.');
    parts[parts.length - 1] = '0';
    return parts.join('.');
  }
  
  // For IPv6, replace the last 80 bits (last 20 hex chars)
  if (ip.includes(':')) {
    return ip.replace(/:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){4}$/i, ':0000:0000:0000:0000:0000');
  }
  
  return "unknown";
}