import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  const content = await page.evaluate(() => document.body.innerHTML);
  console.log("BODY HTML LENGTH:", content.length);
  if (content.length < 2000) {
      console.log("BODY:", content);
  } else {
      console.log("BODY PREVIEW:", content.substring(0, 1000));
  }
  
  await browser.close();
})();
