const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const dashboardRoutes = require('./routes/dashboardRoutes');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use('/', dashboardRoutes);

app.listen(port, () => {
    console.log(`Service Dashboard-Admin fonctionnel sur le port ${port}`);
});
