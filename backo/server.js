require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');



const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const subCategoryRoutes = require('./routes/subcategory');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/order');
const addressRoutes = require('./routes/address');
const advertisementRoutes = require('./routes/advertisement');
const reviewRoutes = require('./routes/review');

console.log('Cloudinary uploader:', require('./config/cloudinary').uploader);



const app = express();
app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
    console.log('------------------------------');
    console.log('📥 REQUEST');
    console.log('METHOD:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('HEADERS:', {
        authorization: req.headers.authorization,
        'content-type': req.headers['content-type']
    });
    console.log('BODY:', req.body);
    console.log('------------------------------');
    next();
});

app.use((req, res, next) => {
    const oldJson = res.json;

    res.json = function (data) {
        console.log('📤 RESPONSE');
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', data);
        console.log('------------------------------');
        return oldJson.call(this, data);
    };

    next();
});


app.use('/api/auth', authRoutes);
app.use('/api/categories', require('./routes/category'), categoryRoutes);
app.use('/api/subcategories', require('./routes/subcategory'), subCategoryRoutes);
app.use('/api/products', require('./routes/product'));
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/upload', require('./routes/upload'));//cloudinary check


const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:askar1234Arshath@cluster0.pbf7dfj.mongodb.net/clothing?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('mongoDB Connected'))
    .catch(err => console.error('mongoDB connection error:', err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

