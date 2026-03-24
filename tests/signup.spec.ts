import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../pages/RegistrationPage';

test.describe('Registration Form', () => {
  test('Email validation error', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.fillEmail('invalid-email');
    
    const error = page.locator('text=Invalid email address');
    await expect(error).toBeVisible();
  });
});