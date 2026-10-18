import fs from "node:fs/promises";
const { default: puppeteer } = await import(process.env.BEM_PUPPETEER_MODULE || "/Users/macbookair/.npm/_npx/55158e48eb5c59f7/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js");
const browser = await puppeteer.launch({ executablePath: process.env.BEM_CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage();
page.setDefaultNavigationTimeout(90000);
const results = { checkedAt: new Date().toISOString(), pages: [], interactions: [], consoleErrors: [], pageErrors: [] };
let expected503ConsoleErrors = 0;
page.on("pageerror", error => results.pageErrors.push(error.message));
page.on("console", message => {
  if (message.type() !== "error") return;
  if (expected503ConsoleErrors && message.text() === "Failed to load resource: the server responded with a status of 503 (Service Unavailable)") {
    expected503ConsoleErrors--;
    return;
  }
  results.consoleErrors.push(message.text());
});
const output = process.env.BEM_QA_OUTPUT || "docs/ui-qa";
await fs.mkdir(output, { recursive: true });
const base = process.env.BEM_QA_ORIGIN || "http://127.0.0.1:3000";
const widths = [360, 390, 768, 1024, 1440];
const routes = ["/", "/kegiatan", "/kegiatan/kalender", "/berita", "/organisasi/departemen", "/tentang", "/tentang/visi-misi", "/organisasi/struktur-kepengurusan", "/layanan/bank-aspirasi", "/dokumen", "/auth/login", "/auth/daftar", "/admin/login", "/portal/aspirasi/baru", "/kontak", "/galeri", "/organisasi/program-kerja"];
try {
  for (const route of routes) {
    await page.setViewport({ width: 1440, height: 1000 });
    const response = await page.goto(base + route, { waitUntil: "networkidle2", timeout: 90000 });
    for (const width of widths) {
      await page.setViewport({ width, height: 900 });
      const audit = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        overflowing: [...document.querySelectorAll("main *")].filter(el => el.getBoundingClientRect().right > innerWidth + 2 && getComputedStyle(el).position !== "absolute").slice(0, 6).map(el => el.tagName + "." + el.className),
        unlabeledButtons: [...document.querySelectorAll("button")].filter(el => !el.textContent.trim() && !el.getAttribute("aria-label") && !el.getAttribute("title")).length,
        h1: document.querySelector("h1")?.textContent,
      }));
      results.pages.push({ route, width, status: response.status(), ...audit });
    }
    if (["/", "/kegiatan", "/berita", "/organisasi/departemen", "/tentang/visi-misi", "/layanan/bank-aspirasi", "/admin/login"].includes(route)) {
      const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
      for (const width of [390, 1440]) {
        await page.setViewport({ width, height: 1000 });
        await page.screenshot({ path: output + "/" + name + "-" + width + ".png", fullPage: true });
      }
    }
    console.log("checked", route);
  }
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(base + "/", { waitUntil: "networkidle2" });
  await page.click('button[aria-controls="public-mobile-menu"]');
  results.interactions.push({ name: "Menu opens on first click", pass: await page.$eval("#public-mobile-menu", () => true) });
  await page.keyboard.press("Escape");
  results.interactions.push({ name: "Escape closes menu and restores scrolling", pass: await page.evaluate(() => !document.querySelector("#public-mobile-menu") && document.body.style.overflow !== "hidden") });
  await page.click('button[aria-controls="public-mobile-menu"]');
  await page.click('#public-mobile-menu a[href="/kegiatan"]');
  await page.waitForSelector('[aria-label="Bulan berikutnya"]');
  results.interactions.push({ name: "Navigation closes menu", pass: await page.evaluate(() => !document.querySelector("#public-mobile-menu")) });
  const before = await page.$eval('[aria-label="Kalender kegiatan"] h2', el => el.textContent);
  await page.click('[aria-label="Bulan berikutnya"]');
  const after = await page.$eval('[aria-label="Kalender kegiatan"] h2', el => el.textContent);
  results.interactions.push({ name: "Calendar next month", pass: before !== after });
  await page.click('[aria-label="Bulan sebelumnya"]');
  await page.click('[data-date$="-15"]');
  results.interactions.push({ name: "Calendar tap date", pass: await page.$eval('[data-date$="-15"]', el => el.getAttribute("aria-pressed") === "true") });
  await page.keyboard.press("ArrowRight");
  results.interactions.push({ name: "Calendar arrow keyboard", pass: await page.$eval('[data-date$="-16"]', el => el.getAttribute("aria-pressed") === "true" && el === document.activeElement) });
  await page.select("select", "");
  results.interactions.push({ name: "Filter preserves date", pass: await page.$eval('[data-date$="-16"]', el => el.getAttribute("aria-pressed") === "true") });
  await page.goto(base + "/berita", { waitUntil: "networkidle2" });
  await page.type('input[name="q"]', "zz-no-result-qa");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => new URL(location.href).searchParams.get("q") === "zz-no-result-qa");
  await page.waitForFunction(() => document.querySelector("main")?.textContent.includes("Tidak ada warta yang sesuai"));
  results.interactions.push({ name: "News search submits query", pass: page.url().includes("q=zz-no-result-qa") });
  await page.goto(base + "/berita?page=Infinity", { waitUntil: "networkidle2" });
  results.interactions.push({ name: "Invalid news page remains usable", pass: await page.$eval("h1", el => el.textContent.includes("Warta")) });
  await page.goto(base + "/berita?page=99999", { waitUntil: "networkidle2" });
  results.interactions.push({ name: "Out of range news page redirects", pass: !page.url().includes("page=99999") });
  let posts = 0;
  let failPrograms = true;
  page.on("request", request => {
    if (failPrograms && request.url().includes("/api/public/study-programs")) {
      expected503ConsoleErrors++;
      request.respond({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { message: "Service unavailable" } }) });
    } else if (request.method() === "POST" && request.url().includes("/api/")) {
      posts++;
      expected503ConsoleErrors++;
      request.respond({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { message: "Koneksi pengujian terputus" } }) });
    } else request.continue();
  });
  await page.setRequestInterception(true);
  await page.goto(base + "/auth/daftar", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[role="alert"]');
  await page.type('input[name="name"]', "Input dipertahankan");
  results.interactions.push({ name: "Program load failure disables registration", pass: await page.$eval('button[type="submit"]', el => el.disabled) });
  failPrograms = false;
  await page.click('[role="alert"] button');
  await page.waitForFunction(() => !document.querySelector('select[name="program_studi_id"]').disabled);
  results.interactions.push({ name: "Program retry restores options and preserves input", pass: await page.$eval('input[name="name"]', el => el.value === "Input dipertahankan") });
  await page.goto(base + "/portal/aspirasi/baru", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[type="text"]');
  await page.type('input[type="text"]', "QA tidak dikirim");
  await page.type("textarea", "Pemeriksaan error, tidak dikirim ke server.");
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="alert"]');
  results.interactions.push({ name: "Aspiration failure retains input and releases submit", pass: await page.evaluate(() => document.querySelector('input[type="text"]').value === "QA tidak dikirim" && !document.querySelector('button[type="submit"]').disabled) });
  results.interactions.push({ name: "One intercepted submit, no server write", pass: posts === 1 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  results.interactions.push({ name: "Reduced motion CSS", pass: await page.evaluate(() => getComputedStyle(document.querySelector("button")).transitionDuration.split(",").every(value => parseFloat(value) < .01)) });
} finally {
  await fs.writeFile(output + "/browser-results.json", JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ pages: results.pages.length, overflows: results.pages.filter(p => p.overflow), interactions: results.interactions, pageErrors: results.pageErrors, consoleErrors: [...new Set(results.consoleErrors)] }, null, 2));

if (results.pages.some(p => p.status !== 200 || p.overflow || p.unlabeledButtons || !p.h1) || results.interactions.some(item => !item.pass) || results.pageErrors.length || results.consoleErrors.length) process.exitCode = 1;
