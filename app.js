const PRODUCTS_URL = 'products.json';

function $(selector) {
  return document.querySelector(selector);
}

function formatPrice(value) {
  return Number(value).toFixed(2);
}

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let products = [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartCount();
}

function renderCartCount() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = $('#cart-count');
  if (countEl) countEl.textContent = totalQty;
}

function getProductById(id) {
  return products.find((product) => product.id === id);
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1, price: product.price, name: product.name, image: product.image });
  }

  saveCart();
  renderCartModal();
  alert(`${product.name} added to cart.`);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCartModal();
}

function updateQty(productId, nextQty) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.qty = Math.max(1, Number(nextQty) || 1);
  saveCart();
  renderCartModal();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function renderProducts(list, containerSelector) {
  const container = $(containerSelector);
  if (!container) return;

  container.innerHTML = '';

  list.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-body">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <div class="product-meta">
          <span class="price">$${formatPrice(product.price)}</span>
          <button class="btn add-btn" data-add="${product.id}">Add to cart</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderCartModal() {
  const container = $('#cart-items');
  const totalEl = $('#cart-total');
  if (!container || !totalEl) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    totalEl.textContent = '0.00';
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <div class="qty-row">
          <input type="number" min="1" value="${item.qty}" data-qty="${item.id}">
          <button class="small-btn" data-remove="${item.id}">Remove</button>
        </div>
        <span>$${formatPrice(item.price * item.qty)}</span>
      </div>
    `;
    container.appendChild(row);
  });

  totalEl.textContent = formatPrice(cartTotal());
}

function openCart() {
  const modal = $('#cart-modal');
  if (modal) modal.classList.remove('hidden');
  renderCartModal();
}

function closeCart() {
  const modal = $('#cart-modal');
  if (modal) modal.classList.add('hidden');
}

async function checkout() {
  const total = cartTotal();
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    });

    const payload = await response.json();

    if (!response.ok || !payload.url) {
      throw new Error(payload.error || 'Checkout creation failed.');
    }

    window.location.href = payload.url;
  } catch (error) {
    alert('Stripe is not configured yet. Add STRIPE_SECRET_KEY in Netlify and redeploy, or contact Velora directly on WhatsApp at +91 82852029.');
    window.open('https://wa.me/9182852029', '_blank');
  }
}

async function initializeStore() {
  try {
    const response = await fetch(PRODUCTS_URL);
    products = await response.json();
  } catch (error) {
    products = [];
  }

  if ($('#products')) renderProducts(products, '#products');
  if ($('#featured-products')) renderProducts(products.slice(0, 4), '#featured-products');

  renderCartCount();
  renderCartModal();

  document.body.addEventListener('click', (event) => {
    const addId = event.target.getAttribute('data-add');
    const removeId = event.target.getAttribute('data-remove');

    if (addId) addToCart(addId);
    if (removeId) removeFromCart(removeId);

    if (event.target.id === 'cart-button') openCart();
    if (event.target.id === 'close-cart') closeCart();
    if (event.target.id === 'checkout-btn') checkout();
  });

  document.body.addEventListener('change', (event) => {
    const qtyId = event.target.getAttribute('data-qty');
    if (qtyId) updateQty(qtyId, event.target.value);
  });

  const cartButton = $('#cart-button');
  if (cartButton) cartButton.addEventListener('click', openCart);
  const closeButton = $('#close-cart');
  if (closeButton) closeButton.addEventListener('click', closeCart);
  const checkoutButton = $('#checkout-btn');
  if (checkoutButton) checkoutButton.addEventListener('click', checkout);
}

initializeStore();
