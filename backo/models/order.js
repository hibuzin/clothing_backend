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
                ref: 'Product',
                required: true
            },
            name: { type: String, required: true },
            price: { type: Number, required: true },

            color: { type: String, required: true }, // ✅ selected color
            size: { type: String, required: true },  // ✅ selected size

            quantity: { type: Number, required: true },
            returnedQty: { type: Number, default: 0 },
            image: String
        }
    ],


    totalAmount: {
        type: Number,
        required: true
    },

    address: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true }
    },


    paymentMethod: {
        type: String,
        enum: ['COD', 'ONLINE'],
        default: 'COD'
    },


    status: {
        type: String,
        enum: ['PLACED', 'PROCESSING', 'SHIPPED','CANCELLED', 'DELIVERED','RETURN_REQUESTED','RETURN_ACCEPTED','RETURNED'],
        default: 'PLACED'
    }

}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
