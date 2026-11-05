import { expect, test } from "@playwright/test";
import sharp from "sharp";

const token = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBA";

test("the home page does not load a pixel", async ({ page }) => {
  const pixels: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/pixel/")) pixels.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in to your workspace", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  expect(pixels).toEqual([]);
});

test("HTTP pixel works without authentication and HEAD never contains a body", async ({ request }) => {
  for (const value of [token, "invalid"]) {
    const response = await request.get(`/api/pixel/${value}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/gif");
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["set-cookie"]).toBeUndefined();
    expect(response.headers()["etag"]).toBeUndefined();
    const { data, info } = await sharp(await response.body()).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect([info.width, info.height, data[3]]).toEqual([1, 1, 0]);
  }
  const head = await request.head(`/api/pixel/${token}`);
  expect(head.status()).toBe(200);
  expect((await head.body()).byteLength).toBe(0);
  const post = await request.post(`/api/pixel/${token}`);
  expect(post.status()).toBe(405);
});

test("only an explicit fixture visit loads the absolute pixel, which a browser decodes as transparent", async ({ page }) => {
  await page.goto(`/probe/${token}`);
  const image = page.locator("#email-fragment img");
  await expect(image).toHaveAttribute("src", `http://127.0.0.1:3100/api/pixel/${token}`);
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBe(1);
  const pixel = await image.evaluate((img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    context.drawImage(img, 0, 0);
    return Array.from(context.getImageData(0, 0, 1, 1).data);
  });
  expect(pixel[3]).toBe(0);
  await page.goto("/probe/invalid");
  await expect(page.locator("img")).toHaveCount(0);
});
