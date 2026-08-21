import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  try {
    const btn = await page.locator('button:has-text("Sign In")').first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(2000);
      const content = await page.evaluate(() => document.body.innerHTML);
      console.log("HTML length after Sign In click:", content.length);
      console.log("Preview:", content.substring(0, 500));
    } else {
        const btn2 = await page.locator('button:has-text("Go to Dashboard")').first();
        if (await btn2.isVisible()) {
          await btn2.click();
          await page.waitForTimeout(2000);
          const content = await page.evaluate(() => document.body.innerHTML);
          console.log("HTML length after Go to Dashboard click:", content.length);
          console.log("Preview:", content.substring(0, 500));
        } else {
           console.log("No button found.");
        }
    }
  } catch(e) {
    console.error("error clicking:", e);
  }
  
  await browser.close();
})();
