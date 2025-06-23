document.addEventListener('DOMContentLoaded', () => {
    const clientsContainer = document.getElementById('clients-container');

    function renderClients(clients) {
        if (!clientsContainer) return;

        if (clients.length === 0) {
            clientsContainer.innerHTML = '<p>Aucun client trouvé.</p>';
            return;
        }

        // Ordenar por nome para consistência
        clients.sort((a, b) => a.nom.localeCompare(b.nom));

        clientsContainer.innerHTML = clients.map(client => `
            <div class="client-card" id="client-${client.email}">
                <div class="client-info">
                    <strong>Nom:</strong> ${client.nom}<br>
                    <strong>Email:</strong> ${client.email}<br>
                    <strong>Téléphone:</strong> ${client.telephone}<br>
                    <strong>Adresse:</strong> ${client.adresse}
                </div>
                <div class="client-actions">
                    <button class="action-btn btn-delete" data-email="${client.email}">Supprimer le Client</button>
                </div>
            </div>
        `).join('');
    }

    async function fetchClients() {
        try {
            const response = await fetch('/api/admin/clients', { credentials: 'same-origin' });
            if (!response.ok) {
                if (response.status === 401) {
                    clientsContainer.innerHTML = '<h1>Accès Refusé</h1>';
                }
                throw new Error('Failed to fetch clients');
            }
            const clients = await response.json();
            renderClients(clients);
        } catch (error) {
            console.error('Error fetching clients:', error);
            if (clientsContainer) {
                clientsContainer.innerHTML = '<p>Erreur lors du chargement des clients.</p>';
            }
        }
    }

    async function deleteClient(email) {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le client ${email}? Cette action est irréversible.`)) {
            return;
        }
        try {
            const encodedEmail = encodeURIComponent(email);
            const response = await fetch(`/api/admin/clients/${encodedEmail}`, {
                method: 'DELETE',
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'La suppression a échoué');
            }
            
            // Remover o cliente da UI
            const clientCard = document.getElementById(`client-${email}`);
            if (clientCard) {
                clientCard.remove();
            }

        } catch (error) {
            console.error('Delete error:', error);
            alert(`Erreur: ${error.message}`);
        }
    }

    // Adicionar event listener para os botões de apagar
    if (clientsContainer) {
        clientsContainer.addEventListener('click', function(event) {
            const target = event.target;
            if (target.matches('.btn-delete')) {
                const email = target.dataset.email;
                deleteClient(email);
            }
        });
    }

    // Carregar os clientes ao iniciar
    fetchClients();
}); 