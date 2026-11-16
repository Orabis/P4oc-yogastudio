import {APIRequestContext, Page, expect, test as base} from '@playwright/test';
import {MCR} from 'monocart-coverage-reports';
import {coverageOptions} from './coverage';

export const admin = {email: 'yoga@studio.com', password: 'test!1234'};
export const user = {email: 'user@test.com', password: 'test!1234'};

export const test = base.extend<{ coverage: void }>({
  coverage: [async ({page}, use) => {
    await page.coverage.startJSCoverage({resetOnNavigation: false});
    await use();
    const coverage = await page.coverage.stopJSCoverage();
    await MCR(coverageOptions).add(coverage);
  }, {auto: true}],
});

export {expect};

export async function login(page: Page, account: { email: string; password: string }) {
  await page.goto('/login');
  await page.locator('input[type=email]').fill(account.email);
  await page.locator('input[type=password]').fill(account.password);
  await page.getByRole('button', {name: 'Login'}).click();
  await expect(page).toHaveURL('/sessions');
}

export async function createSession(request: APIRequestContext, name: string) {
  const auth = await request.post('/api/auth/login', {data: admin});
  const {token} = await auth.json();
  const response = await request.post('/api/session', {
    headers: {Authorization: `Bearer ${token}`},
    data: {name, date: '2030-06-15', description: `Description ${name}`, teacherId: 1},
  });
  return (await response.json()) as { id: number };
}

export const uniqueName = (prefix: string) => `${prefix} ${Date.now()}${Math.floor(Math.random() * 1000)}`;
