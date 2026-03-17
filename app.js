const MENU_ITEMS = [
  {
    id: "kt1",
    name: "Khmer Grilled Chicken Bowl",
    category: "Bowls",
    price: 13.99,
    description: "Grilled marinated chicken over jasmine rice with vegetables and house sauce.",
    image: "images/menu/khmer-chicken-bowl.jpg"
  },
  {
    id: "kt2",
    name: "Beef Lok Lak",
    category: "Entrees",
    price: 16.99,
    description: "Tender beef with pepper-lime flavor, served with rice and fresh vegetables.",
    image: "images/menu/beef-lok-lak.jpg"
  },
  {
    id: "kt3",
    name: "Khmer Curry Chicken",
    category: "Curries",
    price: 15.49,
    description: "Cambodian-style curry with chicken, potatoes, carrots, and coconut richness.",
    image: "images/menu/khmer-curry.jpg"
  },
  {
    id: "kt4",
    name: "Lemongrass Beef Rice Bowl",
    category: "Bowls",
    price: 14.99,
    description: "Savory lemongrass beef with rice, pickled vegetables, and herbs.",
    image: "images/menu/lemongrass-beef-bowl.jpg"
  },
  {
    id: "kt5",
    name: "Khmer Fried Rice",
    category: "Rice",
    price: 12.99,
    description: "Wok-fried rice with egg, vegetables, and Khmer seasoning.",
    image: "images/menu/khmer-fried-rice.jpg"
  },
  {
    id: "kt6",
    name: "Stir-Fried Noodles",
    category: "Noodles",
    price: 13.49,
    description: "Rice noodles tossed with vegetables and savory house sauce.",
    image: "images/menu/stir-fried-noodles.jpg"
  },
  {
    id: "kt7",
    name: "Banh Mi Sandwich",
    category: "Sandwiches",
    price: 10.99,
    description: "Crisp baguette with pickled vegetables, herbs, and savory filling.",
    image: "images/menu/banh-mi.jpg"
  },
  {
    id: "kt8",
    name: "Mango Sticky Rice",
    category: "Desserts",
    price: 7.99,
    description: "Sweet mango served with coconut sticky rice.",
    image: "images/menu/mango-sticky-rice.jpg"
  }
];

const DELIVERY_CONFIG = {
  minimumOrder: 20,
  freeDeliveryThreshold: 50,
  deliveryFee: 6.99,
  allowedZips: ["85008", "85016", "85018", "85032", "85040", "85042", "85281", "85282"]
};

const state = {
  search: "",
  cart: []
};

const menuGrid = document.getElementById("menuGrid");
const searchInput = document.getElementById("searchInput");
const clearOrderBtn = document.getElementById("clearOrder");
const orderItems = document.getElementById("orderItems");
const itemCountEl = document.getElementById("itemCount");
const orderSubtotalEl = document.getElementById("orderSubtotal");
const deliveryFeeEl = document.getElementById("deliveryFee");
const orderTotalEl = document.getElementById("orderTotal");
const orderNoticeEl = document.getElementById("orderNotice");
const zipInput = document.getElementById("zipInput");
const zipNoticeEl = document.getElementById("zipNotice");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const orderForm = document.getElementById("orderForm");
const orderDetailsField = document.getElementById("orderDetailsField");
const orderSubtotalField = document.getElementById("orderSubtotalField");
const deliveryFeeField = document.getElementById("deliveryFeeField");
const orderTotalField = document.getElementById("orderTotalField");
const stickyCart = document.getElementById("stickyCart");
const stickyCartText = document.getElementById("stickyCartText");
const stickyCartTotal = document.getElementById("stickyCartTotal");

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function safeText(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeZip(value) {
  return String(value).replace(/\D/g, "").slice(0, 5);
}

function getSubtotal() {
  return state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getItemCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getDeliveryFee(subtotal) {
  if (subtotal <= 0) return 0;
  if (subtotal >= DELIVERY_CONFIG.freeDeliveryThreshold) return 0;
  return DELIVERY_CONFIG.deliveryFee;
}

function isZipAllowed(zip) {
  return DELIVERY_CONFIG.allowedZips.includes(normalizeZip(zip));
}

function findMenuItem(id) {
  return MENU_ITEMS.find(item => item.id === id);
}

function findCartItem(id) {
  return state.cart.find(item => item.id === id);
}

function renderMenu() {
  const query = state.search.trim().toLowerCase();

  const filtered = MENU_ITEMS.filter(item => {
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    menuGrid.innerHTML = `
      <div class="empty-state">
        No menu items found. Try a different search term.
      </div>
    `;
    return;
  }

  menuGrid.innerHTML = filtered.map(item => `
    <article class="menu-card">
      <div class="menu-image">
        <img
          src="${safeText(item.image)}"
          alt="${safeText(item.name)}"
          loading="lazy"
        />
      </div>

      <div class="menu-body">
        <span class="menu-tag">${safeText(item.category)}</span>

        <div class="menu-meta">
          <h3>${safeText(item.name)}</h3>
          <div class="menu-price">${money(item.price)}</div>
        </div>

        <p class="menu-desc">${safeText(item.description)}</p>

        <div class="menu-actions">
          <span class="small-muted">Freshly made</span>
          <button class="btn btn-primary" type="button" data-add="${safeText(item.id)}">Add</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  if (state.cart.length === 0) {
    orderItems.innerHTML = `
      <div class="empty-state">
        No items yet. Add dishes from the menu to begin your delivery order.
      </div>
    `;
  } else {
    orderItems.innerHTML = state.cart.map(item => `
      <div class="order-item">
        <div>
          <h4>${safeText(item.name)}</h4>
          <p>${money(item.price)} each • Line total: ${money(item.price * item.qty)}</p>
        </div>

        <div class="qty-controls">
          <button class="qty-btn" type="button" data-minus="${safeText(item.id)}">−</button>
          <div class="qty-value">${item.qty}</div>
          <button class="qty-btn" type="button" data-plus="${safeText(item.id)}">+</button>
        </div>
      </div>
    `).join("");
  }

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  itemCountEl.textContent = String(itemCount);
  orderSubtotalEl.textContent = money(subtotal);
  deliveryFeeEl.textContent = money(deliveryFee);
  orderTotalEl.textContent = money(total);

  orderDetailsField.value = buildOrderDetails();
  orderSubtotalField.value = subtotal.toFixed(2);
  deliveryFeeField.value = deliveryFee.toFixed(2);
  orderTotalField.value = total.toFixed(2);

  updateOrderNotice(subtotal, deliveryFee);
  updateZipNotice();
  updateStickyCart(itemCount, total);
  updateSubmitState();
}

function buildOrderDetails() {
  if (state.cart.length === 0) return "";

  return state.cart.map(item => {
    return `${item.qty} x ${item.name} - ${money(item.price)} each = ${money(item.qty * item.price)}`;
  }).join("\n");
}

function updateOrderNotice(subtotal, deliveryFee) {
  if (state.cart.length === 0) {
    orderNoticeEl.className = "notice warning";
    orderNoticeEl.textContent = `Delivery orders require a minimum of ${money(DELIVERY_CONFIG.minimumOrder)}.`;
    return;
  }

  if (subtotal < DELIVERY_CONFIG.minimumOrder) {
    const remaining = DELIVERY_CONFIG.minimumOrder - subtotal;
    orderNoticeEl.className = "notice warning";
    orderNoticeEl.textContent = `Add ${money(remaining)} more to reach the delivery minimum.`;
    return;
  }

  if (deliveryFee === 0) {
    orderNoticeEl.className = "notice success";
    orderNoticeEl.textContent = "Your order qualifies for free delivery.";
    return;
  }

  orderNoticeEl.className = "notice success";
  orderNoticeEl.textContent = `Your order meets the minimum. Delivery fee is ${money(deliveryFee)}.`;
}

function updateZipNotice() {
  const zip = normalizeZip(zipInput.value || "");

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

function canSubmit() {
  const subtotal = getSubtotal();
  const zip = normalizeZip(zipInput.value || "");

  return (
    state.cart.length > 0 &&
    subtotal >= DELIVERY_CONFIG.minimumOrder &&
    /^\d{5}$/.test(zip) &&
    isZipAllowed(zip)
  );
}

function updateSubmitState() {
  placeOrderBtn.disabled = !canSubmit();
}

function updateStickyCart(itemCount, total) {
  if (itemCount > 0) {
    stickyCart.classList.add("show");
    stickyCart.style.display = "flex";
    stickyCartText.textContent = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
    stickyCartTotal.textContent = money(total);
  } else {
    stickyCart.classList.remove("show");
    stickyCart.style.display = "none";
  }
}

function addToCart(id) {
  const menuItem = findMenuItem(id);
  if (!menuItem) return;

  const existing = findCartItem(id);

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
  const item = findCartItem(id);
  if (!item) return;
  item.qty += 1;
  renderCart();
}

function decreaseQty(id) {
  const item = findCartItem(id);
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

searchInput.addEventListener("input", (e) => {
  state.search = e.target.value || "";
  renderMenu();
});

menuGrid.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  if (!addBtn) return;
  addToCart(addBtn.getAttribute("data-add"));
});

orderItems.addEventListener("click", (e) => {
  const plusBtn = e.target.closest("[data-plus]");
  const minusBtn = e.target.closest("[data-minus]");

  if (plusBtn) {
    increaseQty(plusBtn.getAttribute("data-plus"));
  }

  if (minusBtn) {
    decreaseQty(minusBtn.getAttribute("data-minus"));
  }
});

clearOrderBtn.addEventListener("click", clearCart);

zipInput.addEventListener("input", () => {
  zipInput.value = normalizeZip(zipInput.value);
  updateZipNotice();
  updateSubmitState();
});

orderForm.addEventListener("submit", async (e) => {
  const formAction = orderForm.getAttribute("action") || "";

  if (!canSubmit()) {
    e.preventDefault();
    alert("Please complete your order and enter a valid delivery ZIP code.");
    return;
  }

  if (formAction.includes("YOUR_FORM_ID")) {
    e.preventDefault();
    alert("Replace YOUR_FORM_ID in the form action with your real Formspree form ID.");
    return;
  }

  e.preventDefault();

  try {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Submitting...";

    const formData = new FormData(orderForm);

    const response = await fetch(orderForm.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error("Submission failed");
    }

    orderForm.reset();
    state.cart = [];
    renderCart();

    zipNoticeEl.className = "notice success";
    zipNoticeEl.textContent = "Thank you. Your delivery order request was sent successfully.";

    orderNoticeEl.className = "notice success";
    orderNoticeEl.textContent = "We received your order request and will contact you soon to confirm delivery.";

    placeOrderBtn.textContent = "Submit Delivery Order";
    placeOrderBtn.disabled = true;

    window.location.hash = "#order";
  } catch (error) {
    placeOrderBtn.textContent = "Submit Delivery Order";
    updateSubmitState();
    alert("Sorry, there was a problem submitting your order. Please try again.");
  }
});

renderMenu();
renderCart();
updateZipNotice();
