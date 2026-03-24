import { test, expect, type Page, type Locator } from '@playwright/test';

class SignUpPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly jobTitleInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly acceptCookiesBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('SignUpForm__Name--Input');
    this.jobTitleInput = page.getByTestId('SignUpForm__JobTitle--Input');
    this.phoneInput = page.getByTestId('SignUpForm__Phone--Input');
    this.emailInput = page.getByTestId('SignUpForm__Email--Input');
    this.submitButton = page.locator('button').filter({ hasText: /Join Xometry/i });
    this.acceptCookiesBtn = page.locator('button[data-testid="uc-accept-all-button"]');
  }

  async goto() {
    await this.page.goto('/sign_up', { waitUntil: 'networkidle' });
    await this.handleCookies();
  }

  async handleCookies() {
    try {
      await this.acceptCookiesBtn.waitFor({ state: 'visible', timeout: 3000 });
      await this.acceptCookiesBtn.click();
    } catch (e) {}
  }

  async fillForm(email: string) {
    await this.nameInput.fill('Mikle');
    await this.jobTitleInput.fill('QA');
    await this.phoneInput.fill('+38161123456');
    
    await this.emailInput.click({ clickCount: 3 });
    await this.page.keyboard.press('Backspace');
    
    if (email !== '') {
        await this.emailInput.fill(email);
    }
    
    // Кликаем и даем сайту время подумать (важно при проверке капчи)
    await this.submitButton.click();
    await this.page.waitForTimeout(1000); 
  }
}

test.describe('Registration Form - Full Suite (9 Cases)', () => {
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.goto();
  });

  // 1. ПОЗИТИВНЫЙ
  test('Success: Valid registration data', async ({ page }) => {
    await signUpPage.fillForm('new.test.user.beograd@xometry.eu');
    const error = page.locator('text=Wrong email format');
    await expect(error).toBeHidden();
  });

  // 2. ОБЯЗАТЕЛЬНОЕ ПОЛЕ (Уточненный локатор)
  test('Error: Required email field', async ({ page }) => {
    await signUpPage.fillForm('');
    // Ищем Required ТОЛЬКО внутри контейнера Email
    const emailError = page.locator('[data-testid="SignUpForm__Email"]').locator('text=Required');
    await expect(emailError).toBeVisible({ timeout: 10000 });
  });

  // 3. ДУБЛИКАТ
  test('Error: Email already exists', async ({ page }) => {
    await signUpPage.fillForm('mikhail.petrov@example.com');
    await expect(page.locator('text=Email already exists')).toBeVisible({ timeout: 15000 });
  });

  // 4. ОШИБКИ ФОРМАТА
  const invalidFormats = [
    { email: 'plainaddress', desc: 'без собаки' },
    { email: 'user@', desc: 'без домена' },
    { email: '@domain.com', desc: 'без имени' },
    { email: 'user@domain..com', desc: 'двойная точка' },
    { email: 'user@domain', desc: 'без TLD' },
    { email: 'user#domain.com', desc: 'спецсимвол' }
  ];

  for (const tc of invalidFormats) {
    test(`Error format: ${tc.desc}`, async ({ page }) => {
      await signUpPage.fillForm(tc.email);
      // Увеличиваем таймаут на случай тормозов из-за защиты сайта
      const errorMsg = page.locator('text=Wrong email format');
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
    });
  }
});