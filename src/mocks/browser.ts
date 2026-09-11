import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * Browser-side Mock Service Worker.
 * The worker script itself lives at /public/mockServiceWorker.js
 * (generated via `npx msw init public`).
 */
export const worker = setupWorker(...handlers);
