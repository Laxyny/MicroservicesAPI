const express = require('express');
const cors = require('cors');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');
const port = 8081;

//Middleware pour le front
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));

const routes = [
    { path: '/user', target: 'http://ms_users:3000' },
    { path: '/users', target: 'http://ms_users:3000' },
    { path: '/register', target: 'http://ms_users:3000' },
    { path: '/logout', target: 'http://ms_users:3000' },
    { path: '/seller', target: 'http://ms_stores:3002' },
    { path: '/store', target: 'http://ms_stores:3002' },
    { path: '/rating', target: 'http://ms_ratings:3003' },
    { path: '/product', target: 'http://ms_products:3004' },
    { path: '/orders', target: 'http://ms_orders:3005' },
    { path: '/category', target: 'http://ms_categories:3006' },
    { path: '/cart', target: 'http://ms_carts:3007' },
    { path: '/2fa', target: 'http://ms_2fa:3008' },
    { path: '/auth', target: 'http://ms_oauth:5000' },
    { path: '/login', target: 'http://ms_oauth:5000' },
    { path: '/reports', target: 'http://ms_reports:7000' },
    { path: '/invoices', target: 'http://ms_reports:7000' },
    { path: '/notifications', target: 'http://ms_notifications:8000' },
    { path: '/monitoring', target: 'http://ms_monitoring:8080' },
];

routes.forEach(({ path, target }) => {
    app.use(path, createProxyMiddleware({ target, changeOrigin: true }));
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

app.listen(port, () => {
    console.log(`API Gateway en cours d'exécution sur http://localhost:${port}`);
});

app.use('/wishlist', createProxyMiddleware({
    target: 'http://ms_wishlist:3011',
    changeOrigin: true
}));
