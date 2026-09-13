import "@testing-library/jest-dom";
import { JSDOM } from "jsdom";

if (typeof document === "undefined") {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost/",
  });
  const win = dom.window;
  globalThis.window = win as unknown as Window & typeof globalThis;
  globalThis.document = win.document;
  globalThis.navigator = win.navigator;
  globalThis.localStorage = win.localStorage;
  globalThis.HTMLAnchorElement = win.HTMLAnchorElement;
  globalThis.Blob = win.Blob;
  globalThis.URL = win.URL;
}

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}
