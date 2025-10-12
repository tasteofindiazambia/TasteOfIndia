const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qslfidheyalqdetiqdbs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHeroSlides() {
  console.log('Testing hero slides functionality...');
  
  try {
    // Test 1: Check if table exists
    console.log('\n1. Checking if hero_slides table exists...');
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Table does not exist or error:', error.message);
      console.log('Creating table...');
      
      // Create table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS hero_slides (
          id SERIAL PRIMARY KEY,
          slide_order INTEGER NOT NULL,
          slide_type VARCHAR(20) NOT NULL CHECK (slide_type IN ('menu', 'location', 'reservations', 'custom')),
          title VARCHAR(200) NOT NULL,
          subtitle VARCHAR(200),
          description TEXT,
          background_image_url VARCHAR(500),
          background_images JSONB,
          button_text VARCHAR(100),
          button_link VARCHAR(500),
          button_type VARCHAR(20) DEFAULT 'internal' CHECK (button_type IN ('internal', 'external', 'whatsapp')),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      if (createError) {
        console.error('Error creating table:', createError);
        return;
      }
      console.log('Table created successfully!');
    } else {
      console.log('Table exists, found', data?.length || 0, 'records');
    }
    
    // Test 2: Insert test data
    console.log('\n2. Inserting test hero slide...');
    const testSlide = {
      slide_order: 1,
      slide_type: 'menu',
      title: 'Test Slide',
      subtitle: 'Test Subtitle',
      description: 'Test Description',
      background_image_url: 'hero-image.png',
      background_images: ['buffet_TOI.jpeg', 'Dhokla_TOI.jpeg'],
      button_text: 'Test Button',
      button_link: '/menu/1',
      button_type: 'internal',
      is_active: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert(testSlide)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting test slide:', insertError);
    } else {
      console.log('Test slide inserted successfully:', insertData);
    }
    
    // Test 3: Fetch slides
    console.log('\n3. Fetching all hero slides...');
    const { data: slides, error: fetchError } = await supabase
      .from('hero_slides')
      .select('*')
      .order('slide_order', { ascending: true });
    
    if (fetchError) {
      console.error('Error fetching slides:', fetchError);
    } else {
      console.log('Fetched', slides?.length || 0, 'slides:', slides);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHeroSlides();
