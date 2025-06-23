document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');

    function renderOrders(orders) {
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p>Aucune commande trouvée.</p>';
            return;
        }

        orders.reverse();

        ordersContainer.innerHTML = orders.map(order => `
            <div class="order-card" id="order-${order.id}" data-status="${order.status}">
                <h2>
                    <span>Commande ID: ${order.id}</span>
                    <strong class="order-status">Statut: ${order.status}</strong>
                </h2>
                <div class="customer-info">
                    <strong>Client:</strong> ${order.userInfo.nom}<br>
                    <strong>Email:</strong> ${order.userInfo.email}<br>
                    <strong>Téléphone:</strong> ${order.userInfo.telephone}<br>
                    <strong>Adresse:</strong> ${order.userInfo.adresse}<br>
                    <strong>Date:</strong> ${new Date(order.orderDate).toLocaleString('fr-FR')}
                </div>
                <div class="order-items">
                    <h3>Articles commandés</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Quantité</th>
                                <th>Prix Unitaire</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.price.toFixed(2)} MAD</td>
                                    <td>${(item.quantity * item.price).toFixed(2)} MAD</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="order-total">
                    Total Général: ${order.total.toFixed(2)} MAD
                </div>
                <div class="order-actions">
                    <div class="status-actions">
                        <button class="action-btn btn-deliver" data-action="update-status" data-id="${order.id}" data-status="Livrée">Marquer comme livrée</button>
                        <button class="action-btn btn-cancel" data-action="update-status" data-id="${order.id}" data-status="Annulée">Marquer comme annulée</button>
                    </div>
                    <button class="action-btn btn-delete" data-action="delete" data-id="${order.id}">Supprimer</button>
                </div>
            </div>
        `).join('');
    }

    function addActionListeners() {
        ordersContainer.addEventListener('click', function(event) {
            const target = event.target;
            if (!target.matches('.action-btn')) return;

            const action = target.dataset.action;
            const orderId = target.dataset.id;

            if (action === 'update-status') {
                const newStatus = target.dataset.status;
                updateOrderStatus(orderId, newStatus);
            } else if (action === 'delete') {
                if (confirm(`Êtes-vous sûr de vouloir supprimer la commande ${orderId} ? Cette action est irréversible.`)) {
                    deleteOrder(orderId);
                }
            }
        });
    }

    async function deleteOrder(orderId) {
        try {
            const encodedOrderId = encodeURIComponent(orderId);
            const response = await fetch(`/api/admin/orders/${encodedOrderId}`, {
                method: 'DELETE',
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'La suppression a échoué');
            }

            // Remove the card from the DOM
            const orderCard = document.getElementById(`order-${orderId}`);
            if (orderCard) {
                orderCard.remove();
            }

        } catch (error) {
            console.error('Delete error:', error);
            alert(`Erreur: ${error.message}`);
        }
    }

    async function updateOrderStatus(orderId, status) {
        try {
            const encodedOrderId = encodeURIComponent(orderId);
            const fetchUrl = `/api/admin/orders/${encodedOrderId}/status`;
            console.log('Fetching URL:', fetchUrl);

            const response = await fetch(fetchUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Problème d'authentification. Veuillez rafraîchir la page et vous reconnecter.");
                }
                let errorMsg = 'La mise à jour a échoué.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    console.error("Could not parse error response as JSON.");
                }
                throw new Error(errorMsg);
            }

            const { order } = await response.json();
            
            // Update the UI dynamically
            const orderCard = document.getElementById(`order-${order.id}`);
            if (orderCard) {
                orderCard.dataset.status = order.status;
                orderCard.querySelector('.order-status').textContent = `Statut: ${order.status}`;
            }

        } catch (error) {
            console.error('Update error:', error);
            alert(`Erreur: ${error.message}`);
        }
    }

    fetch('/api/admin/orders', { credentials: 'same-origin' })
        .then(response => {
            if (response.status === 401) {
                ordersContainer.innerHTML = '<h1>Accès Refusé</h1><p>Vous devez être administrateur pour voir cette page.</p>';
                throw new Error('Unauthorized');
            }
            if (!response.ok) throw new Error('Failed to fetch orders');
            return response.json();
        })
        .then(orders => {
            renderOrders(orders);
            addActionListeners();
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            if (error.message !== 'Unauthorized') {
                ordersContainer.innerHTML = '<p>Erreur lors du chargement des commandes.</p>';
            }
        });
}); 