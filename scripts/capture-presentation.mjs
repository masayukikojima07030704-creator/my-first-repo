import { chromium } from "playwright";
import path from "path";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "presentation");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

await page.screenshot({
  path: path.join(out, "00-dashboard-overview.png"),
  fullPage: false,
});

async function shotByHeading(filename, heading) {
  const section = page
    .locator("section.section-block")
    .filter({ has: page.locator(`:text-is("${heading}")`) })
    .first();
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await section.screenshot({ path: path.join(out, filename) });
}

await shotByHeading("01-current-location.png", "あなたの健康の現在地");
await shotByHeading("02-radar-compass.png", "Health Compass");
await shotByHeading("03-three-year-trend.png", "3年間の変化");
await shotByHeading("04-action-builder.png", "Action Prescription Builder");

const preview = page.locator(".a4-plan-screen").first();
await preview.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await preview.screenshot({ path: path.join(out, "05-a4-plan-preview.png") });

// Imaging + health type for extra slides
await shotByHeading("06-imaging-findings.png", "Imaging Findings");
await shotByHeading("07-health-type.png", "Health Type");

await page.screenshot({
  path: path.join(out, "99-fullpage.png"),
  fullPage: true,
});

console.log("Saved presentation images to", out);
await browser.close();
