const express = require('express');
import { Redis } from '@upstash/redis'
const basicAuth = require('express-basic-auth');
const path = require('path');
const products = require('./products.json'); // Importar os produtos diretamente

// Inicializa o cliente Redis a partir das variáveis de ambiente da Vercel
// KV_URL é o mesmo que REDIS_URL que a Vercel fornece
const redis = new Redis({
  url: 'https://tolerant-wolf-30152.upstash.io',
  token: '********',
})

const app = express();
const port = 3000;

await redis.set("foo", "bar");
await redis.get("foo");

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

// --- API DE CRIAÇÃO DE PEDIDOS (AGORA ATUALIZA OS CLIENTES) ---
app.post('/api/orders', async (req, res) => {
    try {
        const { userInfo, cartItems } = req.body;
        if (!userInfo || !cartItems || !cartItems.length) return res.status(400).json({ message: 'Invalid order data.' });

        const clients = await redis.get('clients') || [];
        const clientIndex = clients.findIndex(c => c.email === userInfo.email);

        const newOrder = {
            orderId: `order_${Date.now()}`,
            orderDate: new Date().toISOString(),
            items: cartItems.map(item => ({ 
                name: item.nom || item.name, 
                quantity: item.quantite || item.quantity,
                price: item.prix || item.price 
            })),
            total: cartItems.reduce((acc, item) => acc + (item.prix || item.price) * (item.quantite || item.quantity), 0)
        };

        if (clientIndex > -1) {
            // Cliente existe, adiciona o novo pedido ao seu histórico
            if (!clients[clientIndex].orders) {
                clients[clientIndex].orders = [];
            }
            clients[clientIndex].orders.push(newOrder);
        } else {
            // Novo cliente, cria o registo com o primeiro pedido
            userInfo.orders = [newOrder];
            clients.push(userInfo);
        }
        
        await redis.set('clients', JSON.stringify(clients));
        res.status(201).json({ message: 'Order processed successfully' });

    } catch (error) {
        console.error('Failed to process order:', error);
        res.status(500).json({ message: 'Failed to process order in Redis' });
    }
});

// --- API DE CLIENTES ---
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

// Adiciona um redirecionamento para a página de clientes ser a página principal do admin
app.get('/admin', (req, res) => {
    res.redirect('/admin/clients.html');
});

app.use('/admin', adminAuth, express.static(path.join(__dirname, 'admin')));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 
