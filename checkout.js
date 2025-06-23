document.addEventListener("DOMContentLoaded", () => {
  const cartSummary = document.getElementById("cart-summary");

  // Função para exibir o resumo do carrinho
  function displayCartSummary() {
    const cart = JSON.parse(localStorage.getItem("panier")) || [];

    if (!cartSummary) return;

    if (cart.length === 0) {
      cartSummary.innerHTML = `<h2>Résumé du panier</h2><p>Votre panier est vide.</p>`;
      return;
    }

    const itemsHTML = cart.map(item => `
      <div class="cart-item">
        <span>${item.nom || item.name} x ${item.quantite || item.quantity}</span>
        <span>${((item.prix || item.price) * (item.quantite || item.quantity)).toFixed(2)} MAD</span>
      </div>
    `).join("");

    const total = cart.reduce((acc, item) => acc + (item.prix || item.price) * (item.quantite || item.quantity), 0).toFixed(2);

    cartSummary.innerHTML = `
      <h2>Résumé du panier</h2>
      ${itemsHTML}
      <hr />
      <div class="cart-item">
        <strong>Total :</strong>
        <strong>${total} MAD</strong>
      </div>
    `;
  }

  // Exibir o resumo ao carregar a página
  displayCartSummary();

  // Event listener para o botão de finalizar
  const finaliserBtn = document.getElementById('finaliser-btn');
  if (finaliserBtn) {
    finaliserBtn.addEventListener('click', async function (event) {
      event.preventDefault(); // Impedir que o formulário recarregue a página

      const name = document.getElementById('nom').value.trim();
      const email = document.getElementById('email').value.trim();
      const address = document.getElementById('adresse').value.trim();
      const phone = document.getElementById('telephone').value.trim();

      if (!name || !email || !address || !phone) {
        alert("Veuillez remplir tous les champs.");
        return;
      }

      const userInfo = { nom: name, email: email, adresse: address, telephone: phone };
      const cartItems = JSON.parse(localStorage.getItem('panier')) || [];

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

        if (response.ok) {
          alert("Commande envoyée avec succès !");
          localStorage.removeItem('panier');
          window.location.href = "confirmation.html";
        } else {
          const result = await response.json();
          alert("Erreur : " + result.message);
        }
      } catch (error) {
        console.error(error);
        alert("Erreur lors de l'envoi de la commande.");
      }
    });
  }
});
