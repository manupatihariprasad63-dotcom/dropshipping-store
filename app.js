const PRODUCTS_URL = 'products.json'

// Utilities
function $ (sel){return document.querySelector(sel)}
function formatPrice(n){return (n).toFixed(2)}

// Cart
let cart = JSON.parse(localStorage.getItem('cart')||'[]')
function saveCart(){localStorage.setItem('cart', JSON.stringify(cart)); renderCartCount();}
function addToCart(productId){
  const p = products.find(x=>x.id===productId)
  if(!p) return
  const existing = cart.find(i=>i.id===productId)
  if(existing) existing.qty++
  else cart.push({id:productId,qty:1,price:p.price,name:p.name,image:p.image})
  saveCart()
  alert('Added to cart: '+p.name)
}
function removeFromCart(productId){cart = cart.filter(i=>i.id!==productId); saveCart(); renderCartModal();}
function changeQty(productId,qty){const it = cart.find(i=>i.id===productId); if(!it) return; it.qty = Math.max(1,qty); saveCart(); renderCartModal();}
function cartTotal(){return cart.reduce((s,i)=>s + i.qty * i.price,0)}

// Render helpers
function renderProducts(list, container){
  const el = $(container)
  el.innerHTML = ''
  list.forEach(p=>{
    const div = document.createElement('div'); div.className='product'
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      <div class="price">$${formatPrice(p.price)}</div>
      <p class="muted">${p.description}</p>
      <button class="btn" data-add="${p.id}">Add to cart</button>
    `
    el.appendChild(div)
  })
}

function renderFeatured(list){renderProducts(list.slice(0,4),'#featured-products')}

function renderCartCount(){
  const count = cart.reduce((s,i)=>s + i.qty,0)
  const el = $('#cart-count')
  if(el) el.textContent = count
}

// Cart modal
function renderCartModal(){
  const container = $('#cart-items')
  container.innerHTML = ''
  if(cart.length===0){container.innerHTML='<p>Your cart is empty</p>'; $('#cart-total').textContent='0.00'; return}
  cart.forEach(i=>{
    const div = document.createElement('div'); div.className='cart-item'
    div.innerHTML = `
      <img src="${i.image}" alt="${i.name}">
      <div>
        <div>${i.name}</div>
        <div>$${formatPrice(i.price)} × <input type="number" min="1" value="${i.qty}" data-qty="${i.id}" style="width:60px"></div>
        <div><button data-remove="${i.id}" class="btn">Remove</button></div>
      </div>
    `
    container.appendChild(div)
  })
  $('#cart-total').textContent = formatPrice(cartTotal())
}

function openCart(){ $('#cart-modal').classList.remove('hidden'); renderCartModal() }
function closeCart(){ $('#cart-modal').classList.add('hidden') }

// Checkout: sends order to Formspree for manual processing. Replace with Stripe integration if you want live payments.
async function checkout(){
  if(cart.length===0){alert('Cart is empty'); return}
  const order = {
    items: cart.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price})),
    total: cartTotal().toFixed(2),
    created_at: new Date().toISOString()
  }

  // POST to Formspree endpoint (replace with your own endpoint)
  const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID' // <-- REPLACE
  try{
    const res = await fetch(FORM_ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({message: 'New order', order: JSON.stringify(order)})
    })
    if(res.ok){
      alert('Order sent. We will contact you to complete payment and shipping.');
      cart = []; saveCart(); closeCart();
    } else {
      alert('Failed to submit order. Please contact us directly.')
    }
  } catch(e){
    alert('Network error. Please try again later.')
  }
}

// Wire up UI
let products = []
async function init(){
  // load products
  try{
    const r = await fetch(PRODUCTS_URL)
    products = await r.json()
  }catch(e){products = []}

  // render
  if($('#products')) renderProducts(products,'#products')
  if($('#featured-products')) renderFeatured(products)

  renderCartCount()

  // event delegation for add buttons
  document.body.addEventListener('click', e=>{
    const add = e.target.getAttribute && e.target.getAttribute('data-add')
    const remove = e.target.getAttribute && e.target.getAttribute('data-remove')
    if(add){ addToCart(add) }
    if(remove){ removeFromCart(remove) }
    if(e.target.id==='cart-button'){ openCart() }
    if(e.target.id==='close-cart'){ closeCart() }
    if(e.target.id==='checkout-btn'){ checkout() }
  })

  // qty change
  document.body.addEventListener('change', e=>{
    const qtyFor = e.target.getAttribute && e.target.getAttribute('data-qty')
    if(qtyFor){ changeQty(qtyFor, parseInt(e.target.value||1)) }
  })

  // bind cart buttons on pages
  const cb = $('#cart-button')
  if(cb) cb.addEventListener('click', openCart)
  const close = $('#close-cart')
  if(close) close.addEventListener('click', closeCart)

  const checkoutBtn = $('#checkout-btn')
  if(checkoutBtn) checkoutBtn.addEventListener('click', checkout)
}

init()
