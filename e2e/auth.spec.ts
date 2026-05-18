import { expect, test } from "@playwright/test";

import { uniqueUsername } from "./helpers/backend";

test("user can register, log in, and get redirected away from protected profile after logout", async ({
  page,
}) => {
  const username = uniqueUsername("auth");
  const password = "secret123";
  const name = "E2E Student";

  await page.goto("/register");

  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Display name").fill(name);
  await page.getByRole("textbox", { name: /^Password$/ }).fill(password);
  await page.getByRole("textbox", { name: /^Repeat password$/ }).fill(password);
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page.getByText("Account created")).toBeVisible();
  await page.getByRole("button", { name: "Go to login" }).click();

  await expect(page).toHaveURL(/\/login\?registered=1$/);
  await page.getByLabel("Username").fill(username);
  await page.getByRole("textbox", { name: /^Password$/ }).fill(password);
  await page.locator("form").getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await expect(page.getByText(`@${username}`)).toBeVisible();
  await expect(page.getByRole("cell", { name })).toBeVisible();

  await page.getByRole("button", { name: new RegExp(name) }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login\?redirect=%2Fprofile$/);
});
