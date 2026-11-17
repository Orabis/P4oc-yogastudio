import {admin, createSession, expect, login, test, uniqueName, user} from './fixtures';

test.describe('Session detail', () => {
  test('affiche les infos, sans Delete pour un utilisateur', async ({page, request}) => {
    const name = uniqueName('Detail');
    const {id} = await createSession(request, name);
    await login(page, user);
    await page.goto(`/sessions/${id}`);
    await expect(page.getByRole('heading', {name})).toBeVisible();
    await expect(page.getByText(`Description ${name}`)).toBeVisible();
    await expect(page.getByText('Margot Delahaye')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Delete'})).toHaveCount(0);
    await page.getByRole('button', {name: 'Join Session'}).click();
    await page.getByRole('button', {name: 'Leave Session'}).click();
    await expect(page.getByRole('button', {name: 'Join Session'})).toBeVisible();
  });

  test("l'admin supprime la session", async ({page, request}) => {
    const name = uniqueName('Delete');
    const {id} = await createSession(request, name);
    await login(page, admin);
    await page.goto(`/sessions/${id}`);
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', {name: 'Delete'}).click();
    await expect(page).toHaveURL('/sessions');
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
