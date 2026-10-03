/* ══════════════════════════════════════════════
    LOLA EDNA'S HOMEMADE FOOD — JAVASCRIPT
    ══════════════════════════════════════════════ */

'use strict';

/* ── PRODUCTS DATA ── */
const PRODUCTS = [
    {
    id: 1, name: 'Classic Peanut Butter', cat: 'peanut-butter',
    emoji: '🥜', image: 'assets/classicpeanutbutter.jpg', price: 100, weight: '320g', badge: 'Bestseller', stock: 25,
    desc: 'Our original recipe — rich, creamy peanut butter made from freshly roasted peanuts. Perfect on bread, pandesal, or eaten straight from the jar!',
    },
    {
    id: 2, name: 'Coffee Peanut Butter', cat: 'peanut-butter',
    emoji: '☕', image: 'assets/coffeepeanutbutter.jpg', price: 120, weight: '320g', badge: 'Fan Favorite', stock: 18,
    desc: 'A bold fusion of creamy peanut butter with aromatic coffee — the perfect pick-me-up spread for your morning toast or merienda.',
    },
    {
    id: 3, name: 'Chocolate Peanut Butter', cat: 'peanut-butter',
    emoji: '🍫', image: 'assets/chocolatepeanutbutter.jpg', price: 120, weight: '320g', badge: 'Sweet Treat', stock: 3,
    desc: 'The ultimate indulgence — smooth peanut butter swirled with rich cocoa. A crowd favorite for kids and the young at heart.',
    },
    {
    id: 4, name: 'Special Coco Jam', cat: 'jam',
    emoji: '🥥', image: 'assets/cocojam.png', price: 110, weight: '320g', badge: 'All Natural', stock: 12,
    desc: 'A classic Filipino delicacy — silky, sweet coconut jam made from fresh coconut milk and muscovado sugar. No artificial flavors, just pure tradition.',
    },
    {
    id: 5, name: 'Milky Pastillas', cat: 'sweets',
    emoji: '🍬', image: 'assets/pastillas.png', price: 80, weight: 'per pack', badge: 'Homemade', stock: 0,
    desc: 'Soft, melt-in-your-mouth milk candies wrapped in colorful paper. Made from fresh carabao milk — a beloved Filipino childhood treat.',
    },
    {
    id: 6, name: 'Sweet Tamarind', cat: 'sweets',
    emoji: '🟤', image: 'assets/sweettamarind.png', price: 60, weight: 'per pack', badge: 'Classic', stock: 8,
    desc: 'Tangy-sweet tamarind candies coated in sugar — the ultimate Filipino snack. A perfect balance of sour and sweet in every bite.',
    },
    {
    id: 7, name: 'Special Embotido', cat: 'appetizers',
    emoji: '🥩', image: 'assets/embotido.png', price: 180, weight: 'per roll', badge: 'Special', stock: 6,
    desc: "Lola Edna's signature Filipino meatloaf — packed with ground pork, raisins, and bell peppers, wrapped and steamed to perfection.",
    },
    {
    id: 8, name: 'Atsara', cat: 'appetizers',
    emoji: '🥕', image: 'assets/atsara.png', price: 90, weight: '320g', badge: 'Tangy & Fresh', stock: 15,
    desc: 'Crunchy pickled green papaya with carrots, bell peppers, and ginger — the perfect sweet and tangy condiment to pair with any fried or grilled dish.',
    },
];

/* ── RATINGS DATA (productId → { total, count, reviews[] }) ── */
const ratings = {};
PRODUCTS.forEach(p => { ratings[p.id] = { total: 0, count: 0, reviews: [] }; });

// Seed sample reviews
ratings[1] = {
    total: 23, count: 5,
    reviews: [
    { name: 'Maria Santos',  stars: 5, message: 'Masarap talaga! Perfect sa pandesal every morning. Will definitely order again!', date: '2025-03-28', emoji: '🥜' },
    { name: 'Jose Reyes',    stars: 4, message: 'Very creamy and not too sweet. Great value for the price!',                       date: '2025-03-20', emoji: '🥜' },
    { name: 'Ana Cruz',      stars: 5, message: 'Pinaka-masarap na peanut butter na natikman ko. Lola Edna never disappoints!',    date: '2025-03-10', emoji: '🥜' },
    ],
};
ratings[2] = {
    total: 19, count: 4,
    reviews: [
    { name: 'Carlo Dela Rosa', stars: 5, message: 'The coffee flavor is so strong and good! Perfect with my morning coffee too.', date: '2025-03-25', emoji: '☕' },
    { name: 'Luisa Flores',    stars: 5, message: 'Sobrang sarap! My kids love this. Ordered 3 jars already.',                    date: '2025-03-18', emoji: '☕' },
    ],
};
ratings[4] = {
    total: 16, count: 4,
    reviews: [
    { name: 'Rosa Mendoza',   stars: 4, message: "Authentic coco jam taste! Reminds me of my lola's cooking. Sarap!", date: '2025-03-22', emoji: '🥥' },
    { name: 'Pedro Bautista', stars: 4, message: 'Good quality, arrived well-packed. Will order more soon!',          date: '2025-03-15', emoji: '🥥' },
    ],
};

/* ── APP STATE ── */
let cart              = [];
let isRegister        = false;
let currentUser       = null;
let orders            = [];
let orderType         = 'retail';
let cancelTargetId    = null;
let paymentMethod     = 'cod';
let fulfillmentMethod = 'delivery';
let ratingTargetId    = null;
let selectedStar      = 0;
let lastPlacedOrder   = null;
let currentReviewProductId = null;

/* Seller credentials */
const SELLER_CREDENTIALS = { username: 'admin', password: 'lolaedna2025' };
let sellerAuthenticated = false;

/* ══════════════════════════════════════════════
    HELPERS
    ══════════════════════════════════════════════ */

/** Re-initialize Lucide icons after DOM changes */
function refreshIcons() {
    if (window.lucide) {
    lucide.createIcons();
    }
}

/** Show a brief toast notification */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerHTML = msg;
    if (window.lucide) { lucide.createIcons({ root: t }); }
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), 2800);
}

/** Return the currently active filter category */
function activeFilterCat() {
    return document.querySelector('.filter-tab.active')?.dataset.cat || 'all';
}

/* ══════════════════════════════════════════════
    ORDER TYPE (RETAIL / WHOLESALE)
    ══════════════════════════════════════════════ */

function setOrderType(type) {
    orderType = type;
    document.getElementById('btnRetail').classList.toggle('active', type === 'retail');
    document.getElementById('btnWholesale').classList.toggle('active', type === 'wholesale');
    document.getElementById('promoBanner').classList.toggle('hidden', type === 'retail');
    document.getElementById('orderTypeNote').textContent = type === 'retail'
    ? 'Standard pricing for individual buyers'
    : 'Bulk pricing with promo discount for 6+ jars';

    // Reprice existing cart items
    cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    item.price = type === 'wholesale' ? Math.round(product.price * 0.9) : product.price;
    });

    renderProducts(activeFilterCat());
    updateCartUI();
}

/* ══════════════════════════════════════════════
    PRODUCTS
    ══════════════════════════════════════════════ */

function renderProducts(filter = 'all') {
    const grid     = document.getElementById('productsGrid');
    const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

    grid.innerHTML = filtered.map(p => {
    const wsPrice      = Math.round(p.price * 0.9);
    const displayPrice = orderType === 'wholesale' ? wsPrice : p.price;
    const priceLabel   = orderType === 'wholesale'
        ? `₱${displayPrice}<span> / jar</span> <span class="wholesale-badge">-10%</span>`
        : `₱${displayPrice}<span> / jar</span>`;

    const catLabel = {
        'peanut-butter': 'Peanut Butter',
        jam:             'Jam',
        sweets:          'Sweets',
        appetizers:      'Appetizers',
    }[p.cat];

    const r       = ratings[p.id];
    const avg     = r.count > 0 ? r.total / r.count : 0;
    const stars   = [1,2,3,4,5].map(s => `<span style="color:${s <= Math.round(avg) ? 'var(--gold)' : '#ddd'}">★</span>`).join('');
    const stockCls   = p.stock === 0 ? 'stock-out' : p.stock <= 4 ? 'stock-low' : 'stock-ok';
    
    let stockLabel = '';
    if (p.stock === 0) stockLabel = `<i data-lucide="x-circle" class="inline-icon"></i> Out of Stock`;
    else if (p.stock <= 4) stockLabel = `<i data-lucide="alert-triangle" class="inline-icon"></i> Only ${p.stock} left`;
    else stockLabel = `<i data-lucide="check-circle" class="inline-icon"></i> In Stock`;

    return `
        <div class="product-card">
        <div class="product-img">
            <img src="${p.image}" alt="${p.name}" class="product-photo" />
            ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            <span class="stock-badge ${stockCls}">${stockLabel}</span>
        </div>
        <div class="product-body">
            <div class="product-cat">${catLabel}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-desc">${p.desc}</div>
            <div class="product-meta">
            <div class="product-weight"><i data-lucide="package" class="inline-icon"></i> Available in ${p.weight}</div>
            <div class="product-rating-display">
                <span class="stars-display">${stars}</span>
                <span class="rating-count">${r.count > 0 ? `${avg.toFixed(1)} (${r.count})` : 'No ratings yet'}</span>
                <button class="btn-rate" onclick="openReviews(${p.id})"><i data-lucide="message-square" class="inline-icon" style="margin:0;"></i> Reviews</button>
            </div>
            <div class="product-footer">
                <div class="product-price">${priceLabel}</div>
                <button class="btn-add" onclick="addToCart(${p.id})" title="Add to Cart" ${p.stock === 0 ? 'disabled' : ''}>${p.stock === 0 ? '<i data-lucide="ban"></i>' : '<i data-lucide="plus"></i>'}</button>
            </div>
            </div>
        </div>
        </div>`;
    }).join('');
    refreshIcons();
}

function filterProducts(cat, btn) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(cat);
}

/* ══════════════════════════════════════════════
    CART
    ══════════════════════════════════════════════ */

function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (product.stock === 0) { showToast('<i data-lucide="x-circle" class="inline-icon"></i> This item is out of stock.'); return; }

    const price    = orderType === 'wholesale' ? Math.round(product.price * 0.9) : product.price;
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty++;
    else cart.push({ ...product, price, qty: 1 });

    updateCartUI();
    showToast(`<i data-lucide="check-circle" class="inline-icon"></i> ${product.name} added to cart!`);
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else updateCartUI();
}

function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getCartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

function updateCartUI() {
    const count    = getCartCount();
    const badge    = document.getElementById('cartBadge');
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);

    const itemsEl  = document.getElementById('cartItems');
    const footerEl = document.getElementById('cartFooter');
    const total    = getCartTotal();

    if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><i data-lucide="shopping-cart" class="empty-icon"></i><p>Your cart is empty</p></div>`;
    footerEl.style.display = 'none';
    refreshIcons();
    return;
    }

    footerEl.style.display = 'block';
    document.getElementById('cartSubtotal').textContent = `₱${total.toFixed(2)}`;
    document.getElementById('cartTotal').textContent    = `₱${total.toFixed(2)}`;

    itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-photo" />
        <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₱${item.price} each</div>
        <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQty(${item.id}, -1)"><i data-lucide="minus" class="inline-icon" style="margin:0;"></i></button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${item.id}, 1)"><i data-lucide="plus" class="inline-icon" style="margin:0;"></i></button>
        </div>
        </div>
        <div class="cart-item-total">₱${(item.price * item.qty).toFixed(2)}</div>
        <button class="btn-remove" onclick="removeFromCart(${item.id})"><i data-lucide="trash-2"></i></button>
    </div>
    `).join('');
    refreshIcons();
}

/* Cart panel open / close */
function openCart()  { document.getElementById('cartOverlay').classList.add('open'); }
function closeCart() { document.getElementById('cartOverlay').classList.remove('open'); }
function handleCartOverlayClick(e) { if (e.target === document.getElementById('cartOverlay')) closeCart(); }

/* ══════════════════════════════════════════════
    AUTH
    ══════════════════════════════════════════════ */

function openAuth()  { document.getElementById('authOverlay').classList.add('open'); }
function closeAuth() { document.getElementById('authOverlay').classList.remove('open'); }
function handleAuthOverlayClick(e) { if (e.target === document.getElementById('authOverlay')) closeAuth(); }

function toggleAuth() {
    isRegister = !isRegister;
    document.getElementById('authTitle').textContent    = isRegister ? 'Create Account' : 'Welcome Back';
    document.getElementById('authSub').textContent      = isRegister ? "Join Lola Edna's community" : 'Sign in to track your orders';
    document.getElementById('authBtnText').textContent  = isRegister ? 'Register' : 'Sign In';
    document.getElementById('registerName').style.display = isRegister ? 'block' : 'none';
    document.getElementById('authSwitch').innerHTML = isRegister
    ? 'Already have an account? <a onclick="toggleAuth()">Sign in</a>'
    : "Don't have an account? <a onclick=\"toggleAuth()\">Register here</a>";
}

function handleAuth() {
    const email = document.getElementById('inputEmail').value.trim();
    const pass  = document.getElementById('inputPassword').value;
    const name  = document.getElementById('inputName').value.trim();

    if (!email || !pass)          { showToast('Please fill in all fields.'); return; }
    if (isRegister && !name)      { showToast('Please enter your name.');    return; }

    currentUser = { name: isRegister ? name : email.split('@')[0], email };
    document.querySelector('.btn-nav-login').textContent = `Hi, ${currentUser.name.split(' ')[0]}!`;
    closeAuth();
    showToast(`Welcome${isRegister ? '' : ' back'}, ${currentUser.name.split(' ')[0]}!`);
}

/* ══════════════════════════════════════════════
    PAYMENT & FULFILLMENT
    ══════════════════════════════════════════════ */

function setPayment(method) {
    paymentMethod = method;
    document.getElementById('payBtnCOD').className   = `pay-btn${method === 'cod'   ? ' active'       : ''}`;
    document.getElementById('payBtnGcash').className = `pay-btn${method === 'gcash' ? ' gcash-active' : ''}`;
    document.getElementById('codBadgeEl').style.display = method === 'cod' ? 'flex' : 'none';
    document.getElementById('gcashInfoEl').className = `gcash-info${method === 'gcash' ? ' show' : ''}`;
}

function setFulfillment(method) {
    fulfillmentMethod = method;
    document.getElementById('btnDelivery').classList.toggle('active', method === 'delivery');
    document.getElementById('btnPickup').classList.toggle('active',   method === 'pickup');
    document.getElementById('addressGroup').style.display = method === 'delivery' ? 'block' : 'none';
    document.getElementById('pickupNote').style.display   = method === 'pickup'   ? 'block' : 'none';
}

/* ══════════════════════════════════════════════
    CHECKOUT
    ══════════════════════════════════════════════ */

function openCheckout() {
    if (cart.length === 0)                                 { showToast('Your cart is empty!'); return; }
    if (orderType === 'wholesale' && getCartCount() < 6)   { showToast('<i data-lucide="alert-triangle" class="inline-icon"></i> Wholesale orders require at least 6 jars!'); return; }

    // Set minimum datetime to 2 hours from now
    const now = new Date();
    now.setHours(now.getHours() + 2);
    document.getElementById('co-datetime').min = now.toISOString().slice(0, 16);

    closeCart();
    document.getElementById('checkoutForm').style.display    = 'block';
    document.getElementById('checkoutSuccess').style.display = 'none';
    document.getElementById('wholesaleNoteCheckout').classList.toggle('show', orderType === 'wholesale');

    setPayment('cod');
    setFulfillment('delivery');
    renderCheckoutSummary();
    document.getElementById('checkoutOverlay').classList.add('open');
}

function closeCheckout() { document.getElementById('checkoutOverlay').classList.remove('open'); }
function handleCheckoutOverlayClick(e) { if (e.target === document.getElementById('checkoutOverlay')) closeCheckout(); }

function renderCheckoutSummary() {
    const subtotal     = getCartTotal();
    const totalQty     = getCartCount();
    const promoApplied = orderType === 'wholesale' && totalQty >= 6;
    const discount     = promoApplied ? subtotal * 0.10 : 0;
    const total        = subtotal - discount;

    document.getElementById('checkoutOrderSummary').innerHTML = `
    <div style="background:var(--tan-light);border-radius:12px;padding:1rem;font-size:.85rem;">
        <div style="font-weight:700;color:var(--brown-dark);margin-bottom:.6rem;">
        Order Summary ${orderType === 'wholesale' ? '<span class="wholesale-badge"><i data-lucide="package" class="inline-icon" style="margin:0;"></i> WHOLESALE</span>' : ''}
        </div>
        ${cart.map(i => `
        <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;color:var(--text-mid);">
            <span>${i.emoji} ${i.name} × ${i.qty}</span><span>₱${(i.price * i.qty).toFixed(2)}</span>
        </div>`).join('')}
        ${promoApplied ? `
        <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;color:#198754;font-weight:700;">
            <span><i data-lucide="party-popper" class="inline-icon"></i> Wholesale Promo (-10%)</span><span>-₱${discount.toFixed(2)}</span>
        </div>` : ''}
        <div style="border-top:1px solid var(--tan);padding-top:.6rem;margin-top:.4rem;font-weight:900;font-family:'Playfair Display',serif;display:flex;justify-content:space-between;color:var(--brown-dark);">
        <span>Total</span><span>₱${total.toFixed(2)}</span>
        </div>
    </div>`;
    refreshIcons();
}

function placeOrder() {
    const name          = document.getElementById('co-name').value.trim();
    const phone         = document.getElementById('co-phone').value.trim();
    const address       = fulfillmentMethod === 'delivery'
    ? document.getElementById('co-address').value.trim()
    : 'PICKUP';
    const scheduledDate = document.getElementById('co-datetime').value;

    if (!name || !phone)                              { showToast('Please fill in all required fields.'); return; }
    if (fulfillmentMethod === 'delivery' && !address) { showToast('Please enter a delivery address.');   return; }

    const subtotal     = getCartTotal();
    const totalQty     = getCartCount();
    const promoApplied = orderType === 'wholesale' && totalQty >= 6;
    const discount     = promoApplied ? subtotal * 0.10 : 0;
    const finalTotal   = subtotal - discount;
    const orderId      = 'LE-' + Date.now().toString().slice(-6);

    const order = {
    id: orderId, name, phone, address,
    items: [...cart], subtotal, discount, total: finalTotal,
    type: orderType, payment: paymentMethod, fulfillment: fulfillmentMethod,
    scheduledDate: scheduledDate || null,
    source: 'online',
    status: 'approval',
    placedAt: new Date(),
    };

    orders.unshift(order);
    lastPlacedOrder = order;

    // Deduct stock
    cart.forEach(ci => {
    const p = PRODUCTS.find(pr => pr.id === ci.id);
    if (p) p.stock = Math.max(0, p.stock - ci.qty);
    });

    cart = [];
    updateCartUI();
    renderOrders();
    renderSellerOrders();
    renderProducts(activeFilterCat());

    document.getElementById('successOrderId').textContent    = `Order #${orderId}`;
    document.getElementById('checkoutForm').style.display    = 'none';
    document.getElementById('checkoutSuccess').style.display = 'block';
}

/* ══════════════════════════════════════════════
    ORDER TRACKER
    ══════════════════════════════════════════════ */

function renderOrders() {
    const container = document.getElementById('ordersContainer');
    const online    = orders.filter(o => o.source === 'online');

    if (online.length === 0) {
    container.innerHTML = `<div class="no-orders-msg">No orders yet. <a href="#products" style="color:var(--amber);font-weight:700;">Start shopping!</a></div>`;
    refreshIcons();
    return;
    }

    const steps = [
    { key: 'approval',  icon: 'clock', title: 'Awaiting Approval', desc: 'Waiting for seller to confirm your order.' },
    { key: 'pending',   icon: 'clipboard-check', title: 'Order Confirmed',   desc: 'Your order has been approved by the seller.' },
    { key: 'preparing', icon: 'chef-hat', title: 'Preparing',        desc: 'Lola Edna is preparing your order.' },
    { key: 'delivery',  icon: 'truck', title: 'Out for Delivery',  desc: '' },
    { key: 'delivered', icon: 'check-circle', title: 'Delivered',          desc: 'Enjoy your order. Thank you!' },
    ];

    const statusLabels = {
    approval: 'Awaiting Approval', pending: 'Confirmed', preparing: 'Preparing',
    delivery: 'Out for Delivery',  delivered: 'Delivered', cancelled: 'Cancelled',
    };
    const statusCls = {
    approval: 'status-approval', pending: 'status-pending', preparing: 'status-preparing',
    delivery: 'status-delivery', delivered: 'status-delivered', cancelled: 'status-cancelled',
    };

    container.innerHTML = online.map(o => {
    const isCancellable  = o.status === 'approval';
    const isCancelled    = o.status === 'cancelled';
    const isDelivered    = o.status === 'delivered';
    const statusIndex    = steps.findIndex(s => s.key === o.status);

    // Dynamic delivery step description
    const stepsForOrder = steps.map(s => ({
        ...s,
        desc: s.key === 'delivery'
        ? (o.fulfillment === 'pickup' ? 'Ready for pickup!' : 'Your order is on its way!')
        : s.desc,
    }));

    const deliveryStatusLabel = o.status === 'delivery' && o.fulfillment === 'pickup'
        ? 'Ready for Pickup' : statusLabels[o.status];

    const typeBadge = o.type === 'wholesale'
        ? `<span style="font-size:.68rem;background:var(--gold);color:var(--brown-dark);font-weight:900;padding:.2rem .55rem;border-radius:10px;margin-left:.4rem;"><i data-lucide="package" class="inline-icon" style="margin:0;"></i> WHOLESALE</span>`
        : `<span style="font-size:.68rem;background:#cfe2ff;color:#084298;font-weight:900;padding:.2rem .55rem;border-radius:10px;margin-left:.4rem;"><i data-lucide="shopping-bag" class="inline-icon" style="margin:0;"></i> RETAIL</span>`;

    const payBadge = o.payment === 'gcash'
        ? `<span style="font-size:.68rem;background:#e8f4ff;color:#0074e0;font-weight:900;padding:.2rem .55rem;border-radius:10px;margin-left:.4rem;"><i data-lucide="smartphone" class="inline-icon" style="margin:0;"></i> GCash</span>`
        : `<span style="font-size:.68rem;background:#d1e7dd;color:#0a3622;font-weight:900;padding:.2rem .55rem;border-radius:10px;margin-left:.4rem;"><i data-lucide="banknote" class="inline-icon" style="margin:0;"></i> COD</span>`;

    const discountLine = (o.discount && o.discount > 0)
        ? `<span style="color:#198754;font-weight:700;"> · <i data-lucide="party-popper" class="inline-icon"></i> -₱${o.discount.toFixed(2)} promo</span>` : '';

    const schedLine = o.scheduledDate
        ? `<div style="font-size:.78rem;color:var(--amber);margin-top:.2rem;"><i data-lucide="calendar" class="inline-icon"></i> Scheduled: ${new Date(o.scheduledDate).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</div>`
        : '';

    return `
        <div class="tracker-card" id="order-card-${o.id}">
        <div class="tracker-header">
            <div>
            <div class="tracker-id">Order #${o.id} ${typeBadge} ${payBadge}</div>
            <div style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:var(--brown-dark);margin-top:.2rem;">${o.name}</div>
            <div style="font-size:.8rem;color:var(--text-light);">${o.fulfillment === 'pickup' ? '<i data-lucide="store" class="inline-icon"></i> Pickup' : `<i data-lucide="map-pin" class="inline-icon"></i> ${o.address}`}</div>
            ${schedLine}
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.5rem;">
            <span class="status-pill ${statusCls[o.status]}">${deliveryStatusLabel}</span>
            ${isCancellable ? `<button class="btn-cancel-order" onclick="openCancelConfirm('${o.id}')"><i data-lucide="x"></i> Cancel Order</button>` : ''}
            ${isDelivered   ? `<button class="btn-rate" onclick="openRating(${o.items[0].id})" style="margin-left:0;"><i data-lucide="star" class="inline-icon" style="margin:0;"></i> Rate Products</button>` : ''}
            </div>
        </div>
        ${isCancelled ? `
            <div style="background:#f8d7da;border-radius:12px;padding:.9rem 1rem;font-size:.85rem;color:#842029;text-align:center;margin-bottom:.8rem;"><i data-lucide="x-circle" class="inline-icon"></i> This order was cancelled.</div>
        ` : `
            <div class="timeline">
            ${stepsForOrder.map((step, i) => {
                const isDone   = statusIndex > i && !isCancelled;
                const isActive = i === statusIndex && !isCancelled;
                return `<div class="timeline-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}">
                <div class="t-dot">${isDone ? '<i data-lucide="check"></i>' : `<i data-lucide="${step.icon}"></i>`}</div>
                <div class="t-info">
                    <div class="t-title">${step.title}</div>
                    <div class="t-desc">${step.desc}</div>
                </div>
                </div>`;
            }).join('')}
            </div>
        `}
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--tan-light);display:flex;justify-content:space-between;font-size:.85rem;color:var(--text-mid);flex-wrap:wrap;gap:.3rem;">
            <span>${o.items.length} item(s) · ₱${o.total.toFixed(2)} ${payBadge}${discountLine}</span>
            <button onclick="showReceiptForOrder('${o.id}')" style="background:none;border:none;color:var(--amber);font-size:.82rem;font-weight:700;cursor:pointer;"><i data-lucide="receipt" class="inline-icon"></i> Receipt</button>
        </div>
        </div>`;
    }).join('');
    refreshIcons();
}

/* ══════════════════════════════════════════════
    CANCEL ORDER
    ══════════════════════════════════════════════ */

function openCancelConfirm(orderId) {
    cancelTargetId = orderId;
    document.getElementById('cancelOrderIdDisplay').textContent = `#${orderId}`;
    document.getElementById('cancelConfirmOverlay').classList.add('open');
}

function closeCancelConfirm() {
    cancelTargetId = null;
    document.getElementById('cancelConfirmOverlay').classList.remove('open');
}

function confirmCancelOrder() {
    if (!cancelTargetId) return;
    const order = orders.find(o => o.id === cancelTargetId);

    if (order && order.status === 'approval') {
    order.status = 'cancelled';
    // Restore stock
    order.items.forEach(ci => {
        const p = PRODUCTS.find(pr => pr.id === ci.id);
        if (p) p.stock += ci.qty;
    });
    renderOrders();
    renderSellerOrders();
    renderProducts(activeFilterCat());
    showToast(`Order #${cancelTargetId} has been cancelled.`);
    }
    closeCancelConfirm();
}

/* ══════════════════════════════════════════════
    SELLER LOGIN
    ══════════════════════════════════════════════ */

function openSellerPanel() {
    if (sellerAuthenticated) {
    _launchSellerDashboard();
    } else {
    document.getElementById('sellerLoginUser').value = '';
    document.getElementById('sellerLoginPass').value = '';
    document.getElementById('sellerLoginError').classList.remove('show');
    document.getElementById('sellerLoginOverlay').classList.add('open');
    setTimeout(() => document.getElementById('sellerLoginUser').focus(), 100);
    }
}

function closeSellerLogin() {
    document.getElementById('sellerLoginOverlay').classList.remove('open');
}

function doSellerLogin() {
    const u = document.getElementById('sellerLoginUser').value.trim();
    const p = document.getElementById('sellerLoginPass').value;

    if (u === SELLER_CREDENTIALS.username && p === SELLER_CREDENTIALS.password) {
    sellerAuthenticated = true;
    closeSellerLogin();
    showToast('Welcome, Lola Edna!');
    _launchSellerDashboard();
    } else {
    document.getElementById('sellerLoginError').classList.add('show');
    document.getElementById('sellerLoginPass').value = '';
    document.getElementById('sellerLoginPass').focus();
    }
}

function _launchSellerDashboard() {
    renderSellerOrders();
    renderAllOrdersTable();
    renderCustomers();
    renderReports();
    renderStockManager();
    populateManualOrderProducts();
    document.getElementById('sellerPanelOverlay').classList.add('open');
}

function closeSellerPanel() { document.getElementById('sellerPanelOverlay').classList.remove('open'); }
function handleSellerOverlayClick(e) { if (e.target === document.getElementById('sellerPanelOverlay')) closeSellerPanel(); }

function switchSpTab(tabId, btn) {
    document.querySelectorAll('.sp-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sp-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('sp-' + tabId).classList.add('active');

    if (tabId === 'allorders') renderAllOrdersTable();
    if (tabId === 'customers') renderCustomers();
    if (tabId === 'reports')   renderReports();
    if (tabId === 'stock')     renderStockManager();
}

/* ── Pending Orders (Seller) ── */
function renderSellerOrders() {
    const pending = orders.filter(o => o.status === 'approval');
    const list    = document.getElementById('sellerOrdersList');
    if (!list) return;

    if (pending.length === 0) {
    list.innerHTML = `<div class="no-pending"><i data-lucide="check-circle" class="inline-icon"></i> No pending orders. All caught up!</div>`;
    refreshIcons();
    return;
    }

    list.innerHTML = pending.map(o => {
    const typeClass = o.type === 'wholesale' ? 'approval-type-wholesale' : 'approval-type-retail';
    const typeLabel = o.type === 'wholesale' ? '<i data-lucide="package" class="inline-icon" style="margin:0;"></i> Wholesale' : '<i data-lucide="shopping-bag" class="inline-icon" style="margin:0;"></i> Retail';
    const srcBadge  = `<span class="source-badge source-${o.source || 'online'}">${
        o.source === 'fb' ? '<i data-lucide="facebook" class="inline-icon" style="margin:0;"></i> FB' : o.source === 'direct' ? '<i data-lucide="store" class="inline-icon" style="margin:0;"></i> Direct' : '<i data-lucide="globe" class="inline-icon" style="margin:0;"></i> Online'
    }</span>`;

    return `
        <div class="approval-card" id="approval-${o.id}">
        <div class="approval-card-header">
            <div class="approval-card-id">Order #${o.id} ${srcBadge}</div>
            <span class="approval-card-type ${typeClass}">${typeLabel}</span>
        </div>
        <div style="font-size:.82rem;color:var(--text-mid);margin-bottom:.4rem;"><i data-lucide="user" class="inline-icon"></i> ${o.name} · <i data-lucide="phone" class="inline-icon"></i> ${o.phone}</div>
        <div style="font-size:.78rem;color:var(--text-light);margin-bottom:.3rem;">${o.fulfillment === 'pickup' ? '<i data-lucide="store" class="inline-icon"></i> Pickup' : `<i data-lucide="map-pin" class="inline-icon"></i> ${o.address}`}</div>
        ${o.scheduledDate ? `<div style="font-size:.76rem;color:var(--amber);margin-bottom:.4rem;"><i data-lucide="calendar" class="inline-icon"></i> Requested: ${new Date(o.scheduledDate).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</div>` : ''}
        <div class="approval-card-items">${o.items.map(i => `${i.emoji} ${i.name} × ${i.qty}`).join(' &nbsp;·&nbsp; ')}</div>
        <div class="approval-card-total">
            Total: ₱${o.total.toFixed(2)} · ${o.payment === 'gcash' ? '<i data-lucide="smartphone" class="inline-icon"></i> GCash' : '<i data-lucide="banknote" class="inline-icon"></i> COD'}
            ${o.discount > 0 ? `<span style="font-size:.78rem;color:#198754;font-weight:600;margin-left:.4rem;">(incl. ₱${o.discount.toFixed(2)} promo)</span>` : ''}
        </div>
        <div class="approval-actions">
            <button class="btn-approve" onclick="approveOrder('${o.id}')"><i data-lucide="check" class="inline-icon" style="margin:0;"></i> Approve</button>
            <button class="btn-reject"  onclick="rejectOrder('${o.id}')"><i data-lucide="x" class="inline-icon" style="margin:0;"></i> Reject</button>
        </div>
        </div>`;
    }).join('');
    refreshIcons();
}

/* ── All Orders Table ── */
function renderAllOrdersTable() {
    const tbody = document.getElementById('allOrdersBody');
    if (!tbody) return;

    if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:var(--text-light);">No orders yet.</td></tr>`;
    refreshIcons();
    return;
    }

    const statusLabels = {
    approval: 'Awaiting', pending: 'Confirmed', preparing: 'Preparing',
    delivery: 'Delivering', delivered: 'Delivered', cancelled: 'Cancelled',
    };
    const statusColors = {
    approval: '#7a4900', pending: '#856404', preparing: '#084298',
    delivery: '#0a3622', delivered: '#198754', cancelled: '#842029',
    };
    const nextStatuses = {
    approval: 'pending', pending: 'preparing', preparing: 'delivery', delivery: 'delivered',
    };

    tbody.innerHTML = orders.map(o => {
    const next = nextStatuses[o.status];
    return `<tr>
        <td><strong>${o.id}</strong><br><span class="source-badge source-${o.source || 'online'}" style="font-size:.6rem; margin-top:.2rem;">${o.source || 'online'}</span></td>
        <td>${o.name}<br><span style="font-size:.75rem;color:var(--text-light);">${o.phone}</span></td>
        <td style="font-size:.78rem;">${o.items.map(i => `${i.emoji}×${i.qty}`).join(' ')}</td>
        <td><strong>₱${o.total.toFixed(2)}</strong><br><span style="font-size:.72rem;color:${o.payment === 'gcash' ? '#0074e0' : '#198754'};"><i data-lucide="${o.payment === 'gcash' ? 'smartphone' : 'banknote'}" style="width:10px;height:10px;vertical-align:middle;"></i> ${o.payment === 'gcash' ? 'GCash' : 'COD'}</span></td>
        <td style="font-size:.75rem;">${o.fulfillment === 'pickup' ? '<i data-lucide="store" style="width:12px;height:12px;vertical-align:middle;"></i> Pickup' : '<i data-lucide="truck" style="width:12px;height:12px;vertical-align:middle;"></i> Delivery'}</td>
        <td><span style="color:${statusColors[o.status] || '#333'};font-weight:700;font-size:.8rem;">${statusLabels[o.status] || o.status}</span></td>
        <td>${next ? `<button class="btn-advance" onclick="advanceOrder('${o.id}')" style="font-size:.72rem;padding:.35rem .8rem;">→ ${statusLabels[next]}</button>` : '—'}</td>
    </tr>`;
    }).join('');
    refreshIcons();
}

/* ── Order Status Advancement ── */
function advanceOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const next = { approval: 'pending', pending: 'preparing', preparing: 'delivery', delivery: 'delivered' }[order.status];
    if (next) {
    order.status = next;
    renderOrders();
    renderAllOrdersTable();
    renderSellerOrders();
    showToast(`Order #${orderId} updated to "${next}"`);
    }
}

function approveOrder(orderId) {
    advanceOrder(orderId);
    renderSellerOrders();
}

function rejectOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = 'cancelled';
    order.items.forEach(ci => {
    const p = PRODUCTS.find(pr => pr.id === ci.id);
    if (p) p.stock += ci.qty;
    });
    renderOrders();
    renderSellerOrders();
    renderAllOrdersTable();
    renderProducts(activeFilterCat());
    showToast(`<i data-lucide="x-circle" class="inline-icon"></i> Order #${orderId} rejected.`);
}

/* ══════════════════════════════════════════════
    CUSTOMER CONTACTS
    ══════════════════════════════════════════════ */

function renderCustomers() {
    const el = document.getElementById('customersList');
    if (!el) return;

    const uniqueMap = {};
    orders.forEach(o => {
    if (!uniqueMap[o.phone]) {
        uniqueMap[o.phone] = { name: o.name, phone: o.phone, address: o.address || '', count: 0, total: 0 };
    }
    uniqueMap[o.phone].count++;
    uniqueMap[o.phone].total += o.total;
    });

    const customers = Object.values(uniqueMap);
    if (customers.length === 0) { el.innerHTML = '<div class="no-pending">No customers yet.</div>'; return; }

    el.innerHTML = customers.map(c => `
    <div class="customer-card">
        <div class="cust-avatar">${c.name[0].toUpperCase()}</div>
        <div class="cust-info">
        <div class="cust-name">${c.name}</div>
        <div class="cust-details"><i data-lucide="phone" class="inline-icon" style="margin:0;"></i> ${c.phone} ${c.address && c.address !== 'PICKUP' ? `· <i data-lucide="map-pin" class="inline-icon" style="margin:0;"></i> ${c.address}` : '🏪 Pickup'}</div>
        <div style="font-size:.75rem;color:#198754;font-weight:700;margin-top:.2rem;">Total spent: ₱${c.total.toFixed(2)}</div>
        </div>
        <span class="cust-orders-count">${c.count} order${c.count !== 1 ? 's' : ''}</span>
    </div>
    `).join('');
    refreshIcons();
}

/* ══════════════════════════════════════════════
    REPORTS
    ══════════════════════════════════════════════ */

function renderReports() {
    const el = document.getElementById('reportSummary');
    if (!el) return;

    const delivered     = orders.filter(o => o.status === 'delivered');
    const totalRevenue  = delivered.reduce((s, o) => s + o.total, 0);
    const pendingCount  = orders.filter(o => o.status === 'approval').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    el.innerHTML = `
    <div class="report-card"><div class="r-val">₱${totalRevenue.toFixed(0)}</div><div class="r-lbl">Total Revenue</div></div>
    <div class="report-card"><div class="r-val">${orders.length}</div><div class="r-lbl">Total Orders</div></div>
    <div class="report-card"><div class="r-val">${delivered.length}</div><div class="r-lbl">Completed</div></div>
    <div class="report-card"><div class="r-val">${pendingCount}</div><div class="r-lbl">Pending</div></div>
    <div class="report-card"><div class="r-val">${cancelledCount}</div><div class="r-lbl">Cancelled</div></div>
    `;

    // Top products
    const productCount = {};
    orders.forEach(o => o.items.forEach(i => { productCount[i.name] = (productCount[i.name] || 0) + i.qty; }));
    const sorted = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    document.getElementById('topProductsList').innerHTML = sorted.length === 0
    ? '<li style="color:var(--text-light);font-size:.85rem;">No data yet.</li>'
    : sorted.map(([name, qty]) => `<li><span>${name}</span><strong>${qty} units</strong></li>`).join('');

    // Sources
    const srcCount = {};
    orders.forEach(o => { const s = o.source || 'online'; srcCount[s] = (srcCount[s] || 0) + 1; });
    document.getElementById('sourcesList').innerHTML = Object.keys(srcCount).length === 0
    ? '<li style="color:var(--text-light);font-size:.85rem;">No data yet.</li>'
    : Object.entries(srcCount).map(([s, c]) => `<li><span>${s === 'fb' ? '<i data-lucide="facebook" class="inline-icon" style="margin:0; width:12px; height:12px;"></i> Facebook' : s === 'direct' ? '<i data-lucide="store" class="inline-icon" style="margin:0; width:12px; height:12px;"></i> Direct' : '<i data-lucide="globe" class="inline-icon" style="margin:0; width:12px; height:12px;"></i> Online'}</span><strong>${c} orders</strong></li>`).join('');

    // Payments
    const payCount = {};
    orders.forEach(o => { const p = o.payment || 'cod'; payCount[p] = (payCount[p] || 0) + 1; });
    document.getElementById('paymentsList').innerHTML = Object.keys(payCount).length === 0
    ? '<li style="color:var(--text-light);font-size:.85rem;">No data yet.</li>'
    : Object.entries(payCount).map(([p, c]) => `<li><span>${p === 'gcash' ? '<i data-lucide="smartphone" class="inline-icon" style="margin:0; width:12px; height:12px;"></i> GCash' : p === 'cash' ? '<i data-lucide="coins" class="inline-icon" style="margin:0; width:12px; height:12px;"></i> Cash' : '<i data-lucide="banknote" class="inline-icon" style="margin:0; width:12px; height:12px;"></i> COD'}</span><strong>${c} orders</strong></li>`).join('');
    
    refreshIcons();
}

/* ══════════════════════════════════════════════
    STOCK MANAGER
    ══════════════════════════════════════════════ */

function renderStockManager() {
    const el = document.getElementById('stockList');
    if (!el) return;

    el.innerHTML = PRODUCTS.map(p => {
    const cls = p.stock === 0 ? 'stock-out' : p.stock <= 4 ? 'stock-low' : 'stock-ok';
    
    let stockLabel = '';
    if (p.stock === 0) stockLabel = `<i data-lucide="x-circle" class="inline-icon" style="margin:0; width:12px; height:12px;"></i> Out of Stock`;
    else if (p.stock <= 4) stockLabel = `<i data-lucide="alert-triangle" class="inline-icon" style="margin:0; width:12px; height:12px;"></i> Low (${p.stock})`;
    else stockLabel = `<i data-lucide="check-circle" class="inline-icon" style="margin:0; width:12px; height:12px;"></i> ${p.stock} in stock`;

    return `
        <div style="display:flex;align-items:center;gap:.8rem;padding:.8rem;background:#fff;border-radius:14px;border:1.5px solid var(--tan-light);margin-bottom:.6rem;flex-wrap:wrap;">
        <span style="font-size:1.6rem;">${p.emoji}</span>
        <div style="flex:1;">
            <div style="font-family:'Playfair Display',serif;font-weight:700;color:var(--brown-dark);font-size:.9rem;">${p.name}</div>
            <span class="stock-badge ${cls}" style="position:static;display:inline-flex;align-items:center;gap:.2rem;margin-top:.2rem;">${stockLabel}</span>
        </div>
        <div style="display:flex;align-items:center;gap:.4rem;">
            <button class="qty-btn" onclick="adjustStock(${p.id}, -1)"><i data-lucide="minus" class="inline-icon" style="margin:0;"></i></button>
            <input type="number" min="0" value="${p.stock}" id="stock-input-${p.id}"
            style="width:55px;text-align:center;border:1.5px solid var(--tan-light);border-radius:8px;padding:.3rem;font-size:.9rem;"
            onchange="setStock(${p.id}, this.value)" />
            <button class="qty-btn" onclick="adjustStock(${p.id}, 1)"><i data-lucide="plus" class="inline-icon" style="margin:0;"></i></button>
        </div>
        </div>`;
    }).join('');
    refreshIcons();
}

function adjustStock(id, delta) {
    const p = PRODUCTS.find(pr => pr.id === id);
    if (p) {
    p.stock = Math.max(0, p.stock + delta);
    renderStockManager();
    renderProducts(activeFilterCat());
    }
}

function setStock(id, val) {
    const p = PRODUCTS.find(pr => pr.id === id);
    if (p) {
    p.stock = Math.max(0, parseInt(val) || 0);
    renderProducts(activeFilterCat());
    }
}

/* ══════════════════════════════════════════════
    MANUAL ORDER ENTRY
    ══════════════════════════════════════════════ */

function populateManualOrderProducts() {
    document.querySelectorAll('.mo-product-sel').forEach(sel => {
    if (sel.options.length <= 1) {
        PRODUCTS.forEach(p => {
        const opt = document.createElement('option');
        opt.value       = p.id;
        opt.textContent = `${p.emoji} ${p.name} — ₱${p.price}`;
        sel.appendChild(opt);
        });
    }
    });
}

function addMoItem() {
    const container = document.getElementById('moItemsContainer');
    const row       = document.createElement('div');
    row.className   = 'manual-item-row';
    row.innerHTML   = `
    <select class="mo-product-sel">
        <option value="">— Select Product —</option>
        ${PRODUCTS.map(p => `<option value="${p.id}">${p.emoji} ${p.name} — ₱${p.price}</option>`).join('')}
    </select>
    <input type="number" min="1" value="1" class="mo-qty-inp" />
    <button class="btn-rm-item" onclick="removeMoItem(this)"><i data-lucide="trash-2" class="inline-icon" style="margin:0;"></i></button>`;
    container.appendChild(row);
    refreshIcons();
}

function removeMoItem(btn) {
    const rows = document.querySelectorAll('.manual-item-row');
    if (rows.length <= 1) { showToast('At least one item is required.'); return; }
    btn.closest('.manual-item-row').remove();
}

function submitManualOrder() {
    const name          = document.getElementById('mo-name').value.trim();
    const phone         = document.getElementById('mo-phone').value.trim();
    const address       = document.getElementById('mo-address').value.trim();
    const source        = document.getElementById('mo-source').value;
    const payment       = document.getElementById('mo-payment').value;
    const type          = document.getElementById('mo-type').value;
    const scheduledDate = document.getElementById('mo-datetime').value;

    if (!name || !phone) { showToast('Please fill in customer name and phone.'); return; }

    const items = [];
    document.querySelectorAll('.manual-item-row').forEach(row => {
    const sel = row.querySelector('.mo-product-sel');
    const qty = parseInt(row.querySelector('.mo-qty-inp').value) || 1;
    if (sel.value) {
        const p = PRODUCTS.find(pr => pr.id === parseInt(sel.value));
        if (p) {
        const price = type === 'wholesale' ? Math.round(p.price * 0.9) : p.price;
        items.push({ ...p, price, qty });
        }
    }
    });

    if (items.length === 0) { showToast('Please select at least one product.'); return; }

    const subtotal     = items.reduce((s, i) => s + i.price * i.qty, 0);
    const totalQty     = items.reduce((s, i) => s + i.qty, 0);
    const promoApplied = type === 'wholesale' && totalQty >= 6;
    const discount     = promoApplied ? subtotal * 0.10 : 0;
    const finalTotal   = subtotal - discount;
    const orderId      = 'LE-' + Date.now().toString().slice(-6);

    const order = {
    id: orderId, name, phone, address: address || 'PICKUP',
    items, subtotal, discount, total: finalTotal,
    type, payment, fulfillment: address ? 'delivery' : 'pickup',
    scheduledDate: scheduledDate || null,
    source, status: 'pending', placedAt: new Date(),
    };

    orders.unshift(order);

    // Deduct stock
    items.forEach(ci => {
    const p = PRODUCTS.find(pr => pr.id === ci.id);
    if (p) p.stock = Math.max(0, p.stock - ci.qty);
    });

    renderAllOrdersTable();
    renderCustomers();
    renderReports();
    renderStockManager();
    renderProducts(activeFilterCat());

    // Reset form
    document.getElementById('mo-name').value    = '';
    document.getElementById('mo-phone').value   = '';
    document.getElementById('mo-address').value = '';
    document.getElementById('mo-datetime').value = '';
    document.getElementById('moItemsContainer').innerHTML = `
    <div class="manual-item-row">
        <select class="mo-product-sel">
        <option value="">— Select Product —</option>
        ${PRODUCTS.map(p => `<option value="${p.id}">${p.emoji} ${p.name} — ₱${p.price}</option>`).join('')}
        </select>
        <input type="number" min="1" value="1" class="mo-qty-inp" />
        <button class="btn-rm-item" onclick="removeMoItem(this)"><i data-lucide="trash-2" class="inline-icon" style="margin:0;"></i></button>
    </div>`;
    
    refreshIcons();
    showToast(`<i data-lucide="check-circle" class="inline-icon"></i> Manual order #${orderId} created for ${name}!`);
}

/* ══════════════════════════════════════════════
    RATINGS
    ══════════════════════════════════════════════ */

function openRating(productId) {
    ratingTargetId = productId;
    selectedStar   = 0;
    const p = PRODUCTS.find(pr => pr.id === productId);
    document.getElementById('ratingProductName').textContent = p ? `${p.emoji} ${p.name}` : '';
    document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('lit'));
    document.getElementById('ratingOverlay').classList.add('open');
}

function closeRating() {
    document.getElementById('ratingOverlay').classList.remove('open');
    ratingTargetId = null;
    selectedStar   = 0;
}

function selectStar(val) {
    selectedStar = val;
    document.querySelectorAll('.star-btn').forEach(b => {
    b.classList.toggle('lit', parseInt(b.dataset.val) <= val);
    });
}

function submitRating() {
    if (!ratingTargetId || selectedStar === 0) { showToast('Please select a star rating.'); return; }

    const message = document.getElementById('ratingMessage').value.trim();
    const p       = PRODUCTS.find(pr => pr.id === ratingTargetId);

    ratings[ratingTargetId].total += selectedStar;
    ratings[ratingTargetId].count++;

    if (message) {
    const userName = currentUser ? currentUser.name : 'Anonymous Customer';
    ratings[ratingTargetId].reviews.unshift({
        name:    userName,
        stars:   selectedStar,
        message,
        date:    new Date().toISOString().slice(0, 10),
        emoji:   p ? p.emoji : '⭐',
    });
    }

    document.getElementById('ratingMessage').value = '';
    closeRating();
    renderProducts(activeFilterCat());
    showToast('Thank you for your review!');
}

/* ══════════════════════════════════════════════
    REVIEWS OVERLAY
    ══════════════════════════════════════════════ */

function openReviews(productId) {
    currentReviewProductId = productId;
    const p   = PRODUCTS.find(pr => pr.id === productId);
    const r   = ratings[productId];
    const avg = r.count > 0 ? r.total / r.count : 0;

    document.getElementById('reviewsProductName').textContent = p ? `${p.emoji} ${p.name}` : '';
    document.getElementById('reviewsBigStars').innerHTML = [1,2,3,4,5]
    .map(s => `<span style="color:${s <= Math.round(avg) ? 'var(--gold)' : '#ddd'}">&#x2605;</span>`)
    .join('');
    document.getElementById('reviewsAvgNum').textContent   = r.count > 0 ? avg.toFixed(1) : '—';
    document.getElementById('reviewsAvgCount').textContent = r.count > 0
    ? `(${r.count} review${r.count !== 1 ? 's' : ''})`
    : 'No reviews yet';

    const body = document.getElementById('reviewsBody');

    if (!r.reviews || r.reviews.length === 0) {
    body.innerHTML = `
        <div class="no-reviews-msg">
        <i data-lucide="message-square" class="nr-icon"></i>
        <p>No reviews yet for this product.</p>
        <p style="font-size:.82rem;margin-top:.4rem;color:var(--text-light);">Be the first to share your experience!</p>
        </div>`;
    } else {
    body.innerHTML = r.reviews.map(rv => {
        const starRow = [1,2,3,4,5].map(s => `<span style="color:${s <= rv.stars ? 'var(--gold)' : '#ddd'}">&#x2605;</span>`).join('');
        const dateStr = rv.date
        ? new Date(rv.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';
        return `
        <div class="review-card">
            <div class="review-card-top">
            <div class="reviewer-info">
                <div class="reviewer-avatar">${rv.name ? rv.name[0].toUpperCase() : 'A'}</div>
                <div>
                <div class="reviewer-name">${rv.name || 'Anonymous'}</div>
                <div class="reviewer-date">${dateStr}</div>
                </div>
            </div>
            <div class="review-stars">${starRow}</div>
            </div>
            ${rv.message ? `<div class="review-message">"${rv.message}"</div>` : ''}
        </div>`;
    }).join('');
    }

    document.getElementById('reviewsOverlay').classList.add('open');
    refreshIcons();
}

function closeReviews() { document.getElementById('reviewsOverlay').classList.remove('open'); }
function handleReviewsOverlayClick(e) { if (e.target === document.getElementById('reviewsOverlay')) closeReviews(); }

/* ══════════════════════════════════════════════
    DIGITAL RECEIPT
    ══════════════════════════════════════════════ */

function buildReceipt(order) {
    document.getElementById('rcptOrderId').textContent = `Order #${order.id}`;
    document.getElementById('rcptDate').textContent    = order.placedAt.toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' });

    document.getElementById('rcptCustomer').innerHTML = `
    <div class="receipt-row bold"><span>Customer</span><span>${order.name}</span></div>
    <div class="receipt-row"><span>Phone</span><span>${order.phone}</span></div>
    <div class="receipt-row"><span>${order.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</span><span>${order.fulfillment === 'pickup' ? '🏪 Self-Pickup' : order.address}</span></div>
    ${order.scheduledDate ? `<div class="receipt-row"><span>Scheduled</span><span>${new Date(order.scheduledDate).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>` : ''}
    <div class="receipt-row"><span>Payment</span><span>${order.payment === 'gcash' ? '📱 GCash' : '💵 Cash on Delivery'}</span></div>
    <div class="receipt-row"><span>Type</span><span>${order.type === 'wholesale' ? '📦 Wholesale' : '🛍️ Retail'}</span></div>
    `;

    document.getElementById('rcptItems').innerHTML = order.items
    .map(i => `<div class="receipt-row"><span>${i.emoji} ${i.name} × ${i.qty}</span><span>₱${(i.price * i.qty).toFixed(2)}</span></div>`)
    .join('');

    document.getElementById('rcptTotals').innerHTML = `
    <div class="receipt-row"><span>Subtotal</span><span>₱${order.subtotal.toFixed(2)}</span></div>
    ${order.discount > 0 ? `<div class="receipt-row" style="color:#198754;"><span>🎉 Wholesale Promo</span><span>-₱${order.discount.toFixed(2)}</span></div>` : ''}
    <div class="receipt-row total-row"><span>TOTAL</span><span>₱${order.total.toFixed(2)}</span></div>
    `;
}

function viewReceipt() {
    if (!lastPlacedOrder) return;
    buildReceipt(lastPlacedOrder);
    document.getElementById('receiptOverlay').classList.add('open');
}

function showReceiptForOrder(orderId) {
    const o = orders.find(ord => ord.id === orderId);
    if (!o) return;
    buildReceipt(o);
    document.getElementById('receiptOverlay').classList.add('open');
}

function closeReceipt() { document.getElementById('receiptOverlay').classList.remove('open'); }

/* ══════════════════════════════════════════════
    INIT
    ══════════════════════════════════════════════ */
renderProducts();
renderOrders();

// Initialize icons for static HTML on load
document.addEventListener("DOMContentLoaded", () => {
    refreshIcons();
});