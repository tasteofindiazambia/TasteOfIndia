import Database from '../models/database.js';

const db = new Database();

// Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    console.log('🔍 Fetching all customers...');
    const customers = await db.getAll('customers');
    console.log('✅ Customers fetched:', customers.length);
    res.json(customers);
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await db.getById('customers', id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, source } = req.body;
    
    // Validate required fields
    if (!name || !source) {
      return res.status(400).json({ error: 'Name and source are required' });
    }
    
    const customerData = {
      name,
      phone: phone || null,
      email: email || null,
      source,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };
    
    const customerId = await db.create('customers', customerData);
    const newCustomer = await db.getById('customers', customerId);
    
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Add last activity update
    updates.last_activity = new Date().toISOString();
    
    await db.update('customers', id, updates);
    const updatedCustomer = await db.getById('customers', id);
    
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.delete('customers', id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Get customers by source
export const getCustomersBySource = async (req, res) => {
  try {
    const { source } = req.params;
    const customers = await db.query(
      'SELECT * FROM customers WHERE source = ? ORDER BY created_at DESC',
      [source]
    );
    
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers by source:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};
