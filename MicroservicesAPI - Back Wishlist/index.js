require('dotenv').config();
const express = require('express');
const app = express();
const wishlistRoutes = require('./routes/wishlistRoutes');

app.use(express.json());
app.use('/wishlist', wishlistRoutes);

const PORT = process.env.PORT_WISHLIST || 3011;

app.listen(PORT, () => {
  console.log(`Wishlist service running on port ${PORT}`);
});
