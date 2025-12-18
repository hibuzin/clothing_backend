require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const subCategoryRoutes = require('./routes/subcategory');
const productRoutes = require('./routes/product');





const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/subcategories', require('./routes/subcategory'));
app.use('/api/products', require('./routes/product'));




const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://a54527177_db_user:<db_password>@cluster0.pbf7dfj.mongodb.net/';

mongoose.connect(MONGO_URI)
    .then(() => console.log('mongoDB Connected'))
    .catch(err => console.error('mongoDB connection error:', err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));