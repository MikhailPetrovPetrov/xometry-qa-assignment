import { Page, Locator } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    // Ищем любую кнопку, которая содержит текст "Sign up" или "Create"
    this.submitButton = page.locator('button').filter({ hasText: /Sign up|Create/i }).first();
  }

  async goto() {
    await this.page.goto('https://get.preprod.xometry.eu/sign_up');
    const acceptBtn = this.page.getByRole('button', { name: 'Accept All' });
    try {
      await acceptBtn.waitFor({ state: 'visible', timeout: 5000 });
      await acceptBtn.click();
      // Ждем, пока баннер физически исчезнет
      await this.page.waitForTimeout(1000); 
    } catch (e) {
      console.log('Баннер не найден, продолжаем...');
    }
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
    // Провоцируем валидацию: нажимаем Tab и ждем полсекунды
    await this.emailInput.press('Tab');
    await this.page.waitForTimeout(500); 
  }
}