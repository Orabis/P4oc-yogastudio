import {Page} from '@playwright/test';
import {admin, createSession, expect, login, test, uniqueName} from './fixtures';

const fillForm = async (page: Page, name: string, description: string) => {
  await page.locator('input[name=name]').fill(name);
  await page.locator('input[name=date]').fill('2030-07-01');
  await page.locator('select[name=teacherId]').selectOption('1');
  await page.locator('textarea[name=description]').fill(description);
};

test.describe('Session form', () => {
  test.beforeEach(async ({page}) => {
    await login(page, admin);
  });

  test('création OK', async ({page}) => {
    const name = uniqueName('Created');
    await page.goto('/sessions/create');
    await fillForm(page, name, 'Nouvelle séance');
    await page.getByRole('button', {name: 'Create Session'}).click();
    await expect(page).toHaveURL('/sessions');
    await expect(page.getByText(name)).toBeVisible();
  });

  test('erreur si un champ est manquant', async ({page}) => {
    await page.goto('/sessions/create');
    await fillForm(page, uniqueName('Missing'), '');
    await page.getByRole('button', {name: 'Create Session'}).click();
    await expect(page).toHaveURL('/sessions/create');
    await expect(page.locator('textarea[name=description]:invalid')).toBeVisible();
  });

  test('modification OK', async ({page, request}) => {
    const name = uniqueName('ToEdit');
    const {id} = await createSession(request, name);
    await page.goto(`/sessions/${id}`);
    await page.getByRole('button', {name: 'Edit'}).click();
    await expect(page.locator('input[name=name]')).toHaveValue(name);
    const updated = uniqueName('Edited');
    await page.locator('input[name=name]').fill(updated);
    await page.getByRole('button', {name: 'Update Session'}).click();
    await expect(page).toHaveURL('/sessions');
    await expect(page.getByText(updated)).toBeVisible();
  });
});
