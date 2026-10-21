import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Hero/geoid motion keeps WebKit's actionability check from settling. */
async function showStack(page: Page) {
  await page.goto('/en', { waitUntil: 'domcontentloaded' });
  await page.locator('#stack').evaluate((el) => {
    el.scrollIntoView({ block: 'center' });
  });
}

const AXE_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
];

test('stack list is in the first HTML', async ({ request }) => {
  const response = await request.get('/en');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Technologies I work with');
  expect(html).toContain('TypeScript');
  expect(html).toContain('Zustand');
  expect(html).toContain('Redis');
  expect(html).toContain('REST API design');
  expect(html).toContain('>List</button>');
});

test('cloud hydrates and category chips dim the geoid', async ({ page }) => {
  await showStack(page);
  const cloud = page.getByRole('button', { name: 'Cloud', exact: true });
  await expect(cloud).toBeEnabled();
  await expect(cloud).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: 'Switch to list view' }),
  ).toBeVisible();
  await expect(
    page.getByRole('list', { name: 'Filter by category' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Languages/ }).click({ force: true });
  await expect(page.getByRole('button', { name: /Languages/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'List', exact: true }).click({
    force: true,
  });
  await expect(page.getByRole('heading', { name: 'Languages' })).toBeVisible();
});

test('reduced motion keeps the list and disables cloud', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await showStack(page);
  await expect(
    page.getByRole('button', { name: 'Cloud', exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Languages' })).toBeVisible();
});

test('stack has no axe violations', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'axe runs on Chromium projects');
  await showStack(page);
  await expect(page.locator('[data-cloud-item]').first()).toBeAttached();
  const results = await new AxeBuilder({ page })
    .include('#stack')
    .withTags(AXE_TAGS)
    .exclude('[data-reveal=pending]')
    .exclude('[aria-hidden="true"]')
    .analyze();
  expect(results.violations).toEqual([]);
});

test('tap on a front icon announces its name', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'touch path is Pixel 7 only');
  await showStack(page);
  await expect(page.locator('[data-cloud-item]').first()).toBeAttached();
  await page.waitForFunction(() => {
    const el = document.querySelector(
      '[data-cloud-item]',
    ) as HTMLElement | null;
    return Boolean(el?.style.transform.includes('translate3d'));
  });
  const id = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[data-cloud-item]')];
    const front = nodes
      .map((el) => ({
        id: el.getAttribute('data-cloud-item'),
        z: Number((el as HTMLElement).style.zIndex) || 0,
      }))
      .sort((a, b) => b.z - a.z)[0];
    return front?.id ?? null;
  });
  expect(id).toBeTruthy();
  await page.locator(`[data-cloud-item="${id}"]`).tap({ force: true });
  await expect(page.locator('#stack [aria-live="polite"]')).not.toHaveText(
    'Hover or tap a logo to see its name.',
  );
});
