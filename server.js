const express = require('express');
const { createClient } = require('@vercel/kv');
const basicAuth = require('express-basic-auth');
const path = require('path');
const fs = require('fs').promises;

// Inicializa o cliente KV a partir das variáveis de ambiente da Vercel.
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const app = express();
const port = 3000;

// Configuração do Admin
const adminAuth = basicAuth({
    users: { 'admin': 'zitouna123' },
    challenge: true,
    realm: 'ZitounaAdmin',
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- API DE PRODUTOS (Lendo do ficheiro local) ---

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
        const productsData = await fs.readFile(path.join(__dirname, 'products.json'), 'utf-8');
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


// --- API DE PEDIDOS (Usando Vercel KV) ---

app.get('/api/admin/orders', adminAuth, async (req, res) => {
    try {
        const orders = await kv.get('orders') || [];
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error reading orders data from KV' });
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
        res.status(201).json({ message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order in KV' });
    }
});

app.patch('/api/admin/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        let orders = await kv.get('orders') || [];
        const orderIndex = orders.findIndex(o => o.id === id);
        if (orderIndex === -1) return res.status(404).json({ message: 'Commande non trouvée.' });
        
        orders[orderIndex].status = status;
        await kv.set('orders', orders);
        res.json({ message: 'Order status updated', order: orders[orderIndex] });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status in KV' });
    }
});

app.delete('/api/admin/orders/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        let orders = await kv.get('orders') || [];
        const updatedOrders = orders.filter(o => o.id !== id);
        if (orders.length === updatedOrders.length) return res.status(404).json({ message: 'Commande non trouvée.' });

        await kv.set('orders', updatedOrders);
        res.status(200).json({ message: 'Commande supprimée' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete order from KV' });
    }
});

// --- API DE CLIENTES (Usando Vercel KV) ---

app.get('/api/admin/clients', adminAuth, async (req, res) => {
    try {
        const clients = await kv.get('clients') || [];
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error reading clients data from KV' });
    }
});

app.delete('/api/admin/clients/:email', adminAuth, async (req, res) => {
    try {
        const { email } = req.params;
        let clients = await kv.get('clients') || [];
        const updatedClients = clients.filter(c => c.email !== email);
        if (clients.length === updatedClients.length) return res.status(404).json({ message: 'Client not found.' });
        
        await kv.set('clients', updatedClients);
        res.status(200).json({ message: 'Client deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete client from KV' });
    }
});

// --- ROTA DE ADMIN E ARRANQUE ---
app.use('/admin', adminAuth, express.static(path.join(__dirname, 'admin')));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 