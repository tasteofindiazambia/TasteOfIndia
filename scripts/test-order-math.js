// Test order math end-to-end for pickup and delivery
// Simulates CheckoutPage + API total_amount logic

function formatK(n) { return `K${Math.round(n)}`; }

function buildTransformedItems(cartItems) {
  return cartItems.map((item) => {
    const baseUnit = item.grams ? Number(item.menuItem.price) : Number(item.menuItem.price);
    const packagingPerUnit = Number(item.menuItem.packaging_price || 0);
    const qty = Number(item.quantity || 0);
    const grams = Number(item.grams || 0);

    const baseLineUnit = item.grams ? (baseUnit * grams) : baseUnit;
    const baseLine = baseLineUnit * qty;
    const linePackaging = packagingPerUnit * qty;
    const totalWithPackaging = baseLine + linePackaging;

    return {
      menu_item_id: item.menuItem.id,
      quantity: qty,
      grams: item.grams,
      unit_price: baseUnit,
      total_price: totalWithPackaging,
      packaging_fee: linePackaging,
      special_instructions: item.grams ? `${grams}g per package - ${item.specialInstructions || ''}`.trim() : item.specialInstructions || ''
    };
  });
}

function computeSubtotalFromItems(items){
  return items.reduce((s, it) => s + Number(it.total_price || 0), 0);
}

function testCase({name, cartItems, delivery, feePerKm}){
  const items = buildTransformedItems(cartItems);
  const subtotal = computeSubtotalFromItems(items);
  const deliveryFee = delivery ? Math.ceil(delivery.distanceKm * feePerKm) : 0;
  const total = subtotal + deliveryFee;
  return {name, items, subtotal, deliveryFee, total};
}

// Sample data mirroring your seed values
const menu = {
  biryani: { id: 5, price: 28, packaging_price: 3.5 },
  lassi:   { id: 9, price: 8,  packaging_price: 1   },
  rasgulla:{ id: 8, price: 0.60, packaging_price: 1.5, grams: 100 },
};

const pickup = testCase({
  name: 'Pickup',
  cartItems: [
    { menuItem: menu.biryani, quantity: 1 },
    { menuItem: menu.lassi, quantity: 3 },
    { menuItem: menu.rasgulla, quantity: 2, grams: menu.rasgulla.grams }
  ],
  delivery: null,
  feePerKm: 10
});

const delivery = testCase({
  name: 'Delivery Rusangu',
  cartItems: [
    { menuItem: menu.biryani, quantity: 1 },
    { menuItem: menu.lassi, quantity: 3 },
    { menuItem: menu.rasgulla, quantity: 2, grams: menu.rasgulla.grams }
  ],
  delivery: { distanceKm: 2.1 },
  feePerKm: 10
});

function printResult(r){
  console.log(`\n=== ${r.name} ===`);
  r.items.forEach((it, idx) => {
    console.log(`Item#${idx+1}: unit=${it.unit_price}, qty=${it.quantity}, grams=${it.grams||0}, line_total=${it.total_price} (packaging=${it.packaging_fee})`);
  });
  console.log(`Subtotal: ${formatK(r.subtotal)}  (raw=${r.subtotal})`);
  console.log(`Delivery Fee: ${formatK(r.deliveryFee)}  (raw=${r.deliveryFee})`);
  console.log(`Total: ${formatK(r.total)}  (raw=${r.total})`);
}

printResult(pickup);
printResult(delivery);
