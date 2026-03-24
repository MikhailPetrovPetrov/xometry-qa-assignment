import { Page, Locator } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('https://get.preprod.xometry.eu/sign_up');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
    await this.emailInput.press('Tab'); 
  }
}