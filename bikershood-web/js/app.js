(function () {
  const CART_KEY = "bikershood_cart";

  const navLinks = [
    { href: "index.html", key: "home", label: "Home" },
    { href: "products.html", key: "products", label: "Products" },
    { href: "byo.html", key: "byo", label: "Build Your Own" },
    { href: "community.html", key: "community", label: "Community" },
    { href: "about.html", key: "about", label: "About" },
    { href: "contact.html", key: "contact", label: "Contact" }
  ];

  function formatCurrency(value) {
    return "INR " + Number(value || 0).toLocaleString("en-IN");
  }

  function getCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + (item.qty || 0), 0);
  }

  function updateCartCount() {
    const badge = document.querySelector("[data-cart-count]");
    if (badge) {
      badge.textContent = String(getCartCount());
    }
  }

  function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function addToCart(rawItem) {
    const cart = getCart();
    const item = {
      id: rawItem.id,
      name: rawItem.name,
      price: Number(rawItem.price || 0),
      qty: Number(rawItem.qty || 1),
      image: rawItem.image || "",
      source: rawItem.source || "Store",
      meta: rawItem.meta || "",
      itemType: rawItem.itemType || "product"
    };

    const existing = cart.find(
      (cartItem) => cartItem.id === item.id && cartItem.itemType === item.itemType
    );

    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push(item);
    }

    saveCart(cart);
    showToast(item.name + " added to cart");
  }

  function updateCartItem(id, itemType, delta) {
    const cart = getCart();
    const target = cart.find((item) => item.id === id && item.itemType === itemType);

    if (!target) {
      return;
    }

    target.qty += delta;

    const cleaned = cart.filter((item) => item.qty > 0);
    saveCart(cleaned);
  }

  function removeCartItem(id, itemType) {
    const cart = getCart().filter(
      (item) => !(item.id === id && item.itemType === itemType)
    );
    saveCart(cart);
  }

  function cartSubtotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function createProductCard(product) {
    return `
      <article class="product-card">
        <div class="product-visual">
          <img src="${product.heroImage}" alt="${product.name}" loading="lazy" decoding="async" />
          <div class="product-chip-row">
            ${product.isTopSelling ? '<span class="product-chip">Top Selling</span>' : ""}
            ${product.isNew ? '<span class="product-chip">New Arrival</span>' : ""}
          </div>
        </div>
        <div class="product-body">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-meta">
            <span class="badge">${product.brand}</span>
            <span class="badge">${product.category}</span>
          </div>
          <p class="compatibility">Compatible with: ${product.bikeModels.join(", ")}</p>
          <p class="price">${formatCurrency(product.price)} <small>${formatCurrency(
      product.originalPrice
    )}</small></p>
          <div class="card-actions">
            <a class="btn btn-outline" href="product-detail.html?id=${product.id}">View</a>
            <button class="btn btn-primary" data-add-product="${product.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `;
  }

  function bindProductAddButtons(root) {
    if (!root) {
      return;
    }

    root.querySelectorAll("[data-add-product]").forEach((button) => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-add-product");
        const product = (window.BIKERSHOOD_DATA && window.BIKERSHOOD_DATA.products || []).find(
          (item) => item.id === id
        );

        if (!product) {
          return;
        }

        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.heroImage,
          source: product.brand,
          itemType: "product",
          meta: "Compatible with: " + product.bikeModels.slice(0, 3).join(", ")
        });
      });
    });
  }

  function renderInstagram(containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container || !window.BIKERSHOOD_DATA) {
      return;
    }

    const posts = window.BIKERSHOOD_DATA.instagramPosts.slice(0, limit || 4);
    container.innerHTML = posts
      .map(
        (post) => `
        <article class="insta-card">
          <div class="insta-top">
            <strong>${post.handle}</strong>
            <span>${post.likes} likes</span>
          </div>
          <p>${post.caption}</p>
          <p class="insta-hash">${post.tags}</p>
        </article>
      `
      )
      .join("");
  }

  function getProductById(id) {
    if (!window.BIKERSHOOD_DATA) {
      return null;
    }
    return window.BIKERSHOOD_DATA.products.find((product) => product.id === id) || null;
  }

  function getWhatsAppLink(message) {
    return "https://wa.me/919999999999?text=" + encodeURIComponent(message);
  }

  function injectShell() {
    const headerMount = document.getElementById("site-header");
    const footerMount = document.getElementById("site-footer");
    const activeKey = document.body.getAttribute("data-page") || "";

    if (headerMount) {
      headerMount.innerHTML = `
        <header class="site-header">
          <div class="nav-wrap">
            <a class="brand" href="index.html" aria-label="Bikershood home">
              <span class="brand-mark">BH</span>
              <span>bikershood</span>
            </a>

            <button class="menu-toggle" type="button" aria-label="Open menu" data-menu-toggle>☰</button>

            <nav class="main-nav" data-main-nav>
              <ul>
                ${navLinks
                  .map(
                    (link) =>
                      `<li><a href="${link.href}" class="${
                        link.key === activeKey ? "active" : ""
                      }">${link.label}</a></li>`
                  )
                  .join("")}
              </ul>
            </nav>

            <form class="nav-search" data-global-search>
              <input type="search" name="search" placeholder="Search lights, handlebars, touring gear..." value="" />
              <button type="submit" aria-label="Search">⌕</button>
            </form>

            <div class="nav-actions">
              <a class="cart-link" href="cart.html" aria-label="Cart">
                🛒
                <span class="cart-count" data-cart-count>0</span>
              </a>
            </div>
          </div>
        </header>
      `;
    }

    if (footerMount) {
      footerMount.innerHTML = `
        <footer class="footer">
          <div class="footer-inner">
            <div class="footer-grid">
              <div>
                <p class="footer-brand">bikershood</p>
                <p>Upgrade-focused accessories for riders who want rugged style and real-world performance.</p>
              </div>
              <div>
                <p><strong>Quick Links</strong></p>
                <p><a href="products.html">Products</a></p>
                <p><a href="byo.html">Build Your Own Bike</a></p>
                <p><a href="community.html">Community</a></p>
              </div>
              <div>
                <p><strong>Support</strong></p>
                <p><a href="contact.html">Contact + WhatsApp</a></p>
                <p><a href="cart.html">Cart & Checkout</a></p>
                <p><a href="about.html">Brand Story</a></p>
              </div>
            </div>
            <p>2026 bikershood. Built for riders who ride hard.</p>
          </div>
        </footer>
      `;
    }

    const menuToggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-main-nav]");
    if (menuToggle && nav) {
      menuToggle.addEventListener("click", () => nav.classList.toggle("show"));
    }

    const searchForm = document.querySelector("[data-global-search]");
    if (searchForm) {
      const searchInput = searchForm.querySelector("input[name='search']");
      const searchInQuery = getUrlParam("search") || "";
      if (searchInput && searchInQuery) {
        searchInput.value = searchInQuery;
      }

      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = searchInput ? searchInput.value.trim() : "";
        window.location.href = "products.html" + (query ? "?search=" + encodeURIComponent(query) : "");
      });
    }
  }

  window.Bikershood = {
    formatCurrency,
    getCart,
    saveCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    cartSubtotal,
    updateCartCount,
    showToast,
    getUrlParam,
    getProductById,
    renderInstagram,
    createProductCard,
    bindProductAddButtons,
    getWhatsAppLink
  };

  document.addEventListener("DOMContentLoaded", function () {
    injectShell();
    updateCartCount();
  });
})();
