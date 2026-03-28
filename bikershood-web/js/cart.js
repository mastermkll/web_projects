document.addEventListener("DOMContentLoaded", function () {
  if (!window.Bikershood) {
    return;
  }

  const cartList = document.getElementById("cartList");
  const emptyCart = document.getElementById("emptyCart");
  const subtotalValue = document.getElementById("subtotalValue");
  const shippingValue = document.getElementById("shippingValue");
  const discountValue = document.getElementById("discountValue");
  const totalValue = document.getElementById("totalValue");
  const couponInput = document.getElementById("couponInput");
  const applyCoupon = document.getElementById("applyCoupon");
  const razorpayBtn = document.getElementById("payRazorpay");
  const stripeBtn = document.getElementById("payStripe");
  const whatsappOrder = document.getElementById("checkoutWhatsapp");

  const COUPON_CODE = "HOOD10";
  let discount = 0;

  function getShipping(subtotal) {
    return subtotal >= 5000 ? 0 : 149;
  }

  function getTotalSummary() {
    const subtotal = window.Bikershood.cartSubtotal();
    const shipping = getShipping(subtotal);
    const total = Math.max(subtotal + shipping - discount, 0);

    return { subtotal, shipping, total };
  }

  function renderCart() {
    const cart = window.Bikershood.getCart();

    if (!cartList) {
      return;
    }

    if (!cart.length) {
      cartList.innerHTML =
        '<div class="empty-state">Your cart is empty. Add products or create a custom build to start checkout.</div>';
      if (emptyCart) {
        emptyCart.classList.remove("hide");
      }
    } else {
      if (emptyCart) {
        emptyCart.classList.add("hide");
      }

      cartList.innerHTML = cart
        .map(
          (item) => `
            <article class="cart-item">
              <img src="${item.image}" alt="${item.name}" loading="lazy" />
              <div>
                <h4>${item.name}</h4>
                <p class="cart-sub">${item.source}</p>
                <p class="cart-sub">${item.meta || ""}</p>
                <div class="cart-item-actions">
                  <div class="qty-control">
                    <button type="button" data-qty-action="dec" data-item-id="${item.id}" data-item-type="${item.itemType}">-</button>
                    <span>${item.qty}</span>
                    <button type="button" data-qty-action="inc" data-item-id="${item.id}" data-item-type="${item.itemType}">+</button>
                  </div>
                  <p class="cart-price">${window.Bikershood.formatCurrency(item.price * item.qty)}</p>
                </div>
                <button class="btn btn-outline" style="margin-top:0.45rem" type="button" data-remove-item="${item.id}" data-item-type="${item.itemType}">Remove</button>
              </div>
            </article>
          `
        )
        .join("");
    }

    bindCartActions();
    updateOrderSummary();
    updateWhatsAppLink();
    window.Bikershood.updateCartCount();
  }

  function bindCartActions() {
    if (!cartList) {
      return;
    }

    cartList.querySelectorAll("[data-qty-action]").forEach((button) => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-item-id");
        const itemType = this.getAttribute("data-item-type") || "product";
        const action = this.getAttribute("data-qty-action");

        if (action === "inc") {
          window.Bikershood.updateCartItem(id, itemType, 1);
        } else {
          window.Bikershood.updateCartItem(id, itemType, -1);
        }

        renderCart();
      });
    });

    cartList.querySelectorAll("[data-remove-item]").forEach((button) => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-remove-item");
        const itemType = this.getAttribute("data-item-type") || "product";
        window.Bikershood.removeCartItem(id, itemType);
        renderCart();
      });
    });
  }

  function updateOrderSummary() {
    const { subtotal, shipping, total } = getTotalSummary();

    if (subtotalValue) {
      subtotalValue.textContent = window.Bikershood.formatCurrency(subtotal);
    }

    if (shippingValue) {
      shippingValue.textContent = shipping === 0 ? "Free" : window.Bikershood.formatCurrency(shipping);
    }

    if (discountValue) {
      discountValue.textContent = "- " + window.Bikershood.formatCurrency(discount);
    }

    if (totalValue) {
      totalValue.textContent = window.Bikershood.formatCurrency(total);
    }
  }

  function updateWhatsAppLink() {
    if (!whatsappOrder) {
      return;
    }

    const cart = window.Bikershood.getCart();
    const { total } = getTotalSummary();

    const lines = ["Hi Bikershood, I want to place this order:"];

    cart.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.name} x${item.qty} - ${window.Bikershood.formatCurrency(item.price * item.qty)}`
      );
    });

    lines.push("Total: " + window.Bikershood.formatCurrency(total));

    whatsappOrder.setAttribute("href", window.Bikershood.getWhatsAppLink(lines.join("\n")));
  }

  function runRazorpayCheckout() {
    const cart = window.Bikershood.getCart();
    if (!cart.length) {
      window.Bikershood.showToast("Your cart is empty");
      return;
    }

    const config = window.BIKERSHOOD_PAYMENT || {};
    const key = config.razorpayKey || "";
    const { total } = getTotalSummary();

    if (!window.Razorpay || !key || key.includes("your_key")) {
      window.Bikershood.showToast("Add Razorpay test key in js/payment-config.js");
      return;
    }

    const options = {
      key: key,
      amount: Math.round(total * 100),
      currency: "INR",
      name: "bikershood",
      description: "Motorcycle accessories checkout",
      prefill: {
        name: "Bikershood Rider",
        email: "rider@bikershood.com",
        contact: "9999999999"
      },
      notes: {
        order_type: "web_checkout",
        item_count: String(cart.length)
      },
      theme: {
        color: "#ff4d00"
      },
      handler: function () {
        window.Bikershood.showToast("Payment successful. Order request created.");
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  function runStripeCheckout() {
    const cart = window.Bikershood.getCart();
    if (!cart.length) {
      window.Bikershood.showToast("Your cart is empty");
      return;
    }

    const config = window.BIKERSHOOD_PAYMENT || {};

    if (config.stripePaymentLink) {
      window.open(config.stripePaymentLink, "_blank");
      return;
    }

    window.Bikershood.showToast(
      "Set stripePaymentLink in js/payment-config.js for one-click Stripe checkout"
    );
  }

  if (applyCoupon) {
    applyCoupon.addEventListener("click", function () {
      const code = (couponInput && couponInput.value || "").trim().toUpperCase();
      const subtotal = window.Bikershood.cartSubtotal();

      if (code === COUPON_CODE) {
        discount = Math.min(Math.round(subtotal * 0.1), 1200);
        window.Bikershood.showToast("Coupon applied");
      } else {
        discount = 0;
        window.Bikershood.showToast("Invalid coupon. Try HOOD10");
      }

      updateOrderSummary();
      updateWhatsAppLink();
    });
  }

  if (razorpayBtn) {
    razorpayBtn.addEventListener("click", runRazorpayCheckout);
  }

  if (stripeBtn) {
    stripeBtn.addEventListener("click", runStripeCheckout);
  }

  renderCart();
});
