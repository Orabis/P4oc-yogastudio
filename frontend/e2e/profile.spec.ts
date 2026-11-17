import {expect, login, test, user} from './fixtures';

test.describe('Account', () => {
  test("affiche les infos de l'utilisateur", async ({page}) => {
    await login(page, user);
    await page.getByRole('link', {name: 'Profile'}).click();
    await expect(page.getByRole('heading', {name: 'My Profile'})).toBeVisible();
    await expect(page.getByText('John')).toBeVisible();
    await expect(page.getByText('Doe')).toBeVisible();
    await expect(page.getByText(user.email)).toBeVisible();
    await expect(page.getByText('User', {exact: true})).toBeVisible();
  });

  test('logout', async ({page}) => {
    await login(page, user);
    await page.getByRole('button', {name: 'Logout'}).click();
    await expect(page).toHaveURL('/login');
    await page.goto('/sessions');
    await expect(page).toHaveURL('/login');
  });

  test('suppression du compte', async ({page}) => {
    const account = {email: `delete${Date.now()}@test.com`, password: 'password123'};
    await page.request.post('/api/auth/register', {data: {...account, firstName: 'Del', lastName: 'Ete'}});
    await login(page, account);
    await page.goto('/profile');
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', {name: 'Delete Account'}).click();
    await expect(page).toHaveURL('/login');
  });
});
