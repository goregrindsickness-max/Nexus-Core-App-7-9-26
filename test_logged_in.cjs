const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log(`[${msg.type()}] ${msg.text()}`));
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  // Set localStorage
  await page.evaluate(() => {
    localStorage.setItem('nexus_core_user_profile', JSON.stringify({
      id: "op_default",
      name: "Nexus Operator",
      email: "admin@example.com",
      account_type: "band",
      pin: "0000"
    }));
  });
  
  // Reload page to apply localStorage
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log("HTML:", bodyHTML.substring(0, 1000));
  await page.screenshot({path: 'screenshot_logged_in.png'});
  console.log("Screenshot saved to screenshot_logged_in.png");
  await browser.close();
})();
