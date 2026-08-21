import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  try {
    const btn = await page.locator('button:has-text("Sign In")').first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(2000);
    }
  } catch(e) {}
  
  try {
    const dbgBtn = await page.locator('button:has-text("Local Simulation")').first();
    if (await dbgBtn.isVisible()) {
        await dbgBtn.click();
        await page.waitForTimeout(2000);
    }
  } catch(e) {}
  
  try {
    const checkBtn = await page.locator('button:has-text("Tour Checklist")').first();
    if (await checkBtn.isVisible()) {
        await checkBtn.click();
        await page.waitForTimeout(2000);
    } else {
        const checkBtn2 = await page.locator('button:has-text("Checklist")').first();
        if (await checkBtn2.isVisible()) {
            await checkBtn2.click();
            await page.waitForTimeout(2000);
        } else {
            console.log("No checklist button found.");
        }
    }
  } catch(e) {}

  const content = await page.evaluate(() => document.body.innerHTML);
  console.log("HTML length:", content.length);
  
  await browser.close();
})();
