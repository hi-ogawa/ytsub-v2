import { expect, test } from "@playwright/test";

declare const window: any;

test("Enter Youtube Video URL", async ({ page }) => {
  await page.goto("/");

  const selector = '[placeholder="Enter\\ URL\\ or\\ ID"]';
  const value = "https://www.youtube.com/watch?v=MoH8Fk2K9bc";
  await page.click("text=search");
  await page.fill(selector, value);
  await page.press(selector, "Enter");
  await page.waitForURL("/setup/MoH8Fk2K9bc");
});

test("Load VideoMetadata", async ({ page }) => {
  await page.goto("/setup/MoH8Fk2K9bc");
  await page.waitForFunction(
    () => window.document.querySelector("#mui-2").value !== ""
  );
  await expect(page.locator("#mui-1")).toHaveValue("MoH8Fk2K9bc");
  await expect(page.locator("#mui-2")).toHaveValue(
    "Learn French with Elisabeth - HelloFrench"
  );
  await expect(page.locator("#mui-3")).toHaveValue(
    "LEARN FRENCH IN 2 MINUTES – French idiom : Noyer le poisson"
  );
});
