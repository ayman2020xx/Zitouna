const express = require('express');
const { Redis } = require('@upstash/redis');
const basicAuth = require('express-basic-auth');
const path = require('path');
const products = require('./products.json'); // Importar os produtos diretamente

// Inicializa o cliente Redis a partir das variáveis de ambiente da Vercel
// KV_URL é o mesmo que REDIS_URL que a Vercel fornece
const redis = Redis.fromEnv();

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

// --- API DE PRODUTOS (Lendo da variável importada) ---

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// --- API DE PEDIDOS (Usando Upstash Redis) ---

app.get('/api/admin/orders', adminAuth, async (req, res) => {
    try {
        const orders = await redis.get('orders') || [];
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error reading orders data from Redis' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { userInfo, cartItems } = req.body;
        if (!userInfo || !cartItems || !cartItems.length) return res.status(400).json({ message: 'Invalid order data.' });

        const newOrder = {
            id: `order_${Date.now()}`,
            orderDate: new Date().toISOString(),
            status: 'En attente',
            userInfo,
            items: cartItems,
            total: cartItems.reduce((acc, item) => acc + (item.prix || item.price) * (item.quantite || item.quantity), 0)
        };
        const orders = await redis.get('orders') || [];
        orders.push(newOrder);
        await redis.set('orders', JSON.stringify(orders));
        
        const clients = await redis.get('clients') || [];
        if (!clients.some(c => c.email === userInfo.email)) {
            clients.push(userInfo);
            await redis.set('clients', JSON.stringify(clients));
        }
        res.status(201).json({ message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order in Redis' });
    }
});

app.patch('/api/admin/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        let orders = await redis.get('orders') || [];
        const orderIndex = orders.findIndex(o => o.id === id);
        if (orderIndex === -1) return res.status(404).json({ message: 'Commande non trouvée.' });
        
        orders[orderIndex].status = status;
        await redis.set('orders', JSON.stringify(orders));
        res.json({ message: 'Order status updated', order: orders[orderIndex] });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status in Redis' });
    }
});

app.delete('/api/admin/orders/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        let orders = await redis.get('orders') || [];
        const updatedOrders = orders.filter(o => o.id !== id);
        if (orders.length === updatedOrders.length) return res.status(404).json({ message: 'Commande non trouvée.' });

        await redis.set('orders', JSON.stringify(updatedOrders));
        res.status(200).json({ message: 'Commande supprimée' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete order from Redis' });
    }
});

// --- API DE CLIENTES (Usando Upstash Redis) ---

app.get('/api/admin/clients', adminAuth, async (req, res) => {
    try {
        const clients = await redis.get('clients') || [];
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error reading clients data from Redis' });
    }
});

app.delete('/api/admin/clients/:email', adminAuth, async (req, res) => {
    try {
        const { email } = req.params;
        let clients = await redis.get('clients') || [];
        const updatedClients = clients.filter(c => c.email !== email);
        if (clients.length === updatedClients.length) return res.status(404).json({ message: 'Client not found.' });
        
        await redis.set('clients', JSON.stringify(updatedClients));
        res.status(200).json({ message: 'Client deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete client from Redis' });
    }
});

// --- ROTA DE ADMIN E ARRANQUE ---
app.use('/admin', adminAuth, express.static(path.join(__dirname, 'admin')));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 