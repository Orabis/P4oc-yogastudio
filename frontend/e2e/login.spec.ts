import {admin, expect, login, test} from './fixtures';

test.describe('Login', () => {
  test('connexion OK', async ({page}) => {
    await login(page, admin);
    await expect(page.getByRole('button', {name: 'Logout'})).toBeVisible();
  });

  test('erreur avec de mauvais identifiants', async ({page}) => {
    await page.goto('/login');
    await page.locator('input[type=email]').fill(admin.email);
    await page.locator('input[type=password]').fill('wrong-password');
    await page.getByRole('button', {name: 'Login'}).click();
    await expect(page.getByText(/Erreur :/)).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('erreur si un champ est manquant', async ({page}) => {
    await page.goto('/login');
    await page.locator('input[type=email]').fill(admin.email);
    await page.getByRole('button', {name: 'Login'}).click();
    await expect(page.locator('input[type=password]:invalid')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
