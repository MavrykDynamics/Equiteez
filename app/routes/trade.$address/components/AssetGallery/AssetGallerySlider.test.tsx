// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { CustomPopupProps } from "~/lib/organisms/CustomPopup/CustomPopup";
import { AssetGallerySlider } from "./AssetGallerySlider";

vi.mock("@remix-run/react", () => ({
  useLocation: () => ({ pathname: "/trade/asset" }),
}));
vi.mock("embla-carousel-react", () => ({ default: () => [null, undefined] }));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ isOpen, children, contentLabel }: CustomPopupProps) =>
    isOpen ? (
      <div role="dialog" aria-label={contentLabel}>
        {children}
      </div>
    ) : null,
}));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  vi.unstubAllGlobals();
});

function click(label: string) {
  const button = container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`
  );
  expect(button).not.toBeNull();
  act(() => button!.click());
}

it("opens a single image directly in full view without navigation and closes to the page", () => {
  act(() =>
    root.render(<AssetGallerySlider images={["one.jpg"]} name="Asset" />)
  );
  expect(
    container.querySelector('[aria-label="Previous gallery items"]')
  ).toBeNull();
  expect(
    container.querySelector('[aria-label="Next gallery items"]')
  ).toBeNull();
  click("Open Asset, view 1 in gallery");
  const dialog = container.querySelector('[role="dialog"]');
  expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  expect(dialog?.getAttribute("aria-label")).toBe("Asset, view 1");
  expect(dialog?.querySelector("img")?.getAttribute("src")).toBe("one.jpg");
  expect(dialog?.querySelector('[aria-label="Previous image"]')).toBeNull();
  expect(dialog?.querySelector('[aria-label="Next image"]')).toBeNull();
  expect(dialog?.textContent).not.toContain("1 / 1");
  click("Close gallery");
  expect(container.querySelector('[role="dialog"]')).toBeNull();
  click("Open Asset, view 1 in gallery");
  expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(1);
});

it("preserves the gallery overview and full-view navigation for multiple images", () => {
  act(() =>
    root.render(
      <AssetGallerySlider images={["one.jpg", "two.jpg"]} name="Asset" />
    )
  );
  expect(
    container.querySelector('[aria-label="Previous gallery items"]')
  ).not.toBeNull();
  expect(
    container.querySelector('[aria-label="Next gallery items"]')
  ).not.toBeNull();
  click("Open Asset, view 1 in gallery");
  expect(
    container.querySelector('[role="dialog"]')?.getAttribute("aria-label")
  ).toBe("Asset gallery");
  click("Open Asset, view 1 full size");
  click("Next image");
  expect(
    container
      .querySelector('[role="dialog"][aria-label="Asset, view 2"] img')
      ?.getAttribute("src")
  ).toBe("two.jpg");
  click("Back to full gallery");
  expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  click("Close gallery");
  expect(container.querySelector('[role="dialog"]')).toBeNull();
});

it("renders nothing when the gallery has no images", () => {
  act(() => root.render(<AssetGallerySlider images={[]} name="Asset" />));
  expect(container.innerHTML).toBe("");
});
