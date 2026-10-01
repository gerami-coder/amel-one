import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
test("real login, organization onboarding and logout persist", async ({
  page,
}) => {
  test.skip(
    !existsSync(".test-fixture.json"),
    "Requires an explicitly provisioned disposable development identity.",
  );
  const fixture = JSON.parse(readFileSync(".test-fixture.json", "utf8")) as {
    email: string;
    password: string;
  };
  await page.goto("/login");
  await page.getByLabel("Work email").fill(fixture.email);
  await page.getByLabel("Password", { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/(onboarding|dashboard)$/, { timeout: 20000 });
  await expect(
    page.getByRole("button", { name: "Create workspace", exact: true }).or(
      page.getByRole("heading", {
        name: "Welcome to Verification workspace.",
      }),
    ),
  ).toBeVisible({ timeout: 20000 });
  if (
    await page
      .getByRole("button", { name: "Create workspace", exact: true })
      .isVisible()
  ) {
    await page.getByLabel("Organization name").fill("Verification workspace");
    await page
      .getByRole("button", { name: "Create workspace", exact: true })
      .click();
  }
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20000 });
  await expect(
    page.getByRole("heading", { name: "Welcome to Verification workspace." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome to Verification workspace." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
