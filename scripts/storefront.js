// Adobe Commerce GraphQL Client
const GRAPHQL_ENDPOINT = 'http://localhost/graphql';

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
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        return data.data.products.items;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

function renderProducts(products) {
    const productList = document.getElementById('product-list');
    
    if (products.length === 0) {
        productList.innerHTML = '<p>No products found or unable to connect to Adobe Commerce.</p>';
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image?.url || '/placeholder.jpg'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>SKU: ${product.sku}</p>
            <p class="price">${product.price_range.minimum_price.regular_price.currency} ${product.price_range.minimum_price.regular_price.value}</p>
            <button onclick="addToCart('${product.sku}')">Add to Cart</button>
        </div>
    `).join('');
}

async function init() {
    console.log('Initializing Adobe Commerce Storefront...');
    const productList = document.getElementById('product-list');
    const loadingIndicator = document.createElement('p');
    loadingIndicator.textContent = 'Loading products...';
    productList.appendChild(loadingIndicator);
    const products = await fetchProducts();
    if(products && Array.isArray(products) && products.length > 0) {
        renderProducts(products);
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for global access
window.addToCart = (sku) => {
    console.log('Add to cart:', sku);
    alert(`Product ${sku} would be added to cart`);
};
