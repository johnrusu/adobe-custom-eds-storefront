// Simple Stripe Payment Test - Adobe Commerce
// Read configuration from config.js
const GRAPHQL_ENDPOINT =
  window.STOREFRONT_CONFIG?.GRAPHQL_ENDPOINT || "http://localhost/graphql";
const STRIPE_PUBLISHABLE_KEY =
  window.STOREFRONT_CONFIG?.STRIPE_PUBLISHABLE_KEY || "";

let stripe = null;
let elements = null;
let paymentElement = null;

// Simple cart storage
let cart = {
  items: [],
  total: 0,
  currency: "USD",
};

// Fetch products from Adobe Commerce
async function fetchProducts() {
  const query = `
        query {
            products(search: "", pageSize: 10) {
                items {
                    id
                    name
                    sku
                    price_range {
                        minimum_price {
                            regular_price {
                                value
                                currency
                            }
                        }
                    }
                    image {
                        url
                        label
                    }
                }
            }
        }
    `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.data?.products?.items || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Render products from Adobe Commerce
function renderProducts(products) {
  const productList = document.getElementById("product-list");

  if (products.length === 0) {
    productList.innerHTML =
      "<p>No products found. Showing demo products instead.</p>";
    createDemoProducts();
    return;
  }

  productList.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <img src="${
              product.image?.url || "https://via.placeholder.com/200"
            }" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>SKU: ${product.sku}</p>
            <p class="price">${
              product.price_range.minimum_price.regular_price.currency
            } ${product.price_range.minimum_price.regular_price.value}</p>
            <button onclick="window.addToCart('${product.name}', ${
        product.price_range.minimum_price.regular_price.value
      }, '${
        product.price_range.minimum_price.regular_price.currency
      }')">Add to Cart</button>
        </div>
    `
    )
    .join("");
}

// Create demo products if Adobe Commerce is not available
function createDemoProducts() {
  const productList = document.getElementById("product-list");

  productList.innerHTML = `
        <div class="product-card">
            <img src="https://placehold.co/200" alt="Demo Product">
            <h3>Demo Product</h3>
            <p>SKU: DEMO-001</p>
            <p class="price">USD 29.99</p>
            <button onclick="window.addToCart('Demo Product', 29.99, 'USD')">Add to Cart</button>
        </div>
        <div class="product-card">
            <img src="https://placehold.co/200" alt="Premium Product">
            <h3>Premium Product</h3>
            <p>SKU: DEMO-002</p>
            <p class="price">USD 49.99</p>
            <button onclick="window.addToCart('Premium Product', 49.99, 'USD')">Add to Cart</button>
        </div>
    `;
}

// Initialize Stripe
function initializeStripe() {
  if (STRIPE_PUBLISHABLE_KEY) {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    console.log("✅ Stripe initialized");
  } else {
    console.error("❌ No Stripe key configured");
    alert("Please set your Stripe publishable key in storefront.js");
  }
}

// Add product to cart
function addToCart(name, price, currency) {
  cart.items.push({
    name: name,
    price: price,
    quantity: 1,
  });

  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  cart.currency = currency;

  console.log("Cart updated:", cart);
  updateCartBadge();
  displayCartModal();
}

// Update cart count badge
function updateCartBadge() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? "inline-block" : "none";
  }
}

// Display cart in modal
function displayCartModal() {
  const modalCartItems = document.getElementById("modal-cart-items");
  const modalCartTotal = document.getElementById("modal-cart-total");

  if (cart.items.length === 0) {
    modalCartItems.innerHTML = '<p class="text-muted">Your cart is empty</p>';
    modalCartTotal.textContent = "Total: $0.00";
    return;
  }

  modalCartItems.innerHTML = `
        <div class="list-group">
            ${cart.items
              .map(
                (item, index) => `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${item.name}</h6>
                            <small class="text-muted">Price: ${
                              cart.currency
                            } ${item.price.toFixed(2)} × ${
                  item.quantity
                }</small>
                        </div>
                        <div class="text-end">
                            <strong>${cart.currency} ${(
                  item.price * item.quantity
                ).toFixed(2)}</strong>
                            <button class="btn btn-sm btn-outline-danger ms-2" onclick="window.removeFromCart(${index})">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
    `;

  modalCartTotal.innerHTML = `Total: ${cart.currency} ${cart.total.toFixed(2)}`;
}

// Remove item from cart
function removeFromCart(index) {
  cart.items.splice(index, 1);
  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  updateCartBadge();
  displayCartModal();
}

// Display checkout cart summary
function displayCheckoutSummary() {
  const summaryDiv = document.getElementById("checkout-cart-summary");

  if (!summaryDiv || cart.items.length === 0) return;

  summaryDiv.innerHTML = `
        <h5 class="mb-3">Order Summary</h5>
        ${cart.items
          .map(
            (item) => `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.name} × ${item.quantity}</span>
                <span class="fw-bold">${cart.currency} ${(
              item.price * item.quantity
            ).toFixed(2)}</span>
            </div>
        `
          )
          .join("")}
        <hr>
        <div class="d-flex justify-content-between">
            <span class="fs-5 fw-bold">Total:</span>
            <span class="fs-5 fw-bold text-primary">${
              cart.currency
            } ${cart.total.toFixed(2)}</span>
        </div>
    `;
}

// Initialize Stripe Payment Element
async function initializePaymentForm() {
  if (!stripe) {
    alert("Stripe not initialized!");
    return;
  }

  console.log("Initializing payment form with:", {
    amount: cart.total,
    currency: cart.currency,
  });

  const options = {
    mode: "payment",
    amount: Math.round(cart.total * 100), // Convert to cents
    currency: cart.currency.toLowerCase(),
    paymentMethodCreation: "manual",
  };

  elements = stripe.elements(options);
  paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");

  console.log("✅ Payment form initialized");
}

// Handle payment form submission
async function handlePaymentSubmit(event) {
  event.preventDefault();

  if (!stripe || !elements) {
    alert("Payment system not ready");
    return;
  }

  const submitButton = document.getElementById("place-order");
  const messageContainer = document.getElementById("payment-message");
  const customerName =
    document.getElementById("customer-name")?.value || "Customer";
  const customerEmail = document.getElementById("customer-email")?.value || "";

  submitButton.disabled = true;
  messageContainer.textContent = "Processing payment...";
  messageContainer.classList.remove("hidden");
  messageContainer.classList.remove("alert-success", "alert-danger");
  messageContainer.classList.add("alert-info");

  try {
    // Submit the payment element
    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw submitError;
    }

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      elements: elements,
      params: {
        billing_details: {
          name: customerName,
          email: customerEmail,
        },
      },
    });

    if (error) {
      throw error;
    }

    console.log("✅ Payment method created:", paymentMethod.id);

    messageContainer.textContent = `✅ Payment method created successfully! ID: ${paymentMethod.id}`;
    messageContainer.classList.remove("alert-info");
    messageContainer.classList.add("alert-success");

    // In a real implementation, you would now send this to your backend
    console.log("Next step: Send payment method to Adobe Commerce backend");
  } catch (error) {
    console.error("Payment error:", error);
    messageContainer.textContent = `❌ Error: ${error.message}`;
    messageContainer.classList.remove("alert-info", "alert-success");
    messageContainer.classList.add("alert-danger");
    submitButton.disabled = false;
  }
}

// Setup checkout flow
function setupCheckout() {
  // View cart button - show modal
  document.addEventListener("click", async (e) => {
    if (
      e.target &&
      (e.target.id === "view-cart-btn" || e.target.closest("#view-cart-btn"))
    ) {
      e.preventDefault();
      displayCartModal();
      const cartModal = new bootstrap.Modal(
        document.getElementById("cartModal")
      );
      cartModal.show();
    }

    // Proceed to checkout from modal
    if (e.target && e.target.id === "modal-proceed-checkout") {
      if (cart.items.length === 0 || cart.total === 0) {
        alert("Your cart is empty!");
        return;
      }

      console.log("Proceeding to checkout with cart:", cart);

      // Close modal
      const cartModal = bootstrap.Modal.getInstance(
        document.getElementById("cartModal")
      );
      if (cartModal) {
        cartModal.hide();
      }

      // Show checkout section
      document.getElementById("checkout-section").style.display = "block";
      document
        .getElementById("checkout-section")
        .scrollIntoView({ behavior: "smooth" });

      displayCheckoutSummary();
      await initializePaymentForm();
    }

    // Old proceed to checkout (kept for compatibility)
    if (e.target && e.target.id === "proceed-to-checkout") {
      e.preventDefault();

      if (cart.items.length === 0 || cart.total === 0) {
        alert("Your cart is empty!");
        return;
      }

      console.log("Proceeding to checkout with cart:", cart);

      document.getElementById("checkout-section").style.display = "block";

      displayCheckoutSummary();
      await initializePaymentForm();
    }
  });

  const paymentForm = document.getElementById("payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", handlePaymentSubmit);
  }
}

// Initialize everything
async function init() {
  console.log("🚀 Initializing Adobe Commerce Storefront with Stripe...");

  const productList = document.getElementById("product-list");
  productList.innerHTML = "<p>Loading products...</p>";

  // Initialize Stripe
  initializeStripe();

  // Setup checkout handlers
  setupCheckout();

  // Fetch products from Adobe Commerce
  const products = await fetchProducts();

  if (products && products.length > 0) {
    console.log(`✅ Loaded ${products.length} products from Adobe Commerce`);
    renderProducts(products);
  } else {
    console.log("⚠️ No products from Adobe Commerce, showing demo products");
    createDemoProducts();
  }

  console.log("✅ Ready!");
}

// Export add to cart function
window.addToCart = function (name, price, currency) {
  addToCart(name, price, currency);
};

// Export remove from cart function
window.removeFromCart = function (index) {
  removeFromCart(index);
};

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
