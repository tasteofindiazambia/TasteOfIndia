// Import menu items from CSV into Supabase for all restaurants, sharing same items
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://qslfidheyalqdetiqdbs.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey);

const INPUT = path.resolve('menu_items_supabase (1).csv');
const DEFAULT_CATEGORY_NAME = 'Main Menu';

async function pickCategoryId(restaurantId, name){
  // Prefer a category named `name`
  let { data: cat, error } = await supabase
    .from('categories')
    .select('id,name')
    .eq('restaurant_id', restaurantId)
    .eq('name', name)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (cat) return cat.id;

  // Fallback to any existing category for this restaurant
  const { data: anyCat, error: anyErr } = await supabase
    .from('categories')
    .select('id,name')
    .eq('restaurant_id', restaurantId)
    .order('id')
    .limit(1)
    .maybeSingle();
  if (anyErr) throw anyErr;
  if (anyCat) return anyCat.id;

  // As a last resort, attempt insert (may fail if sequence is misaligned)
  const { data: created, error: insertErr } = await supabase
    .from('categories')
    .insert([{ name, restaurant_id: restaurantId }])
    .select('id')
    .single();
  if (insertErr) throw insertErr;
  return created.id;
}

function parseBool(v){
  if (v === undefined || v === null || v === '') return null;
  const s = String(v).trim().toLowerCase();
  if (['true','t','1','yes','y'].includes(s)) return true;
  if (['false','f','0','no','n'].includes(s)) return false;
  return null;
}

function parseNum(v){
  if (v === undefined || v === null || v === '' || v === 'X') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

async function main(){
  // Load restaurants
  const { data: restaurants, error: rErr } = await supabase.from('restaurants').select('id,name').order('id');
  if (rErr) throw rErr;
  if (!restaurants || restaurants.length === 0) throw new Error('No restaurants found');

  // Read CSV
  const rows = await new Promise((resolve, reject) => {
    const out = [];
    fs.createReadStream(INPUT)
      .pipe(csv())
      .on('data', (row) => out.push(row))
      .on('end', () => resolve(out))
      .on('error', reject);
  });

  console.log(`Rows read: ${rows.length}`);

  let totalInserted = 0;
  let totalUpdated = 0;
  for (const r of restaurants){
    const categoryId = await pickCategoryId(r.id, DEFAULT_CATEGORY_NAME);
    // Remove existing items to avoid PK/sequence conflicts; we're repopulating
    const { error: delErr } = await supabase
      .from('menu_items')
      .delete()
      .eq('restaurant_id', r.id);
    if (delErr) throw delErr;
    const batch = rows.map(row => ({
      name: row.name?.trim(),
      description: row.description || null,
      price: parseNum(row.price) ?? 0,
      category_id: categoryId,
      restaurant_id: r.id,
      image_url: row.image_url || null,
      available: parseBool(row.available) ?? true,
      featured: parseBool(row.featured) ?? false,
      tags: row.tags || null,
      spice_level: row.spice_level || 'mild',
      pieces_count: parseNum(row.pieces_count),
      preparation_time: parseNum(row.preparation_time) ?? 15,
      is_vegetarian: parseBool(row.is_vegetarian),
      is_vegan: parseBool(row.is_vegan),
      is_gluten_free: parseBool(row.is_gluten_free),
      dynamic_pricing: parseBool(row.dynamic_pricing) ?? false,
      packaging_price: parseNum(row.packaging_price) ?? 0,
      listing_preference: row.listing_preference || 'mid'
    })).filter(it => it.name);

    // Insert in chunks of 500
    for (let i=0; i<batch.length; i+=500){
      const chunk = batch.slice(i, i+500);
      const { data, error } = await supabase.from('menu_items').insert(chunk).select('id');
      if (error) throw error;
      totalInserted += data?.length || 0;
    }
    console.log(`Restaurant ${r.id} (${r.name}): inserted ${batch.length}`);
  }

  console.log(`Done. Inserts: ${totalInserted}, Updates: ${totalUpdated}`);
}

main().catch(e => { console.error('Import failed:', e.message); process.exit(1); });
