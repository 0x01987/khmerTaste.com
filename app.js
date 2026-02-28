// =====================================================
// EASY MENU EDITING
// - Add a new item: copy one object below and change fields
// - Delete an item: remove its object from the list
// - Change price/name/description/image anytime
// Image paths are relative to index.html
// =====================================================
const menuItems = [
  {
    id: "banhmi",
    name: "Bánh Mì",
    price: 12,
    description: "Crispy baguette, pickled veggies, fresh herbs, house sauce.",
    image: "images/menu/banhmi.jpg",
  },
  {
    id: "ricebowl",
    name: "Khmer Lok-Lak Rice Bowl",
    price: 14,
    description: "Jasmine rice, grilled protein, crisp veg, Khmer flavors.",
    image: "images/menu/loklak.jpg",
  },
  {
    id: "herofood",
    name: "Lemongrass Stir Fry",
    price: 13,
    description: "Savory, balanced, comforting made fresh.",
    image: "images/menu/herofood.jpg",
  },
];

// ======================
// Cart (order) state
// ======================
const cart = new Map(); // key: itemId -> { item, qty }

const menuGrid = document.getElementById("menuGrid");
const searchInput = document.getElementById("searchInput");

const orderItemsEl = document.getElementById("orderItems");
const orderTotalEl = document.getElementById("orderTotal");
const orderDetailsField = document.getElementById("orderDetailsField");
const orderTotalField = document.getElementById("orderTotalField");
const placeOrderBtn = document.getElementById("placeOrderBtn");

document.getElementById("clearOrder").addEventListener("click", () => {
  cart.clear();
  renderCart();
});

// ----------------------
// Helpers
// ----------------------
function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function getFilteredMenu() {
  const q = (searchInput.value || "").trim().toLowerCase();
  if (!q) return menuItems;
  return menuItems.filter((it) =>
    (it.name + " " + it.description).toLowerCase().includes(q)
  );
}

// ----------------------
// Render Menu
// ----------------------
function renderMenu() {
  const items = getFilteredMenu();

  if (items.length === 0) {
    menuGrid.innerHTML = `<div class="card"><p class="muted">No results. Try a different search.</p></div>`;
    return;
  }

  menuGrid.innerHTML = items
    .map((it) => {
      const qty = cart.get(it.id)?.qty || 0;
      return `
        <article class="menu-card">
          <img class="menu-img" src="${it.image}" alt="${it.name}" loading="lazy" />
          <div class="menu-body">
            <div class="menu-top">
              <h3>${it.name}</h3>
              <span class="price">${money(it.price)}</span>
            </div>
            <p class="menu-desc">${it.description}</p>

            <div class="menu-actions">
              <button class="btn" data-add="${it.id}">Add to Order</button>

              <span class="qty-pill">
                <button class="btn-outline" data-dec="${it.id}" type="button">-</button>
                <strong>${qty}</strong>
                <button class="btn-outline" data-inc="${it.id}" type="button">+</button>
              </span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  // Wire events (single pass)
  menuGrid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add, 1, true));
  });
  menuGrid.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.inc, 1, false));
  });
  menuGrid.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.dec, -1, false));
  });
}

searchInput.addEventListener("input", renderMenu);

// ----------------------
// Cart logic
// ----------------------
function addToCart(itemId, deltaQty, scrollToOrder) {
  const item = menuItems.find((x) => x.id === itemId);
  if (!item) return;

  const existing = cart.get(itemId);
  const newQty = (existing?.qty || 0) + deltaQty;

  if (newQty <= 0) {
    cart.delete(itemId);
  } else {
    cart.set(itemId, { item, qty: newQty });
  }

  renderMenu();
  renderCart();

  if (scrollToOrder && cart.size > 0) {
    document.getElementById("order").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderCart() {
  if (cart.size === 0) {
    orderItemsEl.classList.add("muted");
    orderItemsEl.innerHTML = "No items yet.";
    orderTotalEl.textContent = money(0);
    orderDetailsField.value = "";
    orderTotalField.value = "0.00";
    placeOrderBtn.disabled = true;
    return;
  }

  orderItemsEl.classList.remove("muted");

  let total = 0;
  const lines = [];

  for (const [id, entry] of cart.entries()) {
    const lineTotal = entry.item.price * entry.qty;
    total += lineTotal;

    lines.push(`
      <div class="order-item-row">
        <span>${entry.item.name} <span class="muted">x${entry.qty}</span></span>
        <span>
          ${money(lineTotal)}
          <button class="btn-outline" style="padding:4px 10px; margin-left:8px;" type="button" data-remove="${id}">Remove</button>
        </span>
      </div>
    `);
  }

  orderItemsEl.innerHTML = lines.join("");
  orderTotalEl.textContent = money(total);

  // Hidden fields for Formspree email
  const details = Array.from(cart.values())
    .map((e) => `${e.item.name} x${e.qty} (${money(e.item.price)} each)`)
    .join(" | ");
  orderDetailsField.value = details;
  orderTotalField.value = total.toFixed(2);

  placeOrderBtn.disabled = false;

  // Remove buttons
  orderItemsEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cart.delete(btn.dataset.remove);
      renderMenu();
      renderCart();
    });
  });
}

// Initial render
renderMenu();
renderCart();
