require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const subCategoryRoutes = require('./routes/subcategory');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');


const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/categories', require('./routes/category'), categoryRoutes);
app.use('/api/subcategories', require('./routes/subcategory'), subCategoryRoutes);
app.use('/api/products', require('./routes/product'));
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swaggerSpec);
});


const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:askar1234Arshath@cluster0.pbf7dfj.mongodb.net/clothing?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('mongoDB Connected'))
    .catch(err => console.error('mongoDB connection error:', err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));