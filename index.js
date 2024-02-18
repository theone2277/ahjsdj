let words = require('../../words.json');
let rateLimit = {};

export default (req, res) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!rateLimit[ip]) {
    rateLimit[ip] = { count: 0, timestamp: new Date() };
  }

  let currentTimestamp = new Date();
  let minutesPassed = (currentTimestamp - rateLimit[ip].timestamp) / 60000;

  if (minutesPassed > 1) {
    rateLimit[ip] = { count: 0, timestamp: currentTimestamp };
  }

  if (rateLimit[ip].count >= 50) {
    res.status(429).json({ response: "Your IP is rate limited to 50 words per minute" });
  } else {
    let randomWord = words[Math.floor(Math.random() * words.length)];
    rateLimit[ip].count++;
    res.status(200).json({ response: randomWord });
  }
};
