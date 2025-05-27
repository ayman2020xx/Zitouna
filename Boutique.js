// Navbar toggle
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar && nav) {
  bar.addEventListener('click', () => {
    nav.classList.add('active');
  });
}

if (close && nav) {
  close.addEventListener('click', () => {
    nav.classList.remove('active');
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".product-card .btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", (event) => {
      event.preventDefault(); // prevent link navigation

      // Find the parent product card element
      const productCard = btn.closest(".product-card");

      // Extract product info
      const name = productCard.querySelector("h3").textContent.trim();
      const priceText = productCard.querySelector("p").textContent.trim(); // e.g. "229 MAD"
      const price = parseFloat(priceText.replace("MAD", "").trim());

      // Create product object - you can add ID or other properties if you want
      const product = { id: name.toLowerCase().replace(/\s+/g, '-'), name, price, quantity: 1 };

      // Load existing cart from localStorage
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      // Check if product already exists in cart
      const existingIndex = cart.findIndex(item => item.id === product.id);
      if (existingIndex !== -1) {
        // Increase quantity
        cart[existingIndex].quantity += 1;
      } else {
        // Add new product
        cart.push(product);
      }

      // Save back to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Optional: confirmation message
      alert(`"${name}" a été ajouté au panier.`);

      // Optional: if you want, you can update a cart counter here
    });
  });
});



