import { test, expect } from "@playwright/test";
test("lessons render cleanly and core interactions work", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Add two", exact: true }).click();
  await expect(page.locator("output")).toHaveText("2");
  const links = page.locator("nav button");
  for (let i = 0; i < (await links.count()); i++) {
    await links.nth(i).click();
    await expect(page.locator("article h2")).toBeVisible();
    await expect(page.locator("pre")).toContainText("// use");
  }
  await page.getByRole("button", { name: "Toggle resource read" }).click();
  await expect(page.locator(".demo")).toContainText(
    "Conditionally read context: mint",
  );
  await links.nth(3).click();
  await page.getByRole("button", { name: "Focus input", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Focus target" }),
  ).toBeFocused();
  await links.nth(10).click();
  await page
    .getByLabel("What does an Effect synchronize?")
    .fill("An external system");
  await page.getByRole("button", { name: "Save answer" }).click();
  await expect(page.getByRole("button", { name: "Saving…" })).toBeDisabled();
  await expect(page.locator('p[role="status"]')).toContainText(
    "Saved: An external system",
  );
  await links.nth(11).click();
  await page.getByRole("button", { name: "Like answer" }).click();
  await expect(page.locator("output")).toHaveText("1 likes");
  await expect(page.locator('p[role="status"]')).toHaveText("Confirmed");
  await page.getByLabel("Simulate failure").check();
  await page.getByRole("button", { name: "Like answer" }).click();
  await expect(page.locator("output")).toHaveText("2 likes");
  await expect(page.locator('p[role="status"]')).toContainText("Request failed");
  await expect(page.locator("output")).toHaveText("1 likes");
  await links.nth(4).click();
  await page.getByRole("button", { name: "Start timer" }).click();
  await expect(page.locator("output")).toHaveText("1s", { timeout: 3000 });
  await page.getByRole("button", { name: "Pause timer" }).click();
  await page.waitForTimeout(1200);
  await expect(page.locator("output")).toHaveText("1s");
  expect(errors).toEqual([]);
});
test("mobile navigation and search remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("textbox", { name: "Find a hook" }).fill("useRef");
  await expect(page.locator("nav button")).toHaveCount(1);
  await page.locator("nav button").click();
  await expect(page.locator("article h2")).toHaveText("useRef");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
