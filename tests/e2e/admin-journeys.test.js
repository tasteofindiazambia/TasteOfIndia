import { test, expect } from '@playwright/test';

test.describe('Admin User Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login to admin panel before each test
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for login to complete
    await page.waitForURL('http://localhost:3000/admin/dashboard');
  });

  test('Complete menu management workflow', async ({ page }) => {
    // 1. Navigate to menu management
    await page.click('text=Menu Management');
    await expect(page).toHaveURL('http://localhost:3000/admin/menu');
    
    // 2. Wait for menu page to load
    await page.waitForSelector('text=Menu Management');
    
    // 3. Add new menu item
    await page.click('[data-testid="add-item-button"]');
    
    // 4. Fill menu item form
    await page.fill('[data-testid="item-name"]', 'Test Dish');
    await page.fill('[data-testid="item-description"]', 'Test description for new dish');
    await page.fill('[data-testid="item-price"]', '75');
    await page.selectOption('[data-testid="category-select"]', '1');
    await page.selectOption('[data-testid="restaurant-select"]', '1');
    await page.check('[data-testid="available-checkbox"]');
    await page.check('[data-testid="featured-checkbox"]');
    await page.selectOption('[data-testid="spice-level"]', 'medium');
    await page.fill('[data-testid="preparation-time"]', '20');
    await page.check('[data-testid="vegetarian-checkbox"]');
    
    // 5. Save the item
    await page.click('[data-testid="save-item"]');
    
    // 6. Verify item appears in list
    await expect(page.locator('text=Test Dish')).toBeVisible();
    await expect(page.locator('text=$75.00')).toBeVisible();
    
    // 7. Edit the item
    await page.click('[data-testid="edit-item-1"]');
    await page.fill('[data-testid="item-price"]', '80');
    await page.click('[data-testid="save-item"]');
    
    // 8. Verify price update
    await expect(page.locator('text=$80.00')).toBeVisible();
    
    // 9. Delete the item
    await page.click('[data-testid="delete-item-1"]');
    await page.click('[data-testid="confirm-delete"]');
    
    // 10. Verify item is removed
    await expect(page.locator('text=Test Dish')).not.toBeVisible();
  });

  test('Order management workflow', async ({ page }) => {
    // 1. Navigate to orders
    await page.click('text=Orders');
    await expect(page).toHaveURL('http://localhost:3000/admin/orders');
    
    // 2. Wait for orders page to load
    await page.waitForSelector('text=Orders Management');
    
    // 3. Create manual order
    await page.click('[data-testid="create-order-button"]');
    
    // 4. Fill customer information
    await page.fill('[data-testid="customer-name"]', 'Test Customer');
    await page.fill('[data-testid="customer-phone"]', '+260123456789');
    await page.fill('[data-testid="customer-email"]', 'test@example.com');
    await page.selectOption('[data-testid="restaurant-select"]', '1');
    await page.selectOption('[data-testid="order-type"]', 'dine_in');
    await page.selectOption('[data-testid="payment-method"]', 'cash');
    
    // 5. Add menu items
    await page.click('[data-testid="add-menu-item"]');
    await page.selectOption('[data-testid="menu-item-select"]', '1');
    await page.fill('[data-testid="quantity"]', '2');
    await page.fill('[data-testid="unit-price"]', '25');
    
    // 6. Save order
    await page.click('[data-testid="save-order"]');
    
    // 7. Verify order appears in list
    await expect(page.locator('text=Test Customer')).toBeVisible();
    
    // 8. Update order status
    await page.click('[data-testid="order-status-1"]');
    await page.selectOption('[data-testid="status-select"]', 'preparing');
    await page.fill('[data-testid="estimated-time"]', '20');
    await page.click('[data-testid="update-status"]');
    
    // 9. Verify status change
    await expect(page.locator('text=Preparing')).toBeVisible();
  });

  test('CSV menu upload functionality', async ({ page }) => {
    // 1. Navigate to menu management
    await page.click('text=Menu Management');
    await expect(page).toHaveURL('http://localhost:3000/admin/menu');
    
    // 2. Wait for menu page to load
    await page.waitForSelector('text=Menu Management');
    
    // 3. Upload CSV file
    await page.click('[data-testid="csv-upload-button"]');
    
    // 4. Test file upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="file-input"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(['./menu_items_data_MandaHill.csv']);
    
    // 5. Configure column mapping
    await page.selectOption('[data-testid="name-column"]', 'Name');
    await page.selectOption('[data-testid="price-column"]', 'Price');
    await page.selectOption('[data-testid="category-column"]', 'Category');
    await page.selectOption('[data-testid="description-column"]', 'Description');
    
    // 6. Preview and confirm upload
    await page.click('[data-testid="preview-upload"]');
    await page.click('[data-testid="confirm-upload"]');
    
    // 7. Verify upload success
    await expect(page.locator('text=CSV uploaded successfully')).toBeVisible();
    
    // 8. Verify new items appear in menu
    await expect(page.locator('text=Chicken Biryani')).toBeVisible();
    await expect(page.locator('text=Vegetable Samosa')).toBeVisible();
  });

  test('Analytics dashboard displays correct data', async ({ page }) => {
    // 1. Navigate to dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('http://localhost:3000/admin/dashboard');
    
    // 2. Wait for dashboard to load
    await page.waitForSelector('text=Admin Dashboard');
    
    // 3. Verify metrics are displayed
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-order-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-retention"]')).toBeVisible();
    
    // 4. Verify charts are displayed
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="orders-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="popular-items-chart"]')).toBeVisible();
    
    // 5. Test date range filter
    await page.click('[data-testid="date-range-selector"]');
    await page.selectOption('[data-testid="date-range"]', 'last_7_days');
    
    // 6. Verify data updates
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();
    
    // 7. Test chart type toggle
    await page.click('[data-testid="chart-type-toggle"]');
    await page.selectOption('[data-testid="chart-type"]', 'bar');
    
    // 8. Verify chart updates
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
  });

  test('Reservation management workflow', async ({ page }) => {
    // 1. Navigate to reservations
    await page.click('text=Reservations');
    await expect(page).toHaveURL('http://localhost:3000/admin/reservations');
    
    // 2. Wait for reservations page to load
    await page.waitForSelector('text=Reservations Management');
    
    // 3. Create new reservation
    await page.click('[data-testid="new-reservation-button"]');
    
    // 4. Fill customer information
    await page.fill('[data-testid="customer-name"]', 'Test Reservation Customer');
    await page.fill('[data-testid="customer-phone"]', '+260123456789');
    await page.fill('[data-testid="customer-email"]', 'testreservation@example.com');
    
    // 5. Fill reservation details
    await page.fill('[data-testid="date-time"]', '2024-01-25T19:00');
    await page.fill('[data-testid="party-size"]', '4');
    await page.selectOption('[data-testid="restaurant-select"]', '1');
    await page.selectOption('[data-testid="status-select"]', 'confirmed');
    await page.fill('[data-testid="special-requests"]', 'Window table preferred');
    
    // 6. Save reservation
    await page.click('[data-testid="save-reservation"]');
    
    // 7. Verify reservation appears in list
    await expect(page.locator('text=Test Reservation Customer')).toBeVisible();
    
    // 8. Test calendar view
    await page.click('[data-testid="calendar-view-toggle"]');
    await expect(page.locator('[data-testid="reservation-calendar"]')).toBeVisible();
    
    // 9. Test list view
    await page.click('[data-testid="list-view-toggle"]');
    await expect(page.locator('[data-testid="reservations-list"]')).toBeVisible();
  });

  test('Customer management workflow', async ({ page }) => {
    // 1. Navigate to customer management
    await page.click('text=Customer Management');
    await expect(page).toHaveURL('http://localhost:3000/admin/customers');
    
    // 2. Wait for customers page to load
    await page.waitForSelector('text=Customer Management');
    
    // 3. Verify customer statistics
    await expect(page.locator('[data-testid="total-customers"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-customers"]')).toBeVisible();
    await expect(page.locator('[data-testid="vip-customers"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    
    // 4. Test customer search
    await page.fill('[data-testid="customer-search"]', 'John');
    await expect(page.locator('text=John Mwamba')).toBeVisible();
    
    // 5. Test customer status filter
    await page.selectOption('[data-testid="status-filter"]', 'vip');
    await expect(page.locator('text=VIP')).toBeVisible();
    
    // 6. View customer details
    await page.click('[data-testid="view-customer-1"]');
    await expect(page.locator('text=Customer Profile')).toBeVisible();
    
    // 7. Test customer communication
    await page.click('[data-testid="send-whatsapp"]');
    await expect(page.locator('text=WhatsApp Message')).toBeVisible();
  });

  test('Location management workflow', async ({ page }) => {
    // 1. Navigate to location management
    await page.click('text=Location Management');
    await expect(page).toHaveURL('http://localhost:3000/admin/locations');
    
    // 2. Wait for locations page to load
    await page.waitForSelector('text=Location Management');
    
    // 3. Verify locations are displayed
    await expect(page.locator('text=Taste of India - Manda Hill')).toBeVisible();
    await expect(page.locator('text=Taste of India - Parirenyetwa')).toBeVisible();
    
    // 4. Edit location details
    await page.click('[data-testid="edit-location-1"]');
    await page.fill('[data-testid="location-name"]', 'Updated Location Name');
    await page.fill('[data-testid="location-address"]', 'Updated Address');
    await page.fill('[data-testid="location-phone"]', '+260 97 999 9999');
    await page.click('[data-testid="save-location"]');
    
    // 5. Verify location update
    await expect(page.locator('text=Updated Location Name')).toBeVisible();
    
    // 6. Test location status toggle
    await page.click('[data-testid="toggle-location-1"]');
    await expect(page.locator('text=Inactive')).toBeVisible();
  });

  test('Blog management workflow', async ({ page }) => {
    // 1. Navigate to blog management
    await page.click('text=Blog Management');
    await expect(page).toHaveURL('http://localhost:3000/admin/blogs');
    
    // 2. Wait for blogs page to load
    await page.waitForSelector('text=Blog Management');
    
    // 3. Create new blog post
    await page.click('[data-testid="create-blog-button"]');
    
    // 4. Fill blog form
    await page.fill('[data-testid="blog-title"]', 'Test Blog Post');
    await page.fill('[data-testid="blog-content"]', 'This is a test blog post content.');
    await page.selectOption('[data-testid="blog-category"]', 'News');
    await page.selectOption('[data-testid="blog-status"]', 'published');
    
    // 5. Save blog post
    await page.click('[data-testid="save-blog"]');
    
    // 6. Verify blog post appears in list
    await expect(page.locator('text=Test Blog Post')).toBeVisible();
    
    // 7. Edit blog post
    await page.click('[data-testid="edit-blog-1"]');
    await page.fill('[data-testid="blog-title"]', 'Updated Blog Post');
    await page.click('[data-testid="save-blog"]');
    
    // 8. Verify blog update
    await expect(page.locator('text=Updated Blog Post')).toBeVisible();
  });

  test('Event management workflow', async ({ page }) => {
    // 1. Navigate to event management
    await page.click('text=Event Management');
    await expect(page).toHaveURL('http://localhost:3000/admin/events');
    
    // 2. Wait for events page to load
    await page.waitForSelector('text=Event Management');
    
    // 3. Create new event
    await page.click('[data-testid="create-event-button"]');
    
    // 4. Fill event form
    await page.fill('[data-testid="event-title"]', 'Test Event');
    await page.fill('[data-testid="event-description"]', 'This is a test event description.');
    await page.fill('[data-testid="event-date"]', '2024-02-15');
    await page.fill('[data-testid="event-time"]', '19:00');
    await page.selectOption('[data-testid="event-restaurant"]', '1');
    await page.fill('[data-testid="event-capacity"]', '50');
    await page.fill('[data-testid="event-price"]', '100');
    
    // 5. Save event
    await page.click('[data-testid="save-event"]');
    
    // 6. Verify event appears in list
    await expect(page.locator('text=Test Event')).toBeVisible();
    
    // 7. Edit event
    await page.click('[data-testid="edit-event-1"]');
    await page.fill('[data-testid="event-title"]', 'Updated Event');
    await page.click('[data-testid="save-event"]');
    
    // 8. Verify event update
    await expect(page.locator('text=Updated Event')).toBeVisible();
  });

  test('Website branding management', async ({ page }) => {
    // 1. Navigate to website branding
    await page.click('text=Website Branding');
    await expect(page).toHaveURL('http://localhost:3000/admin/branding');
    
    // 2. Wait for branding page to load
    await page.waitForSelector('text=Website Branding');
    
    // 3. Update restaurant information
    await page.fill('[data-testid="restaurant-name"]', 'Updated Taste of India');
    await page.fill('[data-testid="restaurant-tagline"]', 'Updated tagline');
    await page.fill('[data-testid="restaurant-description"]', 'Updated description');
    
    // 4. Update contact information
    await page.fill('[data-testid="contact-phone"]', '+260 97 888 8888');
    await page.fill('[data-testid="contact-email"]', 'updated@tasteofindia.co.zm');
    await page.fill('[data-testid="contact-address"]', 'Updated Address');
    
    // 5. Update social media links
    await page.fill('[data-testid="facebook-url"]', 'https://facebook.com/updated');
    await page.fill('[data-testid="instagram-url"]', 'https://instagram.com/updated');
    await page.fill('[data-testid="whatsapp-number"]', '+260 97 777 7777');
    
    // 6. Save branding changes
    await page.click('[data-testid="save-branding"]');
    
    // 7. Verify success message
    await expect(page.locator('text=Branding updated successfully')).toBeVisible();
  });

  test('Data export functionality', async ({ page }) => {
    // 1. Test orders export
    await page.click('text=Orders');
    await page.waitForSelector('text=Orders Management');
    await page.click('[data-testid="export-orders"]');
    await expect(page.locator('text=Orders exported successfully')).toBeVisible();
    
    // 2. Test reservations export
    await page.click('text=Reservations');
    await page.waitForSelector('text=Reservations Management');
    await page.click('[data-testid="export-reservations"]');
    await expect(page.locator('text=Reservations exported successfully')).toBeVisible();
    
    // 3. Test customers export
    await page.click('text=Customer Management');
    await page.waitForSelector('text=Customer Management');
    await page.click('[data-testid="export-customers"]');
    await expect(page.locator('text=Customers exported successfully')).toBeVisible();
    
    // 4. Test menu export
    await page.click('text=Menu Management');
    await page.waitForSelector('text=Menu Management');
    await page.click('[data-testid="export-menu"]');
    await expect(page.locator('text=Menu exported successfully')).toBeVisible();
  });

  test('Error handling and validation', async ({ page }) => {
    // 1. Test menu item validation
    await page.click('text=Menu Management');
    await page.waitForSelector('text=Menu Management');
    await page.click('[data-testid="add-item-button"]');
    
    // 2. Try to save without required fields
    await page.click('[data-testid="save-item"]');
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
    
    // 3. Test invalid price
    await page.fill('[data-testid="item-price"]', 'invalid');
    await page.click('[data-testid="save-item"]');
    await expect(page.locator('text=Please enter a valid price')).toBeVisible();
    
    // 4. Test order validation
    await page.click('text=Orders');
    await page.waitForSelector('text=Orders Management');
    await page.click('[data-testid="create-order-button"]');
    
    // 5. Try to save without customer information
    await page.click('[data-testid="save-order"]');
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
  });

  test('Performance and loading states', async ({ page }) => {
    // 1. Test dashboard load time
    const startTime = Date.now();
    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForSelector('text=Admin Dashboard');
    const loadTime = Date.now() - startTime;
    
    // 2. Verify dashboard loads within acceptable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // 3. Test menu page load time
    const menuStartTime = Date.now();
    await page.click('text=Menu Management');
    await page.waitForSelector('text=Menu Management');
    const menuLoadTime = Date.now() - menuStartTime;
    
    // 4. Verify menu page loads within acceptable time (3 seconds)
    expect(menuLoadTime).toBeLessThan(3000);
    
    // 5. Test loading states
    await page.click('text=Orders');
    await expect(page.locator('text=Loading...')).toBeVisible();
    await page.waitForSelector('text=Orders Management');
  });
});
