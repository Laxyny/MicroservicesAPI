require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const wishlistRoutes = require('./routes/wishlistRoutes');

// CORS
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));

app.use(express.json());
app.use('/wishlist', wishlistRoutes);

const PORT = process.env.PORT_WISHLIST || 3011;

// Route pour verif le statut de l'API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(PORT, () => {
  console.log(`Wishlist service running on port ${PORT}`);
});
