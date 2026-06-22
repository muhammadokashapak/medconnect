const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage();

  // Emulate mobile device (iPhone 12 Pro)
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  // Read JWT secret from .env if possible
  require('dotenv').config();
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { id: "cm01test123", email: "test@medconnect.com", role: "DOCTOR" },
    process.env.JWT_SECRET || "supersecretjwtkey"
  );

  await page.setCookie({
    name: 'token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  if (!fs.existsSync('public/screenshots')) {
    fs.mkdirSync('public/screenshots', { recursive: true });
  }

  // Go to Profile Page
  console.log("Navigating to Profile...");
  await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'public/screenshots/mobile_profile.png' });
  console.log("Captured Profile!");

  // Go to Feed Page
  console.log("Navigating to Feed...");
  await page.goto('http://localhost:3000/feed', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'public/screenshots/mobile_feed.png' });
  console.log("Captured Feed!");

  await browser.close();
  console.log("All screenshots captured successfully.");
})();
