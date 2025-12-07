import type { Page } from '@playwright/test';

/**
 * Returns true if the page matches the given mobile breakpoint.
 * Uses viewportSize if available, otherwise falls back to window.matchMedia.
 */
export async function isMobileView(page: Page, breakpoint = 768): Promise<boolean> {
    const vp = page.viewportSize();
    if (vp?.width) return vp.width <= breakpoint;
    return page.evaluate((bp) => window.matchMedia(`(max-width: ${bp}px)`).matches, breakpoint);
}