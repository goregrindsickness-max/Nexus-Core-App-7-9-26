import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  // Try to click 'ENTER SYSTEM' or similar button to bypass splash
  try {
    const enterBtn = await page.locator('button', { hasText: 'ENTER NEXUS' }).first();
    if (await enterBtn.isVisible()) {
        await enterBtn.click();
        await page.waitForTimeout(2000);
    } else {
        console.log("No enter nexus button");
    }
  } catch (e) {
    console.log("Error clicking enter:", e.message);
  }
  
  try {
      const dbgBtn = await page.locator('button', { hasText: 'Local Simulation' }).first();
      if (await dbgBtn.isVisible()) {
          await dbgBtn.click();
          await page.waitForTimeout(2000);
      }
  } catch (e) {}

  const content = await page.evaluate(() => document.body.innerHTML);
  console.log("BODY HTML LENGTH AFTER CLICK:", content.length);
  
  await browser.close();
})();
