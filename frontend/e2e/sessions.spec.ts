import {admin, createSession, expect, login, test, uniqueName, user} from './fixtures';

test.describe('Sessions', () => {
  test('un utilisateur voit la liste sans boutons admin', async ({page, request}) => {
    const name = uniqueName('List');
    await createSession(request, name);
    await login(page, user);
    const card = page.locator('div.bg-white', {hasText: name});
    await expect(card).toBeVisible();
    await expect(card.getByRole('link', {name: 'View Details'})).toBeVisible();
    await expect(card.getByRole('button', {name: 'Delete'})).toHaveCount(0);
    await expect(page.getByRole('link', {name: 'Create Session'})).toHaveCount(0);
  });

  test("l'admin voit Create et supprime depuis la liste", async ({page, request}) => {
    const name = uniqueName('ListDelete');
    await createSession(request, name);
    await login(page, admin);
    await expect(page.getByRole('link', {name: 'Create Session'}).last()).toBeVisible();
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('div.bg-white', {hasText: name}).getByRole('button', {name: 'Delete'}).click();
    await expect(page.getByText(name)).toHaveCount(0);
  });

  test("l'admin annule la suppression", async ({page, request}) => {
    const name = uniqueName('ListKeep');
    await createSession(request, name);
    await login(page, admin);
    page.on('dialog', (dialog) => dialog.dismiss());
    await page.locator('div.bg-white', {hasText: name}).getByRole('button', {name: 'Delete'}).click();
    await expect(page.getByRole('heading', {name})).toBeVisible();
  });
});
