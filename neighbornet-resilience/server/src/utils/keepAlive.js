/**
 * Keep-alive utility for Render free tier.
 * Pings the server every 14 minutes to prevent it from sleeping.
 */
const https = require('https');

function keepAlive(url) {
  console.log(`🏓 Keep-alive enabled — pinging ${url} every 14 minutes`);
  setInterval(() => {
    https.get(url, (res) => {
      console.log(`🏓 Keep-alive ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.warn('🏓 Keep-alive ping failed:', err.message);
    });
  }, 14 * 60 * 1000);
}

module.exports = keepAlive;
