const productList = document.getElementById('product-list');
const searchInput = document.getElementById('searchInput');
const addressTextEl = document.getElementById("addressText");

let allProducts = [];

// Fetch products
fetch('http://localhost:5000/api/products')
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    displayProducts(allProducts);
  })
  .catch(err => {
    productList.innerHTML = "<p>Error loading products.</p>";
    console.error(err);
  });

// Display product cards
function displayProducts(products) {
  if (!products.length) {
    productList.innerHTML = "<p>No products found.</p>";
    return;
  }

  productList.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Handle image priority
    let imageUrl =
      product.moreImages?.[0]?.url || // Cloudinary multi-images
      product.moreImages?.[0] ||      // fallback array
      product.image?.url ||           // Cloudinary single image
      (product.image ? `http://localhost:5000/uploads/${product.image}` : null) || // Local uploads
      "default-placeholder.png";      // Fallback

    const original = product.originalprice || product.originalPrice;
    const discount = calculateDiscount(product.price, original);

    card.innerHTML = `
      <div class="div11" style="position: relative;">
        <a href="product.html?id=${product._id}" style="position: relative; display: block;">
          <img src="${imageUrl}" alt="${product.title}" style="width: 100%; border-radius: 5px;" />
          <i class="fas fa-heart wishlist-icon" onclick="toggleWishlist('${product._id}')" style="
            top: 10px;
            right: 10px;
            color: white;
            background-color: rgba(0,0,0,0.5);
            padding: 5px;
            border-radius: 50%;
            font-size: 16px;
          "></i>
        </a>
        <h3 style="color:grey;">${product.name}</h3>
        <p>
          ${discount > 0 ? `<span style="color:red; font-size: 12px; background-color:yellow; padding:0 5px; border-radius:3px;">${discount}% OFF</span>` : ''}
          ${original ? `<span style="color:gray; font-size:12px; text-decoration:line-through;">₹${original}</span>` : ''}
          ₹${product.price}
        </p>
        <h4>${product.option}</h4>
        <button onclick="window.location.href='product.html?id=${product._id}'">View Product</button>
      </div>
    `;
    productList.appendChild(card);
  });
}

// Filter products by search
function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm)
  );
  displayProducts(filtered);
}

// Calculate discount
function calculateDiscount(sellPrice, originalPrice) {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - sellPrice) / originalPrice) * 100);
}

// Show address
function changeAddress() {
  const user = JSON.parse(localStorage.getItem("user") || null);

  if (!addressTextEl) return;

  if (!user) {
    addressTextEl.innerHTML = `<button onclick="window.location.href='profile.html'" style="width: 120px; color: green;">Add Address</button>`;
    return;
  }

  const a = user.address || {};

  if (!a.name || !a.city || !a.pincode || !a.phone) {
    addressTextEl.innerHTML = `<button onclick="window.location.href='profile.html'" style="width: 120px; color: green;">Add Address</button>`;
    return;
  }

  addressTextEl.innerHTML = `
    <a href='address.html'>
      ${a.street || ""}${a.road ? ", " + a.road : ""}${a.place ? ", " + a.place : ""}<br/>
      ${a.city}, ${a.state || ""} - ${a.pincode}<br/>
    </a>
  `;
}

window.addEventListener('DOMContentLoaded', changeAddress);

// Toggle wishlist
function toggleWishlist(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to add to wishlist");
    window.location.href = "login.html";
    return;
  }

  fetch(`http://localhost:5000/api/wishlist/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ productId }) // Send productId to backend
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || "Added to wishlist!");
  })
  .catch(err => {
    console.error(err);
    alert("Error adding to wishlist.");
  });
}
