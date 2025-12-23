const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            name: String,
            price: Number,
            quantity: Number,
            image: String
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    address: {
        name: String,
        phone: String,
        street: String,
        city: String,
        pincode: String
    },

    paymentMethod: {
        type: String,
        enum: ['COD', 'ONLINE'],
        default: 'COD'
    },

    status: {
        type: String,
        default: 'PLACED'
    }

}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
