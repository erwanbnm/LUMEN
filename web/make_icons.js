// Génère les icônes PNG de Lumen (web/icons/) à partir de web/icon.html. Lancer : node web/make_icons.js
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const out = path.join(__dirname, "icons"); fs.mkdirSync(out, { recursive: true });
  // Chromium de Playwright si présent, sinon le navigateur Edge de Windows
  const browser = await chromium.launch().catch(() => chromium.launch({ channel: "msedge" }));
  const page = await browser.newPage();
  for (const s of [512, 192, 180]) {
    await page.setViewportSize({ width: s, height: s });
    await page.goto("file://" + path.join(__dirname, "icon.html").replace(/\\/g, "/") + "?s=" + s);
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#ic").screenshot({ path: path.join(out, `icon-${s}.png`) });
  }
  // Petite icône monochrome des notifications
  await page.setViewportSize({ width: 96, height: 96 });
  await page.goto("file://" + path.join(__dirname, "badge.html").replace(/\\/g, "/"));
  await page.locator("#ic").screenshot({ path: path.join(out, "badge-96.png"), omitBackground: true });
  await browser.close();
  console.log("icônes ->", out);
})();
