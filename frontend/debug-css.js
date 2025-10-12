import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);

    // Check what stylesheets are loaded
    const stylesheets = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      return sheets.map(sheet => ({
        href: sheet.href,
        rules: sheet.cssRules ? sheet.cssRules.length : 0
      }));
    });

    console.log('\n=== STYLESHEETS LOADED ===');
    stylesheets.forEach(sheet => {
      console.log(`${sheet.href || 'inline'} - ${sheet.rules} rules`);
    });

    // Check computed styles on key elements
    const bgColor = await page.evaluate(() => {
      const main = document.querySelector('div');
      if (main) {
        const styles = window.getComputedStyle(main);
        return {
          background: styles.background,
          backgroundColor: styles.backgroundColor,
          backgroundImage: styles.backgroundImage
        };
      }
      return null;
    });

    console.log('\n=== COMPUTED STYLES FOR FIRST DIV ===');
    console.log(JSON.stringify(bgColor, null, 2));

    // Check if Tailwind classes exist
    const hasGradient = await page.evaluate(() => {
      const div = document.querySelector('.bg-gradient-to-br');
      return div !== null;
    });

    console.log('\n=== TAILWIND CLASS CHECK ===');
    console.log('Has .bg-gradient-to-br element:', hasGradient);

    // Get all class names used
    const classNames = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class]');
      const classes = new Set();
      elements.forEach(el => {
        el.className.split(' ').forEach(cls => {
          if (cls.trim()) classes.add(cls.trim());
        });
      });
      return Array.from(classes).sort().slice(0, 20); // First 20 classes
    });

    console.log('\n=== FIRST 20 CLASSES USED IN HTML ===');
    classNames.forEach(cls => console.log(`  - ${cls}`));

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
})();
