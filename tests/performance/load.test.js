import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  
  test('API endpoints respond within acceptable time', async ({ page }) => {
    const start = Date.now();
    
    // Test health endpoint
    const healthResponse = await page.request.get('http://localhost:3001/api/health');
    const healthTime = Date.now() - start;
    
    expect(healthResponse.status()).toBe(200);
    expect(healthTime).toBeLessThan(500); // 500ms threshold
    
    // Test restaurants endpoint
    const restaurantsStart = Date.now();
    const restaurantsResponse = await page.request.get('http://localhost:3001/api/restaurants');
    const restaurantsTime = Date.now() - restaurantsStart;
    
    expect(restaurantsResponse.status()).toBe(200);
    expect(restaurantsTime).toBeLessThan(1000); // 1 second threshold
    
    // Test menu endpoint
    const menuStart = Date.now();
    const menuResponse = await page.request.get('http://localhost:3001/api/menu/1');
    const menuTime = Date.now() - menuStart;
    
    expect(menuResponse.status()).toBe(200);
    expect(menuTime).toBeLessThan(1000); // 1 second threshold
    
    // Test analytics endpoint
    const analyticsStart = Date.now();
    const analyticsResponse = await page.request.get('http://localhost:3001/api/admin/analytics/dashboard');
    const analyticsTime = Date.now() - analyticsStart;
    
    expect(analyticsResponse.status()).toBe(200);
    expect(analyticsTime).toBeLessThan(2000); // 2 second threshold
  });

  test('Frontend pages load quickly', async ({ page }) => {
    // Test home page load time
    const homeStart = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForSelector('text=Taste of India');
    const homeLoadTime = Date.now() - homeStart;
    
    expect(homeLoadTime).toBeLessThan(3000); // 3 second threshold
    
    // Test menu page load time
    const menuStart = Date.now();
    await page.goto('http://localhost:3000/menu');
    await page.waitForSelector('text=Our Menu');
    const menuLoadTime = Date.now() - menuStart;
    
    expect(menuLoadTime).toBeLessThan(4000); // 4 second threshold
    
    // Test reservations page load time
    const reservationsStart = Date.now();
    await page.goto('http://localhost:3000/reservations');
    await page.waitForSelector('text=Make a Reservation');
    const reservationsLoadTime = Date.now() - reservationsStart;
    
    expect(reservationsLoadTime).toBeLessThan(3000); // 3 second threshold
  });

  test('Admin pages load quickly', async ({ page }) => {
    // Login to admin panel
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // Test dashboard load time
    const dashboardStart = Date.now();
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    await page.waitForSelector('text=Admin Dashboard');
    const dashboardLoadTime = Date.now() - dashboardStart;
    
    expect(dashboardLoadTime).toBeLessThan(5000); // 5 second threshold
    
    // Test menu management load time
    const menuStart = Date.now();
    await page.click('text=Menu Management');
    await page.waitForSelector('text=Menu Management');
    const menuLoadTime = Date.now() - menuStart;
    
    expect(menuLoadTime).toBeLessThan(3000); // 3 second threshold
    
    // Test orders page load time
    const ordersStart = Date.now();
    await page.click('text=Orders');
    await page.waitForSelector('text=Orders Management');
    const ordersLoadTime = Date.now() - ordersStart;
    
    expect(ordersLoadTime).toBeLessThan(3000); // 3 second threshold
  });

  test('Database queries are optimized', async ({ page }) => {
    // Test menu query performance
    const menuStart = Date.now();
    const menuResponse = await page.request.get('http://localhost:3001/api/menu/1');
    const menuTime = Date.now() - menuStart;
    
    expect(menuResponse.status()).toBe(200);
    expect(menuTime).toBeLessThan(1000); // 1 second threshold
    
    // Test orders query performance
    const ordersStart = Date.now();
    const ordersResponse = await page.request.get('http://localhost:3001/api/admin/orders');
    const ordersTime = Date.now() - ordersStart;
    
    expect(ordersResponse.status()).toBe(200);
    expect(ordersTime).toBeLessThan(1500); // 1.5 second threshold
    
    // Test reservations query performance
    const reservationsStart = Date.now();
    const reservationsResponse = await page.request.get('http://localhost:3001/api/admin/reservations');
    const reservationsTime = Date.now() - reservationsStart;
    
    expect(reservationsResponse.status()).toBe(200);
    expect(reservationsTime).toBeLessThan(1500); // 1.5 second threshold
  });

  test('Concurrent user simulation', async ({ browser }) => {
    // Create multiple browser contexts to simulate concurrent users
    const contexts = [];
    const pages = [];
    
    try {
      // Create 5 concurrent users
      for (let i = 0; i < 5; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }
      
      // All users navigate to menu page simultaneously
      const startTime = Date.now();
      const promises = pages.map(page => 
        page.goto('http://localhost:3000/menu').then(() => 
          page.waitForSelector('text=Our Menu')
        )
      );
      
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All pages should load within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 second threshold
      
      // Test concurrent API calls
      const apiStartTime = Date.now();
      const apiPromises = pages.map(page => 
        page.request.get('http://localhost:3001/api/menu/1')
      );
      
      const responses = await Promise.all(apiPromises);
      const apiTotalTime = Date.now() - apiStartTime;
      
      // All API calls should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
      
      // API calls should complete within reasonable time
      expect(apiTotalTime).toBeLessThan(5000); // 5 second threshold
      
    } finally {
      // Clean up contexts
      await Promise.all(contexts.map(context => context.close()));
    }
  });

  test('Memory usage is reasonable', async ({ page }) => {
    // Navigate to multiple pages to test memory usage
    await page.goto('http://localhost:3000');
    await page.waitForSelector('text=Taste of India');
    
    await page.goto('http://localhost:3000/menu');
    await page.waitForSelector('text=Our Menu');
    
    await page.goto('http://localhost:3000/reservations');
    await page.waitForSelector('text=Make a Reservation');
    
    // Get memory usage
    const memoryUsage = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (memoryUsage) {
      // Memory usage should be reasonable (less than 100MB)
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
    }
  });

  test('Image loading performance', async ({ page }) => {
    // Navigate to menu page which has images
    await page.goto('http://localhost:3000/menu');
    await page.waitForSelector('text=Our Menu');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check if images are loaded
    const images = await page.locator('img').all();
    expect(images.length).toBeGreaterThan(0);
    
    // Verify images have loaded
    for (const img of images) {
      const isLoaded = await img.evaluate((el) => el.complete && el.naturalHeight !== 0);
      expect(isLoaded).toBe(true);
    }
  });

  test('Form submission performance', async ({ page }) => {
    // Test reservation form submission
    await page.goto('http://localhost:3000/reservations');
    await page.waitForSelector('text=Make a Reservation');
    
    // Fill form
    await page.fill('[data-testid="customer-name"]', 'Test Customer');
    await page.fill('[data-testid="customer-phone"]', '+260123456789');
    await page.fill('[data-testid="customer-email"]', 'test@example.com');
    await page.fill('[data-testid="date-time"]', '2024-01-25T19:00');
    await page.fill('[data-testid="party-size"]', '4');
    await page.selectOption('[data-testid="restaurant-select"]', '1');
    
    // Submit form and measure time
    const submitStart = Date.now();
    await page.click('[data-testid="book-reservation"]');
    
    // Wait for response (success or error)
    await page.waitForSelector('text=Reservation Confirmed!', { timeout: 10000 });
    const submitTime = Date.now() - submitStart;
    
    expect(submitTime).toBeLessThan(5000); // 5 second threshold
  });

  test('Search functionality performance', async ({ page }) => {
    // Navigate to menu page
    await page.goto('http://localhost:3000/menu');
    await page.waitForSelector('text=Our Menu');
    
    // Test search performance
    const searchStart = Date.now();
    await page.fill('[data-testid="menu-search"]', 'biryani');
    
    // Wait for search results
    await page.waitForSelector('text=Chicken Biryani', { timeout: 5000 });
    const searchTime = Date.now() - searchStart;
    
    expect(searchTime).toBeLessThan(2000); // 2 second threshold
    
    // Test category filtering performance
    const filterStart = Date.now();
    await page.click('[data-testid="category-appetizers"]');
    
    // Wait for filtered results
    await page.waitForSelector('text=Appetizers', { timeout: 5000 });
    const filterTime = Date.now() - filterStart;
    
    expect(filterTime).toBeLessThan(2000); // 2 second threshold
  });

  test('Mobile performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test mobile page load
    const mobileStart = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForSelector('text=Taste of India');
    const mobileLoadTime = Date.now() - mobileStart;
    
    expect(mobileLoadTime).toBeLessThan(4000); // 4 second threshold for mobile
    
    // Test mobile menu navigation
    await page.click('[data-testid="mobile-menu-button"]');
    await page.waitForSelector('[data-testid="mobile-menu"]');
    
    const menuClickStart = Date.now();
    await page.click('[data-testid="mobile-menu"] a[href="/menu"]');
    await page.waitForSelector('text=Our Menu');
    const menuClickTime = Date.now() - menuClickStart;
    
    expect(menuClickTime).toBeLessThan(3000); // 3 second threshold
  });

  test('Error handling performance', async ({ page }) => {
    // Test 404 page load time
    const notFoundStart = Date.now();
    await page.goto('http://localhost:3000/nonexistent-page');
    await page.waitForSelector('text=Page Not Found', { timeout: 5000 });
    const notFoundTime = Date.now() - notFoundStart;
    
    expect(notFoundTime).toBeLessThan(2000); // 2 second threshold
    
    // Test API error response time
    const apiErrorStart = Date.now();
    const response = await page.request.get('http://localhost:3001/api/nonexistent-endpoint');
    const apiErrorTime = Date.now() - apiErrorStart;
    
    expect(response.status()).toBe(404);
    expect(apiErrorTime).toBeLessThan(1000); // 1 second threshold
  });

  test('Caching performance', async ({ page }) => {
    // First request
    const firstRequestStart = Date.now();
    await page.goto('http://localhost:3000/menu');
    await page.waitForSelector('text=Our Menu');
    const firstRequestTime = Date.now() - firstRequestStart;
    
    // Second request (should be faster due to caching)
    const secondRequestStart = Date.now();
    await page.goto('http://localhost:3000/menu');
    await page.waitForSelector('text=Our Menu');
    const secondRequestTime = Date.now() - secondRequestStart;
    
    // Second request should be faster
    expect(secondRequestTime).toBeLessThan(firstRequestTime);
    
    // Test API caching
    const firstApiStart = Date.now();
    await page.request.get('http://localhost:3001/api/menu/1');
    const firstApiTime = Date.now() - firstApiStart;
    
    const secondApiStart = Date.now();
    await page.request.get('http://localhost:3001/api/menu/1');
    const secondApiTime = Date.now() - secondApiStart;
    
    // Second API call should be faster
    expect(secondApiTime).toBeLessThan(firstApiTime);
  });
});
