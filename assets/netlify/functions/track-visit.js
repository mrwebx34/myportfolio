const fs = require("fs");
const path = require("path");

const logPath = "/tmp/visitor-log.json"; // Only /tmp is writable in Netlify Functions

exports.handler = async (event) => {
  const { userId, ua, time } = JSON.parse(event.body || "{}");

  const ip = event.headers["x-nf-client-connection-ip"] || "unknown";
  const entry = { time, ip, userId, ua };

  let logs = [];
  if (fs.existsSync(logPath)) {
    logs = JSON.parse(fs.readFileSync(logPath, "utf8"));
  }

  logs.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Visit logged", count: logs.length })
  };
};

// netlify/functions/view-logs.js
const fs = require("fs");
const logPath = "/tmp/visitor-log.json";

exports.handler = async () => {
  if (fs.existsSync(logPath)) {
    const logs = fs.readFileSync(logPath, "utf8");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: logs
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "No visits yet." })
    };
  }
};