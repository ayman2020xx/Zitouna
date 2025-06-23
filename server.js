const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const basicAuth = require('express-basic-auth');

// Define the writable path for the orders file in Vercel's temp directory
const ordersFilePath = path.join(process.env.VERCEL ? '/tmp' : __dirname, 'orders.json');

const app = express();
const port = 3000;

// Admin credentials (as requested, simple for testing)
const adminUser = 'admin';
const adminPassword = 'zitouna123';
console.log(`\n--- Accès Administrateur ---\nUtilisateur: ${adminUser}\nMot de passe: ${adminPassword}\n--------------------------\n`);

const adminAuth = basicAuth({
    users: { [adminUser]: adminPassword },
    challenge: true,
    realm: 'ZitounaAdmin',
});

app.use(express.json());

// Middleware to log all incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Received ${req.method} request for ${req.originalUrl}`);
    next();
});

// --- ROUTES ---

// Homepage Route - REMOVED, express.static will handle serving index.html by default.
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'Accueil.html'));
// });

// API ROUTES
app.get('/api/products', async (req, res) => {
    try {
        const productsData = await fs.readFile(path.join(__dirname, 'products.json'), 'utf-8');
        const products = JSON.parse(productsData);
        res.json(products);
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

// Protected route to get all orders for the admin panel
app.get('/api/admin/orders', adminAuth, async (req, res) => {
    try {
        const ordersData = await fs.readFile(ordersFilePath, 'utf-8');
        const orders = JSON.parse(ordersData);
        res.json(orders);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.json([]); // Return empty array if file doesn't exist
        }
        res.status(500).json({ message: 'Error reading orders data' });
    }
});

app.patch('/api/admin/orders/:id/status', adminAuth, async (req, res) => {
    console.log('Received PATCH request for order status.'); // Diagnostic log 1
    console.log('Request Body:', req.body); // Diagnostic log 2

    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['En attente', 'Livrée', 'Annulée'].includes(status)) {
            console.error('Invalid status received:', status);
            return res.status(400).json({ message: 'Statut invalide fourni.' });
        }

        let orders = [];
        try {
            const ordersData = await fs.readFile(ordersFilePath, 'utf-8');
            orders = JSON.parse(ordersData);
        } catch (readError) {
            if (readError.code !== 'ENOENT') throw readError;
        }

        const orderIndex = orders.findIndex(order => order.id === id);

        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Commande non trouvée.' });
        }

        orders[orderIndex].status = status;

        await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');

        console.log(`Order ${id} status updated to ${status}`);
        res.json({ message: 'Order status updated successfully', order: orders[orderIndex] });

    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la mise à jour.', error: error.message });
    }
});

app.delete('/api/admin/orders/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        let orders = [];
        try {
            const ordersData = await fs.readFile(ordersFilePath, 'utf-8');
            orders = JSON.parse(ordersData);
        } catch (readError) {
            if (readError.code !== 'ENOENT') throw readError;
        }
        
        const initialLength = orders.length;
        orders = orders.filter(order => order.id !== id);

        if (orders.length === initialLength) {
            return res.status(404).json({ message: 'Commande non trouvée.' });
        }

        await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');

        res.status(200).json({ message: 'Commande supprimée avec succès.' });

    } catch (error) {
        console.error('Order deletion error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la commande.', error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { userInfo, cartItems } = req.body;

        if (!userInfo || !cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Invalid order data.' });
        }

        const newOrder = {
            id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            orderDate: new Date().toISOString(),
            status: 'En attente', // Default status: Pending
            userInfo,
            items: cartItems,
            total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
        };

        let orders = [];
        try {
            const ordersData = await fs.readFile(ordersFilePath, 'utf-8');
            orders = JSON.parse(ordersData);
        } catch (readError) {
            if (readError.code !== 'ENOENT') {
                throw readError;
            }
        }

        orders.push(newOrder);
        await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');

        res.status(201).json({ message: 'Order created successfully', order: newOrder });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Failed to create order.' });
    }
});

// --- Static File Serving & Admin Route ---
// The single middleware below will serve the admin panel (index.html, css, js)
// and protect the entire /admin path.
app.use('/admin', adminAuth, express.static(path.join(__dirname, 'admin')));

// Serve general static files -- RE-ENABLING for Vercel.
app.use(express.static(path.join(__dirname)));

// --- Server Startup ---
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 