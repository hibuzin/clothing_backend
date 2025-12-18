require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const subCategoryRoutes = require('./routes/subcategory');
const productRoutes = require('./routes/product');


//server on time

const Log = require('./models/log');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/subcategories', require('./routes/subcategory'));
app.use('/api/products', require('./routes/product'));


//server check
app.get('/server-on-time', async (req, res) => {
    const log = await Log.findOne({ type: 'SERVER_START' });
    if (!log) {
        return res.json({ message: 'Server ON time not saved yet' });
    }

    res.json({ firstServerOnTime: log.createdAt });
});




const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clothing';

mongoose.connect(MONGO_URI)
    .then(() => console.log('mongoDB Connected'))
    .catch(err => console.error('mongoDB connection error:', err));


const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // SAVE ONLY FIRST SERVER START
    const alreadyStarted = await Log.findOne({ type: 'SERVER_START' });

    if (!alreadyStarted) {
        await Log.create({ type: 'SERVER_START' });
        console.log('✅ First server ON time saved');
    } else {
        console.log('❌ Server already started before, not saving');
    }
});