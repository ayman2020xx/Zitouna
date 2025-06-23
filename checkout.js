document.addEventListener("DOMContentLoaded", () => {
  const cartSummary = document.getElementById("cart-summary");
  const confirmationMessage = document.getElementById("confirmation-message");
  const checkoutForm = document.getElementById("checkout-form");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function displayCartSummary() {
    if (cart.length === 0) {
      cartSummary.innerHTML = `<h2>Résumé du panier</h2><p>Votre panier est vide.</p>`;
      return;
    }

    const itemsHTML = cart.map(item => `
      <div class="cart-item">
        <span>${item.name} x ${item.quantity}</span>
        <span>${(item.price * item.quantity).toFixed(2)} €</span>
      </div>
    `).join("");

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

    cartSummary.innerHTML = `
      <h2>Résumé du panier</h2>
      ${itemsHTML}
      <hr />
      <div class="cart-item">
        <strong>Total :</strong>
        <strong>${total} €</strong>
      </div>
    `;
  }
});





document.getElementById('finaliser-btn').addEventListener('click', async function () {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name || !email || !address || !phone) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const userInfo = { name, email, address, phone };
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

  if (cartItems.length === 0) {
    alert("Votre panier est vide.");
    return;
  }

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInfo, cartItems })
    });

    const result = await response.json();

    if (response.ok) {
      alert("Commande envoyée avec succès !");
      localStorage.removeItem('cart');
      window.location.href = "confirmation.html"; // or home page
    } else {
      alert("Erreur : " + result.message);
    }
  } catch (error) {
    console.error(error);
    alert("Erreur lors de l'envoi de la commande.");
  }
});
