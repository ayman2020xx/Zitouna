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



document.getElementById('finaliser-achat-btn').addEventListener('click', async () => {
  // Example: get cart items from localStorage or your app state
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

  // Example: get user info from form inputs
  const userInfo = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    address: document.getElementById('address').value,
    // etc.
  };

  const orderData = { cartItems, userInfo };

  try {
    const response = await fetch('https://your-backend-url/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      alert('Commande enregistrée avec succès !');
      localStorage.removeItem('cart'); // clear cart
      // redirect or update UI as needed
    } else {
      alert('Erreur lors de l\'enregistrement de la commande.');
    }
  } catch (error) {
    console.error(error);
    alert('Erreur réseau, veuillez réessayer plus tard.');
  }
});
