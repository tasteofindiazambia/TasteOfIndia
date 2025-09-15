# Taste of India Restaurant System - Testing Suite

This comprehensive testing suite ensures the quality, reliability, and performance of the Taste of India restaurant system.

## 🧪 Test Structure

```
tests/
├── setup.js                    # Test configuration and database setup
├── integration/                # API and database integration tests
│   ├── api-endpoints.test.js   # All API endpoint tests
│   └── database.test.js        # Database schema and performance tests
├── components/                 # Frontend component tests
│   ├── AdminComponents.test.tsx    # Admin panel component tests
│   └── CustomerComponents.test.tsx # Customer-facing component tests
├── e2e/                       # End-to-end user journey tests
│   ├── customer-journeys.test.js   # Customer user flows
│   └── admin-journeys.test.js      # Admin user flows
├── performance/               # Performance and load tests
│   └── load.test.js           # Load testing and performance benchmarks
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend server running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Run specific test suites
npm run test                    # Unit and integration tests
npm run test:e2e               # End-to-end tests
npm run test:api               # API endpoint tests only
npm run test:components        # Component tests only
npm run test:admin             # Admin E2E tests only
npm run test:customer          # Customer E2E tests only
npm run test:performance       # Performance tests only

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for CI/CD
npm run test:ci
```

## 📋 Test Categories

### 1. API Endpoint Tests (`tests/integration/api-endpoints.test.js`)

Tests all REST API endpoints for:
- ✅ Health check endpoint
- ✅ Restaurant management
- ✅ Menu item CRUD operations
- ✅ Order creation and management
- ✅ Reservation booking and management
- ✅ Customer management
- ✅ Analytics and reporting
- ✅ Error handling and validation

**Key Test Scenarios:**
- GET endpoints return correct data structure
- POST endpoints create resources successfully
- PUT endpoints update resources correctly
- DELETE endpoints remove resources
- Error responses have proper HTTP status codes
- Input validation works correctly

### 2. Database Integration Tests (`tests/integration/database.test.js`)

Tests database functionality:
- ✅ Schema validation and table structure
- ✅ Foreign key relationships
- ✅ Data persistence and updates
- ✅ Database constraints
- ✅ Index performance
- ✅ Transaction handling
- ✅ Large dataset performance
- ✅ Backup and restore simulation

**Key Test Scenarios:**
- All required tables exist with correct structure
- Foreign key constraints work properly
- Data persists across operations
- Database performance is acceptable
- Transactions commit and rollback correctly

### 3. Admin Component Tests (`tests/components/AdminComponents.test.tsx`)

Tests admin panel components:
- ✅ AdminDashboard renders metrics correctly
- ✅ AdminOrders displays order list
- ✅ AdminMenu allows adding/editing items
- ✅ AdminCustomers shows customer data
- ✅ AdminReservations manages bookings
- ✅ Error handling and loading states
- ✅ Form validation and user interactions

**Key Test Scenarios:**
- Components render without errors
- Data displays correctly
- User interactions work as expected
- Error states are handled gracefully
- Loading states are shown appropriately

### 4. Customer Component Tests (`tests/components/CustomerComponents.test.tsx`)

Tests customer-facing components:
- ✅ HomePage displays welcome content
- ✅ MenuPage shows menu items and filtering
- ✅ CartPage manages cart items
- ✅ ReservationPage handles bookings
- ✅ CheckoutPage processes orders
- ✅ Header and Footer navigation
- ✅ Responsive design elements

**Key Test Scenarios:**
- Components render correctly
- Navigation works properly
- Forms validate input correctly
- Cart functionality works
- Search and filtering operate correctly

### 5. Customer E2E Tests (`tests/e2e/customer-journeys.test.js`)

Tests complete customer user journeys:
- ✅ Complete ordering process
- ✅ Menu browsing and filtering
- ✅ Reservation booking process
- ✅ WhatsApp order sharing
- ✅ Location selection
- ✅ Cart management
- ✅ Navigation and responsive design
- ✅ Error handling and validation
- ✅ Performance and loading states
- ✅ Accessibility features

**Key Test Scenarios:**
- End-to-end order placement
- Menu search and category filtering
- Reservation booking with validation
- Mobile responsiveness
- Error handling and recovery
- Performance benchmarks

### 6. Admin E2E Tests (`tests/e2e/admin-journeys.test.js`)

Tests complete admin user journeys:
- ✅ Menu management workflow
- ✅ Order management workflow
- ✅ CSV menu upload functionality
- ✅ Analytics dashboard
- ✅ Reservation management
- ✅ Customer management
- ✅ Location management
- ✅ Blog and event management
- ✅ Website branding management
- ✅ Data export functionality

**Key Test Scenarios:**
- Complete CRUD operations
- File upload and processing
- Data visualization
- Bulk operations
- Export functionality
- Error handling and validation

### 7. Performance Tests (`tests/performance/load.test.js`)

Tests system performance:
- ✅ API response times
- ✅ Page load times
- ✅ Database query performance
- ✅ Concurrent user simulation
- ✅ Memory usage monitoring
- ✅ Image loading performance
- ✅ Form submission performance
- ✅ Search functionality performance
- ✅ Mobile performance
- ✅ Caching performance

**Performance Benchmarks:**
- API endpoints: < 500ms
- Page loads: < 3-5 seconds
- Database queries: < 1-2 seconds
- Form submissions: < 5 seconds
- Search operations: < 2 seconds

## 🎯 Test Success Criteria

### Must Pass All Tests:
- ✅ All API endpoints return correct data
- ✅ Database operations work correctly
- ✅ Admin can manage menu, orders, reservations
- ✅ Customers can browse menu and place orders
- ✅ WhatsApp integration works
- ✅ Real-time updates function properly
- ✅ CSV upload processes correctly
- ✅ Authentication and authorization work
- ✅ Mobile responsiveness confirmed
- ✅ No console errors during test execution
- ✅ Performance benchmarks met
- ✅ 80%+ test coverage achieved

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- Test environment: jsdom
- Coverage threshold: 80%
- Test timeout: 10 seconds
- Module name mapping for assets
- Transform configuration for TypeScript

### Playwright Configuration (`playwright.config.js`)
- Multiple browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Screenshot and video capture on failure
- Trace collection for debugging
- Web server setup for E2E tests

### Test Setup (`tests/setup.js`)
- Database initialization
- Mock data creation
- Global test configuration
- Cleanup procedures

## 📊 Test Data

### Sample Data Files:
- `menu_items_data_MandaHill.csv` - Sample menu items for CSV upload tests
- Test database with sample restaurants, categories, and menu items
- Mock API responses for component testing

### Test Database:
- SQLite test database
- Isolated from production data
- Automatic cleanup after tests
- Sample data for all entities

## 🐛 Debugging Tests

### Common Issues and Solutions:

1. **Tests failing due to server not running:**
   ```bash
   npm run server  # Start backend server
   npm run dev     # Start frontend
   ```

2. **Database connection issues:**
   - Ensure SQLite database is created
   - Check database file permissions
   - Verify schema is applied correctly

3. **E2E tests timing out:**
   - Increase timeout in test configuration
   - Check if servers are running
   - Verify network connectivity

4. **Component tests failing:**
   - Check if all dependencies are installed
   - Verify mock data is correct
   - Ensure components are properly exported

### Debug Commands:
```bash
# Run tests with verbose output
npm run test -- --verbose

# Run specific test file
npm run test -- tests/integration/api-endpoints.test.js

# Run tests with debugging
npm run test:e2e -- --debug

# Generate test coverage report
npm run test:coverage
```

## 📈 Continuous Integration

### CI/CD Pipeline:
1. **Install Dependencies:** `npm install`
2. **Run Linting:** `npm run lint`
3. **Run Unit Tests:** `npm run test:coverage`
4. **Run E2E Tests:** `npm run test:e2e`
5. **Generate Reports:** Coverage and test results

### GitHub Actions Example:
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci
```

## 🎉 Test Results

### Expected Outcomes:
- **Unit Tests:** 100% pass rate
- **Integration Tests:** 100% pass rate
- **E2E Tests:** 100% pass rate
- **Performance Tests:** All benchmarks met
- **Coverage:** 80%+ code coverage
- **No Console Errors:** Clean test execution

### Test Reports:
- Jest coverage report in `coverage/` directory
- Playwright HTML report in `playwright-report/` directory
- Performance metrics in test output
- Screenshots and videos for failed E2E tests

## 📝 Contributing

### Adding New Tests:
1. Follow existing test patterns
2. Use descriptive test names
3. Include both positive and negative test cases
4. Add proper error handling
5. Update this README if adding new test categories

### Test Naming Convention:
- `describe()`: Feature or component name
- `test()`: Specific functionality being tested
- Use clear, descriptive names
- Include expected behavior in test name

### Best Practices:
- Keep tests independent and isolated
- Use proper setup and teardown
- Mock external dependencies
- Test both success and failure scenarios
- Maintain test data consistency
- Write maintainable and readable tests

---

**Happy Testing! 🧪✨**

For questions or issues with the test suite, please refer to the main project documentation or create an issue in the repository.
