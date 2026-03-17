const MENU_ITEMS = [
  {
    id: "kt-1",
    name: "Khmer Grilled Chicken Bowl",
    category: "Bowls",
    price: 13.99,
    description: "Grilled marinated chicken served over jasmine rice with fresh vegetables and house sauce.",
    image: "images/menu/khmer-chicken-bowl.jpg"
  },
  {
    id: "kt-2",
    name: "Beef Lok Lak",
    category: "Entrees",
    price: 16.99,
    description: "Tender beef with pepper-lime flavor, served with rice and crisp vegetables.",
    image: "images/menu/beef-lok-lak.jpg"
  },
  {
    id: "kt-3",
    name: "Khmer Curry Chicken",
    category: "Curries",
    price: 15.49,
    description: "Comforting Cambodian-style curry with chicken, potatoes, and carrots.",
    image: "images/menu/khmer-curry.jpg"
  },
  {
    id: "kt-4",
    name: "Lemongrass Beef Rice Bowl",
    category: "Bowls",
    price: 14.99,
    description: "Savory lemongrass beef with rice, pickled vegetables, and herbs.",
    image: "images/menu/lemongrass-beef-bowl.jpg"
  },
  {
    id: "kt-5",
    name: "Khmer Fried Rice",
    category: "Rice",
    price: 12.99,
    description: "Wok-fried rice with egg, vegetables, and Khmer seasoning.",
    image: "images/menu/khmer-fried-rice.jpg"
  },
  {
    id: "kt-6",
    name: "Stir-Fried Noodles",
    category: "Noodles",
    price: 13.49,
    description: "Rice noodles tossed with vegetables and savory house sauce.",
    image: "images/menu/stir-fried-noodles.jpg"
  },
  {
    id: "kt-7",
    name: "Banh Mi Sandwich",
    category: "Sandwiches",
    price: 10.99,
    description: "Crisp baguette with pickled vegetables, herbs, and savory protein.",
    image: "images/menu/banh-mi.jpg"
  },
  {
    id: "kt-8",
    name: "Mango Sticky Rice",
    category: "Desserts",
    price: 7.99,
    description: "Sweet mango with coconut sticky rice.",
    image: "images/menu/mango-sticky-rice.jpg"
  }
];

// Delivery configuration
const DELIVERY_CONFIG = {
  minimumOrder: 20,
  allowedZips: ["85008", "85016", "85018", "85032", "85040", "85042", "85281", "85282"],
  freeDeliveryThreshold: 50,
  defaultDeliveryFee: 6.99
};

// App state
const state = {
  cart: [],
  search: ""
};

// DOM
const menuGrid = document.getElementById("menuGrid");
const searchInput = document.getElementById("searchInput");
const orderItems = document.getElementById("orderItems");
const clearOrderBtn = document.getElementById("clearOrder");
const itemCountEl = document.getElementById("itemCount");
const subtotalEl = document.getElementById("orderSubtotal");
const deliveryFeeEl = document.getElementById("deliveryFee");
const totalEl = document.getElementById("orderTotal");
const orderNoticeEl = document.getElementById("orderNotice");
const zipNoticeEl = document.getElementById("zipNotice");
const zipInput = document.getElementById("zipInput");
const orderForm = document.getElementById("orderForm");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const orderDetailsField = document.getElementById("orderDetailsField");
const orderSubtotalField = document.getElementById("orderSubtotalField");
const deliveryFeeField = document.getElementById("deliveryFeeField");
const orderTotalField = document.getElementById("orderTotalField");
const stickyCart = document.getElementById("stickyCart");
const stickyCartText = document.getElementById("stickyCartText");
const stickyCartTotal = document.getElementById("stickyCartTotal");

// Utilities
function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getCartItem(id) {
  return state.cart.find(item => item.id === id);
}

function getMenuItem(id) {
  return MENU_ITEMS.find(item => item.id === id);
}

function getItemCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getSubtotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getDeliveryFee(subtotal) {
  if (subtotal <= 0) return 0;
  if (subtotal >= DELIVERY_CONFIG.freeDeliveryThreshold) return 0;
  return DELIVERY_CONFIG.defaultDeliveryFee;
}

function normalizeZip(zip) {
  return zip.replace(/\D/g, "").slice(0, 5);
}

function isZipAllowed(zip) {
  return DELIVERY_CONFIG.allowedZips.includes(normalizeZip(zip));
}

function canSubmitOrder() {
  const subtotal = getSubtotal();
  const zip = normalizeZip(zipInput.value || "");
  return state.cart.length > 0 &&
    subtotal >= DELIVERY_CONFIG.minimumOrder &&
    isZipAllowed(zip);
}

function buildOrderDetailsText() {
  if (state.cart.length === 0) return "";
  return state.cart.map(item => {
    const lineTotal = item.price * item.qty;
    return `${item.qty} x ${item.name} - ${formatMoney(item.price)} each = ${formatMoney(lineTotal)}`;
  }).join("\n");
}

// Rendering
function renderMenu() {
  const q = state.search.trim().toLowerCase();

  const filtered = MENU_ITEMS.filter(item => {
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  if (!filtered.length) {
    menuGrid.innerHTML = `
      <div class="card" style="padding:18px;">
        <strong>No menu items found.</strong>
        <p class="muted" style="margin:.4rem 0 0;">Try a different search term.</p>
      </div>
    `;
    return;
  }

  menuGrid.innerHTML = filtered.map(item => `
    <article class="card menu-card">
      <div class="menu-image">
        <img
          src="${escapeHtml(item.image)}"
          alt="${escapeHtml(item.name)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='images/khmer-taste-logo.png';"
        />
      </div>
      <div class="menu-body">
        <span class="tag">${escapeHtml(item.category)}</span>

        <div class="menu-top">
          <h3>${escapeHtml(item.name)}</h3>
          <div class="price">${formatMoney(item.price)}</div>
        </div>

        <p class="muted" style="margin:0;">${escapeHtml(item.description)}</p>

        <div class="menu-actions">
          <span class="muted tiny">Freshly made</span>
          <button class="btn" type="button" data-add="${escapeHtml(item.id)}">Add to Order</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  if (!state.cart.length) {
    orderItems.innerHTML = `
      <div class="empty-state muted">
        No items yet. Add dishes from the menu to start your delivery order.
      </div>
    `;
  } else {
    orderItems.innerHTML = state.cart.map(item => `
      <div class="order-item">
        <div>
          <h4>${escapeHtml(item.name)}</h4>
          <div class="order-meta">
            ${formatMoney(item.price)} each • Line total: ${formatMoney(item.price * item.qty)}
          </div>
        </div>

        <div class="qty-controls">
          <button class="qty-btn" type="button" data-decrease="${escapeHtml(item.id)}" aria-label="Decrease quantity">−</button>
          <div class="qty-value" aria-live="polite">${item.qty}</div>
          <button class="qty-btn" type="button" data-increase="${escapeHtml(item.id)}" aria-label="Increase quantity">+</button>
        </div>
      </div>
    `).join("");
  }

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;
  const zip = normalizeZip(zipInput.value || "");

  itemCountEl.textContent = String(itemCount);
  subtotalEl.textContent = formatMoney(subtotal);
  deliveryFeeEl.textContent = formatMoney(deliveryFee);
  totalEl.textContent = formatMoney(total);

  orderDetailsField.value = buildOrderDetailsText();
  orderSubtotalField.value = subtotal.toFixed(2);
  deliveryFeeField.value = deliveryFee.toFixed(2);
  orderTotalField.value = total.toFixed(2);

  updateNotices(subtotal, zip);
  updateStickyCart(itemCount, total);
  placeOrderBtn.disabled = !canSubmitOrder();
}

function updateNotices(subtotal, zip) {
  if (state.cart.length === 0) {
    orderNoticeEl.className = "notice warning";
    orderNoticeEl.innerHTML = `Add items to begin your order. Delivery minimum is <strong>${formatMoney(DELIVERY_CONFIG.minimumOrder)}</strong>.`;
  } else if (subtotal < DELIVERY_CONFIG.minimumOrder) {
    const remaining = DELIVERY_CONFIG.minimumOrder - subtotal;
    orderNoticeEl.className = "notice warning";
    orderNoticeEl.innerHTML = `Add <strong>${formatMoney(remaining)}</strong> more to reach the delivery minimum of <strong>${formatMoney(DELIVERY_CONFIG.minimumOrder)}</strong>.`;
  } else {
    const deliveryFee = getDeliveryFee(subtotal);
    if (deliveryFee === 0) {
      orderNoticeEl.className = "notice success";
      orderNoticeEl.innerHTML = `Great news — your order qualifies for <strong>free delivery</strong>.`;
    } else {
      orderNoticeEl.className = "notice success";
      orderNoticeEl.innerHTML = `Your order meets the minimum. Current delivery fee: <strong>${formatMoney(deliveryFee)}</strong>.`;
    }
  }

  if (!zip) {
    zipNoticeEl.className = "notice warning";
    zipNoticeEl.textContent = "Enter a valid delivery ZIP code to continue.";
    return;
  }

  if (!/^\d{5}$/.test(zip)) {
    zipNoticeEl.className = "notice warning";
    zipNoticeEl.textContent = "Please enter a valid 5-digit ZIP code.";
    return;
  }

  if (!isZipAllowed(zip)) {
    zipNoticeEl.className = "notice error";
    zipNoticeEl.textContent = `Sorry, we do not currently deliver to ZIP code ${zip}.`;
    return;
  }

  zipNoticeEl.className = "notice success";
  zipNoticeEl.textContent = `Delivery is available to ZIP code ${zip}.`;
}

function updateStickyCart(itemCount, total) {
  if (itemCount > 0) {
    stickyCart.classList.add("show");
    stickyCartText.textContent = `View Order • ${itemCount} item${itemCount === 1 ? "" : "s"}`;
    stickyCartTotal.textContent = formatMoney(total);
  } else {
    stickyCart.classList.remove("show");
  }
}

// Cart actions
function addToCart(id) {
  const menuItem = getMenuItem(id);
  if (!menuItem) return;

  const existing = getCartItem(id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      qty: 1
    });
  }

  renderCart();
}

function increaseQty(id) {
  const item = getCartItem(id);
  if (!item) return;
  item.qty += 1;
  renderCart();
}

function decreaseQty(id) {
  const item = getCartItem(id);
  if (!item) return;

  item.qty -= 1;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(entry => entry.id !== id);
  }

  renderCart();
}

function clearCart() {
  state.cart = [];
  renderCart();
}

// Events
searchInput.addEventListener("input", (event) => {
  state.search = event.target.value || "";
  renderMenu();
});

menuGrid.addEventListener("click", (event) => {
  const addBtn = event.target.closest("[data-add]");
  if (addBtn) {
    addToCart(addBtn.getAttribute("data-add"));
  }
});

orderItems.addEventListener("click", (event) => {
  const incBtn = event.target.closest("[data-increase]");
  const decBtn = event.target.closest("[data-decrease]");

  if (incBtn) {
    increaseQty(incBtn.getAttribute("data-increase"));
  }

  if (decBtn) {
    decreaseQty(decBtn.getAttribute("data-decrease"));
  }
});

clearOrderBtn.addEventListener("click", () => {
  clearCart();
});

zipInput.addEventListener("input", () => {
  zipInput.value = normalizeZip(zipInput.value);
  renderCart();
});

orderForm.addEventListener("submit", async (event) => {
  const formAction = orderForm.getAttribute("action") || "";
  const subtotal = getSubtotal();
  const zip = normalizeZip(zipInput.value || "");

  if (state.cart.length === 0) {
    event.preventDefault();
    alert("Please add at least one item to your order.");
    return;
  }

  if (subtotal < DELIVERY_CONFIG.minimumOrder) {
    event.preventDefault();
    alert(`Delivery orders require a minimum of ${formatMoney(DELIVERY_CONFIG.minimumOrder)}.`);
    return;
  }

  if (!isZipAllowed(zip)) {
    event.preventDefault();
    alert("Sorry, we do not currently deliver to that ZIP code.");
    return;
  }

  if (formAction.includes("YOUR_FORM_ID")) {
    event.preventDefault();
    alert("Replace YOUR_FORM_ID in the form action with your real Formspree form ID before going live.");
    return;
  }

  // Progressive enhancement with fetch
  event.preventDefault();

  try {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Submitting...";

    const formData = new FormData(orderForm);

    const response = await fetch(orderForm.action, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    orderForm.reset();
    clearCart();

    zipNoticeEl.className = "notice success";
    zipNoticeEl.textContent = "Thank you. Your delivery request has been sent successfully.";

    orderNoticeEl.className = "notice success";
    orderNoticeEl.innerHTML = "Your order request was submitted. We’ll contact you soon to confirm delivery and payment.";

    placeOrderBtn.textContent = "Submit Delivery Order";
    placeOrderBtn.disabled = true;

    window.location.hash = "#order";
  } catch (error) {
    placeOrderBtn.textContent = "Submit Delivery Order";
    placeOrderBtn.disabled = !canSubmitOrder();
    alert("Sorry, there was a problem submitting your order. Please try again.");
  }
});

// Init
renderMenu();
renderCart();
