#!/usr/bin/env node

/**
 * Test script for reservation endpoints
 * Tests reservation creation and retrieval from user, admin, and worker perspectives
 */

const testReservationEndpoints = async () => {
  const API_BASE = process.env.API_URL || 'https://toi.restaurant/api';
  
  console.log('🧪 Testing Reservation Endpoints');
  console.log('================================');
  console.log(`API Base: ${API_BASE}`);
  console.log('');

  // Test 1: Create a reservation (user perspective)
  console.log('📝 Test 1: Creating a reservation (User side)...');
  try {
    const reservationData = {
      customer_name: 'Test Customer',
      customer_phone: '+260977123456',
      restaurant_id: 1,
      date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      party_size: 4,
      special_requests: 'Window seat preferred'
    };

    const createResponse = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData)
    });

    if (!createResponse.ok) {
      throw new Error(`HTTP ${createResponse.status}: ${createResponse.statusText}`);
    }

    const createdReservation = await createResponse.json();
    console.log('✅ Reservation created successfully!');
    console.log(`   ID: ${createdReservation.id}`);
    console.log(`   Number: ${createdReservation.reservation_number}`);
    console.log(`   Status: ${createdReservation.status}`);
    console.log('');

    // Store reservation ID for further tests
    const reservationId = createdReservation.id;

    // Test 2: Retrieve the reservation (confirmation page)
    console.log('🔍 Test 2: Retrieving reservation (Confirmation page)...');
    const getResponse = await fetch(`${API_BASE}/reservations/${reservationId}`);
    
    if (!getResponse.ok) {
      throw new Error(`HTTP ${getResponse.status}: ${getResponse.statusText}`);
    }

    const retrievedReservation = await getResponse.json();
    console.log('✅ Reservation retrieved successfully!');
    console.log(`   ID: ${retrievedReservation.id}`);
    console.log(`   Customer: ${retrievedReservation.customer_name}`);
    console.log(`   Phone: ${retrievedReservation.customer_phone}`);
    console.log('');

    // Test 3: Admin view - get all reservations
    console.log('👨‍💼 Test 3: Admin view - Get all reservations...');
    
    // Try to get admin token first
    const adminLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    let adminToken = null;
    if (adminLoginResponse.ok) {
      const adminLoginData = await adminLoginResponse.json();
      adminToken = adminLoginData.token;
      console.log('   ✅ Admin login successful');
    } else {
      console.log('   ⚠️  Admin login failed, testing without auth');
    }

    const adminHeaders = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      adminHeaders['Authorization'] = `Bearer ${adminToken}`;
    }

    const adminReservationsResponse = await fetch(`${API_BASE}/reservations?restaurant_id=1`, {
      headers: adminHeaders
    });

    if (adminReservationsResponse.ok) {
      const adminReservations = await adminReservationsResponse.json();
      console.log(`✅ Admin can see ${adminReservations.length} reservations`);
      const ourReservation = adminReservations.find(r => r.id === reservationId);
      if (ourReservation) {
        console.log('   ✅ Our test reservation is visible to admin');
      } else {
        console.log('   ⚠️  Our test reservation not found in admin list');
      }
    } else {
      console.log(`   ❌ Admin reservations failed: ${adminReservationsResponse.status}`);
    }
    console.log('');

    // Test 4: Worker view - get reservations
    console.log('👷 Test 4: Worker view - Get reservations...');
    
    // Try to get worker token
    const workerLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'worker',
        password: 'worker123'
      })
    });

    let workerToken = null;
    if (workerLoginResponse.ok) {
      const workerLoginData = await workerLoginResponse.json();
      workerToken = workerLoginData.token;
      console.log('   ✅ Worker login successful');
    } else {
      console.log('   ⚠️  Worker login failed, testing without auth');
    }

    const workerHeaders = {
      'Content-Type': 'application/json',
    };
    if (workerToken) {
      workerHeaders['Authorization'] = `Bearer ${workerToken}`;
    }

    const workerReservationsResponse = await fetch(`${API_BASE}/reservations?restaurant_id=1`, {
      headers: workerHeaders
    });

    if (workerReservationsResponse.ok) {
      const workerReservations = await workerReservationsResponse.json();
      console.log(`✅ Worker can see ${workerReservations.length} reservations`);
      const ourReservation = workerReservations.find(r => r.id === reservationId);
      if (ourReservation) {
        console.log('   ✅ Our test reservation is visible to worker');
      } else {
        console.log('   ⚠️  Our test reservation not found in worker list');
      }
    } else {
      console.log(`   ❌ Worker reservations failed: ${workerReservationsResponse.status}`);
    }
    console.log('');

    // Test 5: Update reservation status (admin/worker action)
    console.log('📝 Test 5: Update reservation status...');
    const updateToken = adminToken || workerToken;
    
    if (updateToken) {
      const updateResponse = await fetch(`${API_BASE}/reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${updateToken}`
        },
        body: JSON.stringify({
          status: 'confirmed',
          notes: 'Confirmed by test script'
        })
      });

      if (updateResponse.ok) {
        const updatedReservation = await updateResponse.json();
        console.log('✅ Reservation status updated successfully!');
        console.log(`   New status: ${updatedReservation.status}`);
        console.log(`   Notes: ${updatedReservation.notes || 'None'}`);
      } else {
        console.log(`   ❌ Status update failed: ${updateResponse.status}`);
      }
    } else {
      console.log('   ⚠️  No auth token available for status update');
    }

    console.log('');
    console.log('🎉 All reservation endpoint tests completed!');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
  }
};

// Run the tests
testReservationEndpoints().catch(console.error);
