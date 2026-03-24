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
    // Кнопка из виджета Usercentrics
    this.acceptCookiesBtn = page.locator('button[data-testid="uc-accept-all-button"]');
  }

  async goto() {
    await this.page.goto('/sign_up', { waitUntil: 'networkidle' });
    await this.handleCookies();
  }

  async handleCookies() {
    try {
      // Ждем баннер совсем недолго, чтобы не тормозить тест, если его нет
      await this.acceptCookiesBtn.waitFor({ state: 'visible', timeout: 3000 });
      await this.acceptCookiesBtn.click();
      console.log('✅ Куки приняты');
    } catch (e) {
      console.log('ℹ️ Баннер куки не появился, продолжаем');
    }
  }

  async fillForm(email: string) {
    // Используем fill для скорости, так как на видео капчи не было
    await this.nameInput.fill('Mikle');
    await this.jobTitleInput.fill('QA');
    await this.phoneInput.fill('+381000000000');
    
    // Очистка и ввод email
    await this.emailInput.click({ clickCount: 3 });
    await this.page.keyboard.press('Backspace');
    await this.emailInput.fill(email);
    
    await this.submitButton.click();
  }
}

test.describe('Email Validation Suite', () => {
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.goto();
  });

  const negativeCases = [
    { email: 'plainaddress', desc: 'без собаки' },
    { email: 'user@', desc: 'без домена' },
    { email: 'user@domain..com', desc: 'двойная точка' },
    { email: 'user@domain', desc: 'без TLD' },
  ];

  for (const tc of negativeCases) {
    test(`Кейс: ${tc.desc}`, async ({ page }) => {
      await signUpPage.fillForm(tc.email);
      const error = page.locator('text=Wrong email format');
      await expect(error).toBeVisible({ timeout: 10000 });
      console.log(`✅ Ошибка валидации подтверждена для: ${tc.email}`);
    });
  }

  test('Позитивный кейс: Валидный email', async ({ page }) => {
    await signUpPage.fillForm('test.user@xometry.eu');
    const error = page.locator('text=Wrong email format');
    await expect(error).toBeHidden();
    console.log('✅ Валидный email прошел проверку');
  });
});