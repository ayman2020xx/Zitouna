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
