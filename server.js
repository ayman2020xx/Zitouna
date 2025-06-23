const express = require('express');
const { createClient } = require('@vercel/kv');
const basicAuth = require('express-basic-auth');
const path = require('path');
const fs = require('fs').promises; // Manter para ler products.json

const app = express();
const port = 3000;

// Inicializa o cliente KV. As credenciais são lidas automaticamente das variáveis de ambiente da Vercel.
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Credenciais de administrador
const adminUser = 'admin';
const adminPassword = 'zitouna123';
console.log(`\n--- Accès Administrateur ---\nUtilisateur: ${adminUser}\nMot de passe: ${adminPassword}\n--------------------------\n`);

const adminAuth = basicAuth({
    users: { [adminUser]: adminPassword },
    challenge: true,
    realm: 'ZitounaAdmin',
});

app.use(express.json());

// Servir ficheiros estáticos do diretório raiz
app.use(express.static(path.join(__dirname)));

// Middleware de log para depuração
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Received ${req.method} request for ${req.originalUrl}`);
    next();
});

// --- FUNÇÃO AUXILIAR SEGURA PARA LER PEDIDOS ---
async function getOrdersSafe() {
    try {
        const ordersData = await fs.readFile(ordersFilePath, 'utf-8');
        // Se o ficheiro estiver vazio ou for inválido, retorna um array vazio
        return ordersData ? JSON.parse(ordersData) : [];
    } catch (error) {
        // Se o ficheiro não existir (ENOENT) ou houver um erro de parsing, retorna um array vazio
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            return [];
        }
        // Para outros erros, lança a exceção
        throw error;
    }
}

// --- FUNÇÃO AUXILIAR SEGURA PARA LER CLIENTES ---
async function getClientsSafe() {
    try {
        const clientsData = await fs.readFile(path.join(__dirname, 'clients.json'), 'utf-8');
        return clientsData ? JSON.parse(clientsData) : [];
    } catch (error) {
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            return [];
        }
        throw error;
    }
}

// --- ROTAS DA API PARA PEDIDOS (ORDERS) ---

app.get('/api/admin/orders', adminAuth, async (req, res) => {
    try {
        const orders = await kv.get('orders') || [];
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders from KV:', error);
        res.status(500).json({ message: 'Error reading orders data' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { userInfo, cartItems } = req.body;
        if (!userInfo || !cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Invalid order data.' });
        }

        const newOrder = {
            id: `order_${Date.now()}`,
            orderDate: new Date().toISOString(),
            status: 'En attente',
            userInfo,
            items: cartItems,
            total: cartItems.reduce((acc, item) => acc + (item.prix || item.price) * (item.quantite || item.quantity), 0)
        };

        const orders = await kv.get('orders') || [];
        orders.push(newOrder);
        await kv.set('orders', orders);
        
        const clients = await kv.get('clients') || [];
        if (!clients.some(c => c.email === userInfo.email)) {
            clients.push(userInfo);
            await kv.set('clients', clients);
        }

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Failed to create order.' });
    }
});

app.patch('/api/admin/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        let orders = await kv.get('orders') || [];
        const orderIndex = orders.findIndex(o => o.id === id);

        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Commande non trouvée.' });
        }
        
        orders[orderIndex].status = status;
        await kv.set('orders', orders);
        
        res.json({ message: 'Order status updated successfully', order: orders[orderIndex] });
    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

app.delete('/api/admin/orders/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        let orders = await kv.get('orders') || [];
        const updatedOrders = orders.filter(o => o.id !== id);

        if (orders.length === updatedOrders.length) {
            return res.status(404).json({ message: 'Commande non trouvée.' });
        }

        await kv.set('orders', updatedOrders);
        res.status(200).json({ message: 'Commande supprimée avec succès.' });
    } catch (error) {
        console.error('Order deletion error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression.' });
    }
});

// --- ROTAS DA API PARA CLIENTES ---

app.get('/api/admin/clients', adminAuth, async (req, res) => {
    try {
        const clients = await kv.get('clients') || [];
        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients from KV:', error);
        res.status(500).json({ message: 'Error reading clients data' });
    }
});

app.delete('/api/admin/clients/:email', adminAuth, async (req, res) => {
    try {
        const { email } = req.params;
        let clients = await kv.get('clients') || [];
        const updatedClients = clients.filter(c => c.email !== email);

        if (clients.length === updatedClients.length) {
            return res.status(404).json({ message: 'Client not found.' });
        }
        
        await kv.set('clients', updatedClients);
        res.status(200).json({ message: 'Client deleted successfully.' });
    } catch (error) {
        console.error('Client deletion error:', error);
        res.status(500).json({ message: 'Error deleting client.' });
    }
});

// --- ROTA PARA PRODUTOS (continua a ler do ficheiro local) ---
app.get('/api/products', async (req, res) => {
    try {
        const productsData = await fs.readFile(path.join(__dirname, 'products.json'), 'utf-8');
        res.json(JSON.parse(productsData));
    } catch (error) {
        res.status(500).json({ message: 'Error reading products data' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const productsData = await fs.promises.readFile(path.join(__dirname, 'products.json'), 'utf-8');
        const products = JSON.parse(productsData);
        const product = products.find(p => p.id === req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error reading products data' });
    }
});

// --- Rota para Admin e Arranque do Servidor ---
app.use('/admin', adminAuth, express.static(path.join(__dirname, 'admin')));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 