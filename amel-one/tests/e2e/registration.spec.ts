import { test, expect } from "@playwright/test";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
test("complete event setup, public registration and organizer review", async ({
  page,
  browser,
}, info) => {
  test.setTimeout(120000);
  test.skip(
    !existsSync(".test-fixture.json"),
    "Requires disposable development identity.",
  );
  const fixture = JSON.parse(readFileSync(".test-fixture.json", "utf8")) as {
    email: string;
    password: string;
  };
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const suffix = crypto.randomUUID().slice(0, 8);
  const slug = "journey-" + suffix;
  await page.goto("/login");
  await page.getByLabel("Work email").fill(fixture.email);
  await page.getByLabel("Password", { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("link", { name: "Create event", exact: true }).click();
  await page
    .getByLabel("Event name", { exact: true })
    .fill("Community Exchange " + suffix);
  await page.getByLabel("Event link", { exact: true }).fill(slug);
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/events\/[a-f0-9-]+$/);
  const eventUrl = page.url();
  await page
    .getByLabel("Description", { exact: true })
    .fill(
      "A clearly fictional gathering for testing a thoughtful registration experience.",
    );
  await page
    .getByLabel("Location", { exact: true })
    .fill("Demo Hall, Addis Ababa");
  await page.getByRole("tab", { name: "Basics" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Registration types" })).toBeFocused();
  await page.getByRole("button", { name: "Add registration type" }).click();
  await page.getByLabel("Type name").fill("Community guest");
  await page.getByLabel("Capacity", { exact: true }).fill("2");
  await page.getByLabel("Review registrations before approving").check();
  await page.getByRole("tab", { name: "Form", exact: false }).click();
  await page.getByRole("button", { name: "Select", exact: true }).click();
  await page.getByLabel("Field label").fill("Country");
  await page.getByLabel("Options", { exact: true }).fill("Ethiopia\nKenya");
  await page.getByLabel("Required answer").check();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.getByLabel("Field label").fill("Company");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByRole("button", { name: "Move Company up", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await page.getByRole("tab", { name: "Branding" }).click();
  await page.getByLabel("Event logo", { exact: true }).setInputFiles({
    name: "demo-logo.png", mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=", "base64"),
  });
  await expect(page.getByRole("img", { name: "Event logo", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "clay", exact: true }).click();
  await page.getByLabel("Welcome heading").fill("An invitation to connect.");
  await page.getByRole("button", { name: "Save now", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("All changes saved", {
    timeout: 20000,
  });
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "An invitation to connect." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Preview only" }),
  ).toBeDisabled();
  await page
    .getByRole("link", { name: "Return to setup", exact: false })
    .click();
  await page.getByRole("tab", { name: "Publish", exact: false }).click();
  await page
    .getByRole("button", { name: "Publish event", exact: true })
    .click();
  await expect(page).toHaveURL(/\/preview\?published=1$/, { timeout: 20000 });
  const visitor = await browser.newPage({
    viewport: page.viewportSize() ?? { width: 1280, height: 800 },
  });
  visitor.on("pageerror", (e) => errors.push(e.message));
  const base = new URL(page.url()).origin;
  await visitor.goto(base + "/e/" + slug);
  await expect(visitor.getByRole("img", { name: "Community Exchange " + suffix + " logo", exact: true })).toBeVisible();
  await expect(
    visitor.getByRole("heading", { name: "An invitation to connect." }),
  ).toBeVisible();
  await visitor.getByRole("button", { name: "Complete registration" }).click();
  await expect(
    visitor.getByText("Enter your full name.", { exact: true }),
  ).toBeVisible();
  await visitor
    .getByLabel("Full name", { exact: true })
    .fill("Demo Visitor " + suffix);
  await visitor
    .getByLabel("Email address", { exact: true })
    .fill(suffix + "@example.test");
  await visitor
    .getByLabel("Country *", { exact: true })
    .selectOption("Ethiopia");
  await visitor.getByLabel("Company", { exact: true }).fill("Fictional Studio");
  await visitor.getByRole("button", { name: "Complete registration" }).click();
  await expect(
    visitor.getByRole("heading", {
      name: "Your request is with the organizer.",
    }),
  ).toBeVisible({ timeout: 20000 });
  expect(
    await visitor.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  mkdirSync("../artifacts", { recursive: true });
  await visitor.screenshot({
    path: "../artifacts/phase1-confirmation-" + info.project.name + ".png",
    fullPage: true,
  });
  await page.goto(eventUrl + "/registrations");
  await page.getByLabel("Search attendees").fill(suffix);
  await page.getByRole("button", { name: "Apply filters" }).click();
  await page
    .getByRole("link", { name: "Demo Visitor " + suffix, exact: true })
    .click();
  await expect(
    page.getByText("Fictional Studio", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Ethiopia", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Approve registration" }).click();
  await expect(
    page.getByRole("button", { name: "Approve registration" }),
  ).toHaveCount(0);
  await expect(page.locator(".status.approved")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "../artifacts/phase1-organizer-" + info.project.name + ".png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
  await visitor.close();
});
