const MENU = [
  {
    id: "banhmi-classic",
    name: "Banh Mi (Classic)",
    price: 10.00,
    desc: "Crispy baguette, pickled veggies, cucumber, cilantro, house sauce.",
    cat: "sandwiches",
    meta: ["Fan favorite", "Fresh"]
  },
  {
    id: "banhmi-bbq",
    name: "Banh Mi (BBQ Pork)",
    price: 11.00,
    desc: "BBQ pork, pickled veggies, cucumber, cilantro, house sauce.",
    cat: "sandwiches",
    meta: ["Savory", "Popular"]
  },
  {
    id: "ricebowl-chicken",
    name: "Chicken Rice Bowl",
    price: 13.00,
    desc: "Grilled chicken, jasmine rice, fresh herbs, house dressing.",
    cat: "bowls",
    meta: ["Filling"]
  },
  {
    id: "ricebowl-beef",
    name: "Beef Rice Bowl",
    price: 14.00,
    desc: "Marinated beef, jasmine rice, fresh herbs, house dressing.",
    cat: "bowls",
    meta: ["Hearty"]
  },
  {
    id: "springrolls",
    name: "Fresh Spring Rolls (2pc)",
    price: 7.00,
    desc: "Fresh rolls with herbs and dipping sauce.",
    cat: "snacks",
    meta: ["Light"]
  },
  {
    id: "icedcoffee",
    name: "Khmer Iced Coffee",
    price: 5.00,
    desc: "Strong coffee over ice with sweet cream.",
    cat: "drinks",
    meta: ["Signature"]
  }
];

// --- State
const cart = new Map(); // id -> qty
let activeFilter = "all";

// --- Elements
const menuGrid = document.getElementById("menuGrid");
const tabs = document.querySelectorAll(".tab");

const drawer = document.getElementById("cartDrawer");
const openCartBtn = document.getElementById("openCartBtn");
const openCartBtn2 = document.getElementById("openCartBtn2");
const closeCartBtn = document.getElementById("closeCartBtn");
const closeCartOverlay = document.getElementById("closeCartOverlay");

const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const cartSub = document.getElementById("cartSub");
const cartSubtotal = document.getElementById("cartSubtotal");

const orderForm = document.getElementById("orderForm");
const orderItemsField = document.getElementById("orderItemsField");
const orderTotalField = document.getElementById("orderTotalField");
const formMsg = document.getElementById("formMsg");

const scrollToOrderBtn = document.getElementById("scrollToOrderBtn");

function money(n){ return `$${n.toFixed(2)}`; }

function getFilteredMenu(){
  if(activeFilter === "all") return MENU;
  return MENU.filter(i => i.cat === activeFilter);
}

// --- Render Menu
function renderMenu(){
  const items = getFilteredMenu();
  menuGrid.innerHTML = items.map(item => `
    <div class="item">
      <div class="item__top">
        <div class="item__name">${item.name}</div>
        <div class="item__price">${money(item.price)}</div>
      </div>
      <div class="item__desc">${item.desc}</div>
      <div class="item__meta">${(item.meta || []).map(m => `<span>• ${m}</span>`).join("")}</div>
      <button class="btn" data-add="${item.id}">Add to Cart</button>
    </div>
  `).join("");

  menuGrid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-add")));
  });
}

// --- Cart ops
function addToCart(id){
  cart.set(id, (cart.get(id) || 0) + 1);
  syncCartUI();
  openDrawer();
}

function decFromCart(id){
  const q = cart.get(id) || 0;
  if(q <= 1) cart.delete(id);
  else cart.set(id, q - 1);
  syncCartUI();
}

function incInCart(id){
  cart.set(id, (cart.get(id) || 0) + 1);
  syncCartUI();
}

function cartItemsDetailed(){
  const lines = [];
  for(const [id, qty] of cart.entries()){
    const item = MENU.find(x => x.id === id);
    if(!item) continue;
    lines.push({ ...item, qty, lineTotal: item.price * qty });
  }
  return lines;
}

function subtotal(){
  return cartItemsDetailed().reduce((sum, i) => sum + i.lineTotal, 0);
}

function syncCartUI(){
  const items = cartItemsDetailed();
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  cartCount.textContent = String(count);
  cartSub.textContent = `${count} item${count === 1 ? "" : "s"}`;
  cartSubtotal.textContent = money(subtotal());

  if(items.length === 0){
    cartList.innerHTML = `
      <div class="noteCard">
        <div class="noteCard__title">Your cart is empty</div>
        <p class="noteCard__text">Add items from the menu to place an order.</p>
      </div>
    `;
  } else {
    cartList.innerHTML = items.map(i => `
      <div class="cartItem">
        <div>
          <div class="cartItem__name">${i.name}</div>
          <div class="cartItem__meta">${money(i.price)} · Line: ${money(i.lineTotal)}</div>
        </div>
        <div class="cartItem__actions">
          <button class="qtyBtn" data-dec="${i.id}" aria-label="Decrease quantity">−</button>
          <div class="qty">${i.qty}</div>
          <button class="qtyBtn" data-inc="${i.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
    `).join("");

    cartList.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => decFromCart(b.getAttribute("data-dec"))));
    cartList.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => incInCart(b.getAttribute("data-inc"))));
  }

  // Prepare hidden fields for form submit
  const orderLines = items.map(i => `${i.qty}x ${i.name} (${money(i.price)})`).join(" | ");
  orderItemsField.value = orderLines || "";
  orderTotalField.value = money(subtotal());
}

// --- Drawer
function openDrawer(){
  drawer.classList.add("drawer--open");
  drawer.setAttribute("aria-hidden", "false");
}
function closeDrawer(){
  drawer.classList.remove("drawer--open");
  drawer.setAttribute("aria-hidden", "true");
}

// --- Tabs
tabs.forEach(t => {
  t.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("tab--active"));
    t.classList.add("tab--active");
    activeFilter = t.getAttribute("data-filter") || "all";
    renderMenu();
  });
});

// --- Buttons
openCartBtn.addEventListener("click", openDrawer);
openCartBtn2.addEventListener("click", openDrawer);
closeCartBtn.addEventListener("click", closeDrawer);
closeCartOverlay.addEventListener("click", closeDrawer);

scrollToOrderBtn.addEventListener("click", () => {
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  openDrawer();
});

// ESC close
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeDrawer();
});

// --- Form submit (AJAX so we can show success message)
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "";

  const items = cartItemsDetailed();
  if(items.length === 0){
    formMsg.textContent = "Add at least one item to your cart before ordering.";
    return;
  }

  try{
    const formData = new FormData(orderForm);
    const res = await fetch(orderForm.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    });

    if(res.ok){
      formMsg.textContent = "✅ Order received! We’ll reach out if needed. See you at pickup.";
      cart.clear();
      syncCartUI();
      orderForm.reset();
    } else {
      formMsg.textContent = "⚠️ Could not submit order. Please try again, or call us.";
    }
  } catch {
    formMsg.textContent = "⚠️ Network error. Please try again, or call us.";
  }
});

// Init
renderMenu();
syncCartUI();
