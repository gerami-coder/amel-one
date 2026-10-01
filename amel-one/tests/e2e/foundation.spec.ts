import { test, expect } from "@playwright/test";
test("marketing and demo are responsive and navigable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Great events. A better beginning." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Take a look around" }).click();
  await expect(
    page.getByRole("heading", { name: "Your events, coming together." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("signup validates before creating an account", async ({ page }) => {
  await page.goto("/signup");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByText("Enter your full name.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
});
test("dashboard requires a real session", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
});
test("unavailable routes offer recovery", async ({ page }) => {
  await page.goto("/missing-event");
  await expect(
    page.getByRole("heading", { name: "This link leads somewhere else." }),
  ).toBeVisible();
});
