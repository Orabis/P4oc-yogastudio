import {expect, test} from './fixtures';

test.describe('Register', () => {
  test('création de compte OK', async ({page}) => {
    await page.goto('/register');
    await page.locator('input[name=firstName]').fill('Jane');
    await page.locator('input[name=lastName]').fill('Doe');
    await page.locator('input[name=email]').fill(`jane${Date.now()}@test.com`);
    await page.locator('input[name=password]').fill('password123');
    await page.getByRole('button', {name: 'Register'}).click();
    await expect(page).toHaveURL('/sessions');
    await expect(page.getByRole('heading', {name: 'Yoga Sessions'})).toBeVisible();
  });

  test('erreur si un champ est manquant', async ({page}) => {
    await page.goto('/register');
    await page.locator('input[name=firstName]').fill('Jane');
    await page.locator('input[name=email]').fill('jane@test.com');
    await page.locator('input[name=password]').fill('password123');
    await page.getByRole('button', {name: 'Register'}).click();
    await expect(page).toHaveURL('/register');
    await expect(page.locator('input[name=lastName]:invalid')).toBeVisible();
  });
});
