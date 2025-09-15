import { test, expect } from '@playwright/test';

test.describe('Customer User Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('http://localhost:3000');
  });

  test('Complete ordering process', async ({ page }) => {
    // 1. Navigate to menu
    await page.click('text=Menu');
    await expect(page).toHaveURL('http://localhost:3000/menu');
    
    // 2. Wait for menu to load
    await page.waitForSelector('text=Our Menu');
    
    // 3. Add items to cart
    await page.click('[data-testid="add-to-cart-1"]');
    
    // 4. Go to cart
    await page.click('[data-testid="cart-icon"]');
    
    // 5. Verify cart has items
    await expect(page.locator('text=Your Cart')).toBeVisible();
    
    // 6. Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // 7. Fill customer details
    await page.fill('[data-testid="customer-name"]', 'Test Customer');
    await page.fill('[data-testid="customer-phone"]', '+260123456789');
    await page.fill('[data-testid="customer-email"]', 'test@example.com');
    
    // 8. Select restaurant location
    await page.selectOption('[data-testid="restaurant-select"]', '1');
    
    // 9. Submit order
    await page.click('[data-testid="submit-order"]');
    
    // 10. Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    await expect(page.locator('text=Order Confirmed!')).toBeVisible();
  });

  test('Menu browsing and filtering', async ({ page }) => {
    // 1. Navigate to menu
    await page.click('text=Menu');
    await expect(page).toHaveURL('http://localhost:3000/menu');
    
    // 2. Wait for menu to load
    await page.waitForSelector('text=Our Menu');
    
    // 3. Test category filtering
    await page.click('[data-testid="category-appetizers"]');
    
    // 4. Verify only appetizers are shown
    await expect(page.locator('text=Appetizers')).toBeVisible();
    
    // 5. Test search functionality
    await page.fill('[data-testid="menu-search"]', 'samosa');
    
    // 6. Verify filtered results
    await expect(page.locator('text=Samosa')).toBeVisible();
    
    // 7. Clear search
    await page.fill('[data-testid="menu-search"]', '');
    
    // 8. Test all categories
    await page.click('[data-testid="category-all"]');
    
    // 9. Verify all items are shown
    await expect(page.locator('text=Main Courses')).toBeVisible();
  });

  test('Reservation booking process', async ({ page }) => {
    // 1. Navigate to reservations
    await page.click('text=Reservations');
    await expect(page).toHaveURL('http://localhost:3000/reservations');
    
    // 2. Wait for reservation form to load
    await page.waitForSelector('text=Make a Reservation');
    
    // 3. Fill customer information
    await page.fill('[data-testid="customer-name"]', 'Test Customer');
    await page.fill('[data-testid="customer-phone"]', '+260123456789');
    await page.fill('[data-testid="customer-email"]', 'test@example.com');
    
    // 4. Select date and time
    await page.click('[data-testid="date-picker"]');
    await page.click('text=25'); // Select 25th of current month
    
    // 5. Select time
    await page.selectOption('[data-testid="time-select"]', '19:00');
    
    // 6. Fill party size
    await page.fill('[data-testid="party-size"]', '4');
    
    // 7. Select restaurant location
    await page.selectOption('[data-testid="restaurant-select"]', '1');
    
    // 8. Add special requests
    await page.fill('[data-testid="special-requests"]', 'Window table preferred');
    
    // 9. Submit reservation
    await page.click('[data-testid="book-reservation"]');
    
    // 10. Verify reservation confirmation
    await expect(page.locator('text=Reservation Confirmed!')).toBeVisible();
  });

  test('WhatsApp order sharing', async ({ page }) => {
    // 1. Complete an order first
    await page.click('text=Menu');
    await page.waitForSelector('text=Our Menu');
    await page.click('[data-testid="add-to-cart-1"]');
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-button"]');
    
    // 2. Fill customer details
    await page.fill('[data-testid="customer-name"]', 'Test Customer');
    await page.fill('[data-testid="customer-phone"]', '+260123456789');
    await page.fill('[data-testid="customer-email"]', 'test@example.com');
    await page.selectOption('[data-testid="restaurant-select"]', '1');
    
    // 3. Submit order
    await page.click('[data-testid="submit-order"]');
    
    // 4. Wait for order confirmation
    await expect(page.locator('text=Order Confirmed!')).toBeVisible();
    
    // 5. Click WhatsApp share button
    await page.click('[data-testid="whatsapp-share"]');
    
    // 6. Verify WhatsApp window opens (this will be a new tab/window)
    // Note: In a real test, you might want to mock the WhatsApp API
    await expect(page.locator('text=Share on WhatsApp')).toBeVisible();
  });

  test('Location selection and menu filtering', async ({ page }) => {
    // 1. Navigate to menu
    await page.click('text=Menu');
    await expect(page).toHaveURL('http://localhost:3000/menu');
    
    // 2. Wait for menu to load
    await page.waitForSelector('text=Our Menu');
    
    // 3. Change location
    await page.selectOption('[data-testid="location-selector"]', '2');
    
    // 4. Verify menu updates for new location
    await expect(page.locator('text=Menu for')).toBeVisible();
    
    // 5. Test category filtering with new location
    await page.click('[data-testid="category-main-courses"]');
    
    // 6. Verify only main courses are shown
    await expect(page.locator('text=Main Courses')).toBeVisible();
  });

  test('Cart management', async ({ page }) => {
    // 1. Navigate to menu
    await page.click('text=Menu');
    await page.waitForSelector('text=Our Menu');
    
    // 2. Add multiple items to cart
    await page.click('[data-testid="add-to-cart-1"]');
    await page.click('[data-testid="add-to-cart-2"]');
    
    // 3. Open cart sidebar
    await page.click('[data-testid="cart-icon"]');
    
    // 4. Verify items are in cart
    await expect(page.locator('text=Your Cart')).toBeVisible();
    await expect(page.locator('text=Chicken Biryani')).toBeVisible();
    await expect(page.locator('text=Vegetable Samosa')).toBeVisible();
    
    // 5. Update quantities
    await page.click('[data-testid="increase-quantity-1"]');
    await page.click('[data-testid="decrease-quantity-2"]');
    
    // 6. Remove an item
    await page.click('[data-testid="remove-item-2"]');
    
    // 7. Verify item is removed
    await expect(page.locator('text=Vegetable Samosa')).not.toBeVisible();
    
    // 8. Clear cart
    await page.click('[data-testid="clear-cart"]');
    
    // 9. Verify cart is empty
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('Navigation and responsive design', async ({ page }) => {
    // 1. Test desktop navigation
    await expect(page.locator('text=Taste of India')).toBeVisible();
    await expect(page.locator('text=Menu')).toBeVisible();
    await expect(page.locator('text=Reservations')).toBeVisible();
    await expect(page.locator('text=Locations')).toBeVisible();
    await expect(page.locator('text=About')).toBeVisible();
    await expect(page.locator('text=Contact')).toBeVisible();
    
    // 2. Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 3. Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // 4. Verify mobile menu is visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // 5. Navigate using mobile menu
    await page.click('[data-testid="mobile-menu"] a[href="/menu"]');
    
    // 6. Verify navigation worked
    await expect(page).toHaveURL('http://localhost:3000/menu');
    
    // 7. Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Error handling and validation', async ({ page }) => {
    // 1. Test reservation form validation
    await page.click('text=Reservations');
    await page.waitForSelector('text=Make a Reservation');
    
    // 2. Try to submit without filling required fields
    await page.click('[data-testid="book-reservation"]');
    
    // 3. Verify validation errors
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
    
    // 4. Fill invalid phone number
    await page.fill('[data-testid="customer-phone"]', 'invalid-phone');
    await page.click('[data-testid="book-reservation"]');
    
    // 5. Verify phone validation error
    await expect(page.locator('text=Please enter a valid phone number')).toBeVisible();
    
    // 6. Fill invalid email
    await page.fill('[data-testid="customer-email"]', 'invalid-email');
    await page.click('[data-testid="book-reservation"]');
    
    // 7. Verify email validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('Performance and loading states', async ({ page }) => {
    // 1. Test page load times
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForSelector('text=Taste of India');
    const loadTime = Date.now() - startTime;
    
    // 2. Verify page loads within acceptable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // 3. Test menu loading
    const menuStartTime = Date.now();
    await page.click('text=Menu');
    await page.waitForSelector('text=Our Menu');
    const menuLoadTime = Date.now() - menuStartTime;
    
    // 4. Verify menu loads within acceptable time (3 seconds)
    expect(menuLoadTime).toBeLessThan(3000);
    
    // 5. Test loading states
    await page.click('text=Reservations');
    await expect(page.locator('text=Loading...')).toBeVisible();
    await page.waitForSelector('text=Make a Reservation');
  });

  test('Accessibility features', async ({ page }) => {
    // 1. Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // 2. Verify focus indicators
    await expect(page.locator(':focus')).toBeVisible();
    
    // 3. Test alt text for images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // 4. Test form labels
    await page.click('text=Reservations');
    await page.waitForSelector('text=Make a Reservation');
    
    const nameInput = page.locator('[data-testid="customer-name"]');
    const nameLabel = page.locator('label[for="customer-name"]');
    await expect(nameLabel).toBeVisible();
    
    // 5. Test ARIA attributes
    const cartButton = page.locator('[data-testid="cart-icon"]');
    const ariaLabel = await cartButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });
});
